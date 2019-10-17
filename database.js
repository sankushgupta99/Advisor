const { MongoClient } = require("mongodb");
const uri = process.env.MONGOLAB_URI || "mongodb://localhost:27017";
const client = new MongoClient(uri, { useNewUrlParser: true });

const getDb = () =>
    client.connect().then(() => {
        console.log(uri);
        const db = client.db("testdb");
        return db;
    });

const insertData = data =>
    getDb()
        .then(db => db.collection("users"))
        .then(collection => collection.insertOne(data));

const getData = email =>
    getDb()
        .then(db => db.collection("users"))
        .then(users =>
            users.find({
                email: {
                    $eq: email
                }
            })
        )
        .then(cursor => cursor.toArray());

module.exports = {
    insertData,
    getData
};
