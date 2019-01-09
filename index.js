const httpServer = require('./httpServer');
const ChatManager = require('./chatManager');

// ChatManager handles websocket connections and implements our chat protocol.
// See README for extra details.
const instance = new ChatManager(httpServer);