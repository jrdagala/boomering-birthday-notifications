import { SQSEvent, SQSBatchResponse } from 'aws-lambda';

async function consumer(event: SQSEvent): Promise<SQSBatchResponse | void> {
  console.log(`Processing ${event.Records.length} SQS records`);

  for (const record of event.Records) {
    console.log(`Processing record: ${record.body}`);
  }
}

export { consumer };
