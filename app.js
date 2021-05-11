const express = require('express');
const asyncHandler = require('express-async-handler');
const { join } = require('path');
const { notFound, errorHandler } = require('./errors/handlers');
const apiRouter = require('./routes/api');
const uploadRouter = require('./routes/upload');
const helmet = require('helmet');
const compression = require('compression');
const morgan = require('morgan');
const cors = require('cors');
const { IS_DEV } = require('./env');
const app = express();

const { stream } = require('./utils/logger');
const { authenticate } = require('../sw7up-backend/shared/middlewares/auth');

app.use(helmet());
app.use(compression());

app.use(morgan(IS_DEV ? 'dev' : 'combined', { stream }));
app.use(cors());
app.use(
  '/uploads',
  authenticate,
  asyncHandler(async (req, res, next) => {
    const url = `${HOST}${req.originalUrl}`;
    console.log('static url check:::', url);
    next();
  }),
  express.static(join(__dirname, 'uploads'))
);
// if (staticOptions) staticOptions.forEach(options => app.use(...options));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(apiRouter);
app.use('/upload', uploadRouter);
app.use(notFound);
app.use(errorHandler);

module.exports = app;
