const ws = require('ws');

const HISTORY_LIMIT = 5;

class ConnectionManager {
   constructor(httpServer) {
      console.log('creating websocket ConnectionManager');

      this.clients = new Set();
      this.history = [];

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

   onClientJoin(joinedClient) {
      // send everyone the new user list - much less efficient than it could be
      const userlist = { users: [] };
      const clients = [...this.clients].filter(client => client.name !== null);
      for (const client of clients) {
         userlist.users.push(client.name);
      }
      for (const client of clients) {
         client.send(userlist);
      }

      // send the new client the chat log
      joinedClient.send({ history: this.history });
   }
   onClientChat(client, chat) {
      const message = { 
         name: client.name,
         chat 
      };
      for (const client of this.clients) {
         client.send(message);
      }

      this.history.push(message);
      if (this.history.length > HISTORY_LIMIT) {
         this.history.shift();
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
         this.manager.onClientJoin(this);
      }
      else if (message.chat && this.name) {
         this.manager.onClientChat(this, message.chat)
      }
   }
   onerror(event) {
      console.error('Client error', event);
   }
   onclose(event) {
      console.log('Client closed');
      this.manager.onClientLeave(this);
   }
   send(payload) {
      console.log('sending', payload);
      this.websocket.send(JSON.stringify(payload));
      ++this.sent;
   }
}

module.exports = ConnectionManager;