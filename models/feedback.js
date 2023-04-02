const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema({
  teacherId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Teacher',
  },
  criteria1: Number,
  criteria2: Number,
  criteria3: Number,
  criteria4: Number,
  criteria5: Number,
});

module.exports = mongoose.model('Feedback', feedbackSchema);
