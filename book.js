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
const addBook = require('./book-func').addBook;
const getBookSearchMain = require('./book-func').getBookSearchMain;
const getBookByID = require('./book-func').getBookByID;
const updateBook = require('./book-func').updateBook;
const deleteBook = require('./book-func').deleteBook;
const checkBookIDExists = require('./book-func').checkBookIDExists;
const updateBookCover = require('./book-func').updateBookCover;
const saveBase64CoverLocal = require('./files_manager').saveBase64CoverLocal;
const logApiBasic = require('./utilities').logApiBasic;

// CONFIGS
// ===============================================================================

// VARS
// ===============================================================================
const router = express.Router();

// FOR '/book'
const head_route_name = '/book';


// ROUTES



//------------------------------------------------------------------------
// GET book
//------------------------------------------------------------------------
router.get('/get_my_book', authorMiddleware, async (req, res)=>{
    
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
        "Title": joi.string().default(null),
        // "Author_ID": joi.number().default(null),
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
    let title = joi_valid.value["Title"];
    let author_id = res.locals.curr_author_id;
    let stocked = null;
    let current_page = joi_valid.value["Page"];
    let limit = joi_valid.value["Limit"];

    // GET book
    //=============================================================
    let [book_success, book_result] = getBookSearchMain(
        title,
        author_id,
        stocked,
        current_page,
        limit
    );

    // QUERY FAILS
    if (!book_success){
        console.log(book_result);
        const message = {
            "message": "Failed",
            "error_key": "error_internal_server",
            "error_message": book_result,
            "error_data": "ON getBookSearchMain"
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
        "data": book_result
    });
    return; //END
    
});

//------------------------------------------------------------------------
// GET book
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
        "Title": joi.string().default(null),
        "Author_ID": joi.number().default(null),
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
    let title = joi_valid.value["Title"];
    let author_id = joi_valid.value["Author_ID"];
    let stocked = true;
    let current_page = joi_valid.value["Page"];
    let limit = joi_valid.value["Limit"];

    // GET book
    //=============================================================
    let [book_success, book_result] = getBookSearchMain(
        title,
        author_id,
        stocked,
        current_page,
        limit
    );

    // QUERY FAILS
    if (!book_success){
        console.log(book_result);
        const message = {
            "message": "Failed",
            "error_key": "error_internal_server",
            "error_message": book_result,
            "error_data": "ON getBookSearchMain"
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
        "data": book_result
    });
    return; //END
    
});


//------------------------------------------------------------------------
// PUT UPDATE book
//------------------------------------------------------------------------
router.put('/update/:id', authorMiddleware, async (req, res)=>{

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
        "Title": joi.string().required(),
        "Summary": joi.string().required(),
        "Price": joi.number().min(1).required(),
        "Stock": joi.number().min(1).required(),
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
    let book_id = req.params.id;
    let title = joi_body_valid.value["Title"];
    let summary = joi_body_valid.value["Summary"];
    let price = joi_body_valid.value["Price"];
    let stock = joi_body_valid.value["Stock"];

    // CHECK ID book
    //=============================================================
    let [check_book_success, check_book_result] = checkBookIDExists(
        book_id
    );

    // QUERY FAILS
    if (!check_book_success){
        console.log(check_book_result);
        const message = {
            "message": "Failed",
            "error_key": "error_internal_server",
            "error_message": check_book_result,
            "error_data": "ON checkBookIDExists"
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
    if (!check_book_result){
        console.log(check_book_result);
        const message = {
            "message": "Failed",
            "error_key": "error_id_not_found",
            "error_message": "Cant found data with id :: " + book_id.toString(),
            "error_data": {
                "ON": "checkBookIDExists",
                "ID": book_id
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

    // UPDATE book
    //=============================================================
    let [book_success, book_result] = updateBook(
        book_id,
        title,
        summary,
        price,
        stock
    );

    // QUERY FAILS
    if (!book_success){
        console.log(book_result);
        const message = {
            "message": "Failed",
            "error_key": "error_internal_server",
            "error_message": book_result,
            "error_data": "ON updateBook"
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
// PUT UPDATE book cover
//------------------------------------------------------------------------
router.put('/update_cover/:id', authorMiddleware, async (req, res)=>{

    // BASIC REQUEST INFO
    //=============================================================
    const request_namepath = req.path;
    const time_requested = moment_tz().tz('Asia/Jakarta');

    // PARAM
    //=============================================================
    const data_toview_on_error = {
        "PARAMS": req.params,
        // "BODY": req.body
    };
    const req_body = req.body;

    // JOI VALIDATION
    //=============================================================
    let joi_body_schema = joi.object({
        "Cover_Image_Base64": joi.string().base64().required(),
        "Image_Extension": joi.string().valid('jpg', 'jpeg', 'png').required(),
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
    let book_id = req.params.id;
    let image_base64 = joi_body_valid.value["Cover_Image_Base64"];
    let image_extension = joi_body_valid.value["Image_Extension"];

    // CHECK ID book
    //=============================================================
    let [check_book_success, check_book_result] = checkBookIDExists(
        book_id
    );

    // QUERY FAILS
    if (!check_book_success){
        console.log(check_book_result);
        const message = {
            "message": "Failed",
            "error_key": "error_internal_server",
            "error_message": check_book_result,
            "error_data": "ON checkBookIDExists"
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
    if (!check_book_result){
        console.log(check_book_result);
        const message = {
            "message": "Failed",
            "error_key": "error_id_not_found",
            "error_message": "Cant found data with id :: " + book_id.toString(),
            "error_data": {
                "ON": "checkBookIDExists",
                "ID": book_id
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


    // SAVE COVER Local
    //=============================================================
    let filename = book_id.toString() + "_cover";
    let file_static_url = saveBase64CoverLocal(
        filename,
        image_base64,
        image_extension
    );



    // UPDATE book
    //=============================================================
    let [book_success, book_result] = updateBookCover(
        book_id,
        file_static_url
    );

    // QUERY FAILS
    if (!book_success){
        console.log(book_result);
        const message = {
            "message": "Failed",
            "error_key": "error_internal_server",
            "error_message": book_result,
            "error_data": "ON updateBookCover"
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
// POST ADD book
//------------------------------------------------------------------------
router.post('/add', authorMiddleware, async (req, res)=>{

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
        "Title": joi.string().required(),
        "Summary": joi.string().required(),
        "Price": joi.number().min(1).required(),
        "Stock": joi.number().min(1).required(),
        "Cover_Image_Base64": joi.string().base64().required(),
        "Image_Extension": joi.string().valid('jpg', 'jpeg', 'png').required(),
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
    let author_id = res.locals.curr_author_id;
    let title = joi_body_valid.value["Title"];
    let summary = joi_body_valid.value["Summary"];
    let price = joi_body_valid.value["Price"];
    let stock = joi_body_valid.value["Stock"];
    let image_base64 = joi_body_valid.value["Cover_Image_Base64"];
    let image_extension = joi_body_valid.value["Image_Extension"];


    // ADD book
    //=============================================================
    let [book_success, book_result] = addBook(
        author_id,
        title,
        summary,
        price,
        stock
    );

    // QUERY FAILS
    if (!book_success){
        console.log(book_result);
        const message = {
            "message": "Failed",
            "error_key": "error_internal_server",
            "error_message": book_result,
            "error_data": "ON addBook"
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



    // SAVE COVER Local
    //=============================================================
    let book_id = book_result;
    let filename = book_id.toString() + "_cover";
    let file_static_url = saveBase64CoverLocal(
        filename,
        image_base64,
        image_extension
    );
    

    // UPDATE book
    //=============================================================
    let [cover_book_success, cover_book_result] = updateBookCover(
        book_id,
        file_static_url
    );

    // QUERY FAILS
    if (!cover_book_success){
        console.log(cover_book_result);
        const message = {
            "message": "Failed",
            "error_key": "error_internal_server",
            "error_message": cover_book_result,
            "error_data": "ON updateBookCover"
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
// DELETE book
//------------------------------------------------------------------------
router.delete('/delete/:id', authorMiddleware, async (req, res)=>{

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
    let book_id = req.params.id;

    // CHECK ID book
    //=============================================================
    let [check_book_success, check_book_result] = checkBookIDExists(
        book_id
    );

    // QUERY FAILS
    if (!check_book_success){
        console.log(check_book_result);
        const message = {
            "message": "Failed",
            "error_key": "error_internal_server",
            "error_message": check_book_result,
            "error_data": "ON checkBookIDExists"
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
    if (!check_book_result){
        console.log(check_book_result);
        const message = {
            "message": "Failed",
            "error_key": "error_id_not_found",
            "error_message": "Cant found data with id :: " + book_id.toString(),
            "error_data": {
                "ON": "checkBookIDExists",
                "ID": book_id
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


    // DELETE book
    //=============================================================
    let [book_success, book_result] = deleteBook(
        book_id
    );

    // QUERY FAILS
    if (!book_success){
        console.log(book_result);
        const message = {
            "message": "Failed",
            "error_key": "error_internal_server",
            "error_message": book_result,
            "error_data": "ON updateBook"
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
// GET book By ID
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
    let book_id = req.params.id;

    // GET book BY ID
    //=============================================================
    let [book_success, book_result] = getBookByID(
        book_id
    );

    // QUERY FAILS
    if (!book_success){
        console.log(book_result);
        const message = {
            "message": "Failed",
            "error_key": "error_internal_server",
            "error_message": book_result,
            "error_data": "ON getBookByID"
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
    if (book_result == null){
        console.log(book_result);
        const message = {
            "message": "Failed",
            "error_key": "error_id_not_found",
            "error_message": "Cant found data with id :: " + book_id.toString(),
            "error_data": {
                "ON": "getBookByID",
                "ID": book_id
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
        "data": book_result
    });
    return; //END
    
});




// EXPORTS
// ===============================================================================
module.exports = router
