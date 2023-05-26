export class BaseClass extends Error {
  private sdkError?: Error;
  constructor(sdkError?: Error, message?: string) {
    super(message);
    this.name = new.target.name;
    this.sdkError = sdkError;
    if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BadRequestError extends BaseClass {
  constructor(sdkError?: Error, message?: string) {
    super(sdkError, message);
    this.name = 'BadRequestError';
  }
}

export class UnauthorizedError extends BaseClass {
  constructor(sdkError?: Error, message?: string) {
    super(sdkError, message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends BaseClass {
  constructor(sdkError?: Error, message?: string) {
    super(sdkError, message);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends BaseClass {
  constructor(sdkError?: Error, message?: string) {
    super(sdkError, message);
    this.name = 'NotFoundError';
  }
}

export class AWSSDKError extends BaseClass {
  constructor(sdkError: Error, message?: string) {
    super(sdkError, message);
    this.name = 'AWSSDKError';
  }
}
