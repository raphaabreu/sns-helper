import { SNSHelper } from './sns-helper';
import { StructuredLogger } from '@raphaabreu/nestjs-opensearch-structured-logger';
import * as AWS from 'aws-sdk';

describe('SNSHelper', () => {
  let snsHelper: SNSHelper;
  let awsSns: jest.Mocked<AWS.SNS>;
  let logger: jest.Mocked<StructuredLogger>;

  beforeEach(() => {
    awsSns = {
      publishBatch: jest.fn(),
    } as unknown as jest.Mocked<AWS.SNS>;
    logger = {
      debug: jest.fn(),
      log: jest.fn(),
      error: jest.fn(),
    } as unknown as jest.Mocked<StructuredLogger>;
    snsHelper = new SNSHelper(awsSns, logger);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('publishBatchIgnoringErrors', () => {
    it('should successfully publish messages to SNS topic and return results', async () => {
      // Arrange
      const params: AWS.SNS.PublishBatchInput = {
        TopicArn: 'arn:aws:sns:us-east-1:123456789012:myTopic',
        PublishBatchRequestEntries: [
          { Id: '0', Message: JSON.stringify({ test: 'message0' }) },
          { Id: '1', Message: JSON.stringify({ test: 'message1' }) },
        ],
      };
      const expectedResult: AWS.SNS.PublishBatchResponse = {
        Successful: [{ Id: '0' }, { Id: '1' }],
        Failed: [],
      };
      awsSns.publishBatch = jest.fn().mockReturnValue({ promise: () => Promise.resolve(expectedResult) });

      // Act
      const result = await snsHelper.publishBatchIgnoringErrors(params);

      // Assert
      expect(awsSns.publishBatch).toHaveBeenCalledWith(params);
      expect(logger.debug).toHaveBeenCalledTimes(1);
      expect(logger.log).toHaveBeenCalledTimes(1);
      expect(logger.error).not.toHaveBeenCalled();
      expect(result).toEqual(expectedResult);
    });

    it('should handle errors and log them without throwing', async () => {
      // Arrange
      const params: AWS.SNS.PublishBatchInput = {
        TopicArn: 'arn:aws:sns:us-east-1:123456789012:myTopic',
        PublishBatchRequestEntries: [
          { Id: '0', Message: JSON.stringify({ test: 'message0' }) },
          { Id: '1', Message: JSON.stringify({ test: 'message1' }) },
        ],
      };
      const error = new Error('Failed to publish messages');
      awsSns.publishBatch = jest.fn().mockReturnValue({ promise: () => Promise.reject(error) });

      // Act
      const result = await snsHelper.publishBatchIgnoringErrors(params);

      // Assert
      expect(awsSns.publishBatch).toHaveBeenCalledWith(params);
      expect(logger.debug).toHaveBeenCalledTimes(1);
      expect(logger.log).not.toHaveBeenCalled();
      expect(logger.error).toHaveBeenCalledTimes(1);
      expect(result).toBeUndefined();
    });
  });

  describe('stringifyBatch', () => {
    it('should convert a batch of objects to an array of PublishBatchRequestEntry', () => {
      // Arrange
      const inputBatch = [{ test: 'message0' }, { test: 'message1' }];
      const expectedOutput: AWS.SNS.PublishBatchRequestEntry[] = [
        { Id: '0', Message: JSON.stringify({ test: 'message0' }) },
        { Id: '1', Message: JSON.stringify({ test: 'message1' }) },
      ];

      // Act
      const result = snsHelper.stringifyBatch(inputBatch);

      // Assert
      expect(result).toEqual(expectedOutput);
    });
  });
});
