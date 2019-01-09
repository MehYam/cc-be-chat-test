const fs = require('fs');

// if it's not possible to do this efficiently on the server, it could be pushed to the clients,
// which makes more sense given that clients may want to opt out

let foulestRegexEver = null;
try {
   // make a big regular expression out of the banned words.  
   const content = fs.readFileSync('list.txt', 'utf8');
   words = content.split(/\s*[\r\n]+\s*/g);

   foulestRegexEver = new RegExp(words.join('|'), 'gi');
}
catch(err) {
   console.error('error loading profanity filter spec', err);
}

function makeHoly(unwashed) {
   var retval = unwashed;

   const matches = unwashed.match(foulestRegexEver);
   if (matches) {
      for (const match of matches) {
         const holy = '*'.repeat(match.length);
         retval = retval.replace(match, holy);
      }
   }
   return retval;
}

module.exports = { makeHoly };