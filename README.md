# SNS Helper

A utility module that simplifies the process of publishing batches of messages to AWS SNS topics with error handling.

## Installation

```bash
npm i @raphaabreu/sns-helper
```

## Usage

First, import the `SNSHelper` class and AWS SDK.

```typescript
import { SNSHelper } from '@raphaabreu/sns-helper';
import * as AWS from 'aws-sdk';
```

Next, create an instance of `SNSHelper`, providing an instance of `AWS.SNS` and optionally an instance of a `StructuredLogger`:

```typescript
import { StructuredLogger } from '@raphaabreu/nestjs-opensearch-structured-logger';

const awsSns = new AWS.SNS();
const logger = new StructuredLogger();
const snsHelper = new SNSHelper(awsSns, logger);
```

### Publish Batch Ignoring Errors

To publish a batch of messages to an SNS topic, use the `publishBatchIgnoringErrors` method:

```typescript
const messages = [{ key: 'value1' }, { key: 'value2' }];
const publishBatchRequestEntries = snsHelper.stringifyBatch(messages);

const params: AWS.SNS.PublishBatchInput = {
  TopicArn: 'arn:aws:sns:us-east-1:123456789012:myTopic',
  PublishBatchRequestEntries: publishBatchRequestEntries,
};

const results = await snsHelper.publishBatchIgnoringErrors(params);
```

### Stringify Batch

To convert an array of objects to an array of `AWS.SNS.PublishBatchRequestEntry`:

```typescript
const batch = [{ key: 'value1' }, { key: 'value2' }];
const publishBatchRequestEntries = snsHelper.stringifyBatch(batch);
```

## Tests

To run the provided unit tests just execute `npm run tests`.

## License

MIT License

## Contributing

Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

Please make sure to update tests as appropriate.

## Support

If you have any issues or questions, please open an issue on the project repository.
