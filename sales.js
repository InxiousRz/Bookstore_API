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
const addSales = require('./sales-func').addSales;
const getSalesSearchMain = require('./sales-func').getSalesSearchMain;
const getSalesByID = require('./sales-func').getSalesByID;
const logApiBasic = require('./utilities').logApiBasic;

// CONFIGS
// ===============================================================================

// VARS
// ===============================================================================
const router = express.Router();

// FOR '/sales'
const head_route_name = '/sales';


// ROUTES


//------------------------------------------------------------------------
// GET sales
//------------------------------------------------------------------------
router.get('/get_my_sales', authorMiddleware, async (req, res)=>{
    
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
        "Book_Title": joi.string().default(null),
        "Created_Time_Start": joi.date().timestamp('unix').default(null),
        "Created_Time_End": joi.date().timestamp('unix').default(null),
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
    let author_id = res.locals.curr_author_id;
    let book_title = joi_valid.value["Book_Title"];
    let sales_created_start = joi_valid.value["Created_Time_Start"] == null ? null : moment_tz(joi_valid.value["Created_Time_Start"]).unix();
    let sales_created_end = joi_valid.value["Created_Time_End"] == null ? null : moment_tz(joi_valid.value["Created_Time_End"]).unix();
    let current_page = joi_valid.value["Page"];
    let limit = joi_valid.value["Limit"];

    // GET sales
    //=============================================================
    let [sales_success, sales_result] = getSalesSearchMain(
        author_id,
        book_title,
        sales_created_start,
        sales_created_end,
        current_page,
        limit
    );

    // QUERY FAILS
    if (!sales_success){
        console.log(sales_result);
        const message = {
            "message": "Failed",
            "error_key": "error_internal_server",
            "error_message": sales_result,
            "error_data": "ON getSalesSearchMain"
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
        "data": sales_result
    });
    return; //END
    
});


//------------------------------------------------------------------------
// POST ADD sales
//------------------------------------------------------------------------
router.post('/add', async (req, res)=>{

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
        "Email": joi.string().email().required(),
        "Quantity": joi.number().required(),
        "Book_ID": joi.number().required(),
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
    let email = joi_body_valid.value["Email"];
    let quantity = joi_body_valid.value["Quantity"];
    let book_id = joi_body_valid.value["Book_ID"];

    // ADD sales
    //=============================================================
    let [sales_success, sales_result] = addSales(
        name,
        email,
        quantity,
        book_id
    );

    // QUERY FAILS
    if (!sales_success){
        console.log(sales_result);
        const message = {
            "message": "Failed",
            "error_key": "error_internal_server",
            "error_message": sales_result,
            "error_data": "ON addSales"
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
// GET sales By ID
//------------------------------------------------------------------------
router.get('/get/:id', authorMiddleware, async (req, res)=>{

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
    let sales_id = req.params.id;

    // GET sales BY ID
    //=============================================================
    let [sales_success, sales_result] = getSalesByID(
        sales_id
    );

    // QUERY FAILS
    if (!sales_success){
        console.log(sales_result);
        const message = {
            "message": "Failed",
            "error_key": "error_internal_server",
            "error_message": sales_result,
            "error_data": "ON getSalesByID"
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
    if (sales_result == null){
        console.log(sales_result);
        const message = {
            "message": "Failed",
            "error_key": "error_id_not_found",
            "error_message": "Cant found data with id :: " + sales_id.toString(),
            "error_data": {
                "ON": "getSalesByID",
                "ID": sales_id
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
        "data": sales_result
    });
    return; //END
    
});




// EXPORTS
// ===============================================================================
module.exports = router
