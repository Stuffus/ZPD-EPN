const express = require('express');
const router = express.Router();
const getAuthentificationData  = require('../helpers/getAuthentificationData');
const createUser  = require('../helpers/createUser');
const userModel = require(`../user`);

router.get('/', (req, res) => {
  res.render('login', { message: 'Please use the login form to log in' });
});

router.post('/', async (req, res) => {
  const { username, password } = req.body;
  try {
    // Call the MyKoob API authentication method with the user's credentials
    const response = await getAuthentificationData(username, password);

    // If the authentication is successful, store the user's credentials in mongoDB
    let result = await userModel.deleteOne({username});
    if(result.deletedCount > 0) {
      createUser(username, password);
      req.session.isAuth = true;
      res.redirect('/dashboard');
    } else {
      createUser(username, password);
      req.session.isAuth = true;
      res.redirect('/dashboard');
    }

  } catch (error) {
    console.error(error);
    res.render('login', { message: 'An error occurred, please try again later' });
  }
});

module.exports = router;