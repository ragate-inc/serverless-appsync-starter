import middy from '@middy/core';
import logger from 'utils/logger';
import { injectLambdaContext } from '@aws-lambda-powertools/logger';
import { Callback, Context, Handler } from 'aws-lambda';
import { BaseClass } from 'exceptions/index';

export const middyWrapper = (handler: Handler) => {
  const catchHandler = async (event: unknown, context: Context, callback: Callback) => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return await handler(event, context, callback);
    } catch (e) {
      const err = e as BaseClass;
      logger.error({ stack: err.stack, name: err.name, message: err.message });
      throw e;
    }
  };
  return middy(catchHandler).use(injectLambdaContext(logger));
};
