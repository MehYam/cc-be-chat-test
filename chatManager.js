const ws = require('ws');

const History = require('./history');
const { makeHoly } = require('./profanityFilter');
const { formatElapsedTime } = require('./util');

// ChatManager is our monolithic class that handles the messaging system and chat protocol.
// See the README for thoughts on architecture, performance, and scaling.
class ChatManager {
   constructor(httpServer) {
      console.log('creating websocket ChatManager');

      // one Client instance for each websocket connection.  Not completely necessary as
      // ws provides a similar object, but we need somewhere to store connection-specific
      // things (user name, stats, etc)
      this.clients = new Set();

      // reverse lookup to find clients by name, after they've signed in
      this.nameToClient = {};  

      // stores previous chats, implements /popular and 
      this.history = new History();

      this.server = new ws.Server({ server: httpServer });
      this.server.on('listening', () => { console.log('ChatManager listening'); });
      this.server.on('connection', (ws, req) => {
         const client = new Client(this, ws);
         this.clients.add(client);
      });
      this.server.on('error', error => {
         console.error('ChatManager error', error);
      });
   }

   onClientJoin(joinedClient) {
      //TODO - we're not handling and rejecting duplicate names properly
      this.nameToClient[joinedClient.name] = joinedClient;

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
      joinedClient.send({ history: this.history.log });
   }
   onClientChat(client, chat) {
      chat = makeHoly(chat);

      if (!this.handleSlashCommand(client, chat)) {
         const message = { 
            name: client.name,
            chat 
         };
         for (const client of this.clients) {
            client.send(message);
         }
         this.history.add(message);
      }
   }
   onClientLeave(client) {
      this.clients.delete(client);
      delete this.nameToClient[client.name];
   }
   handleSlashCommand(client, chat) {
      if (chat.indexOf('/popular') === 0) {
         // should really 'render' in a client
         const popular = this.history.popular;
         const render = popular ? '"' + popular.word + '" found ' + popular.hits + ' times' : 'no result';
         client.send({ slashResult: render});
         return true;
      }
      if (chat.indexOf('/stats') === 0) {
         const split = chat.split(/\s+/);
         const statsClient = split.length >= 2 && this.nameToClient[split[1]];
         if (statsClient) {
            const elapsed = Date.now() - statsClient.loggedInSince;
            client.send({ slashResult: 'user logged in for ' + formatElapsedTime(elapsed)});
         }
         else {
            client.send({ slashResult: 'user not found'});
         }
         return true;
      }
      return false;
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

      const message = JSON.parse(event.data);
      if (message.name) {
         this.name = message.name;
         this.loggedInSince = Date.now();
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

module.exports = ChatManager;