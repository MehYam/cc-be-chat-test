const ws = require('ws');

class ConnectionManager {
   constructor(httpServer) {
      console.log('creating websocket ConnectionManager');

      this.clients = new Set();

      this.server = new ws.Server({ server: httpServer });
      this.server.on('listening', () => { console.log('ConnectionManager listening'); });
      this.server.on('connection', (ws, req) => {
         const client = new Client(this, ws);
         this.clients.add(client);
      });
      this.server.on('error', error => {
         console.error('ConnectionManager error', error);
      });
   }

   onClientJoin(client) {
      // send this client the userlist

      // broadcast the join to everyone
   }
   onClientChat(client, chat) {
      const message = { chat };
      for (const client of this.clients) {
         client.send(JSON.stringify(message));
      }
   }
   onClientLeave(client) {
      this.clients.delete(client);
   }
}

class Client {
   constructor(manager, websocket) {
      this.manager = manager;
      this.websocket = websocket;
      this.name = null;

      this.received = 0;
      this.sent = 0;

      this.websocket = websocket;
      this.websocket.onmessage = event => {this.onmessage(event)};
      this.websocket.onerror = event => {this.onerror(event)};
      this.websocket.onclose = event => {this.onclose(event)};
   }
   onmessage(event) {
      ++this.received;
      console.log('Client message', event.data);

      const message = JSON.parse(event.data);
      if (message.name) {
         this.name = message.name;
         this.manager.onClientJoin(client);
      }
      else if (message.chat) {
         this.manager.onClientChat(message)
      }
   }
   onerror(event) {
      console.error('Client error', event);
   }
   onclose(event) {
      console.long('Client closed');
   }
   send(payload) {
      this.websocket.send(JSON.stringify(payload));
      ++this.sent;
   }
}

module.exports = ConnectionManager;