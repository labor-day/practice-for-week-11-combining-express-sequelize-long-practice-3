// Instantiate router - DO NOT MODIFY
const express = require('express');
const router = express.Router();

// Import model(s)
const { Student, Classroom, StudentClassroom } = require('../db/models');
const { Op } = require("sequelize");

// List
router.get('/', async (req, res, next) => {

    let query = {
        attributes: ['id', 'firstName', 'lastName', 'leftHanded'],
        where: {},
        // Phase 1A: Order the Students search results
        order: [
            [StudentClassroom, 'grade', 'DESC'],
            ['lastName', 'ASC'], ['firstName', 'ASC']
        ],

        include: {  //use nested includes instead of through, to allow sorting
            model: StudentClassroom,
            attributes: ['grade'],
            include: {
                model: Classroom,
                attributes: ['id', 'name']
            }
        },
        distinct: true //gives us the correct count
    }

    let errorResult = { errors: [], count: 0, pageCount: 0 };

    // Phase 2A: Use query params for page & size
    // Your code here
    // let page = typeof parseInt(req.query.page) === 'number' ? parseInt(req.query.page) : 1;
    // let size = typeof parseInt(req.query.size) === 'number' ? parseInt(req.query.size) : 10;


    // Phase 2B: Calculate limit and offset
    // Phase 2B (optional): Special case to return all students (page=0, size=0)
    // Phase 2B: Add an error message to errorResult.errors of
        // 'Requires valid page and size params' when page or size is invalid
    // Your code here
    // let devMode = (page === 0 && size === 0);
    // let validPage = (page >= 1);
    // let validSize = (size >= 1 && size <= 200);

    // if (!devMode) {
    //     if (validPage && validSize) {
    //         query.limit = size
    //         query.offset = (page - 1) * size;
    //     } else {
    //         errorResult.errors.push({ message: 'Requires valid page and size params' });
    //     }
    // }

    //use parameters saved from paginator middleware to set limit/offset
    let devMode = req.query.devMode;
    if (!devMode) {
        query.limit = req.query.limit;
        query.offset = req.query.offset
    }

    // Phase 4: Student Search Filters
    /*
        firstName filter:
            If the firstName query parameter exists, set the firstName query
                filter to find a similar match to the firstName query parameter.
            For example, if firstName query parameter is 'C', then the
                query should match with students whose firstName is 'Cam' or
                'Royce'.

        lastName filter: (similar to firstName)
            If the lastName query parameter exists, set the lastName query
                filter to find a similar match to the lastName query parameter.
            For example, if lastName query parameter is 'Al', then the
                query should match with students whose lastName has 'Alfonsi' or
                'Palazzo'.

        lefty filter:
            If the lefty query parameter is a string of 'true' or 'false', set
                the leftHanded query filter to a boolean of true or false
            If the lefty query parameter is neither of those, add an error
                message of 'Lefty should be either true or false' to
                errorResult.errors
    */
    const where = {};

    //Your code here
    if (req.query.firstName) {
        where.firstName = {
            [Op.like]: `%${req.query.firstName}%`
        }
    }

    if (req.query.lastName) {
        where.lastName = {
            [Op.like]: `%${req.query.lastName}%`
        }
    }

    if (req.query.lefty) {
        if (req.query.lefty === 'true' || req.query.lefty === 'false') {
            where.leftHanded = JSON.parse(req.query.lefty)
        } else {
            errorResult.errors.push({
                message: "Lefty should be either true or false"
            });
        }
    }

    query.where = where;

    // Phase 2C: Handle invalid params with "Bad Request" response
    // Phase 3C: Include total student count in the response even if params were
        // invalid
        /*
            If there are elements in the errorResult.errors array, then
            return a "Bad Request" response with the errorResult as the body
            of the response.

            Ex:
                errorResult = {
                    errors: [{ message: 'Grade should be a number' }],
                    count: 267,
                    pageCount: 0
                }
        */
    // Your code here
    errorResult.count = await Student.count();

    if (errorResult.errors.length) {
        res.json({
            status: 400,
            body: errorResult
        });
    }

    let result = {};

    // Phase 3A: Include total number of results returned from the query without
        // limits and offsets as a property of count on the result
        // Note: This should be a new query
    result.count = await Student.count(query);

    result.rows = await Student.findAll(query);

    // Phase 2E: Include the page number as a key of page in the response data
        // In the special case (page=0, size=0) that returns all students, set
            // page to 1
        /*
            Response should be formatted to look like this:
            {
                rows: [{ id... }] // query results,
                page: 1
            }
        */
    // Your code here
    result.page = devMode ? 1 : req.query.page;

    // Phase 3B:
        // Include the total number of available pages for this query as a key
            // of pageCount in the response data
        // In the special case (page=0, size=0) that returns all students, set
            // pageCount to 1
        /*
            Response should be formatted to look like this:
            {
                count: 17 // total number of query results without pagination
                rows: [{ id... }] // query results,
                page: 2, // current page of this query
                pageCount: 10 // total number of available pages for this query
            }
        */
    // Your code here
    result.pageCount = devMode ? 1 : Math.ceil(result.count/req.query.size);

    res.json(result);
});

// Export class - DO NOT MODIFY
module.exports = router;
