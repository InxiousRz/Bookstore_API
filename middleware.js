// IMPORTS
// ===============================================================================
const db = require('./db').db;
const begin = require('./db').begin;
const commit = require('./db').commit;
const rollback = require('./db').rollback;
const moment_tz = require('moment-timezone');
const verifyAccessToken = require('./token').verifyAccessToken;
const logApiBasic = require('./utilities').logApiBasic;



function getUIDFromHeader(req){
    /**
     * @TODO Edge and Internet Explorer do some weird things with the headers
     * So I believe that this should handle more 'edge' cases ;)
     */

    console.log(req.headers);
    let header_target = "authorization";
    header_target = header_target.toLowerCase();
    if (req.headers[header_target]){
      return req.headers[header_target].toString().split("Bearer ")[1];
    }
    return null;
};

// ADD task
// ===============================================================================
function fetchAuthorData(
  author_id, 
){

  let success;
  let result;

  try {

      // HEADER
      let select_author_stmt = db.prepare(
          `
            select 
              author_id,
              name,
              pen_name,
              email
            from author
            where author_id = ${author_id} and is_disabled = false
          `
      );
      let author_data = select_author_stmt.get();
      console.log('author data fetch :: ' + author_id.toString());
      
      success = true;

      
      if(!author_data){
        result = null;

      } else {
        result = author_data;

      }

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

async function authorMiddleware(req, res, next){

  
  const time_requested = moment_tz().tz('Asia/Jakarta');
  let data_toview_on_error = {
    "Header": req.headers
  }

  const auth_token = getUIDFromHeader(req);

  if (auth_token == undefined || auth_token == null){
    const message = {
      "message": "Failed",
      "error_key": "error_no_auth_token",
      "error_message": `Token doesnt exists`,
      "error_data": {
          "Request_Headers": req.headers
      }
    };
    res.status(401).json(message);
    return; //END 

  } else {

    let [validate_success, validate_result] = verifyAccessToken(
      auth_token
    )

    if(!validate_success){
      console.log(validate_result);
      const message = {
          "message": "Failed",
          "error_key": "error_invalid_token",
          "error_message": "Invalid token",
          "error_data": {
            "Request_Headers": req.headers
        }
      };
      //LOGGING
      logApiBasic(
          `Middleware :: authorMiddleware \n`,
          `REQUEST GOT AT : ${time_requested} \n` +
          "REQUEST BODY/PARAM : \n" +
          JSON.stringify(data_toview_on_error, null, 2),
          JSON.stringify(message, null, 2)
      );
      res.status(401).json(message);
      return; //END
    }


    if(validate_result == "TokenExpiredError"){
      console.log(validate_result);
      const message = {
          "message": "Failed",
          "error_key": "error_expired_token",
          "error_message": "Token Expired",
          "error_data": {
            "Request_Headers": req.headers
        }
      };
      //LOGGING
      logApiBasic(
          `Middleware :: authorMiddleware \n`,
          `REQUEST GOT AT : ${time_requested} \n` +
          "REQUEST BODY/PARAM : \n" +
          JSON.stringify(data_toview_on_error, null, 2),
          JSON.stringify(message, null, 2)
      );
      res.status(401).json(message);
      return; //END
    }
    


    // PARAMETER
    //==========================================
    let author_id = validate_result["Author_ID"];



    //==========================================

    let [author_success, author_result] = fetchAuthorData(
      author_id
    );

    // QUERY FAILS
    if (!author_success){
      console.log(author_result);
      const message = {
          "message": "Failed",
          "error_key": "error_internal_server",
          "error_message": author_result,
          "error_data": "ON fetchAuthorData"
      };
      //LOGGING
      logApiBasic(
          `Middleware :: authorMiddleware \n`,
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
          "error_key": "error_invalid_token",
          "error_message": "Cant found data with id on token :: " + author_id.toString(),
          "error_data": {
              "ON": "fetchAuthorData",
              "ID": author_id
          }
      };
      //LOGGING
      logApiBasic(
          `Middleware :: authorMiddleware \n`,
          `REQUEST GOT AT : ${time_requested} \n` +
          "REQUEST BODY/PARAM : \n" +
          JSON.stringify(data_toview_on_error, null, 2),
          JSON.stringify(message, null, 2)
      );
      res.status(401).json(message);
      return; //END
    }



    // PASS SOME DATA
    // ==================================================
    res.locals.curr_author_id = author_id;
    res.locals.curr_author_data = author_result;

    //==========================================

    //NEXT 
    next();


  }

}

//EXPORTS
exports.authorMiddleware = authorMiddleware;
