// Database utilities and helpers
// Re-exports for convenient access to storage layer
export { prisma } from "@/lib/storage/prisma";
export { cacheGet, cacheSet, cacheDelete, acquireLock, releaseLock } from "@/lib/storage/redis";
