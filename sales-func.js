// IMPORTS
// ===============================================================================
const db = require('./db').db;
const begin = require('./db').begin;
const commit = require('./db').commit;
const rollback = require('./db').rollback;
const moment_tz = require('moment-timezone');


// FUNCTIONS
// ===============================================================================
const PaginatePagesSimple = require('./paginate').PaginatePagesSimple;

// MODELS
// ===============================================================================


// ADD Book
// ===============================================================================
function addBook(
    author_id,
    title, 
    summary, 
    price,
    stock
){

    let success;
    let result;

    try {

        let action_time = moment_tz();
        console.log(action_time);


        // PARAM TREATMENT
        title = title.toString().replaceAll("'", "''");
        summary = summary.toString().replaceAll("'", "''");


        // BEGIN
        begin.run();

        // QUERY
        let insert_book_stmt = db.prepare(
            `
                INSERT INTO book(author_id, title, summary, price, stock)
                VALUES (
                    ${author_id},
                    '${title}',
                    '${summary}',
                    ${price},
                    ${stock}
                )
            `
        );

        
        let insert_book_info = insert_book_stmt.run();
        let book_id = insert_book_info.lastInsertRowid;
        console.log('book data created :: ' + book_id.toString());

        // COMMIT
        commit.run();
        
        success = true;
        result = book_id;

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


// GET book SEARCH MAIN
// ===============================================================================
function getBookSearchMain(
    title,
    author_id,
    current_page,
    limit
){

    // GET SAMPLE PARAMETER HASIL DATA
    // ------------------------------------------------------
    let [get_search_success, get_search_result] = getBookSearch(
        title,
        author_id,
        current_page,
        limit
    )

    // IF FAILS
    if (!get_search_success){
        success = false;
        result = get_search_result;
        return [success, result]; // END
    }

    // GET SAMPLE PARAMETER HASIL DATA
    // ------------------------------------------------------
    let [get_search_count_success, get_search_count_result] = getBookSearchCountAll(
        title,
        author_id
    )

    // IF FAILS
    if (!get_search_count_success){
        success = false;
        result = get_search_count_result;
        return [success, result]; // END
    }

    // PAGINATE

    result = PaginatePagesSimple(
        get_search_result,
        current_page,
        limit,
        get_search_count_result
    );
    success = true;

    
    return [success, result]; // END

}


// GET book search
// ===============================================================================
function getBookSearch(
    title,
    author_id,
    current_page,
    limit
){

    let success;
    let result;

    try {

        // BOOK
        let query = `
            SELECT 
                book_id as "Book_ID",
                author_id as "Author_ID",
                title as "Title",
                summary as "Summary",
                price as "Price",
                stock as "Stock",
                cover_url as "Cover_URL"
            FROM book
        `;
        let filter_applied = 0;

        // APPLY SEARCH - title
        if (title != null){

            if (filter_applied == 0){
                query += " where "
            } else {
                query += " and "
            }

            let filter_value = "'" + '%'+title.toString().toLowerCase()+'%' + "'" ;
            query += `  title like ${filter_value}  `;
            filter_applied += 1;
        }


        // APPLY SEARCH - author_id
        if (author_id != null){

            if (filter_applied == 0){
                query += " where "
            } else {
                query += " and "
            }

            let filter_value = author_id;
            query += ` author_id = ${filter_value} `;
            filter_applied += 1;
        }


        // ORDER
        query += `
            ORDER BY book_id asc
        `

        // LIMIT 
        if(limit){
            query += ` LIMIT ${limit} `;
        }
        

        // OFFSET 
        let offset = limit * Math.max(((current_page || 0) - 1), 0);
        query += ` OFFSET ${offset} `;


        console.log(query)


        result = [];

        let search_stmt = db.prepare(
            query
        );
        
        for(const data of search_stmt.iterate()){

            console.log('book data fetched :: ' + data["Book_ID"].toString());

            result.push(
                data
            );
            
        }

        
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


// GET book search Count All
// ===============================================================================
function getBookSearchCountAll(
    title,
    author_id
){

    let success;
    let result;

    try {

        // BOOK
        let query = `
            select  
                --// COUNT ONLY
                COUNT(*) as "Total"
            FROM book
        `;
        let filter_applied = 0;

        // APPLY SEARCH - title
        if (title != null){

            if (filter_applied == 0){
                query += " where "
            } else {
                query += " and "
            }

            let filter_value = "'" + '%'+title.toString().toLowerCase()+'%' + "'" ;
            query += `  title like ${filter_value}  `;
            filter_applied += 1;
        }


        // APPLY SEARCH - author_id
        if (author_id != null){

            if (filter_applied == 0){
                query += " where "
            } else {
                query += " and "
            }

            let filter_value = author_id;
            query += ` author_id = ${filter_value} `;
            filter_applied += 1;
        }


        // ORDER
        query += `
            ORDER BY book_id asc
        `;



        result = [];


        let search_stmt = db.prepare(
            query
        );
        
        let search_result = search_stmt.get();
        result = Number(search_result["Total"]);

        
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


// GET book by ID
// ===============================================================================
function getBookByID(
    book_id,
){

    let success;
    let result = null;

    try {

        // BOOK
        let book_stmt =  db.prepare(
            `
                SELECT 
                    book_id as "Book_ID",
                    author_id as "Author_ID",
                    title as "Title",
                    summary as "Summary",
                    price as "Price",
                    stock as "Stock",
                    cover_url as "Cover_URL"
                FROM book
                WHERE book_id = ${book_id}
                ORDER BY book_id asc
            `
        );
        let book_data = book_stmt.get();
        if(!book_data){
            success = true;
            result = null;
            return [
                success,
                result
            ]; 
        }

        console.log('book data fetched :: ' + book_data["Book_ID"].toString());
        
        result = book_data;

        
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


// UPDATE book by ID
// ===============================================================================
function updateBook(
    book_id,
    title,
    summary,
    price,
    stock
){

    let success;
    let result = null;


    // PARAM TREATMENT
    title = title.toString().replaceAll("'", "''");
    summary = summary.toString().replaceAll("'", "''");

    try {

        // BEGIN
        begin.run();

        let update_book_stmt = db.prepare(
            `
                UPDATE book
                SET title = '${title}', summary = '${summary}', price = ${price}, stock = ${stock}
                WHERE book_id = ${book_id}
            `
        );
        let update_book_info = update_book_stmt.run();
        console.log('book data updated :: ' + book_id.toString());


        // COMMIT
        commit.run();

        success = true;
        result = null

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


// UPDATE book by ID
// ===============================================================================
function updateBookCover(
    book_id,
    cover_url
){

    let success;
    let result = null;

    try {

        // BEGIN
        begin.run();

        let update_book_stmt = db.prepare(
            `
                UPDATE book
                SET cover_url = '${cover_url}'
                WHERE book_id = ${book_id}
            `
        );
        let update_book_info = update_book_stmt.run();
        console.log('book data updated :: ' + book_id.toString());


        // COMMIT
        commit.run();

        success = true;
        result = null

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


// DELETE book by ID
// ===============================================================================
function deleteBook(
    book_id,
){

    let success;
    let result = null;

    try {


        // BEGIN
        begin.run();

        // let delete_book_stmt = db.prepare(
        //     `
        //         DELETE FROM book
        //         WHERE book_id = ${book_id}
        //     `
        // );
        // let delete_book_info = delete_book_stmt.run();
        // console.log('book data deleted for book :: ' + book_id.toString());


        // let delete_sales_stmt = db.prepare(
        //     `
        //         DELETE FROM sales
        //         WHERE book_id in (
        //             select book_id
        //             from book
        //             where book_id = ${book_id}
        //         )
        //     `
        // );
        // let delete_sales_info = delete_sales_stmt.run();
        // console.log('sales data deleted for book :: ' + book_id.toString());

        
        let delete_book_stmt = db.prepare(
            `
                DELETE FROM book
                WHERE book_id = ${book_id}
            `
        );
        let delete_book_info = delete_book_stmt.run();
        console.log('book data deleted :: ' + book_id.toString());


        // let delete_book_stmt = db.prepare(
        //     `
        //         UPDATE book
        //         SET is_disabled = true
        //         WHERE book_id = ${book_id}
        //     `
        // );
        // let delete_book_info = delete_book_stmt.run();
        // console.log('book data deleted :: ' + book_id.toString());

        // COMMIT
        commit.run();
        
        success = true;
        result = null

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


// GET book by ID
// ===============================================================================
function checkBookIDExists(
    book_id,
){

    let success;
    let result = null;

    try {

        // BOOK
        let book_stmt =  db.prepare(
            `
                select exists(
                    select 1 
                    from book
                    where book_id = ${book_id}
                ) as "Exists"
            `
        );
        let book_data = book_stmt.get();
        console.log('book data checked :: ' + book_id.toString());

        result = (book_data["Exists"] == true);
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
exports.addBook = addBook;
exports.getBookSearchMain = getBookSearchMain;
exports.getBookByID = getBookByID;
exports.updateBook = updateBook;
exports.deleteBook = deleteBook;
exports.checkBookIDExists = checkBookIDExists;
exports.updateBookCover = updateBookCover;
