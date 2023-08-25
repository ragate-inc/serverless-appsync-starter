import { AppSyncResolverEvent, Context } from 'aws-lambda';
import middy from 'utils/middy';
import logger from 'utils/logger';

describe('errorCatch', () => {
  it('should catch error', async () => {
    const mockErrorFn = jest.fn();
    logger.error = mockErrorFn;
    const handler = middy.handler(async () => {
      await Promise.reject(new Error('test'));
    });

    await expect(handler({} as AppSyncResolverEvent<unknown>, {} as Context)).rejects.toThrow('test');
    expect(mockErrorFn.mock.calls).toHaveLength(1);
    console.log(mockErrorFn.mock.calls[0]);
    expect((mockErrorFn.mock.calls[0] as { error: Error }[])[0].error).toHaveProperty('message', 'test');
  });
});
