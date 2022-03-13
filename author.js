// IMPORTS
// ===============================================================================
const express = require('express');
const joi = require('joi');
const moment_tz = require('moment-timezone');

// MIDDLEWARES
// ===============================================================================
const authorMiddleware = require('./middleware').authorMiddleware;

// MODELS
// ===============================================================================

// FUNCTIONS
// ===============================================================================
const addAuthor = require('./author-func').addAuthor;
const getAuthorSearchMain = require('./author-func').getAuthorSearchMain;
const getAuthorByID = require('./author-func').getAuthorByID;
const updateAuthor = require('./author-func').updateAuthor;
const deleteAuthor = require('./author-func').deleteAuthor;
const checkAuthorIDExists = require('./author-func').checkAuthorIDExists;
const checkAuthorEmailExists = require('./author-func').checkAuthorEmailExists;
const loginAuthor = require('./auth').loginAuthor;
const logoutAuthor = require('./auth').logoutAuthor;
const refreshTokenAuthor = require('./auth').refreshTokenAuthor;
const changePasswordAuthor = require('./auth').changePasswordAuthor;
const resetPasswordAuthor = require('./auth').resetPasswordAuthor;
const logApiBasic = require('./utilities').logApiBasic;

// CONFIGS
// ===============================================================================

// VARS
// ===============================================================================
const router = express.Router();

// FOR '/author'
const head_route_name = '/author';


// ROUTES


//------------------------------------------------------------------------
// GET author
//------------------------------------------------------------------------
router.get('/get', async (req, res)=>{
    
    // BASIC REQUEST INFO
    //=============================================================
    const request_namepath = req.path;
    const time_requested = moment_tz().tz('Asia/Jakarta');

    // PARAM
    //=============================================================
    const data_toview_on_error = {
        "QUERY": req.query
    };
    const url_query = req.query;
    console.log(data_toview_on_error);

    // JOI VALIDATION
    //=============================================================
    let joi_schema = joi.object({
        "Name": joi.string().default(null),
        "Page": joi.number().min(1).required(),
        "Limit": joi.number().default(20).invalid(0)
    }).required();

    let joi_valid = joi_schema.validate(url_query);
    if (joi_valid.error){
        const message = {
            "message": "Failed",
            "error_key": "error_param",
            "error_message": joi_valid.error.stack,
            "error_data": joi_valid.error.details
        };
        //LOGGING
        logApiBasic(
            `Request ${head_route_name}/${request_namepath} Failed`,
            `REQUEST GOT AT : ${time_requested} \n` +
            "REQUEST BODY/PARAM : \n" +
            JSON.stringify(data_toview_on_error, null, 2),
            JSON.stringify(message, null, 2)
        );
        res.status(200).json(message);
        return; //END
    }

    // PARAMETER
    //=============================================================
    let name = joi_valid.value["Name"];
    let is_disabled = false;
    let current_page = joi_valid.value["Page"];
    let limit = joi_valid.value["Limit"];

    // GET author
    //=============================================================
    let [author_success, author_result] = getAuthorSearchMain(
        name,
        is_disabled,
        current_page,
        limit
    );

    // QUERY FAILS
    if (!author_success){
        console.log(author_result);
        const message = {
            "message": "Failed",
            "error_key": "error_internal_server",
            "error_message": author_result,
            "error_data": "ON getAuthorSearchMain"
        };
        //LOGGING
        logApiBasic(
            `Request ${head_route_name}/${request_namepath} Failed`,
            `REQUEST GOT AT : ${time_requested} \n` +
            "REQUEST BODY/PARAM : \n" +
            JSON.stringify(data_toview_on_error, null, 2),
            JSON.stringify(message, null, 2)
        );
        res.status(200).json(message);
        return; //END
    }


    // ASSEMBLY RESPONSE
    //=============================================================
    res.status(200).json({
        "message": "Success",
        "data": author_result
    });
    return; //END
    
});


//------------------------------------------------------------------------
// PUT UPDATE author
//------------------------------------------------------------------------
router.put('/update', authorMiddleware, async (req, res)=>{

    // BASIC REQUEST INFO
    //=============================================================
    const request_namepath = req.path;
    const time_requested = moment_tz().tz('Asia/Jakarta');

    // PARAM
    //=============================================================
    const data_toview_on_error = {
        "PARAMS": req.params,
        "BODY": req.body
    };
    const req_body = req.body;

    // JOI VALIDATION
    //=============================================================
    let joi_body_schema = joi.object({
        "Name": joi.string().required(),
        "Pen_Name": joi.string().required(),
    }).required();

    let joi_id_schema = joi.number().required();

    let joi_body_valid = joi_body_schema.validate(req_body);
    if (joi_body_valid.error){
        const message = {
            "message": "Failed",
            "error_key": "error_param",
            "error_message": joi_body_valid.error.stack,
            "error_data": joi_body_valid.error.details
        };
        //LOGGING
        logApiBasic(
            `Request ${head_route_name}/${request_namepath} Failed`,
            `REQUEST GOT AT : ${time_requested} \n` +
            "REQUEST BODY/PARAM : \n" +
            JSON.stringify(data_toview_on_error, null, 2),
            JSON.stringify(message, null, 2)
        );
        res.status(200).json(message);
        return; //END
    }

    let joi_id_valid = joi_id_schema.validate(res.locals.curr_author_id);
    if (joi_id_valid.error){
        const message = {
            "message": "Failed",
            "error_key": "error_param",
            "error_message": joi_id_valid.error.stack,
            "error_data": joi_id_valid.error.details
        };
        //LOGGING
        logApiBasic(
            `Request ${head_route_name}/${request_namepath} Failed`,
            `REQUEST GOT AT : ${time_requested} \n` +
            "REQUEST BODY/PARAM : \n" +
            JSON.stringify(data_toview_on_error, null, 2),
            JSON.stringify(message, null, 2)
        );
        res.status(200).json(message);
        return; //END
    }


    // PARAMETER
    //=============================================================
    let author_id = res.locals.curr_author_id;
    let name = joi_body_valid.value["Name"];
    let pen_name = joi_body_valid.value["Pen_Name"];

    // CHECK ID author
    //=============================================================
    let [check_author_success, check_author_result] = checkAuthorIDExists(
        author_id
    );

    // QUERY FAILS
    if (!check_author_success){
        console.log(check_author_result);
        const message = {
            "message": "Failed",
            "error_key": "error_internal_server",
            "error_message": check_author_result,
            "error_data": "ON checkAuthorIDExists"
        };
        //LOGGING
        logApiBasic(
            `Request ${head_route_name}/${request_namepath} Failed`,
            `REQUEST GOT AT : ${time_requested} \n` +
            "REQUEST BODY/PARAM : \n" +
            JSON.stringify(data_toview_on_error, null, 2),
            JSON.stringify(message, null, 2)
        );
        res.status(200).json(message);
        return; //END
    }

    // ID DOESNT EXISTS
    if (!check_author_result){
        console.log(check_author_result);
        const message = {
            "message": "Failed",
            "error_key": "error_author_id_not_found",
            "error_message": "Author ID not listed on db :: " + author_id.toString(),
            "error_data": {
                "ON": "checkAuthorIDExists",
                "ID": author_id
            }
        };
        //LOGGING
        logApiBasic(
            `Request ${head_route_name}/${request_namepath} Failed`,
            `REQUEST GOT AT : ${time_requested} \n` +
            "REQUEST BODY/PARAM : \n" +
            JSON.stringify(data_toview_on_error, null, 2),
            JSON.stringify(message, null, 2)
        );
        res.status(200).json(message);
        return; //END
    }

    // UPDATE author
    //=============================================================
    let [author_success, author_result] = updateAuthor(
        author_id,
        name,
        pen_name
    );

    // QUERY FAILS
    if (!author_success){
        console.log(author_result);
        const message = {
            "message": "Failed",
            "error_key": "error_internal_server",
            "error_message": author_result,
            "error_data": "ON updateAuthor"
        };
        //LOGGING
        logApiBasic(
            `Request ${head_route_name}/${request_namepath} Failed`,
            `REQUEST GOT AT : ${time_requested} \n` +
            "REQUEST BODY/PARAM : \n" +
            JSON.stringify(data_toview_on_error, null, 2),
            JSON.stringify(message, null, 2)
        );
        res.status(200).json(message);
        return; //END
    }


    // ASSEMBLY RESPONSE
    //=============================================================
    res.status(200).json({
        "message": "Success"
    });
    return; //END
    
});

//------------------------------------------------------------------------
// PUT UPDATE author
//------------------------------------------------------------------------
router.put('/change_password', authorMiddleware, async (req, res)=>{

    // BASIC REQUEST INFO
    //=============================================================
    const request_namepath = req.path;
    const time_requested = moment_tz().tz('Asia/Jakarta');

    // PARAM
    //=============================================================
    const data_toview_on_error = {
        "PARAMS": req.params,
        "BODY": req.body
    };
    const req_body = req.body;

    // JOI VALIDATION
    //=============================================================
    let joi_body_schema = joi.object({
        "Old_Password": joi.string().required(),
        "New_Password": joi.string().required(),
    }).required();

    let joi_id_schema = joi.number().required();

    let joi_body_valid = joi_body_schema.validate(req_body);
    if (joi_body_valid.error){
        const message = {
            "message": "Failed",
            "error_key": "error_param",
            "error_message": joi_body_valid.error.stack,
            "error_data": joi_body_valid.error.details
        };
        //LOGGING
        logApiBasic(
            `Request ${head_route_name}/${request_namepath} Failed`,
            `REQUEST GOT AT : ${time_requested} \n` +
            "REQUEST BODY/PARAM : \n" +
            JSON.stringify(data_toview_on_error, null, 2),
            JSON.stringify(message, null, 2)
        );
        res.status(200).json(message);
        return; //END
    }

    let joi_id_valid = joi_id_schema.validate(res.locals.curr_author_id);
    if (joi_id_valid.error){
        const message = {
            "message": "Failed",
            "error_key": "error_param",
            "error_message": joi_id_valid.error.stack,
            "error_data": joi_id_valid.error.details
        };
        //LOGGING
        logApiBasic(
            `Request ${head_route_name}/${request_namepath} Failed`,
            `REQUEST GOT AT : ${time_requested} \n` +
            "REQUEST BODY/PARAM : \n" +
            JSON.stringify(data_toview_on_error, null, 2),
            JSON.stringify(message, null, 2)
        );
        res.status(200).json(message);
        return; //END
    }


    // PARAMETER
    //=============================================================
    let author_id = res.locals.curr_author_id;
    let old_password = joi_body_valid.value["Old_Password"];
    let new_password = joi_body_valid.value["New_Password"];

    // CHECK ID author
    //=============================================================
    let [check_author_success, check_author_result] = checkAuthorIDExists(
        author_id
    );

    // QUERY FAILS
    if (!check_author_success){
        console.log(check_author_result);
        const message = {
            "message": "Failed",
            "error_key": "error_internal_server",
            "error_message": check_author_result,
            "error_data": "ON checkAuthorIDExists"
        };
        //LOGGING
        logApiBasic(
            `Request ${head_route_name}/${request_namepath} Failed`,
            `REQUEST GOT AT : ${time_requested} \n` +
            "REQUEST BODY/PARAM : \n" +
            JSON.stringify(data_toview_on_error, null, 2),
            JSON.stringify(message, null, 2)
        );
        res.status(200).json(message);
        return; //END
    }

    // ID DOESNT EXISTS
    if (!check_author_result){
        console.log(check_author_result);
        const message = {
            "message": "Failed",
            "error_key": "error_author_id_not_found",
            "error_message": "Author ID not listed on db :: " + author_id.toString(),
            "error_data": {
                "ON": "checkAuthorIDExists",
                "ID": author_id
            }
        };
        //LOGGING
        logApiBasic(
            `Request ${head_route_name}/${request_namepath} Failed`,
            `REQUEST GOT AT : ${time_requested} \n` +
            "REQUEST BODY/PARAM : \n" +
            JSON.stringify(data_toview_on_error, null, 2),
            JSON.stringify(message, null, 2)
        );
        res.status(200).json(message);
        return; //END
    }

    // UPDATE author
    //=============================================================
    let [change_pass_success, change_pass_result] = changePasswordAuthor(
        author_id,
        old_password,
        new_password
    );

    // QUERY FAILS
    if (!change_pass_success){
        console.log(change_pass_result);
        const message = {
            "message": "Failed",
            "error_key": "error_internal_server",
            "error_message": change_pass_result,
            "error_data": "ON changePasswordAuthor"
        };
        //LOGGING
        logApiBasic(
            `Request ${head_route_name}/${request_namepath} Failed`,
            `REQUEST GOT AT : ${time_requested} \n` +
            "REQUEST BODY/PARAM : \n" +
            JSON.stringify(data_toview_on_error, null, 2),
            JSON.stringify(message, null, 2)
        );
        res.status(200).json(message);
        return; //END
    }

    // EMAIL NOT FOUND
    if (change_pass_result == "NOT_FOUND"){
        console.log(change_pass_result);
        const message = {
            "message": "Failed",
            "error_key": "error_author_id_not_found",
            "error_message": "Author ID not listed on db :: " + author_id.toString(),
            "error_data": "ON changePasswordAuthor"
        };
        //LOGGING
        logApiBasic(
            `Request ${head_route_name}/${request_namepath} Failed`,
            `REQUEST GOT AT : ${time_requested} \n` +
            "REQUEST BODY/PARAM : \n" +
            JSON.stringify(data_toview_on_error, null, 2),
            JSON.stringify(message, null, 2)
        );
        res.status(200).json(message);
        return; //END
    }

    // PASSWORD INVALID
    if (change_pass_result == "INVALID_PASSWORD"){
        console.log(change_pass_result);
        const message = {
            "message": "Failed",
            "error_key": "error_invalid_password",
            "error_message": "Invalid password for user :: " + author_id.toString(),
            "error_data": "ON changePasswordAuthor"
        };
        //LOGGING
        logApiBasic(
            `Request ${head_route_name}/${request_namepath} Failed`,
            `REQUEST GOT AT : ${time_requested} \n` +
            "REQUEST BODY/PARAM : \n" +
            JSON.stringify(data_toview_on_error, null, 2),
            JSON.stringify(message, null, 2)
        );
        res.status(200).json(message);
        return; //END
    }


    // ASSEMBLY RESPONSE
    //=============================================================
    res.status(200).json({
        "message": "Success"
    });
    return; //END
    
});


//------------------------------------------------------------------------
// POST ADD author
//------------------------------------------------------------------------
router.post('/register', async (req, res)=>{

    // BASIC REQUEST INFO
    //=============================================================
    const request_namepath = req.path;
    const time_requested = moment_tz().tz('Asia/Jakarta');

    // PARAM
    //=============================================================
    const data_toview_on_error = {
        "PARAMS": req.params,
        "BODY": req.body
    };
    const req_body = req.body;

    // JOI VALIDATION
    //=============================================================
    let joi_body_schema = joi.object({
        "Name": joi.string().required(),
        "Pen_Name": joi.string().required(),
        "Email": joi.string().email().required(),
        "Password": joi.string().required(),
    }).required();

    let joi_body_valid = joi_body_schema.validate(req_body);
    if (joi_body_valid.error){
        const message = {
            "message": "Failed",
            "error_key": "error_param",
            "error_message": joi_body_valid.error.stack,
            "error_data": joi_body_valid.error.details
        };
        //LOGGING
        logApiBasic(
            `Request ${head_route_name}/${request_namepath} Failed`,
            `REQUEST GOT AT : ${time_requested} \n` +
            "REQUEST BODY/PARAM : \n" +
            JSON.stringify(data_toview_on_error, null, 2),
            JSON.stringify(message, null, 2)
        );
        res.status(200).json(message);
        return; //END
    }


    // PARAMETER
    //=============================================================
    let name = joi_body_valid.value["Name"];
    let pen_name = joi_body_valid.value["Pen_Name"];
    let email = joi_body_valid.value["Email"];
    let password = joi_body_valid.value["Password"];


    // ADD author
    //=============================================================
    let [email_success, email_result] = checkAuthorEmailExists(
        email
    );

    // QUERY FAILS
    if (!email_success){
        console.log(email_result);
        const message = {
            "message": "Failed",
            "error_key": "error_internal_server",
            "error_message": email_result,
            "error_data": "ON checkAuthorEmailExists"
        };
        //LOGGING
        logApiBasic(
            `Request ${head_route_name}/${request_namepath} Failed`,
            `REQUEST GOT AT : ${time_requested} \n` +
            "REQUEST BODY/PARAM : \n" +
            JSON.stringify(data_toview_on_error, null, 2),
            JSON.stringify(message, null, 2)
        );
        res.status(200).json(message);
        return; //END
    }

    // EMAIL FOUND
    if (email_result == true){
        console.log(email_result);
        const message = {
            "message": "Failed",
            "error_key": "error_email_duplicate",
            "error_message": "Email already registered :: " + email.toString(),
            "error_data": {
                "ON": "checkAuthorEmailExists",
                "Email": email
            }
        };
        //LOGGING
        logApiBasic(
            `Request ${head_route_name}/${request_namepath} Failed`,
            `REQUEST GOT AT : ${time_requested} \n` +
            "REQUEST BODY/PARAM : \n" +
            JSON.stringify(data_toview_on_error, null, 2),
            JSON.stringify(message, null, 2)
        );
        res.status(200).json(message);
        return; //END
    }


    // ADD author
    //=============================================================
    let [author_success, author_result] = addAuthor(
        name,
        pen_name,
        email,
        password
    );

    // QUERY FAILS
    if (!author_success){
        console.log(author_result);
        const message = {
            "message": "Failed",
            "error_key": "error_internal_server",
            "error_message": author_result,
            "error_data": "ON addAuthor"
        };
        //LOGGING
        logApiBasic(
            `Request ${head_route_name}/${request_namepath} Failed`,
            `REQUEST GOT AT : ${time_requested} \n` +
            "REQUEST BODY/PARAM : \n" +
            JSON.stringify(data_toview_on_error, null, 2),
            JSON.stringify(message, null, 2)
        );
        res.status(200).json(message);
        return; //END
    }


    // ASSEMBLY RESPONSE
    //=============================================================
    res.status(200).json({
        "message": "Success"
    });
    return; //END
    
});


//------------------------------------------------------------------------
// DELETE author
//------------------------------------------------------------------------
router.delete('/delete', authorMiddleware, async (req, res)=>{

    // BASIC REQUEST INFO
    //=============================================================
    const request_namepath = req.path;
    const time_requested = moment_tz().tz('Asia/Jakarta');

    // PARAM
    //=============================================================
    const data_toview_on_error = {
        "PARAMS": req.params,
        "BODY": req.body,
        "HEADER": req.headers
    };

    // JOI VALIDATION
    //=============================================================
    let joi_id_schema = joi.number().required();

    let joi_id_valid = joi_id_schema.validate(res.locals.curr_author_id);
    if (joi_id_valid.error){
        const message = {
            "message": "Failed",
            "error_key": "error_param",
            "error_message": joi_id_valid.error.stack,
            "error_data": joi_id_valid.error.details
        };
        //LOGGING
        logApiBasic(
            `Request ${head_route_name}/${request_namepath} Failed`,
            `REQUEST GOT AT : ${time_requested} \n` +
            "REQUEST BODY/PARAM : \n" +
            JSON.stringify(data_toview_on_error, null, 2),
            JSON.stringify(message, null, 2)
        );
        res.status(200).json(message);
        return; //END
    }


    // PARAMETER
    //=============================================================
    let author_id = res.locals.curr_author_id;

    // CHECK ID author
    //=============================================================
    let [check_author_success, check_author_result] = checkAuthorIDExists(
        author_id
    );

    // QUERY FAILS
    if (!check_author_success){
        console.log(check_author_result);
        const message = {
            "message": "Failed",
            "error_key": "error_internal_server",
            "error_message": check_author_result,
            "error_data": "ON checkAuthorIDExists"
        };
        //LOGGING
        logApiBasic(
            `Request ${head_route_name}/${request_namepath} Failed`,
            `REQUEST GOT AT : ${time_requested} \n` +
            "REQUEST BODY/PARAM : \n" +
            JSON.stringify(data_toview_on_error, null, 2),
            JSON.stringify(message, null, 2)
        );
        res.status(200).json(message);
        return; //END
    }

    // ID DOESNT EXISTS
    if (!check_author_result){
        console.log(check_author_result);
        const message = {
            "message": "Failed",
            "error_key": "error_author_id_not_found",
            "error_message": "Author ID not listed on db :: " + author_id.toString(),
            "error_data": {
                "ON": "checkAuthorIDExists",
                "ID": author_id
            }
        };
        //LOGGING
        logApiBasic(
            `Request ${head_route_name}/${request_namepath} Failed`,
            `REQUEST GOT AT : ${time_requested} \n` +
            "REQUEST BODY/PARAM : \n" +
            JSON.stringify(data_toview_on_error, null, 2),
            JSON.stringify(message, null, 2)
        );
        res.status(200).json(message);
        return; //END
    }


    // DELETE author
    //=============================================================
    let [author_success, author_result] = deleteAuthor(
        author_id
    );

    // QUERY FAILS
    if (!author_success){
        console.log(author_result);
        const message = {
            "message": "Failed",
            "error_key": "error_internal_server",
            "error_message": author_result,
            "error_data": "ON updateAuthor"
        };
        //LOGGING
        logApiBasic(
            `Request ${head_route_name}/${request_namepath} Failed`,
            `REQUEST GOT AT : ${time_requested} \n` +
            "REQUEST BODY/PARAM : \n" +
            JSON.stringify(data_toview_on_error, null, 2),
            JSON.stringify(message, null, 2)
        );
        res.status(200).json(message);
        return; //END
    }


    // ASSEMBLY RESPONSE
    //=============================================================
    res.status(200).json({
        "message": "Success"
    });
    return; //END
    
});


//------------------------------------------------------------------------
// GET author By ID
//------------------------------------------------------------------------
router.get('/get_my_profile', authorMiddleware, async (req, res)=>{

    // BASIC REQUEST INFO
    //=============================================================
    const request_namepath = req.path;
    const time_requested = moment_tz().tz('Asia/Jakarta');

    // PARAM
    //=============================================================
    const data_toview_on_error = {
        "HEADER": req.headers
    };

    // JOI VALIDATION
    //=============================================================

    // PARAMETER
    //=============================================================
    let author_id = res.locals.curr_author_id;

    // GET author BY ID
    //=============================================================
    let [author_success, author_result] = getAuthorByID(
        author_id
    );

    // QUERY FAILS
    if (!author_success){
        console.log(author_result);
        const message = {
            "message": "Failed",
            "error_key": "error_internal_server",
            "error_message": author_result,
            "error_data": "ON getAuthorByID"
        };
        //LOGGING
        logApiBasic(
            `Request ${head_route_name}/${request_namepath} Failed`,
            `REQUEST GOT AT : ${time_requested} \n` +
            "REQUEST BODY/PARAM : \n" +
            JSON.stringify(data_toview_on_error, null, 2),
            JSON.stringify(message, null, 2)
        );
        res.status(200).json(message);
        return; //END
    }

    // ID NOT FOUND
    if (author_result == null){
        console.log(author_result);
        const message = {
            "message": "Failed",
            "error_key": "error_author_id_not_found",
            "error_message": "Author ID not listed on db :: " + author_id.toString(),
            "error_data": {
                "ON": "getAuthorByID",
                "ID": author_id
            }
        };
        //LOGGING
        logApiBasic(
            `Request ${head_route_name}/${request_namepath} Failed`,
            `REQUEST GOT AT : ${time_requested} \n` +
            "REQUEST BODY/PARAM : \n" +
            JSON.stringify(data_toview_on_error, null, 2),
            JSON.stringify(message, null, 2)
        );
        res.status(200).json(message);
        return; //END
    }


    // ASSEMBLY RESPONSE
    //=============================================================
    res.status(200).json({
        "message": "Success",
        "data": author_result
    });
    return; //END
    
});


//------------------------------------------------------------------------
// GET author By ID
//------------------------------------------------------------------------
router.get('/get/:id', async (req, res)=>{

    // BASIC REQUEST INFO
    //=============================================================
    const request_namepath = req.path;
    const time_requested = moment_tz().tz('Asia/Jakarta');

    // PARAM
    //=============================================================
    const data_toview_on_error = {
        "PARAMS": req.params
    };

    // JOI VALIDATION
    //=============================================================
    let joi_id_schema = joi.number().required();

    let joi_id_valid = joi_id_schema.validate(req.params.id);
    if (joi_id_valid.error){
        const message = {
            "message": "Failed",
            "error_key": "error_param",
            "error_message": joi_id_valid.error.stack,
            "error_data": joi_id_valid.error.details
        };
        //LOGGING
        logApiBasic(
            `Request ${head_route_name}/${request_namepath} Failed`,
            `REQUEST GOT AT : ${time_requested} \n` +
            "REQUEST BODY/PARAM : \n" +
            JSON.stringify(data_toview_on_error, null, 2),
            JSON.stringify(message, null, 2)
        );
        res.status(200).json(message);
        return; //END
    }

    // PARAMETER
    //=============================================================
    let author_id = req.params.id;

    // GET author BY ID
    //=============================================================
    let [author_success, author_result] = getAuthorByID(
        author_id
    );

    // QUERY FAILS
    if (!author_success){
        console.log(author_result);
        const message = {
            "message": "Failed",
            "error_key": "error_internal_server",
            "error_message": author_result,
            "error_data": "ON getAuthorByID"
        };
        //LOGGING
        logApiBasic(
            `Request ${head_route_name}/${request_namepath} Failed`,
            `REQUEST GOT AT : ${time_requested} \n` +
            "REQUEST BODY/PARAM : \n" +
            JSON.stringify(data_toview_on_error, null, 2),
            JSON.stringify(message, null, 2)
        );
        res.status(200).json(message);
        return; //END
    }

    // ID NOT FOUND
    if (author_result == null){
        console.log(author_result);
        const message = {
            "message": "Failed",
            "error_key": "error_author_id_not_found",
            "error_message": "Author ID not listed on db :: " + author_id.toString(),
            "error_data": {
                "ON": "getAuthorByID",
                "ID": author_id
            }
        };
        //LOGGING
        logApiBasic(
            `Request ${head_route_name}/${request_namepath} Failed`,
            `REQUEST GOT AT : ${time_requested} \n` +
            "REQUEST BODY/PARAM : \n" +
            JSON.stringify(data_toview_on_error, null, 2),
            JSON.stringify(message, null, 2)
        );
        res.status(200).json(message);
        return; //END
    }


    // ASSEMBLY RESPONSE
    //=============================================================
    res.status(200).json({
        "message": "Success",
        "data": author_result
    });
    return; //END
    
});


//------------------------------------------------------------------------
// POST ADD author login
//------------------------------------------------------------------------
router.post('/login', async (req, res)=>{

    // BASIC REQUEST INFO
    //=============================================================
    const request_namepath = req.path;
    const time_requested = moment_tz().tz('Asia/Jakarta');

    // PARAM
    //=============================================================
    const data_toview_on_error = {
        "PARAMS": req.params,
        "BODY": req.body
    };
    const req_body = req.body;

    // JOI VALIDATION
    //=============================================================
    let joi_body_schema = joi.object({
        "Email": joi.string().required(),
        "Password": joi.string().required(),
    }).required();

    let joi_body_valid = joi_body_schema.validate(req_body);
    if (joi_body_valid.error){
        const message = {
            "message": "Failed",
            "error_key": "error_param",
            "error_message": joi_body_valid.error.stack,
            "error_data": joi_body_valid.error.details
        };
        //LOGGING
        logApiBasic(
            `Request ${head_route_name}/${request_namepath} Failed`,
            `REQUEST GOT AT : ${time_requested} \n` +
            "REQUEST BODY/PARAM : \n" +
            JSON.stringify(data_toview_on_error, null, 2),
            JSON.stringify(message, null, 2)
        );
        res.status(200).json(message);
        return; //END
    }


    // PARAMETER
    //=============================================================
    let email = joi_body_valid.value["Email"];
    let password = joi_body_valid.value["Password"];

    // ADD author
    //=============================================================
    let [author_success, author_result] = loginAuthor(
        email,
        password
    );

    // QUERY FAILS
    if (!author_success){
        console.log(author_result);
        const message = {
            "message": "Failed",
            "error_key": "error_internal_server",
            "error_message": author_result,
            "error_data": "ON loginAuthor"
        };
        //LOGGING
        logApiBasic(
            `Request ${head_route_name}/${request_namepath} Failed`,
            `REQUEST GOT AT : ${time_requested} \n` +
            "REQUEST BODY/PARAM : \n" +
            JSON.stringify(data_toview_on_error, null, 2),
            JSON.stringify(message, null, 2)
        );
        res.status(200).json(message);
        return; //END
    }

    // EMAIL NOT FOUND
    if (author_result == "NOT_FOUND"){
        console.log(author_result);
        const message = {
            "message": "Failed",
            "error_key": "error_email_not_found",
            "error_message": "Email is not listed on db :: " + email.toString(),
            "error_data": "ON loginAuthor"
        };
        //LOGGING
        logApiBasic(
            `Request ${head_route_name}/${request_namepath} Failed`,
            `REQUEST GOT AT : ${time_requested} \n` +
            "REQUEST BODY/PARAM : \n" +
            JSON.stringify(data_toview_on_error, null, 2),
            JSON.stringify(message, null, 2)
        );
        res.status(200).json(message);
        return; //END
    }

    // PASSWORD INVALID
    if (author_result == "INVALID_PASSWORD"){
        console.log(author_result);
        const message = {
            "message": "Failed",
            "error_key": "error_invalid_password",
            "error_message": "Invalid password for user :: " + email.toString(),
            "error_data": "ON loginAuthor"
        };
        //LOGGING
        logApiBasic(
            `Request ${head_route_name}/${request_namepath} Failed`,
            `REQUEST GOT AT : ${time_requested} \n` +
            "REQUEST BODY/PARAM : \n" +
            JSON.stringify(data_toview_on_error, null, 2),
            JSON.stringify(message, null, 2)
        );
        res.status(200).json(message);
        return; //END
    }


    // ASSEMBLY RESPONSE
    //=============================================================
    res.status(200).json({
        "message": "Success",
        "data": author_result
    });
    return; //END
    
});


//------------------------------------------------------------------------
// POST ADD author login
//------------------------------------------------------------------------
router.post('/forgot_password', async (req, res)=>{

    // BASIC REQUEST INFO
    //=============================================================
    const request_namepath = req.path;
    const time_requested = moment_tz().tz('Asia/Jakarta');

    // PARAM
    //=============================================================
    const data_toview_on_error = {
        "PARAMS": req.params,
        "BODY": req.body
    };
    const req_body = req.body;

    // JOI VALIDATION
    //=============================================================
    let joi_body_schema = joi.object({
        "Email": joi.string().email().required()
    }).required();

    let joi_body_valid = joi_body_schema.validate(req_body);
    if (joi_body_valid.error){
        const message = {
            "message": "Failed",
            "error_key": "error_param",
            "error_message": joi_body_valid.error.stack,
            "error_data": joi_body_valid.error.details
        };
        //LOGGING
        logApiBasic(
            `Request ${head_route_name}/${request_namepath} Failed`,
            `REQUEST GOT AT : ${time_requested} \n` +
            "REQUEST BODY/PARAM : \n" +
            JSON.stringify(data_toview_on_error, null, 2),
            JSON.stringify(message, null, 2)
        );
        res.status(200).json(message);
        return; //END
    }


    // PARAMETER
    //=============================================================
    let email = joi_body_valid.value["Email"];

    // NEW PASSWORD
    //=============================================================
    let [change_pass_success, change_pass_result] = resetPasswordAuthor(
        email
    );

    // QUERY FAILS
    if (!change_pass_success){
        console.log(change_pass_result);
        const message = {
            "message": "Failed",
            "error_key": "error_internal_server",
            "error_message": change_pass_result,
            "error_data": "ON resetPasswordAuthor"
        };
        //LOGGING
        logApiBasic(
            `Request ${head_route_name}/${request_namepath} Failed`,
            `REQUEST GOT AT : ${time_requested} \n` +
            "REQUEST BODY/PARAM : \n" +
            JSON.stringify(data_toview_on_error, null, 2),
            JSON.stringify(message, null, 2)
        );
        res.status(200).json(message);
        return; //END
    }

    // EMAIL NOT FOUND
    if (change_pass_result == "NOT_FOUND"){
        console.log(change_pass_result);
        const message = {
            "message": "Failed",
            "error_key": "error_email_not_found",
            "error_message": "Email is not listed on db :: " + email.toString(),
            "error_data": "ON resetPasswordAuthor"
        };
        //LOGGING
        logApiBasic(
            `Request ${head_route_name}/${request_namepath} Failed`,
            `REQUEST GOT AT : ${time_requested} \n` +
            "REQUEST BODY/PARAM : \n" +
            JSON.stringify(data_toview_on_error, null, 2),
            JSON.stringify(message, null, 2)
        );
        res.status(200).json(message);
        return; //END
    }

    // ASSEMBLY RESPONSE
    //=============================================================
    res.status(200).json({
        "message": "Success",
        "data": {
            "New_Password": change_pass_result
        }
    });
    return; //END
    
});


//------------------------------------------------------------------------
// POST ADD author logout
//------------------------------------------------------------------------
router.post('/logout', authorMiddleware, async (req, res)=>{

    // BASIC REQUEST INFO
    //=============================================================
    const request_namepath = req.path;
    const time_requested = moment_tz().tz('Asia/Jakarta');

    // PARAM
    //=============================================================
    const data_toview_on_error = {
        "HEADER": req.headers
    };

    // JOI VALIDATION
    //=============================================================


    // PARAMETER
    //=============================================================
    let author_id = res.locals.curr_author_id;

    // ADD author
    //=============================================================
    let [author_success, author_result] = logoutAuthor(
        author_id
    );

    // QUERY FAILS
    if (!author_success){
        console.log(author_result);
        const message = {
            "message": "Failed",
            "error_key": "error_internal_server",
            "error_message": author_result,
            "error_data": "ON logoutAuthor"
        };
        //LOGGING
        logApiBasic(
            `Request ${head_route_name}/${request_namepath} Failed`,
            `REQUEST GOT AT : ${time_requested} \n` +
            "REQUEST BODY/PARAM : \n" +
            JSON.stringify(data_toview_on_error, null, 2),
            JSON.stringify(message, null, 2)
        );
        res.status(200).json(message);
        return; //END
    }


    // ASSEMBLY RESPONSE
    //=============================================================
    res.status(200).json({
        "message": "Success"
    });
    return; //END
    
});


//------------------------------------------------------------------------
// POST ADD author login
//------------------------------------------------------------------------
router.post('/refresh_token', async (req, res)=>{

    // BASIC REQUEST INFO
    //=============================================================
    const request_namepath = req.path;
    const time_requested = moment_tz().tz('Asia/Jakarta');

    // PARAM
    //=============================================================
    const data_toview_on_error = {
        "PARAMS": req.params,
        "BODY": req.body
    };
    const req_body = req.body;

    // JOI VALIDATION
    //=============================================================
    let joi_body_schema = joi.object({
        "Refresh_Token": joi.string().required(),
    }).required();

    let joi_body_valid = joi_body_schema.validate(req_body);
    if (joi_body_valid.error){
        const message = {
            "message": "Failed",
            "error_key": "error_param",
            "error_message": joi_body_valid.error.stack,
            "error_data": joi_body_valid.error.details
        };
        //LOGGING
        logApiBasic(
            `Request ${head_route_name}/${request_namepath} Failed`,
            `REQUEST GOT AT : ${time_requested} \n` +
            "REQUEST BODY/PARAM : \n" +
            JSON.stringify(data_toview_on_error, null, 2),
            JSON.stringify(message, null, 2)
        );
        res.status(200).json(message);
        return; //END
    }


    // PARAMETER
    //=============================================================
    let refresh_token = joi_body_valid.value["Refresh_Token"];

    // REFRESH TOKEN
    //=============================================================
    let [refresh_success, refresh_result] = refreshTokenAuthor(
        refresh_token
    );

    // QUERY FAILS
    if (!refresh_success){
        console.log(refresh_result);
        const message = {
            "message": "Failed",
            "error_key": "error_internal_server",
            "error_message": refresh_result,
            "error_data": "ON refreshTokenAuthor"
        };
        //LOGGING
        logApiBasic(
            `Request ${head_route_name}/${request_namepath} Failed`,
            `REQUEST GOT AT : ${time_requested} \n` +
            "REQUEST BODY/PARAM : \n" +
            JSON.stringify(data_toview_on_error, null, 2),
            JSON.stringify(message, null, 2)
        );
        res.status(200).json(message);
        return; //END
    }

    // EXPIRED TOKEN
    if (refresh_result == "TOKEN_EXPIRED"){
        console.log(refresh_result);
        const message = {
            "message": "Failed",
            "error_key": "error_refresh_token_expired",
            "error_message": "Refresh token is expired, please re-login",
            "error_data": "ON refreshTokenAuthor"
        };
        //LOGGING
        logApiBasic(
            `Request ${head_route_name}/${request_namepath} Failed`,
            `REQUEST GOT AT : ${time_requested} \n` +
            "REQUEST BODY/PARAM : \n" +
            JSON.stringify(data_toview_on_error, null, 2),
            JSON.stringify(message, null, 2)
        );
        res.status(401).json(message);
        return; //END
    }

    // INVALID TOKEN
    if (refresh_result == "INVALID_TOKEN"){
        console.log(refresh_result);
        const message = {
            "message": "Failed",
            "error_key": "error_refresh_token_invalid",
            "error_message": "Refresh token is invalid, please re-login",
            "error_data": "ON refreshTokenAuthor"
        };
        //LOGGING
        logApiBasic(
            `Request ${head_route_name}/${request_namepath} Failed`,
            `REQUEST GOT AT : ${time_requested} \n` +
            "REQUEST BODY/PARAM : \n" +
            JSON.stringify(data_toview_on_error, null, 2),
            JSON.stringify(message, null, 2)
        );
        res.status(401).json(message);
        return; //END
    }


    // ASSEMBLY RESPONSE
    //=============================================================
    res.status(200).json({
        "message": "Success",
        "data": refresh_result
    });
    return; //END
    
});


// EXPORTS
// ===============================================================================
module.exports = router
