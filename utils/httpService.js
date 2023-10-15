const request = require("request");

const apiCall = (url, options) => {
    return new Promise((resolve, reject) => {
        request(url, { json: true, ...options }, (err, res, body) => {
            if (err) reject(err)
            resolve(body)
        });
    })
};

module.exports = {apiCall};
