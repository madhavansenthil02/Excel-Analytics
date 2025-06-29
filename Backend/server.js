const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

// Load environment variables
dotenv.config();

// Initialize Express app
const app = express();

// Middleware
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true,
}));
app.use('/uploads', express.static('uploads'));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("🚀 Excel Analytics Backend is running!");
});

// MongoDB Connection
const mongoURI = process.env.MONGO_URI
  
mongoose.connect(mongoURI)
.then(() => console.log('MongoDB connected'))
.catch(err => console.log('DB error', err));

// Define Routes
app.use('/api/auth', require('./routes/auth'));

const excelRoutes = require('./routes/excel');
app.use('/api/excel', excelRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});