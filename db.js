require('dotenv').config();
const { MongoClient } = require('mongodb') // destructures the mongoClient object from a default value


const connectionString = process.env.ONLINE_CONNECTION_STRING;
let dbConnection;

// functions we'll be exporting to app.js

/**
 * Connects to the MongoDB database.
 *
 * @param {function} callBackFunct - The callback function to call after the connection is established or if an error occurs.
 * @returns {void}
 */
function connectToDb(callBackFunct){
    var databaseName = "bookstore";
    var localConnectionString = `mongodb://localhost:27017/${databaseName}`; // this is the format for all local mongodb url's (on your computer)

    MongoClient.connect(connectionString) // this is an asynchronus task, which will take sometime to complete
    .then((client) => {
        dbConnection = client.db(); // returns the database connection
        return callBackFunct();
    })
    .catch(err => {
        console.log(err);
        return callBackFunct(err);
    })
}

// this function is intended to be called after we've connected to the database)
/**
 * Retrieves the current database connection.
 *
 * @returns {object} The database connection object.
 */
function getDb() {
    return dbConnection;
}

module.exports = {
    connectToDb,
    getDb
}