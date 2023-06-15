import { LogItemMessage } from '@aws-lambda-powertools/logger/lib/types';
import middy from '@middy/core';
import { AppSyncAuthorizerEvent, AppSyncResolverEvent, Context } from 'aws-lambda';
import logger from 'utils/logger';

export default (): middy.MiddlewareObj<AppSyncAuthorizerEvent | AppSyncResolverEvent<unknown>, unknown, Error, Context> => {
  return {
    onError: (handler): void => {
      logger.error(handler as unknown as LogItemMessage);
    },
  };
};
