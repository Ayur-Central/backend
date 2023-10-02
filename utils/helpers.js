const config = require('config');
const request = require('request')
const videoSdkApi = config.get('videoSdkApi');
const videoSdkToken = config.get('videoSdkToken');

const ClinicTypes = {
    own: 'Own',
    franchise: 'Franchise',
}

const apiCall = (url, options) => {
    return new Promise((resolve, reject) => {
        request(url, { json: true, ...options }, (err, res, body) => {
          if (err) reject(err)
          resolve(body)
        });
    })
}

const createMeeting = async () => {
    const url = `${videoSdkApi}/v2/rooms`;
    const options = {
      method: "POST",
      headers: { Authorization: videoSdkToken, "Content-Type": "application/json" },
    };
  
    let meetingId = "";
    try {
        const { roomId } = await apiCall(url, options);
        meetingId = roomId;
    }
    // console.log(response)
    //   .then((response) => response.json())
    catch (error) {
        console.error("error", error)   
    }
  
    return meetingId;
};

module.exports = {ClinicTypes, createMeeting}