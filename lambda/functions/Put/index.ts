import * as Aws from 'aws-sdk';
const dynamo = new Aws.DynamoDB.DocumentClient();

let tableName:string = '';
if (process.env.TABLE_NAME) {
    tableName = process.env.TABLE_NAME;
}

exports.handler = async(event:any) => {
    console.log(JSON.stringify(event));
    let body:{productName:string,price:number,purchaseType:string,image:string} = JSON.parse(event.body);

    let param:Aws.DynamoDB.DocumentClient.PutItemInput = {
        TableName: tableName,
        Item:{
            productName: body.productName,
            Attributes: JSON.stringify({
                price: body.price,
                purchaseType: body.purchaseType,
                image: body.image
            })
        }
    }

    try {
        let data:Aws.DynamoDB.DocumentClient.PutItemOutput = await dynamo.put(param).promise();
        console.log(JSON.stringify(data));
        return { statusCode:200 };
    } catch(e) {
        console.log(e);
        return;
    }

}