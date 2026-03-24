import { prisma } from "@/lib/storage/prisma";
import { acquireLock, releaseLock } from "@/lib/storage/redis";

export async function runJob(
  jobName: string,
  fn: () => Promise<void>,
  lockTtlSeconds = 120
): Promise<boolean> {
  const locked = await acquireLock(jobName, lockTtlSeconds);
  if (!locked) {
    console.log(`[${jobName}] skipped — another instance is running`);
    return false;
  }

  const startedAt = new Date();
  console.log(`[${jobName}] started at ${startedAt.toISOString()}`);

  try {
    await fn();

    const finishedAt = new Date();
    const durationMs = finishedAt.getTime() - startedAt.getTime();
    console.log(`[${jobName}] completed in ${durationMs}ms`);

    await prisma.jobHistory.create({
      data: {
        jobName,
        status: "success",
        startedAt,
        finishedAt,
        metadata: { durationMs },
      },
    });

    return true;
  } catch (err) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`[${jobName}] FAILED: ${errorMsg}`);

    await prisma.jobHistory.create({
      data: {
        jobName,
        status: "error",
        startedAt,
        finishedAt: new Date(),
        error: errorMsg,
      },
    });

    return false;
  } finally {
    await releaseLock(jobName);
  }
}
