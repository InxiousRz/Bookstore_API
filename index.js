// IMPORTS
// ===============================================================================
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const compression = require('compression');
const moment_tz = require('moment-timezone');
const db = require('./db');


String.prototype.replaceAll = function(search, replacement) {
    var target = this;
    return target.replace(new RegExp(search, 'g'), replacement);
};


// EXPRESS JS
// ===============================================================================

// CONST
const app = express();

// SET
app.use(cors());
app.use(express.json({
    limit:'10mb' //UPLOAD IMAGE
}));
app.use(helmet()); //A lvl 2 helmet
app.use(compression()); //Compress all routes

// STATIC IMAGE
app.use("/images", express.static(
    __dirname + '/images',
    {
        setHeaders: function setHeaders(res, path, stat) {
          res.header('Access-Control-Allow-Origin', '*');
          res.header('Cross-Origin-Resource-Policy', 'cross-origin');
          res.header('Access-Control-Allow-Methods', 'GET');
          res.header('Access-Control-Allow-Headers', 'Content-Type');
        }
    }
));

// APP HOMEs
// ===============================================================================
const project_alias = 'v1';
app.get('/', (req, res)=>{
    res.send("pong");
});
app.get(`/${project_alias}/`, (req, res)=>{
    res.send({
        project_name :"bookstore backend",
        greetings: "👋 from bookstore",
        info: {
            current_time: moment_tz().toLocaleString() 
        }
    });
});

// ===============================================================================
// ROUTES
// ===============================================================================

// ROUTE IMPORT [3RD PARTY ROUTE]
//------------------------------------------------------------------------

// ROUTE IMPORT [DEV]
//------------------------------------------------------------------------
const r_author = require('./author');
const r_book = require('./book');
const r_sales = require('./sales');

// ROUTE IMPLEMENTATION
app.use(`/bookstore_api/author`, r_author);
app.use(`/bookstore_api/book`, r_book);
app.use(`/bookstore_api/sales`, r_sales);

// ROUTE IMPORT [VERSION 1]
//------------------------------------------------------------------------

// EXPORTS
// ===============================================================================
module.exports = app;
