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
    const url = `${smsApi}/${smsAccountSid}`;
    const options = {
        method: "POST",
        body: {
            to: '+91' + phoneNo,
            from: "+12567438590",
            body: body
        }
    };
  
    try {
        const response = await apiCall(url, options);
    }
    // console.log(response)
    //   .then((response) => response.json())
    catch (error) {
        console.error("error", error)   
    }
  
    return;
};

module.exports = {sendSms};