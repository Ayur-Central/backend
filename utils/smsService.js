const nodemailer = require("nodemailer");
const config = require('config');
const request = require("request");
const smsApi = config.get('smsApi');
const smsAccountSid = config.get('smsAccountSid');

const apiCall = (url, options) => {
    return new Promise((resolve, reject) => {
        request(url, { json: true, ...options }, (err, res, body) => {
          if (err) reject(err)
          resolve(body)
        });
    })
}

const sendSms = async (phoneNo, body) => {
    const url = `${ smsApi }/${ smsAccountSid }/messages`;
    let cbo = {};
    const options = {
        method: "post",
        headers: {
            "api-key": "A37f128f0a5d8ed643218238d1ff43952",
            "Content-Type": "application/x-www-form-urlencoded"
        },
        body: {
            "to": phoneNo,
            "sender": "AYURCT",
            "type": "MKT",
            "body": "This is my first sms",
            "source": "API"
        }
    };
  
    try {
        const response = await apiCall(url, options);
        console.log(response)
    }
    // console.log(response)
    //   .then((response) => response.json())
    catch (error) {
        console.error("error", error)   
    }
  
    return;
};

module.exports = {sendSms};