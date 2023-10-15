const nodemailer = require("nodemailer");
const config = require('config');
const request = require("request");
const smsApi = config.get('smsApi');
const smsAccountSid = config.get('smsAccountSid');
const whatsappTemplatesRepo = {
    lead_enquiry_online : 'lead_enquiry_online',
    lead_enquiry_offline : 'lead_enquiry_offline',
    appointment_confirmed : 'appointment_onfirmed',
    ops_scheduled_offline : "offline_by_ops_scheduled",
    direct_walkin : "direct_walkin_confirmed",
    appointment_payment : "appointment_scheduled_paynow_online",
    send_vc_after_payment : "payment_received_join_vc",
    download_rx : "download_rx",
    feedback : "feedback"
}

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

const getWhatsApptemplate = (template) => {
    let templateObj = whatsappTemplatesRepo;
    return templateObj[template];
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
            template_id: '123456789100',
            body: "This is my second sms",
            params: "Shiva",
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

const sendWhatsAppMsg = async (phoneNo, body, templateName, params, footerUrl) => {
    const phone = removePhoneNoPrefix(phoneNo);
    console.log('Selected Template : ', templateName);
    console.log('Template Params : ', params);
    const url = `${ smsApi }/${ smsAccountSid }/messages`;
    
    let postBody = {
        from: "+918123402371",
        to: `+91${phone}`,
        type: "text",
        channel: "whatsapp",
        body: body,
    };

    if (templateName) {
        postBody = {
            from: "+918123402371",
            to: `+91${phone}`,
            type: footerUrl ? "mediatemplate" : "template",
            channel: "whatsapp",
            // body: body,
            template_name: templateName,
        }
        if (params) {
            postBody.params = params;
        }
        if (footerUrl) {
            postBody.param_url = footerUrl;
        }
    }

    const options = {
        method: "post",
        headers: {
            "api-key": "A37f128f0a5d8ed643218238d1ff43952",
            "Content-Type": "application/json"
        },
        body: postBody
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

module.exports = {sendSms, sendWhatsAppMsg, whatsappTemplatesRepo};