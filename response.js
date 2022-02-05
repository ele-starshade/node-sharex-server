const basicResponse = function (res, status, json) {
    res.status(status).json(json)
}

// Responds with 400 bad request and the supplied error message/fix
const responseBadRequest = function (res, errorMessage, errorFix) {
    basicResponse(res, 400, {
        success: false,
        error: {
            message: errorMessage,
            fix: errorFix
        }
    });
}

// Responds with 401 unauthorized and the supplied error message/fix
const responseUnauthorized = function (res, errorMessage, errorFix) {
    basicResponse(res, 401, {
        success: false,
        error: {
            message: errorMessage,
            fix: errorFix
        }
    });
}

// Responds with empty key error
const responseEmptyKey = function (res) {
    responseBadRequest(res, 'Key is empty.', 'Submit a key.');
}

// Responds with invalid key error
const responseInvalidKey = function (res) {
    responseUnauthorized(res, 'Key is invalid.', 'Submit a valid key.');
}

// Responds with no uploaded file error
const responseNoFileUploaded = function (res) {
    responseBadRequest(res, 'No file was uploaded.', 'Upload a file.');
}

// Responds with invalid extension error
const responseInvalidFileExtension = function (res) {
    responseBadRequest(res, 'Invalid file extension.', 'Upload a file with a valid extension.');
}

// Responds with a uploaded response
const responseUploaded = function (res, url, deleteUrl) {
    basicResponse(res, 200, {
        success: true,
        file: {
            url: url,
            delete_url: deleteUrl
        }
    });
}

// Responds with deleted response
const responseDeleted = function (res, fileName) {
    basicResponse(res, 200, {
        success: true,
        message: "Deleted file " + fileName
    })
}

// Responds with a file does not exists error
const responseFileDoesntExists = function (res) {
    responseBadRequest(res, 'The file does not exists.', 'Submit a existing file name.')
}

// Responds with a file name is empty error
const responseFileNameIsEmpty = function (res) {
    responseBadRequest(res, 'File name is empty.', 'Provide a file name.');
}

module.exports.emptyKey = responseEmptyKey;
module.exports.invalidKey = responseInvalidKey;
module.exports.noFileUploaded = responseNoFileUploaded;
module.exports.invalidFileExtension = responseInvalidFileExtension;
module.exports.uploaded = responseUploaded;
module.exports.deleted = responseDeleted;
module.exports.fileDoesNotExists = responseFileDoesntExists;
module.exports.fileNameIsEmpty = responseFileNameIsEmpty;
