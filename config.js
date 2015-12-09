module.exports = {
    database: {
        database : "flashcards",
        protocol : "mysql",
        host     : "127.0.0.1",
        port     : 3306,         // optional, defaults to database default
        user     : "root",
        password : "testpass",
        debug: false
    },
    auth: {
        realm: "http://localhost:3000",
        clientID: "<FILL ME>",
        clientSecret: "<FILL ME>",
    },
    registration: {
        // if the user didn't fill in his password in an hour after
        // auto-registration, then it will be removed
        inactiveUserDropTimeout: 1000 * 60 * 60, // 1 hour
    }
};

if (process.env.VERSION)
    module.exports.version = process.env.VERSION.substr(0, 9);
