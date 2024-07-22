// Third-party imports
const express = require('express');
const { PrismaClient } = require('@prisma/client');
const cors = require('cors');
require('dotenv').config();
// Local imports
const authRoutes = require('./routes/auth');
const routes = require('./routes');

const prisma = new PrismaClient();
const app = express();

app.use(express.json());

app.use(cors());
app.use('/api', routes);
app.use('/auth', authRoutes);

const PORT = process.env.PORT || 5000

app.listen(PORT, () =>
  console.log('REST API server ready at: http://localhost:' + PORT),
)