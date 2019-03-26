import * as Aws from 'aws-sdk';
import * as Rp from 'request-promise';
const dynamo = new Aws.DynamoDB.DocumentClient();

let paymentUrl:string = '';
let callbackUrl:string = '';
let itemApiUrl:string = '';
let channelId:string = '';
let channelSecret:string = '';
let tableName:string = '';

if (process.env.LINEPAY_ENDPOINT) {
    paymentUrl = process.env.LINEPAY_ENDPOINT;
}
if (process.env.CALLBACK_ENDPOINT) {
    callbackUrl = process.env.CALLBACK_ENDPOINT;
}
if (process.env.GETITEM_ENDPOINT) {
    itemApiUrl = process.env.GETITEM_ENDPOINT;
}
if (process.env.CHANNEL_ID) {
    channelId = process.env.CHANNEL_ID;
}
if (process.env.CHANNEL_SECRET) {
    channelSecret = process.env.CHANNEL_SECRET;
}
if (process.env.TABLE_NAME) {
    tableName = process.env.TABLE_NAME;
}

exports.handler = async(event:any) => {
    console.log(JSON.stringify(event));
    let body:{productName:string} = JSON.parse(event.body);
    console.log(body);
    
    let getUrl = itemApiUrl + '?productName=' + encodeURI(body.productName);
    console.log(getUrl);

    let itemData = await Rp.get(getUrl).promise();
    let item:{Item: {Attributes:string, productName:string}} = JSON.parse(itemData);
    let itemAttributes:{price:number,purchaseType:string,image:string} = JSON.parse(item.Item.Attributes);

    let requestId:string = event.requestContext.requestId;
    let orderId:string = requestId.replace('-','');
    let paymentInfo:{productName:string, amount:number, currency:string, confirmUrl:string, confirmUrlType:string, orderId:string} = {
        productName: item.Item.productName,
        amount: itemAttributes.price,
        currency: 'JPY',
        confirmUrl: callbackUrl,
        confirmUrlType: 'CLIENT',
        orderId: orderId
    };

    let options:Rp.OptionsWithUrl = {
        url: paymentUrl,
        body: JSON.stringify(paymentInfo),
        headers: {
            'Content-Type': 'application/json',
            'X-LINE-ChannelId': channelId,
            'X-LINE-ChannelSecret': channelSecret
        }
    }
    let paymentData = await Rp.post(paymentUrl, options).promise();
    let paymentAttributes = JSON.parse(paymentData);
    let transactionId:string = paymentAttributes.info.transactionId.toString();

    let Attributes:string = JSON.stringify({
        productName: item.Item.productName,
        amount: itemAttributes.price,
        paymentAccessToken: paymentAttributes.info.paymentAccessToken,
        transactionId: transactionId
    });

    let param:Aws.DynamoDB.DocumentClient.PutItemInput = {
        TableName: tableName,
        Item: {
            orderId: orderId,
            Attributes: Attributes
        }
    };
    let putData:Aws.DynamoDB.DocumentClient.PutItemOutput = await dynamo.put(param).promise();
    console.log(JSON.stringify(putData));

    let response = {
        isBase64Encoded: false,
        statusCode: 200,
        headers: {},
        body: JSON.stringify(putData)
    };
    return response;
};