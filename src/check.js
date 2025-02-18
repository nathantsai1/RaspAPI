const { general_error } = require('./errors.js');


// check the POST requests for errors
function normal_post(strings, res) {
    if (!strings.username || !strings.password || !strings.function) {
        console.log(strings.username, strings.password, strings.function)
        res.status(404).json(general_error(404, 'missing required arguments', 'argument(s) missing: "username", "password", and/or "function"'));
        return false;
    } else if (strings.username.length < 4 || strings.password.length < 8) {
        res.status(400).json(general_error(405, 'invalid user and/or password length', 'password and/or username parameter is too short'));
        return false;
    } else if (strings.function != "add_run" && strings.function != "get_today" 
        && strings.function != "set_goal" && strings.function != "get_all" && strings.function != "add_user" 
        && strings.function != "delete_user" && strings.function != "change_password" && strings.function != "change_username"
        && strings.function != "get_all" && strings.function != "find_goal") {
        res.status(400).json(general_error(407, 'invalid function', 'function parameter is not valid'));
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