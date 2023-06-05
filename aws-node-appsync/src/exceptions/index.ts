export class BaseClass extends Error {
  private _err?: Error;
  constructor(err?: Error, message?: string) {
    super(message);
    this.name = new.target.name;
    this._err = err;
    if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor);
    Object.setPrototypeOf(this, new.target.prototype);
  }
  public get err(): Error | undefined {
    return this._err;
  }
}

export class BadRequestError extends BaseClass {
  constructor(message?: string, err?: Error) {
    super(err, message);
    this.name = 'BadRequestError';
  }
}

export class UnauthorizedError extends BaseClass {
  constructor(message?: string, err?: Error) {
    super(err, message);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends BaseClass {
  constructor(message?: string, err?: Error) {
    super(err, message);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends BaseClass {
  constructor(message?: string, err?: Error) {
    super(err, message);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends BaseClass {
  constructor(message?: string, err?: Error) {
    super(err, message);
    this.name = 'ConflictError';
  }
}

export class AWSSDKError extends BaseClass {
  constructor(err: Error, message?: string) {
    super(err, message);
    this.name = 'AWSSDKError';
  }
}
