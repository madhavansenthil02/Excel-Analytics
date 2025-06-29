const mongoose = require('mongoose');

const ParseDataSchema = new mongoose.Schema({
  file: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UploadedFile',
  },

  data: {
    type: Array, // Array of objects parsed from Excel rows
    required: true,
  },

  uploadedAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('ParseData', ParseDataSchema);
