const mongoose = require('mongoose');

const ExcelFileSchema = new mongoose.Schema({
  filename: String,
  path: String,
  originalname: String,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  parsedData: Array,  // parsed rows of Excel
  headers: Array,     // column names
  uploadDate: {
    type: Date,
    default: Date.now
  },
  data: {
    type: Array,
    default: []
  }
});

module.exports = mongoose.model('ExcelFile', ExcelFileSchema);
