const axios = require('axios');
const Qs = require('qs');

async function getAuthentificationData(email, password) {
  if (typeof email !== 'string') throw new Error('Invalid email specified');
  if (typeof password !== 'string') throw new Error('Invalid password specified');

  const response = await axios({
    method: 'POST',
    timeout: 5000,
    url: 'https://www.mykoob.lv/?oauth2/authorizeDevice',
    data: Qs.stringify({
      use_oauth_proxy: 1,
      client: 'MykoobMobile',
      username: email,
      password: password,
    }),
  });

  if (typeof response.data !== 'object') throw new Error('Response contains invalid data');
  if (typeof response.data.error !== 'undefined') throw new Error(response.data.error.message);
  if (typeof response.data.access_token !== 'string') throw new Error('Response does not contain an access token');

  return response.data;
}

module.exports = getAuthentificationData;
