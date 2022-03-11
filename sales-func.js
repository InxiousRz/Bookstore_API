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


// ADD sales
// ===============================================================================
function addSales(
    name,
    email, 
    quantity, 
    book_id
){

    let success;
    let result;

    try {

        let action_time = moment_tz();
        let unix_now = action_time.unix();
        console.log(action_time);


        // PARAM TREATMENT
        name = name.toString().replaceAll("'", "''");
        email = email.toString().replaceAll("'", "''");


        // BOOK
        let book_stmt =  db.prepare(
            `
                SELECT 
                    b.book_id as "Book_ID",
                    b.author_id as "Author_ID",
                    b.title as "Title",
                    b.summary as "Summary",
                    b.price as "Price",
                    b.stock as "Stock",
                    b.cover_url as "Cover_URL"
                FROM book b
                WHERE b.book_id = ${book_id}
                ORDER BY b.book_id asc
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


        // BEGIN
        begin.run();

        // QUERY
        let total_price = book_data["Price"] * quantity;

        // PARAM TREATMENT
        let book_title = book_data["Title"].toString().replaceAll("'", "''");

        let insert_sales_stmt = db.prepare(
            `
                INSERT INTO sales(
                    name, 
                    email, 
                    book_title, 
                    author_id,
                    quantity,
                    price_per_unit, 
                    price_total, 
                    created_time
                )
                VALUES (
                    '${name}',
                    '${email}',
                    '${book_title}',
                    ${book_data["Author_ID"]},
                    ${quantity},
                    ${book_data["Price"]},
                    ${total_price},
                    ${unix_now}
                )
            `
        );

        
        let insert_sales_info = insert_sales_stmt.run();
        let sales_id = insert_sales_info.lastInsertRowid;
        console.log('sales data created :: ' + sales_id.toString());


        // STOCK
        let leftover_stock = book_data["Stock"] - quantity;
        let update_book_stmt = db.prepare(
            `
                UPDATE book 
                SET stock = ${leftover_stock}
                WHERE book_id = ${book_data["Book_ID"]}
            `
        );

        
        let update_book_info = update_book_stmt.run();
        console.log('book data updated :: ' + book_data["Book_ID"].toString());

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


// GET book SEARCH MAIN
// ===============================================================================
function getSalesSearchMain(
    author_id,
    book_title,
    sales_created_start,
    sales_created_end,
    current_page,
    limit
){

    // GET SAMPLE PARAMETER HASIL DATA
    // ------------------------------------------------------
    let [get_search_success, get_search_result] = getSalesSearch(
        author_id,
        book_title,
        sales_created_start,
        sales_created_end,
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
    let [get_search_count_success, get_search_count_result] = getSalesSearchCountAll(
        author_id,
        book_title,
        sales_created_start,
        sales_created_end
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
function getSalesSearch(
    author_id,
    book_title,
    sales_created_start,
    sales_created_end,
    current_page,
    limit
){

    let success;
    let result;

    try {

        // BOOK
        let query = `
            SELECT 
                sales_id as "Sales_ID",
                name as "Recipient_Name",
                email as "Recipient_Email",
                book_title as "Book_Title",
                author_id as "Author_ID",
                quantity as "Quantity",
                price_per_unit as "Price_Per_Unit",
                price_total as "Total_Price",
                created_time as "Created_Time"
            FROM sales
        `;
        let filter_applied = 0;


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
        

        // APPLY SEARCH - book_title
        if (book_title != null){

            if (filter_applied == 0){
                query += " where "
            } else {
                query += " and "
            }

            let filter_value = "'" + '%'+book_title.toString().toLowerCase()+'%' + "'" ;
            query += `  book_title like ${filter_value}  `;
            filter_applied += 1;
        }


        // APPLY SEARCH - sales_created_start
        if (sales_created_start != null){

            if (filter_applied == 0){
                query += " where "
            } else {
                query += " and "
            }

            let filter_value = sales_created_start;
            query += `  created_time >= ${filter_value}  `;
            filter_applied += 1;
        }


        // APPLY SEARCH - sales_created_end
        if (sales_created_end != null){

            if (filter_applied == 0){
                query += " where "
            } else {
                query += " and "
            }

            let filter_value = sales_created_end;
            query += `  created_time <= ${filter_value}  `;
            filter_applied += 1;
        }


        // ORDER
        query += `
            ORDER BY created_time desc
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

            console.log('sales data fetched :: ' + data["Sales_ID"].toString());

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
function getSalesSearchCountAll(
    author_id,
    book_title,
    sales_created_start,
    sales_created_end,
){

    let success;
    let result;

    try {

        // BOOK
        let query = `
            select  
                --// COUNT ONLY
                COUNT(*) as "Total"
            FROM sales
        `;
        let filter_applied = 0;

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
        

        // APPLY SEARCH - book_title
        if (book_title != null){

            if (filter_applied == 0){
                query += " where "
            } else {
                query += " and "
            }

            let filter_value = "'" + '%'+book_title.toString().toLowerCase()+'%' + "'" ;
            query += `  book_title like ${filter_value}  `;
            filter_applied += 1;
        }


        // APPLY SEARCH - sales_created_start
        if (sales_created_start != null){

            if (filter_applied == 0){
                query += " where "
            } else {
                query += " and "
            }

            let filter_value = sales_created_start;
            query += `  created_time >= ${filter_value}  `;
            filter_applied += 1;
        }


        // APPLY SEARCH - sales_created_end
        if (sales_created_end != null){

            if (filter_applied == 0){
                query += " where "
            } else {
                query += " and "
            }

            let filter_value = sales_created_end;
            query += `  created_time <= ${filter_value}  `;
            filter_applied += 1;
        }



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
function getSalesByID(
    sales_id,
){

    let success;
    let result = null;

    try {

        // BOOK
        let sales_stmt =  db.prepare(
            `
                SELECT 
                    sales_id as "Sales_ID",
                    name as "Recipient_Name",
                    email as "Recipient_Email",
                    book_title as "Book_Title",
                    author_id as "Author_ID",
                    quantity as "Quantity",
                    price_per_unit as "Price_Per_Unit",
                    price_total as "Total_Price",
                    created_time as "Created_Time"
                FROM sales
                WHERE sales_id = ${sales_id}
                ORDER BY sales_id asc
            `
        );
        let sales_data = sales_stmt.get();
        if(!sales_data){
            success = true;
            result = null;
            return [
                success,
                result
            ]; 
        }

        console.log('sales data fetched :: ' + sales_data["Sales_ID"].toString());
        
        result = sales_data;

        
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
exports.addSales = addSales;
exports.getSalesSearchMain = getSalesSearchMain;
exports.getSalesByID = getSalesByID;
