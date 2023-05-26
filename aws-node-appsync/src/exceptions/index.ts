export class BaseClass extends Error {
  private err?: Error;
  constructor(err?: Error, message?: string) {
    super(message);
    this.name = new.target.name;
    this.err = err;
    if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class BadRequestError extends BaseClass {
  constructor(err?: Error, message?: string) {
    super(err, message);
    this.name = 'BadRequestError';
  }
}

export class UnauthorizedError extends BaseClass {
  constructor(err?: Error, message?: string) {
    super(err, message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends BaseClass {
  constructor(err?: Error, message?: string) {
    super(err, message);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends BaseClass {
  constructor(err?: Error, message?: string) {
    super(err, message);
    this.name = 'NotFoundError';
  }
}

export class AWSSDKError extends BaseClass {
  constructor(err: Error, message?: string) {
    super(err, message);
    this.name = 'AWSSDKError';
  }
}
