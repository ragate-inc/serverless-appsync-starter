export class BaseClass extends Error {
  constructor(message?: string) {
    super(message);
    this.name = new.target.name;
    if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BadRequestError extends BaseClass {
  constructor(message?: string) {
    super(message);
    this.name = 'BadRequestError';
  }
}

export class UnauthorizedError extends BaseClass {
  constructor(message?: string) {
    super(message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends BaseClass {
  constructor(message?: string) {
    super(message);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends BaseClass {
  constructor(message?: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class AWSSDKError extends BaseClass {
  private sdkError: Error;
  constructor(sdkError: Error, message?: string) {
    super(message);
    this.sdkError = sdkError;
    this.name = 'AWSSDKError';
  }
}
