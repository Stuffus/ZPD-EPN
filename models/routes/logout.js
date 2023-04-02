const express = require('express');
const router = express.Router();
const session = require(`express-session`);
const MongoDBSession = require(`connect-mongodb-session`)(session);

const store = new MongoDBSession({
  uri: process.env.MONGO_URL,
  collection: `sessions`
});

router.get('/', async (req, res) => {
  const sessionId = req.session.id;
  try {
    await store.destroy(sessionId);
    req.session.destroy();
    res.redirect('/login');
  } catch (err) {
    res.send(sessionId);
    console.error(err);
    res.status(500).send('Error logging out');
  }
});

module.exports = router;