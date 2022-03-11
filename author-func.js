// IMPORTS
// ===============================================================================
const db = require('./db').db;
const begin = require('./db').begin;
const commit = require('./db').commit;
const rollback = require('./db').rollback;
const moment_tz = require('moment-timezone');


// FUNCTIONS
// ===============================================================================
const hashPassword = require('./encryption').hashPassword;
const PaginatePagesSimple = require('./paginate').PaginatePagesSimple;

// MODELS
// ===============================================================================


// ADD Author
// ===============================================================================
function addAuthor(
    name, 
    pen_name, 
    email,
    password
){

    let success;
    let result;

    try {

        let action_time = moment_tz();
        let unix_now = action_time.unix();
        console.log(action_time);
        


        // PARAM TREATMENT
        name = name.toString().replaceAll("'", "''");
        pen_name = pen_name.toString().replaceAll("'", "''");
        email = email.toString().replaceAll("'", "''");

        
        let author_id;
        let hash_password = hashPassword(password);

        // BEGIN
        begin.run();

        // QUERY
        let insert_author_stmt = db.prepare(
            `
                INSERT INTO author(name, pen_name, email, password, created_time)
                VALUES (
                    '${name}',
                    '${pen_name}',
                    '${email}',
                    '${hash_password}',
                    ${unix_now}
                )
            `
        );
        let insert_author_info = insert_author_stmt.run();
        author_id = insert_author_info.lastInsertRowid;
        console.log('author data created :: ' + author_id.toString());

        // COMMIT
        commit.run();
        
        success = true;
        result = null;

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


// GET author SEARCH MAIN
// ===============================================================================
function getAuthorSearchMain(
    name,
    is_disabled,
    current_page,
    limit
){

    // GET SAMPLE PARAMETER HASIL DATA
    // ------------------------------------------------------
    let [get_search_success, get_search_result] = getAuthorSearch(
        name,
        is_disabled,
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
    let [get_search_count_success, get_search_count_result] = getAuthorSearchCountAll(
        name,
        is_disabled,
        current_page,
        limit
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


// GET author search
// ===============================================================================
function getAuthorSearch(
    name,
    is_disabled,
    current_page,
    limit
){

    let success;
    let result;

    try {

        // HEADER
        let query = `
            SELECT 
                author_id as "Author_ID",
                name as "Name",
                pen_name as "Pen_Name",
                email as "Email"
            FROM author
        `;
        let filter_applied = 0;

        // APPLY SEARCH - name
        if (name != null){

            if (filter_applied == 0){
                query += " where "
            } else {
                query += " and "
            }

            let filter_value = "'" + '%'+name.toString().toLowerCase()+'%' + "'" ;
            query += ` ( name like ${filter_value} or pen_name like ${filter_value} ) `;
            filter_applied += 1;
        }


        // APPLY SEARCH - is_disabled
        if (is_disabled != null){

            if (filter_applied == 0){
                query += " where "
            } else {
                query += " and "
            }

            let filter_value = is_disabled;
            query += ` is_disabled = ${filter_value} `;
            filter_applied += 1;
        }


        // ORDER
        query += `
            ORDER BY author_id asc
        `

        // LIMIT 
        if(limit){
            query += ` LIMIT ${limit} `;
        }
        

        // OFFSET 
        let offset = limit * Math.max(((current_page || 0) - 1), 0);
        query += ` OFFSET ${offset} `;



        result = [];

        let search_stmt = db.prepare(
            query
        );
        
        for(const data of search_stmt.iterate()){

            console.log('author data fetched :: ' + data["Author_ID"].toString());

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


// GET author search Count All
// ===============================================================================
function getAuthorSearchCountAll(
    name,
    is_disabled
){

    let success;
    let result;

    try {

        // HEADER
        let query = `
            select  
                --// COUNT ONLY
                COUNT(*) as "Total"
            FROM author
        `;
        let filter_applied = 0;

        // APPLY SEARCH - name
        if (name != null){

            if (filter_applied == 0){
                query += " where "
            } else {
                query += " and "
            }

            let filter_value = "'" + '%'+name.toString().toLowerCase()+'%' + "'" ;
            query += ` ( name like ${filter_value} or pen_name like ${filter_value} ) `;
            filter_applied += 1;
        }

        // APPLY SEARCH - is_disabled
        if (is_disabled != null){

            if (filter_applied == 0){
                query += " where "
            } else {
                query += " and "
            }

            let filter_value = is_disabled;
            query += ` is_disabled = ${filter_value} `;
            filter_applied += 1;
        }


        // ORDER
        query += `
            ORDER BY author_id asc
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


// GET author by ID
// ===============================================================================
function getAuthorByID(
    author_id,
){

    let success;
    let result = null;

    try {

        // HEADER
        let author_stmt =  db.prepare(
            `
                SELECT 
                    author_id as "Author_ID",
                    name as "Name",
                    pen_name as "Pen_Name",
                    email as "Email"
                FROM author
                WHERE author_id = ${author_id}
                ORDER BY author_id asc
            `
        );
        let author_data = author_stmt.get();
        if(!author_data){
            success = true;
            result = null;
            return [
                success,
                result
            ]; 
        }

        console.log('author data fetched :: ' + author_data["Author_ID"].toString());
        
        result = author_data;

        
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


// UPDATE author by ID
// ===============================================================================
function updateAuthor(
    author_id,
    name,
    pen_name
){

    let success;
    let result = null;

    try {


        // PARAM TREATMENT
        name = name.toString().replaceAll("'", "''");
        pen_name = pen_name.toString().replaceAll("'", "''");

        // BEGIN
        begin.run();

        let update_head_stmt = db.prepare(
            `
                UPDATE author
                SET name = '${name}', pen_name = '${pen_name}'
                WHERE author_id = ${author_id}
            `
        );
        let update_head_info = update_head_stmt.run();
        console.log('author data updated :: ' + author_id.toString());


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


// DELETE author by ID
// ===============================================================================
function deleteAuthor(
    author_id,
){

    let success;
    let result = null;

    try {


        // BEGIN
        begin.run();

        // let delete_book_stmt = db.prepare(
        //     `
        //         DELETE FROM book
        //         WHERE author_id = ${author_id}
        //     `
        // );
        // let delete_book_info = delete_book_stmt.run();
        // console.log('book data deleted for author :: ' + author_id.toString());


        // let delete_sales_stmt = db.prepare(
        //     `
        //         DELETE FROM sales
        //         WHERE book_id in (
        //             select book_id
        //             from book
        //             where author_id = ${author_id}
        //         )
        //     `
        // );
        // let delete_sales_info = delete_sales_stmt.run();
        // console.log('sales data deleted for author :: ' + author_id.toString());

        
        // let delete_author_stmt = db.prepare(
        //     `
        //         DELETE FROM author
        //         WHERE author_id = ${author_id}
        //     `
        // );
        // let delete_author_info = delete_author_stmt.run();
        // console.log('author data deleted :: ' + author_id.toString());


        let delete_author_stmt = db.prepare(
            `
                UPDATE author
                SET is_disabled = true
                WHERE author_id = ${author_id}
            `
        );
        let delete_author_info = delete_author_stmt.run();
        console.log('author data deleted :: ' + author_id.toString());

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


// GET author by ID
// ===============================================================================
function checkAuthorIDExists(
    author_id,
){

    let success;
    let result = null;

    try {

        // HEADER
        let author_stmt =  db.prepare(
            `
                select exists(
                    select 1 
                    from author
                    where author_id = ${author_id} and is_disabled = false
                ) as "Exists"
            `
        );
        let author_data = author_stmt.get();
        console.log('author data checked :: ' + author_id.toString());

        result = (author_data["Exists"] == true);
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

// GET author by ID
// ===============================================================================
function checkAuthorEmailExists(
    email,
){

    let success;
    let result = null;

    try {

        // HEADER
        let author_stmt =  db.prepare(
            `
                select exists(
                    select 1 
                    from author
                    where email = '${email}' and is_disabled = false
                ) as "Exists"
            `
        );
        let author_data = author_stmt.get();
        console.log('author data checked :: ' + email.toString());

        result = (author_data["Exists"] == true);
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
exports.addAuthor = addAuthor;
exports.getAuthorSearchMain = getAuthorSearchMain;
exports.getAuthorByID = getAuthorByID;
exports.updateAuthor = updateAuthor;
exports.deleteAuthor = deleteAuthor;
exports.checkAuthorIDExists = checkAuthorIDExists;
exports.checkAuthorEmailExists = checkAuthorEmailExists;
