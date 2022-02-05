// Console colors
const colors = require('colors');

// [INFO] console out
const info = function (message) {
    console.log(colors.cyan('[INFO]'), message);
}

// [ERROR] console out
const error = function (message) {
    console.log(colors.red('[ERROR]'), message);
}

// [SUCCESS] console out
const success = function (message) {
    console.log(colors.green('[SUCCESS]'), message);
}

// [AUTH] console out
const auth = function (message) {
    console.log(colors.yellow('[AUTH]'), message);
}

// Module exports
module.exports.info = info;
module.exports.error = error;
module.exports.success = success;
module.exports.auth = auth;
