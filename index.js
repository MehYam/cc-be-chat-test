const httpServer = require('./httpServer');
const User = require('./user');
const ConnectionManager = require('./connectionManager.js');

const cm = new ConnectionManager(httpServer);