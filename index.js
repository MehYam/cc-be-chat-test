const httpServer = require('./httpServer');
const ConnectionManager = require('./connectionManager.js');

const cm = new ConnectionManager(httpServer);