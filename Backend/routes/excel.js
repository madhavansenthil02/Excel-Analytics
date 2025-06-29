const express = require('express');
const router = express.Router();
const multer = require('multer');
const ExcelFile = require('../models/ExcelFile');
const xlsx = require('xlsx');
const fs = require('fs');
const path = require('path');
const auth = require('../middleware/authMiddleware')

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    console.log('FILE:', req.file);
    console.log('USER:', req.user);
    
    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    // ✅ Read Excel content
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const sheetData = xlsx.utils.sheet_to_json(sheet);

    const newFile = new ExcelFile({
      filename: req.file.filename,
      path: req.file.path,
      originalname: req.file.originalname,
      userId: req.user.id,  // Make sure this exists (from auth middleware)
      data: sheetData      // ✅ Now it exists
    });

    await newFile.save();

    res.json({ msg: 'File uploaded', file: newFile });
  } catch (err) {
    console.error('Upload error:', err);
    res.status(500).json({ msg: 'Upload failed' });
  }
});

// GET all uploaded files
router.get('/excelfiles', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const files = await ExcelFile.find({ userId }).sort({ uploadDate: -1 });
    res.json(files);
  } catch (err) {
    console.error('Fetch files error:', err);
    res.status(500).json({ msg: 'Failed to fetch files' });
  }
});

// Load single file data (NEW!!)
router.get('/file/:id', auth, async (req, res) => {
  try {
    const fileDoc = await ExcelFile.findById({ _id: req.params.id, userId: req.user.id });
    if (!fileDoc) {
      return res.status(404).json({ msg: 'File not found' });
    }

    const workbook = xlsx.readFile(fileDoc.path);
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const jsonData = xlsx.utils.sheet_to_json(sheet);

    const headers = jsonData.length > 0 ? Object.keys(jsonData[0]) : [];

    res.json({
      filename: fileDoc.originalname,
      data: jsonData,
      headers
    });
  } catch (err) {
    console.error('Load file error:', err);
    res.status(500).json({ msg: 'Failed to load file data' });
  }
});

module.exports = router;
