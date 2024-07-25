// Third-party imports
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
require('dotenv').config();
// Local imports
const openRoutes = require('./routes/auth');
const authRoutes = require('./routes');

const prisma = new PrismaClient();
const app = express();

app.use(express.json());

app.use(cors());
app.use('/api/v1', authRoutes);
app.use('api/auth', openRoutes);

const PORT = process.env.PORT || 5002

app.listen(PORT, () =>
  console.log('REST API server ready at: http://localhost:' + PORT),
)