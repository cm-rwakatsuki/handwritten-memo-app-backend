const AWS = require("aws-sdk");
const TABLE_NAME = process.env.TABLE_NAME || "";
const db = new AWS.DynamoDB.DocumentClient();

export const handler = async (): Promise<any> => {
  const params = {
    TableName: TABLE_NAME,
    ConsistentRead: true,
  };
  try {
    const response = await db.scan(params).promise();
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
      body: JSON.stringify(response.Items),
    };
  } catch (dbError) {
    return { statusCode: 500, body: JSON.stringify(dbError) };
  }
};
