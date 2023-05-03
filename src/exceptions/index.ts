export class BaseClass extends Error {
  constructor(message?: string) {
    super(message);
    this.name = new.target.name;
    if (Error.captureStackTrace) Error.captureStackTrace(this, this.constructor);
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

export class SystemError extends BaseClass {
  constructor(message?: string) {
    super(message);
    this.name = 'SystemError';
  }
}

export class ArgumentError extends BaseClass {
  constructor(message?: string) {
    super(message);
    this.name = 'ArgumentError';
  }
}

export class UnAuthorizedError extends BaseClass {
  constructor(message?: string) {
    super(message);
    this.name = 'UnAuthorizedError';
  }
}

export class NotFoundError extends BaseClass {
  constructor(message?: string) {
    super(message);
    this.name = 'NotFoundError';
  }
}

export class DynamoDBAlreadyExistsError extends BaseClass {
  constructor(message?: string) {
    super(message);
    this.name = 'AlreadyExistsError';
  }
}

export class AWSSDKError extends BaseClass {
  constructor(message?: string) {
    super(message);
    this.name = 'AWSSDKError';
  }
}
