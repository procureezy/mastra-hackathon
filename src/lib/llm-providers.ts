import { createAmazonBedrock } from "@ai-sdk/amazon-bedrock";
import { anthropic } from "@ai-sdk/anthropic";
import { env } from "./env";

const bedrock = createAmazonBedrock({
  region: env.AWS_REGION,
  accessKeyId: env.AWS_ACCESS_KEY_ID,
  secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
});

export const modelAWSClaudeSonnet35 = bedrock(
  "anthropic.claude-3-5-sonnet-20240620-v1:0",
);

export const modelAWSHaiku = bedrock(
  "anthropic.claude-3-haiku-20240307-v1:0",
);

export const modelClaudeSonnet35 = anthropic("claude-3-sonnet-20240229");
