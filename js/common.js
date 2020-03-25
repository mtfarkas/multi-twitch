const LOG = {
  info: 'INFO',
  error: 'ERROR',
  warn: 'WARN',
};

const validChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';
const validCharsLength = validChars.length;

function randomId(len) {
  const result = [];
  for (let i = 0; i <= len; i++) {
    result.push(validChars.charAt(Math.floor(Math.random() * validCharsLength)));
  }
  return result.join('');
}

// source https://stackoverflow.com/a/9899701
function docReady(fn) {
  // see if DOM is already available
  if (document.readyState === 'complete' || document.readyState === 'interactive') {
    // call on next available tick
    setTimeout(fn, 1);
  } else {
    document.addEventListener('DOMContentLoaded', fn);
  }
}
