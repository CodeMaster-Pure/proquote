let mongoose = require('mongoose');
let ApplicantSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },

  address: {
    type: String,
    required: true
  },

  quote_id: {
    type: String,
    unique: true,
    required: true
  },

  link: {
    type: String,
  },
  register_date: {
    type: Date,
    default: Date.now()
  }
});
module.exports = mongoose.model('Applicant', ApplicantSchema);
