const AWS = require("aws-sdk");
const TABLE_NAME = process.env.TABLE_NAME || "";
const db = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: any = {}): Promise<any> => {
  const formatDate = (date: Date | any, format: string) => {
    format = format.replace(/yyyy/g, date.getFullYear());
    format = format.replace(/MM/g, ("0" + (date.getMonth() + 1)).slice(-2));
    format = format.replace(/dd/g, ("0" + date.getDate()).slice(-2));
    format = format.replace(/HH/g, ("0" + date.getHours()).slice(-2));
    format = format.replace(/mm/g, ("0" + date.getMinutes()).slice(-2));
    format = format.replace(/ss/g, ("0" + date.getSeconds()).slice(-2));
    return format;
  };
  const key = {
    memoId: "",
  };
  if (event.pathParameters && event.pathParameters.memoId) {
    key.memoId = event.pathParameters.memoId;
  }
  const params = {
    TableName: TABLE_NAME,
    Key: key,
    UpdateExpression: "set #status = :status, doneAt = :doneAt",
    ExpressionAttributeNames: {
      "#status": "status",
    },
    ExpressionAttributeValues: {
      ":status": "completed",
      ":doneAt": formatDate(
        new Date(
          Date.now() + (new Date().getTimezoneOffset() + 9 * 60) * 60 * 1000
        ),
        "yyyy/MM/ddTHH:mm:ss"
      ),
    },
  };
  try {
    await db.update(params).promise();
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Headers": "Content-Type",
      },
    };
  } catch (dbError) {
    return { statusCode: 500, body: JSON.stringify(dbError) };
  }
};
