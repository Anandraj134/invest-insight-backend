const express = require('express');
const bodyParser = require('body-parser');
const authRoutes = require('./routes/authRoutes');
const financialRoutes = require('./routes/financialRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
require('dotenv').config();

const app = express();

app.use(bodyParser.json());

// Routes
app.use('/auth', authRoutes);
app.use('/financial', financialRoutes);
app.use('/transaction', transactionRoutes);

// Error handling
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
