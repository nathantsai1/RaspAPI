const { general_error } = require('./errors.js');


// check the POST requests for errors
function normal_post(strings, res) {
    if (!strings.api_key) {
        res.status(404).json(general_error(404, 'missing required arguments', 'argument(s) missing: "api_key"'));
        return false;
    }
    return true;
}

function normal_db(num, res, returns) {
    if (num === 1) {
        res.status(408).json(general_error(409, 'invalid user', "user doesn't exist"));
        return false;
    } else if (num === 2) {
        res.status(408).json(general_error(409, 'invalid password', "password doesn't match"));
        return false;
    } else if (num === 3) {
        res.status(408).json(general_error(501, 'server-side error', "try again in a few minutes"));
        return false;
    } else if (num === 4 || num === -1) {
        res.status(408).json(general_error(501, 'server-side error', "try again in a few minutes"));
        return false;
    }
    if (returns == true){
        res.json({message: "Success"});
    }
    return true;
}



module.exports = { normal_post, normal_db}