const express = require('express')
const { connectToDb, getDb } = require('./db');
const { ObjectId } = require('mongodb');

//init app & middleware
const app = express(); // what we do to create the app
app.use(express.json()) // yo parse any json coming in as a request -- for .post method

// http codes
const httpCodes ={
    "okay": 200,
    "successfully added": 201,
    "DNE": 404,
    "server error": 500
}

// database connection
let db;

connectToDb((err) => {
    if (!err) {
        const portNumber = 3000
        app.listen(portNumber, () => {
            console.log(`app is listening on port ${portNumber}`);
        })

        db = getDb();
    }
})

// routes
mgdbCollectionName = "books" // mgdb = mongoDB

// gets all the books (5 per page) in the collection in ascending order
app.get(`/${mgdbCollectionName}`, (req, res) => {

    // current page
    const page = req.query.page || 0
    const booksPerPage = 5

    let books = [];

    // in JS find() returns a cursor (like a pointer) to 2 methods (that you can use to find data) ... toArray & forEach and returns them in batches (101 documents to avoid network delay)
    db.collection(`${mgdbCollectionName}`)
        .find()
        .sort({ author: 1 }) // remember that 1 means Ascending and -1 means Descending
        .skip(page * booksPerPage) // for pagination ... to skip to the current page
        .limit(booksPerPage) // for pagination ... sets the standard for the allowed number of books 
        .forEach(book => books.push(book)) // cycles through each book in batches and allows us to do smth with it
        .then(() => { // using a .then because the response is asynchronus in nature
            res.status(httpCodes["okay"]).json(books)
        })
        .catch(() => {
            res.status(httpCodes["server error"]).json({error: "Couldn't fetch documents"})
        })
})

// getting a specific book
app.get(`/${mgdbCollectionName}/id/:id`, (req,res) => {
    // req.params.id //gives us access to whatever is passed through the url (if it were .../_id it'll be 'req.params._id' for greater context)
    var documentId = req.params.id;

    if (ObjectId.isValid(documentId)){
        db.collection(`${mgdbCollectionName}`)
        .findOne({_id: new ObjectId(documentId)})
        .then(doc => {
            if (doc)
                res.status(httpCodes["okay"]).json(doc)
            else
                res.status(httpCodes["DNE"]).json({message: "document does not exist"}) 

        })
        .catch(err => {
            res.status(httpCodes["server error"]).json({error: `could not fetch the document with id:${documentId}`})
        })
    }
    else
    {
        res.status(httpCodes["server error"]).json({error: `${documentId}  is not a valid document ID`})
    }
})

// getting all the books from an author
app.get(`/${mgdbCollectionName}/author/:author`, (req,res) => {
    var authorName = req.params.author;

    db.collection(`${mgdbCollectionName}`)
        .find({author: authorName }).toArray()
        .then(doc => {
            res.status(httpCodes["okay"]).json(doc)
        })
        .catch(err => {
            res.status(httpCodes["server error"]).json({error: `could not fetch the documents with name:${authorName}`})
        })
})

// getting all the books with a specific rating
app.get(`/${mgdbCollectionName}/rating/:rating`, (req,res) => {

    var specificRating = parseInt(req.params.rating, 10);

    db.collection(`${mgdbCollectionName}`)
        .find({rating: specificRating}).toArray()
        .then(doc => {
            res.status(httpCodes["okay"]).json(doc)
        })
        .catch(err => {
            res.status(httpCodes["server error"]).json({error: `could not fetch the documents with rating:${specificRating}`})
        })
})

// getting all books with >= page limit
app.get(`/${mgdbCollectionName}/pages/:pages`, (req, res) =>{

    var pageLimt = parseInt(req.params.pages, 10);

    db.collection(`${mgdbCollectionName}`)
        .find({pages: {$gte: pageLimt}}).toArray()
        .then(doc => {
            res.status(httpCodes["okay"]).json(doc)
        })
        .catch(err => {
            res.status(httpCodes["server error"]).json({error: `could not fetch the documents with pages greater than:${pageLimt}`})
        })
})


app.post(`/${mgdbCollectionName}`, (req, res) =>{
    const book = req.body

    db.collection(`${mgdbCollectionName}`)
        .insertOne(book)
        .then(result => {
            res.status(httpCodes["successfully added"]).json(result)
        })
        .catch(err => {
            res.status(httpCodes["server error"]).json({err: `could not create a new document`})
        })
})

app.delete(`/${mgdbCollectionName}/id/:id`, (req, res) =>{

    const bookToDelete = req.params.id;

    if(ObjectId.isValid(bookToDelete)){
        db.collection(`${mgdbCollectionName}`)
            .deleteOne({_id: new ObjectId(bookToDelete)})
            .then(response => {
                res.status(httpCodes["okay"]).json(response)
            })
            .catch( err => {
                res.status(httpCodes["server error"]).json({err: `could not delete book of Id ${bookToDelete}`})
            })
    }
    else{
        res.status(httpCodes["server error"]).json({err: "Not a valid document Id"})
    }
})

app.patch(`/${mgdbCollectionName}/id/:id`, (req, res) => {
    const updates = req.body;
    const updatesId = req.params.id;
    
    if (ObjectId.isValid(updatesId)){
        db.collection(`${mgdbCollectionName}`)
            .updateOne({_id: new ObjectId(updatesId)}, {$set: updates})
            .then(result => {
                res.status(httpCodes["okay"]).json(result)
            })
            .catch(err => {
                res.status(httpCodes["server error"]).json({err: `Unable to update book with ${updates}`})
            })
    }
    else{
        res.status(httpCodes["server error"]).json({err: "Not a valid document Id"})
    }
})