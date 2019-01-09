
const LOG_LIMIT = 5;
const POPULAR_THRESHHOLD_MS = 5 * 1000;

class History {
   constructor() {
      // TODO: we should trim this as chats come in by MAX(log limit, /popular threshhold), 
      // it just grows endlessly for now.
      this.msgs = [];
   }
   add(msg) {
      this.msgs.push({ time: Date.now(), ...msg });
   }
   get log() {
      // return the last LOG_LIMIT messages
      const num = Math.min(LOG_LIMIT, this.msgs.length);
      const start = this.msgs.length - num;
      return this.msgs.slice(start, start + num);
   }
   get popular() {
      // loop all chats within the time threshhold, count the words
      const wordMap = new Map();
      const time = Date.now();

      for (const msg of this.msgs.reverse()) {
         if (time - msg.time > POPULAR_THRESHHOLD_MS) break;

         if (!msg.words) {
            // might as well cache this
            msg.words = msg.chat.split(/\s+/);
         }
         for (const word of msg.words) {
            const hits = wordMap.get(word) || 0;
            wordMap.set(word, hits + 1);
         }
      }

      if (wordMap.size) {
         // sort to find the winner
         const wordValues = Array.from(wordMap.entries());
         const winner = wordValues.sort((a, b) => b[1] - a[1])[0];
         return { word: winner[0], hits: winner[1] };
      }
      return null;
   }
}

module.exports = History;

