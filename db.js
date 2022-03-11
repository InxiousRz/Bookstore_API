var sqlite3_db = require('better-sqlite3');

const DBSOURCE = "db.sqlite";
// const DBSOURCE = ":memory:";


let book_query = `
    CREATE TABLE IF NOT EXISTS book (
        book_id integer PRIMARY KEY AUTOINCREMENT,
        author_id integer,
        title text, 
        summary text, 
        stock integer, 
        price integer,
        cover_url text, 
        created_time integer, 
        FOREIGN KEY (author_id) 
            REFERENCES author (author_id)
    )
`;

let author_query = `
    CREATE TABLE IF NOT EXISTS author (
        author_id integer PRIMARY KEY AUTOINCREMENT,
        name text,
        pen_name integer,
        email text,  
        password text,
        active_refresh_token text,
        is_disabled boolean DEFAULT false,
        created_time integer
        

    )
`;

let sales_query = `
    CREATE TABLE IF NOT EXISTS sales (
        sales_id integer PRIMARY KEY AUTOINCREMENT,
        name text,
        email text,
        book_title integer,  
        author_id integer,
        quantity integer,
        price_per_unit integer,
        price_total integer,
        created_time integer

    )
`;

let db = new sqlite3_db(DBSOURCE, { verbose: console.log });
console.log('Connected to the SQLite database.');

// author CREATE
let author_table_stmt = db.prepare(author_query);
author_table_stmt.run();
console.log('Head table created to the SQLite database.');

// book CREATE
let book_table_stmt = db.prepare(book_query);
book_table_stmt.run();
console.log('Detail table created to the SQLite database.');

// sales CREATE
let sales_table_stmt = db.prepare(sales_query);
sales_table_stmt.run();
console.log('Detail table created to the SQLite database.');

// HARD PARAM
let begin = db.prepare('BEGIN');
let commit = db.prepare('COMMIT');
let rollback = db.prepare('ROLLBACK');


exports.db = db;
exports.begin = begin;
exports.commit = commit;
exports.rollback = rollback;