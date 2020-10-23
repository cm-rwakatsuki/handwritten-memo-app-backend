import * as cdk from "@aws-cdk/core";
import { Table, AttributeType } from "@aws-cdk/aws-dynamodb";
import { Runtime } from "@aws-cdk/aws-lambda";
import {
  RestApi,
  LambdaIntegration,
  IResource,
  MockIntegration,
  PassthroughBehavior,
} from "@aws-cdk/aws-apigateway";
import { NodejsFunction } from "@aws-cdk/aws-lambda-nodejs";

export class HandwrittenMemoAppBackendStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    const memoTable = new Table(this, "items", {
      partitionKey: {
        name: "memoId",
        type: AttributeType.STRING,
      },
      tableName: "memo_table",
    });

    const getItemLambda = new NodejsFunction(this, "getItemsFunction", {
      entry: "lib/lambda/get-item.ts",
      runtime: Runtime.NODEJS_12_X,
      environment: {
        TABLE_NAME: memoTable.tableName,
      },
    });
    memoTable.grantReadData(getItemLambda);

    const postItemLambda = new NodejsFunction(this, "postItemsFunction", {
      entry: "lib/lambda/post-item.ts",
      runtime: Runtime.NODEJS_12_X,
      environment: {
        TABLE_NAME: memoTable.tableName,
      },
    });
    memoTable.grantReadWriteData(postItemLambda);

    const updateItemLambda = new NodejsFunction(this, "completeItemsFunction", {
      entry: "lib/lambda/update-item.ts",
      runtime: Runtime.NODEJS_12_X,
      environment: {
        TABLE_NAME: memoTable.tableName,
      },
    });
    memoTable.grantReadWriteData(updateItemLambda);

    const api = new RestApi(this, "itemsApi", {
      restApiName: "Items Service",
    });

    const items = api.root.addResource("items");
    const getItemIntegration = new LambdaIntegration(getItemLambda);
    items.addMethod("GET", getItemIntegration);
    addCorsOptions(items);

    const item = api.root.addResource("item");
    const postItemIntegration = new LambdaIntegration(postItemLambda);
    item.addMethod("POST", postItemIntegration);
    addCorsOptions(item);

    const memoId = item.addResource("{memoId}");
    const updateItemIntegration = new LambdaIntegration(updateItemLambda);
    memoId.addMethod("PUT", updateItemIntegration);
    addCorsOptions(memoId);
  }
}

export function addCorsOptions(apiResource: IResource) {
  apiResource.addMethod(
    "OPTIONS",
    new MockIntegration({
      integrationResponses: [
        {
          statusCode: "200",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Headers":
              "'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token,X-Amz-User-Agent'",
            "method.response.header.Access-Control-Allow-Origin": "'*'",
            "method.response.header.Access-Control-Allow-Credentials":
              "'false'",
            "method.response.header.Access-Control-Allow-Methods":
              "'OPTIONS,GET,PUT,POST,DELETE'",
          },
        },
      ],
      passthroughBehavior: PassthroughBehavior.NEVER,
      requestTemplates: {
        "application/json": '{"statusCode": 200}',
      },
    }),
    {
      methodResponses: [
        {
          statusCode: "200",
          responseParameters: {
            "method.response.header.Access-Control-Allow-Headers": true,
            "method.response.header.Access-Control-Allow-Methods": true,
            "method.response.header.Access-Control-Allow-Credentials": true,
            "method.response.header.Access-Control-Allow-Origin": true,
          },
        },
      ],
    }
  );
}

const app = new cdk.App();
new HandwrittenMemoAppBackendStack(app, "HandwrittenMemoAppBackendStack");
app.synth();
