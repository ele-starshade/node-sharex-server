/**
 * @author ravi0lii and contributors
 */

// Constants
const config = require('./config.json')
const version = require('./package.json').version;

// Get the port
const PORT = config.port;

// Custom modules
const logger = require('./logger.js');
const response = require('./response.js');
const middleware = require('./middleware.js');
// Random string
const randomString = require('random-string');
// Path
const path = require('path');

// Filesystem
const fs = require('fs');
// file-exists
const fileExists = require('file-exists');
// Q promises/deferreds
const Q = require('q');

// Create uploads directory if it does not exists and local static files should be served
if (config.useLocalStaticServe && !fs.existsSync(config.uploadDirectory)) {
    fs.mkdirSync(config.uploadDirectory);
    logger.info('Created upload directory');
}

// Express basic stuff
const express = require('express');
const app = express();

// Static directory for files
if (config.useLocalStaticServe) {
    app.use('/f', express.static(config.uploadDirectory));
}

// body-parser middleware
const bodyParser = require('body-parser');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
    extended: true
}));

// express-fileupload middleware
const fileUpload = require('express-fileupload');
app.use(fileUpload({
    safeFileNames: true,
    preserveExtension: true,
    limits: {
        fileSize: config.fileSizeLimit
    }
}));

// / page
app.get('/', function (req, res) {
    res.send('This server runs <a href="https://github.com/ravi0lii/node-sharex-server">node-sharex-server</a> v' + version + ' by <a href="https://github.com/ravi0lii">ravi0lii</a>.');
});

// Upload file
app.post('/upload', middleware.keyRequired, function (req, res) {
    // Check if file was uploaded
    if (!req.files || !req.files.file) {
        logger.info('No file was sent, aborting... (' + req.locals.shortKey + ')');
        response.noFileUploaded(res);
    } else {
        // File was uploaded
        const file = req.files.file;

        // Generate a unique path (so it will not conflict with any existing files named the same)
        const getUniqueFilepathDeferred = Q.defer();
        const fileExtension = path.extname(file.name);

        const tryNewRandomString = function () {
            const newFileName = randomString({ length: config.fileNameLength }) + fileExtension;
            const uploadPath = path.join(config.uploadDirectory, newFileName);

            fileExists(uploadPath).then(function (doesFileExist) {
                if (doesFileExist) {
                    tryNewRandomString();
                } else {
                    getUniqueFilepathDeferred.resolve({ fileName: newFileName, path: uploadPath });
                }
            }, function (err) {
                res.status(500).send(err + ' (' + req.locals.shortKey + ')'); // TODO: Better handling
            });
        };
        tryNewRandomString();

        getUniqueFilepathDeferred.promise.then(function (payload) {
            logger.info('Uploading file ' + file.name + ' to ' + payload.path + ' (' + req.locals.shortKey + ')');

            // Check file extension (if enabled)
            if (config.fileExtensionCheck.enabled && config.fileExtensionCheck.extensionsAllowed.indexOf(fileExtension) == -1) {
                // Invalid file extension
                logger.info('File ' + file.name + ' has an invalid extension, aborting... (' + req.locals.shortKey + ')');
                response.invalidFileExtension(res);
            } else {
                // Move files
                file.mv(payload.path, function (err) {
                    if (err) {
                        logger.error(err + ' (' + req.locals.shortKey + ')');
                        return res.status(500).send(err); // TODO: Better error handling
                    }

                    // Return the informations
                    logger.info('Uploaded file ' + file.name + ' to ' + payload.path + ' (' + req.locals.shortKey + ')');
                    response.uploaded(res, config.staticFileServerUrl + payload.fileName, config.serverUrl + '/delete?filename=' + payload.fileName + '&key=' + key);
                });
            }
        });
    }
});

// Delete file
app.get('/delete', middleware.keyRequired, function (req, res) {
    if (!req.query.filename) {
        response.responseFileNameIsEmpty(res);
    } else {
        // Generate file informations
        const fileName = req.query.filename;
        const filePath = path.join(config.uploadDirectory, fileName);
        logger.info('Trying to delete ' + fileName + ' (' + req.locals.shortKey + ')');

        // Check if file exists
        fileExists(filePath, function (err, exists) {
            if (err) {
                logger.error(err + ' (' + req.locals.shortKey + ')');
                return res.status(500).send(err); // TODO: Better error handling
            }

            if (!exists) {
                // File doesnt exists
                logger.info('File ' + fileName + ' doesnt exists, aborting... (' + req.locals.shortKey + ')');
                response.fileDoesNotExists(res);
            } else {
                // File exists => Delete file
                fs.unlink(filePath, function (err) {
                    if (err) {
                        logger.error(err + ' (' + req.locals.shortKey + ')');
                        return res.status(500).send(err); // TODO: Better error handling
                    }

                    // Return the information
                    logger.info('Deleted file ' + fileName + ' (' + req.locals.shortKey + ')');
                    response.deleted(res, fileName);
                });
            }
        });
    }
});

// based on whether or not SSL is enabled, run http or https web server
let server;
if (!config.ssl.useSSL) {
    const http = require('http');
    server = http.createServer(app);
} else {
    const https = require('https');
    server = https.createServer({
        key: fs.readFileSync(config.ssl.privateKeyPath, 'utf8'),
        cert: fs.readFileSync(config.ssl.certificatePath, 'utf8')
    }, app);
}

server.listen(PORT);
logger.success('Now listening on port ' + PORT);
