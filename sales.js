// IMPORTS
// ===============================================================================
const express = require('express');
const joi = require('joi');
const moment_tz = require('moment-timezone');

// MIDDLEWARES
// ===============================================================================

// MODELS
// ===============================================================================

// FUNCTIONS
// ===============================================================================
const addSales = require('./functions').addSales;
const getSalesSearchMain = require('./functions').getSalesSearchMain;
const getSalesByID = require('./functions').getSalesByID;
const updateSales = require('./functions').updateSales;
const deleteSales = require('./functions').deleteSales;
const checkSalesIDExists = require('./functions').checkSalesIDExists;
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
    let current_page = joi_valid.value["Page"];
    let limit = joi_valid.value["Limit"];

    // GET sales
    //=============================================================
    let [sales_success, sales_result] = getSalesSearchMain(
        name,
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
// PUT UPDATE sales
//------------------------------------------------------------------------
router.put('/update/:id', async (req, res)=>{

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
    let name = joi_body_valid.value["Name"];
    let pen_name = joi_body_valid.value["Pen_Name"];

    // CHECK ID sales
    //=============================================================
    let [check_sales_success, check_sales_result] = checkSalesIDExists(
        sales_id
    );

    // QUERY FAILS
    if (!check_sales_success){
        console.log(check_sales_result);
        const message = {
            "message": "Failed",
            "error_key": "error_internal_server",
            "error_message": check_sales_result,
            "error_data": "ON checkSalesIDExists"
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
    if (!check_sales_result){
        console.log(check_sales_result);
        const message = {
            "message": "Failed",
            "error_key": "error_id_not_found",
            "error_message": "Cant found data with id :: " + sales_id.toString(),
            "error_data": {
                "ON": "checkSalesIDExists",
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

    // UPDATE sales
    //=============================================================
    let [sales_success, sales_result] = updateSales(
        sales_id,
        name,
        pen_name
    );

    // QUERY FAILS
    if (!sales_success){
        console.log(sales_result);
        const message = {
            "message": "Failed",
            "error_key": "error_internal_server",
            "error_message": sales_result,
            "error_data": "ON updateSales"
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

    // ADD sales
    //=============================================================
    let [sales_success, sales_result] = addSales(
        name,
        pen_name,
        email,
        password
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
// DELETE sales
//------------------------------------------------------------------------
router.delete('/delete/:id', async (req, res)=>{

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
    let sales_id = req.params.id;

    // CHECK ID sales
    //=============================================================
    let [check_sales_success, check_sales_result] = checkSalesIDExists(
        sales_id
    );

    // QUERY FAILS
    if (!check_sales_success){
        console.log(check_sales_result);
        const message = {
            "message": "Failed",
            "error_key": "error_internal_server",
            "error_message": check_sales_result,
            "error_data": "ON checkSalesIDExists"
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
    if (!check_sales_result){
        console.log(check_sales_result);
        const message = {
            "message": "Failed",
            "error_key": "error_id_not_found",
            "error_message": "Cant found data with id :: " + sales_id.toString(),
            "error_data": {
                "ON": "checkSalesIDExists",
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


    // DELETE sales
    //=============================================================
    let [sales_success, sales_result] = deleteSales(
        sales_id
    );

    // QUERY FAILS
    if (!sales_success){
        console.log(sales_result);
        const message = {
            "message": "Failed",
            "error_key": "error_internal_server",
            "error_message": sales_result,
            "error_data": "ON updateSales"
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
