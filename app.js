const express = require('express');
const logger = require('morgan');
const path = require('path');

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/', require('./routes/index'));

// serve static files from folder
app.use(express.static('public'));

module.exports = app;
