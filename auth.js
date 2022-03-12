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
const hashPassword = require('./encryption').hashPassword;

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
                    author_id as "Author_ID",
                    name as "Name",
                    pen_name as "Pen_Name",
                    email as "Email",
                    active_refresh_token as "Active_Refresh_Token"
                FROM author
                WHERE author_id = ${author_id} and is_disabled = false
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
        if(refresh_token != active_refresh_token){
            success = true;
            result = "INVALID_TOKEN";
            return [
                success,
                result
            ]; 
        }


        // TOKEN DATA
        // =============================================================================
        let token_payload = {
            "Author_ID": author_data["Author_ID"],
            "Name": author_data["Name"],
            "Pen_Name": author_data["Pen_Name"],
            "Email": author_data["Email"]
        } ;


        // TOKEN REFRESH
        // =============================================================================
        let [refresh_token_success, refresh_token_result] = generateRefreshToken(
            token_payload
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
                WHERE author_id = ${author_id}
            `
        );
        let update_head_info = update_head_stmt.run();
        console.log('author data updated :: ' + author_id.toString());

        // COMMIT
        commit.run();


        // TOKEN ACCESS
        // =============================================================================
        let [access_token_success, access_token_result] = generateAccessToken(
            token_payload
        );

        if(!access_token_success){
            throw new Error(access_token_result);
        }
        
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


// Change Password Author
// ===============================================================================
function changePasswordAuthor(
    author_id, 
    old_password,
    new_password
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
                WHERE author_id = ${author_id} and is_disabled = false
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

        let hash_password_old = author_data["Password"];
        let password_valid = comparePassword(old_password, hash_password_old);
        
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


        // BEGIN
        begin.run();

        let hash_password_new = hashPassword(new_password);

        // QUERY
        let update_password_stmt = db.prepare(
            `
                UPDATE author
                SET password = '${hash_password_new}'
                WHERE author_id = ${author_id}
            `
        );
        let update_password_info = update_password_stmt.run();
        console.log('author password updated :: ' + author_id.toString());


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


// Reset Password Author
// ===============================================================================
function resetPasswordAuthor(
    email
){

    let success;
    let result;

    try {

        let action_time = moment_tz();
        console.log(action_time);

        
        email = email.toString().replaceAll("'", "''");

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


        // BEGIN
        begin.run();

        let new_password = (Math.random() + 1).toString(36).substring(4);
        let hash_password_new = hashPassword(new_password);

        // QUERY
        let update_password_stmt = db.prepare(
            `
                UPDATE author
                SET password = '${hash_password_new}'
                WHERE author_id = ${author_data["Author_ID"]}
            `
        );
        let update_password_info = update_password_stmt.run();
        console.log('author password updated :: ' + author_data["Author_ID"].toString());


        // COMMIT
        commit.run();
        
        // RESULT
        // =============================================================================
        result = new_password;
        
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


// EXPORTS
// ===============================================================================
exports.loginAuthor = loginAuthor;
exports.logoutAuthor = logoutAuthor;
exports.refreshTokenAuthor = refreshTokenAuthor;
exports.changePasswordAuthor = changePasswordAuthor;
exports.resetPasswordAuthor = resetPasswordAuthor;