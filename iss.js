
const request = require('request');


//Get IP address
const fetchMyIP = function(callback) {
  
  request('https://api.ipify.org?format=json', (error, response, body) => {
    if (error) return callback(error, null);

      
    if (response.statusCode !== 200) {
      callback(Error(`Status Code ${response.statusCode} when fetching IP: ${body}`), null);
      return;
    }

    const ip = JSON.parse(body).ip;
    callback(null, ip);
  });
};


//Get coordinates by IP address
const fetchCoordsByIP = function(ip, callback) {
  request(`https://freegeoip.app/json/${ip}`, (error, response, body) => {
    if (error) {
      callback(error, null);
      return;
    }

    if (response.statusCode !== 200) {
      callback(Error(`Status Code ${response.statusCode} when fetching coordinates for IP. Response: ${body}`), null);
      return;
    }

    const { latitude, longitude } = JSON.parse(body);
    callback(null, { latitude, longitude });


  });
};


//Get ISS flyover times by coordinates
const fetchISSFlyOverTimes = function(coords, callback) {
  request(`http://api.open-notify.org/iss-pass.json?lat=${coords.latitude}&lon=${coords.longitude}`, (error, response, body) => {
    if (error) {
      callback(error, null);
      return;
    }

    if (response.statusCode !== 200) {
      callback(Error(`Status Code ${response.statusCode} when fetching pass times for ISS: ${body}`), null);
      return;
    }

    const passTimes = JSON.parse(body).response;
    callback(null, passTimes);
  });
};

//Orchestrates multiple API requests in order to determine the next 5 upcoming ISS fly overs for the user's current location.

const nextISSTimesForMyLocation = function(callback) {
  
  fetchMyIP((error, ip) => {
    if (error) {
      return callback(error, null);
    }
    fetchCoordsByIP(ip, (error, coords) => {
      if (error) {
        return callback(error, null);
      }
      fetchISSFlyOverTimes(coords, (error, passTimes) => {
        if (error) {
          return callback(error, null);
        }
        callback(null, passTimes);
      });
    });
  });
};

module.exports = { nextISSTimesForMyLocation };
// module.exports = { fetchMyIP };
// module.exports = { fetchCoordsByIP }
// module.exports = { fetchISSFlyOverTimes };