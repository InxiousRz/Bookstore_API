// IMPORTS
// ===============================================================================
const db = require('./db').db;
const begin = require('./db').begin;
const commit = require('./db').commit;
const rollback = require('./db').rollback;
const moment_tz = require('moment-timezone');


// FUNCTIONS
// ===============================================================================
const comparePassword = require('./encryption').comparePassword;
const generateRefreshToken = require('./token').generateRefreshToken;
const generateAccessToken = require('./token').generateAccessToken;
const verifyRefreshToken = require('./token').verifyRefreshToken;

// MODELS
// ===============================================================================


// Login Author
// ===============================================================================
function loginAuthor(
    email, 
    password
){

    let success;
    let result;

    try {

        let action_time = moment_tz();
        console.log(action_time);

        // QUERY
        // =============================================================================
        let author_stmt =  db.prepare(
            `
                SELECT 
                    author_id as "Author_ID",
                    name as "Name",
                    pen_name as "Pen_Name",
                    email as "Email",
                    password as "Password"
                FROM author
                WHERE email = '${email}' and is_disabled = false
                ORDER BY author_id asc
            `
        );
        let author_data = author_stmt.get();

        // NOT FOUND
        // =============================================================================
        if(!author_data){
            success = true;
            result = "NOT_FOUND";
            return [
                success,
                result
            ]; 
        }

        console.log('author data fetched :: ' + author_data["Author_ID"].toString());

        let hash_password = author_data["Password"];
        let password_valid = comparePassword(password, hash_password);
        
        // INVALID PASSWORD
        // =============================================================================
        if(!password_valid){
            success = true;
            result = "INVALID_PASSWORD";
            return [
                success,
                result
            ]; 
        }

        // DELETE PASSWORD
        // =============================================================================
        delete author_data["Password"]; 


        // TOKEN REFRESH
        // =============================================================================
        let [refresh_token_success, refresh_token_result] = generateRefreshToken(
            author_data
        );

        if(!refresh_token_success){
            throw new Error(refresh_token_result);
        }

        

        // BEGIN
        // =============================================================================
        begin.run();

        // UPDATE TO DB AUTHOR - TOKEN REFRESH
        // =============================================================================
        let update_head_stmt = db.prepare(
            `
                UPDATE author 
                SET active_refresh_token = '${refresh_token_result}'
                WHERE author_id = ${author_data["Author_ID"]}
            `
        );
        let update_head_info = update_head_stmt.run();
        console.log('author data updated :: ' + author_data["Author_ID"].toString());


        // TOKEN ACCESS
        // =============================================================================
        let [access_token_success, access_token_result] = generateAccessToken(
            author_data
        );

        if(!access_token_success){
            throw new Error(access_token_result);
        }

        // COMMIT
        commit.run();
        
        // RESULT
        // =============================================================================
        result = {
            "Refresh_Token": refresh_token_result,
            "Access_Token": access_token_result
        }; 
        
        success = true;

    } catch(err) {

        if (db.inTransaction) rollback.run();
        console.log(err.message);
        success = false;
        result = err.message;


    }

    return [
        success,
        result
    ];

}

// logout Author
// ===============================================================================
function logoutAuthor(
    author_id
){

    let success;
    let result;

    try {

        let action_time = moment_tz();
        console.log(action_time);

        // BEGIN
        // =============================================================================
        begin.run();

        // UPDATE TO DB AUTHOR - LOGOUT
        // =============================================================================
        let update_head_stmt = db.prepare(
            `
                UPDATE author 
                SET active_refresh_token = null
                WHERE author_id = ${author_id}
            `
        );
        let update_head_info = update_head_stmt.run();
        console.log('author data updated :: ' + author_id.toString());

        // COMMIT
        commit.run();
        
        // RESULT
        // =============================================================================
        result = null; 
        
        success = true;

    } catch(err) {

        if (db.inTransaction) rollback.run();
        console.log(err.message);
        success = false;
        result = err.message;


    }

    return [
        success,
        result
    ];

}


// logout Author
// ===============================================================================
function refreshTokenAuthor(
    refresh_token
){

    let success;
    let result;

    try {

        let action_time = moment_tz();
        console.log(action_time);


        // VALIDATE TOKEN
        // =============================================================================
        let [validate_success, validate_result] = verifyRefreshToken(
            refresh_token
        )
    
        if(!validate_success){
            throw new Error(validate_result);
        }
    
    
        if(validate_result == "TokenExpiredError"){
            success = true;
            result = "TOKEN_EXPIRED";
            return [
                success,
                result
            ]; 
        }

        // QUERY
        // =============================================================================
        let author_id = validate_result["Author_ID"];
        let author_stmt =  db.prepare(
            `
                SELECT 
                    active_refresh_token as "Active_Refresh_Token"
                FROM author
                WHERE author_id = ${author_id}
            `
        );
        let author_data = author_stmt.get();

        // NOT FOUND
        // =============================================================================
        if(!author_data){
            success = true;
            result = "INVALID_TOKEN";
            return [
                success,
                result
            ]; 
        }

        console.log('author data fetched :: ' + author_id.toString());
        

        // COMPARE REFRESH TOKEN
        // =============================================================================
        let active_refresh_token = author_data["Active_Refresh_Token"];
        if(!refresh_token == active_refresh_token){
            success = true;
            result = "INVALID_TOKEN";
            return [
                success,
                result
            ]; 
        }



        // TOKEN ACCESS
        // =============================================================================
        let [access_token_success, access_token_result] = generateAccessToken(
            {
                "Author_ID": validate_result["Author_ID"],
                "Name": validate_result["Name"],
                "Pen_Name": validate_result["Pen_Name"],
                "Email": validate_result["Email"]
            } // Pass Data
        );

        if(!access_token_success){
            throw new Error(access_token_result);
        }
        
        // RESULT
        // =============================================================================
        result = {
            "Access_Token": access_token_result
        }; 
        
        success = true;

    } catch(err) {
        
        console.log(err.message);
        success = false;
        result = err.message;


    }

    return [
        success,
        result
    ];

}




// EXPORTS
// ===============================================================================
exports.loginAuthor = loginAuthor;
exports.logoutAuthor = logoutAuthor;
exports.refreshTokenAuthor = refreshTokenAuthor;