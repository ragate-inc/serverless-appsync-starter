import middy from '@middy/core';
import { AppSyncAuthorizerEvent, AppSyncResolverEvent, Context } from 'aws-lambda';
import logger from 'utils/logger';

export default (): middy.MiddlewareObj<AppSyncAuthorizerEvent | AppSyncResolverEvent<unknown>, unknown, Error, Context> => {
  return {
    onError: (handler): void => {
      logger.error(JSON.stringify(handler, null, 2));
    },
  };
};
