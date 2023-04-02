const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const fs = require('fs');
const path = require(`path`);
const chalk = require(`chalk`);
const mongoose = require(`mongoose`);
require(`dotenv`).config();
const session = require(`express-session`);
const MongoDBSession = require(`connect-mongodb-session`)(session);
const errorMsg = chalk.bgKeyword(`white`).redBright;
const succesMSg = chalk.bgKeyword(`green`).white;
const userModel = require(`./models/user`);
const teacherModel = require('./models/teacher');
const feedbackModel = require('./models/feedback');
const bcrypt = require(`bcryptjs`);
const { ObjectId } = require('mongodb');
const app = express();

const getAuthentificationData = require('./models/helpers/getAuthentificationData');
const createUser = require('./models/helpers/createUser');

mongoose
  .connect(process.env.MONGO_URL, { useNewUrlParser: true, useCreateIndex: true, useUnifiedTopology: true })
  .then((res) => console.log(succesMSg('Connected to DB')))
  .catch((error) => console.log(errorMsg(error)));

const store = new MongoDBSession({
  uri: process.env.MONGO_URL,
  collection: `sessions`
});

app.use(session({
  secret: `key that will sign a cookie`,
  resave: false,
  saveUninitialized: false,
  store: store,
}));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

app.set('view engine', 'ejs');
app.use(express.static(path.join(__dirname,`styles`)));

const isAuth = (req,res, next) => {
  if(req.session.isAuth) {
    next()
  } else {
    res.redirect(`/login`);
  }
}

const loginRouter = require('./models/routes/login');
app.use('/login', loginRouter);

const logoutRouter = require('./models/routes/logout');
app.use('/logout', logoutRouter);

app.get('/', (req, res) => {
  res.render('index');
});

app.get('/dashboard', isAuth, (req, res) => {
  res.render('dashboard');
});

app.get('/teachers', isAuth, async (req, res) => {
  try {
    const teachers = await teacherModel.find({});
    const feedbackAggregate = await Promise.all(teachers.map(async (teacher) => {
      const { _id } = teacher;
      const feedback = await feedbackModel.aggregate([
        { $match: { teacherId: ObjectId(_id) } },
        {
          $group: {
            _id: null,
            averageCriteria1: { $avg: '$criteria1' },
            averageCriteria2: { $avg: '$criteria2' },
            averageCriteria3: { $avg: '$criteria3' },
            averageCriteria4: { $avg: '$criteria4' },
            averageCriteria5: { $avg: '$criteria5' },
          }
        },
      ]);
      return {
        teacher,
        feedback: feedback[0]
      };
    }));
    res.render('teachers', { feedbackAggregate });
  } catch (error) {
    console.error(error);
    res.render('error');
  }
});

app.get('/teachers/:id', isAuth, async (req, res) => {
  const id = req.params.id;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    res.status(404).render('error');
    return;
  }
  try {
    const teacher = await teacherModel.findOne({ _id: mongoose.Types.ObjectId(id) });
    if (!teacher) {
      res.status(404).render('error');
      return;
    }
    res.render('teacher', { teacher });
  } catch (error) {
    console.error(error);
    res.status(500).render('error');
  }
});
app.post('/teacher/:id/feedback', isAuth, async (req, res) => {
  const { criteria1, criteria2, criteria3, criteria4, criteria5 } = req.body;
  const teacherId = req.params.id;

  // Create a new document in the feedback collection
  await feedbackModel.create({
    teacherId,
    criteria1,
    criteria2,
    criteria3,
    criteria4,
    criteria5,
  });

  // Redirect back to the teacher page
  res.redirect(`/teachers`);
});

app.get('*', (req, res) => {
  res.render('error');
});

app.listen(3000, () => {
  console.log('Server started on port 3000');
});
