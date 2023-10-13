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
};


const removePhoneNoPrefix = (phoneNo) => {
    if (phoneNo.includes('+91')) {
        phoneNo.replace('+91', "")
    }
    return phoneNo;
}

const sendSms = async (phoneNo, body) => {
    const phone = removePhoneNoPrefix(phoneNo);
    const url = `${ smsApi }/${ smsAccountSid }/messages`;
    const options = {
        method: "post",
        headers: {
            "api-key": "A37f128f0a5d8ed643218238d1ff43952",
            "Content-Type": "application/json"
        },
        body: {
            to: `+91${phone}`,
            sender: "AYURCT",
            type: "MKT",
            body: "This is my second sms",
            source: "API"
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


const getWhatsAppTemplateName = (phoneNo) => {
    if (phoneNo.includes('+91')) {
        phoneNo.replace('+91', "")
    }
    return phoneNo;
}

const sendWhatsAppMsg = async (phoneNo, body) => {
    const phone = removePhoneNoPrefix(phoneNo);
    const url = `${ smsApi }/${ smsAccountSid }/messages`;
    const options = {
        method: "post",
        headers: {
            "api-key": "A37f128f0a5d8ed643218238d1ff43952",
            "Content-Type": "application/json"
        },
        body: {
            from: "+918123402371",
            to: `+91${phone}`,
            type: "text",
            channel: "whatsapp",
            body: body,
        }
    };
  
    try {
        const response = await apiCall(url, options);
        console.log(response);
        return response;
    }
    // console.log(response)
    //   .then((response) => response.json())
    catch (error) {
        console.error("error", error)   
        return error;
    }
  
    return;
};

module.exports = {sendSms, sendWhatsAppMsg};