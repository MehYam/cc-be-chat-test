const fs = require('fs');

// if it's expensive doing this on the server, it easily could be pushed to the clients,
// which may make more sense given that some clients will want to opt out of filtering anyway

let foulestRegexEver = null;
try {
   // make a giant regular expression out of the banned words.  No idea how efficient this is.
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