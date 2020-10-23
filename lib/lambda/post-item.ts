const AWS = require("aws-sdk");
const TABLE_NAME = process.env.TABLE_NAME || "";
const db = new AWS.DynamoDB.DocumentClient();
const uuid4 = require("uuid4");

export const handler = async (event: any = {}): Promise<any> => {
  var body = JSON.parse(event.body);
  const formatDate = (date: Date | any, format: string) => {
    format = format.replace(/yyyy/g, date.getFullYear());
    format = format.replace(/MM/g, ("0" + (date.getMonth() + 1)).slice(-2));
    format = format.replace(/dd/g, ("0" + date.getDate()).slice(-2));
    format = format.replace(/HH/g, ("0" + date.getHours()).slice(-2));
    format = format.replace(/mm/g, ("0" + date.getMinutes()).slice(-2));
    format = format.replace(/ss/g, ("0" + date.getSeconds()).slice(-2));
    return format;
  };
  const params = {
    TableName: TABLE_NAME,
    Item: {
      imageData: body.imageData,
      createdAt: formatDate(
        new Date(
          Date.now() + (new Date().getTimezoneOffset() + 9 * 60) * 60 * 1000
        ),
        "yyyy/MM/ddTHH:mm:ss"
      ),
      memoId: uuid4(),
    },
  };
  try {
    await db.put(params).promise();
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
