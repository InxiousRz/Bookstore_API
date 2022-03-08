const bcrypt = require('bcrypt');



function hashPassword(password){

    const hash_password = bcrypt.hashSync(
        password,
        10
    );

    return hash_password;

}


function comparePassword(password, hash_password){

    const valid = bcrypt.compareSync(password, hash_password);

    return valid;

}



exports.hashPassword = hashPassword;
exports.comparePassword = comparePassword;