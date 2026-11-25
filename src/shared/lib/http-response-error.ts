export class HttpResponseError extends Error {
  public readonly status: number;
  public readonly errorCode?: string;

  public constructor(status: number, message: string, errorCode?: string) {
    super(message);
    this.name = "HttpResponseError";
    this.status = status;
    this.errorCode = errorCode;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export function isHttpResponseError(
  value: unknown
): value is HttpResponseError {
  return value instanceof HttpResponseError;
}
