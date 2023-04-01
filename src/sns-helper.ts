import { StructuredLogger } from '@raphaabreu/nestjs-opensearch-structured-logger';
import * as AWS from 'aws-sdk';

export class SNSHelper {
  constructor(private readonly awsSns: AWS.SNS, private readonly logger?: StructuredLogger) {}

  async publishBatchIgnoringErrors(params: AWS.SNS.PublishBatchInput): Promise<AWS.SNS.PublishBatchResponse> {
    try {
      this.logger?.debug(
        'Batch publishing ${messageCount} messages to SNS topic ${topicArn}...',
        params.TopicArn,
        params.PublishBatchRequestEntries.length,
      );

      const results = await this.awsSns.publishBatch(params).promise();

      this.logger?.log(
        'Batch published messages to SNS topic ${topicArn}: ${successCount} succeeded, ${failCount} failed.',
        params.TopicArn,
        results.Successful.length,
        results.Failed.length,
      );
      return results;
    } catch (error) {
      this.logger?.error('Failed to batch publish messages to SNS topic ${topicArn}', error, params.TopicArn);
    }
  }

  stringifyBatch<T>(batch: T[]): AWS.SNS.PublishBatchRequestEntry[] {
    return batch.map((entry, index) => ({
      Id: String(index),
      Message: JSON.stringify(entry),
    }));
  }
}
