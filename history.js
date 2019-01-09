
const LOG_LIMIT = 5;
const POPULAR_THRESHHOLD_MS = 20 * 1000;

class History {
   constructor() {
      this.chats = [];
   }
   add(chat) {
      this.chats.push({ time: Date.now(), text: chat });
   }
   get log() {
      // return the last LOG_LIMIT messages
      return this.chats.splice(0, LOG_LIMIT);
   }
   get popular() {
      // loop all chats within the time threshhold, count the words
      const wordMap = new Map();
      const time = Date.now();

      for (const chat of this.chats.reverse()) {
         if (time - chat.time > POPULAR_THRESHHOLD_MS) break;

         if (!chat.words) {
            // might as well cache this
            chat.words = chat.text.split(/\s+/);
         }
         for (const word of chat.words) {
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

