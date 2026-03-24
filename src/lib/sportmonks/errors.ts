export class SportMonksError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public endpoint?: string
  ) {
    super(message);
    this.name = "SportMonksError";
  }
}

export class RateLimitError extends SportMonksError {
  constructor(retryAfterSeconds: number, endpoint?: string) {
    super(
      `Rate limit exceeded. Retry after ${retryAfterSeconds}s`,
      429,
      endpoint
    );
    this.name = "RateLimitError";
  }
}

export class AuthenticationError extends SportMonksError {
  constructor() {
    super("Invalid or missing SportMonks API token", 401);
    this.name = "AuthenticationError";
  }
}
