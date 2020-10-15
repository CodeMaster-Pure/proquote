const request = require('request');
const config = require('../config');

class HavenLife {
  generateToken(params) {
    const url = 'https://quotes-v3.havenlife.com/quote/coverage';
    let coverageAmount;
    try {
      if (params['estimate'] * 0.8 > 25000) coverageAmount = params['estimate'] * 0.8;
      else coverageAmount = 25000;
      if (coverageAmount > 500000) coverageAmount = 500000;
    } catch (e) {
      coverageAmount = 25000;
    }
    const qs = {
      coverageAmount,
      dateOfBirth: params['personData'][0]['birthday'],
      gender: 'male',
      healthCategory: 'fair',
      isSmoker: true,
      productIdentifier: 'HavenTermSI',
      state: params['address']['administrative_area_level_1'],
      termLength: 20,
      includeWaiverPremium: false
    };
    console.log(qs,'qs');
    const options = {
      url, qs, method: 'GET',
      headers: {
        'accept': 'application/json',
        'Source': config.haven.source
      }
    };
    return new Promise((resolve, reject) => {
      request(options, function (error, response, body) {
        if (error) {
          reject({result: 'error'});
        } else {
          resolve(body);
        }
      });
    });
  }
}

module.exports = HavenLife;
