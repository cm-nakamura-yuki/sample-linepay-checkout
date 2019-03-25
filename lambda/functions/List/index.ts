import * as Aws from 'aws-sdk';
const dynamo = new Aws.DynamoDB.DocumentClient();

let tableName:string = '';
if (process.env.TABLE_NAME) {
    tableName = process.env.TABLE_NAME;
}

exports.handler = async(event:any) => {
    console.log(JSON.stringify(event));

    let param:Aws.DynamoDB.DocumentClient.ScanInput = {
        TableName: tableName
    }

    try {
        let data:Aws.DynamoDB.DocumentClient.ScanOutput = await dynamo.scan(param).promise();
        console.log(JSON.stringify(data));

        let response = {
            isBase64Encoded: false,
            statusCode: 200,
            headers: {},
            body: JSON.stringify(data)
        };
        return response;
    } catch(e) {
        console.log(e);
        return;
    }

}