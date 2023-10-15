const config = require('config');
const generateId = require('./uuidGenerator');
const { apiCall } = require('./httpService');
const paymentToken = config.get('paymentToken');

const removePhoneNoPrefix = (phoneNo) => {
    if (phoneNo.includes('+91')) {
        phoneNo.replace('+91', "")
    }
    return phoneNo;
}

const getReferenceId = (id) => {
    if (!id) return generateId();
    return id;
}

const paymentObj = {
    amount : 1000,
    currency : "INR",
    // "expire_by": 1691097057,
    // name: 'AyurCentral',
    reference_id : getReferenceId(),
    description : "Payment for AyurCentral Online Consultation",
    options : {
        checkout : {
          prefill : {
                contact : "8088423230", 
                email : "test@example.com"
            }
        }
    },
}

const getAmount = (amount) => {
    if (amount instanceof String) {
        const amt = parseInt(amount);
        return Math.ceil(amt * 100 + 0.0);
        // return Math.ceil(amt ?? 0 * 100);
    } else {
        return Math.ceil(amount * 100 + 0.0);
        // return Math.ceil(amount ?? 0 * 100);
    }
}

const generatePaymentLink = async (body) => {
    return new Promise(async (resolve, reject) => {
        console.log(body);
        const phone = removePhoneNoPrefix(body.phoneNo);
        const url = 'https://api.razorpay.com/v1/payment_links';
        paymentObj.amount = getAmount(body.amount);
        paymentObj.reference_id = getReferenceId(body.id);
        paymentObj.description = body.description;
        paymentObj.options.checkout.prefill.contact = phone;
        paymentObj.options.checkout.prefill.email = body.email ?? "";
        const options = {
            method: "post",
            headers: {
                "Authorization": `Basic ${paymentToken}`,
                "Content-Type": "application/json"
            },
            body: paymentObj
        };
      
        try {
            const response = await apiCall(url, options);
            // console.log('generatePaymentLink success : ', response);
            resolve(response.short_url);
        }
        // console.log(response)
        //   .then((response) => response.json())
        catch (error) {
            console.error("generatePaymentLink error : ", error);
            reject(error)
        }
    })
};

module.exports = {generatePaymentLink};