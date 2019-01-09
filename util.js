function pad(num) {
   return num.toFixed(0).padStart(2, '0');
}
function formatElapsedTime(millis) {
   const seconds = millis / 1000;

   const ss = seconds % 60;
   const mm = (seconds / 60) % 60;
   const hh = (seconds / 3600) % 24;
   const dd = (seconds / 86400);

   return pad(dd) + 'd ' + pad(hh) + 'h ' + pad(mm) + 'm ' + pad(ss) + 's';
}

module.exports = { formatElapsedTime };