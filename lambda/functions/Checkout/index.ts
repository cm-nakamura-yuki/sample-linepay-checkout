import * as Rp from 'request-promise';

let paymentUrl:string = '';
let channelId:string = '';
let channelSecret:string = '';

if (process.env.LINEPAY_ENDPOINT) {
    paymentUrl = process.env.LINEPAY_ENDPOINT;
}
if (process.env.CHANNEL_ID) {
    channelId = process.env.CHANNEL_ID;
}
if (process.env.CHANNEL_SECRET) {
    channelSecret = process.env.CHANNEL_SECRET;
}

exports.handler = async(event:any) => {
    console.log(JSON.stringify(event));
    let body:{productName:string, price:number, callbackUrl: string, orderId:string} = JSON.parse(event.body);
    let paymentInfo:{productName:string, amount:number, currency:string, confirmUrl:string, confirmUrlType:string, orderId:string} = {
        productName: body.productName,
        amount: body.price,
        currency: 'JPY',
        confirmUrl: body.callbackUrl,
        confirmUrlType: 'SERVER',
        orderId: body.orderId
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

    console.log(paymentAttributes);
    let response = {
        isBase64Encoded: false,
        statusCode: 200,
        headers: {},
        body: paymentData
    };

    return response;
};