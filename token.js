const jwt = require('jsonwebtoken');
const fs = require('fs');


let key_private = fs.readFileSync('./private-key.key', 'utf8');
let key_pub = fs.readFileSync('./public-key.key.pub', 'utf8');
const refresh_key = "ilovemymum";





function generateRefreshToken(author_data){

    let success;
    let refresh_token;

    try {

        refresh_token = jwt.sign(
            author_data,
            refresh_key,
            {
                expiresIn: '1d',
                algorithm: "HS256" // HS256 because why not
            }
        )

        success = true;

    } catch(err){
        console.log(err.message);
        refresh_token = err.message;
        success = false;
    }

    return [success, refresh_token];

}


function generateAccessToken(author_data){

    let success;
    let access_token;

    try {

        access_token = jwt.sign(
            author_data,
            key_private,
            {
                expiresIn: '15m',
                algorithm: "RS256"
            }
        )

        success = true;

    } catch(err){
        console.log(err.message);
        access_token = err.message;
        success = false;
    }

    return [success, access_token];

}


function verifyAccessToken(access_token){

    let success;
    let valid_data;

    try {

        valid_data = jwt.verify(
            access_token,
            key_pub,
            {
                algorithm: "RS256"
            }
        );

        success = true;

    } catch(err){

        console.log(err.message);
        valid_data = err.message;
        success = false;

        // EXPIRED
        if(err.name == "TokenExpiredError"){
            success = true;
            valid_data = "TokenExpiredError";
        }
    }

    return [success, valid_data];

}


function verifyRefreshToken(refresh_token){

    let success;
    let valid_data;

    try {

        valid_data = jwt.verify(
            refresh_token,
            refresh_key,
            {
                algorithm: "HS256"
            }
        );

        success = true;

    } catch(err){

        console.log(err.message);
        valid_data = err.message;
        success = false;

        // EXPIRED
        if(err.name == "TokenExpiredError"){
            success = true;
            valid_data = "TokenExpiredError";
        }
    }

    return [success, valid_data];

}


exports.generateRefreshToken = generateRefreshToken;
exports.generateAccessToken = generateAccessToken;
exports.verifyAccessToken = verifyAccessToken;
exports.verifyRefreshToken = verifyRefreshToken;