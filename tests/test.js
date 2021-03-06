var Q = require("q") 
  , should = require("should")
  , database = require("../lib/database")
  , Actions = require("../lib/actions")
  , config = require("./testConfig")
  , dbTasks = require("../tasks/db-tasks")
  , EventEmitter = require("events").EventEmitter;

var eventBus = new EventEmitter();
var db = null;
var actions = null;
var testUser1 = {
    firstName: "Amigo",
    lastName: "Paradise",
    email: "amigo@paradise.com",
    password: "callmemaybe",
};

var testUser2 = {
    firstName: "Hablar",
    lastName: "Menceran",
    email: "hablar@menceran.com",
    password: "tasteslikepepsicola",
};

var testWord = {
    original: "hablar",
    translation: "speak"
};

var testWordWithTags = {
    original: "hablar",
    translation: "speak",
    tags: ["basic", "common"]
};

function clone(config)
{
    return JSON.parse(JSON.stringify(config));
}

before(function (done) {
    // connect to db and initialize
    database.connect(config)
    .then(function(database) {
        db = database;
        actions = new Actions(db, eventBus, config);
    })
    .then(function() {
        dbTasks.init(db);
    })
    .then(done)
    .fail(done)
});

after(function (done) {
    // drop database tables
    dbTasks.drop(db)
    .then(function(db) {
        return Q.denodeify(db.close.bind(db))();
    })
    .then(done)
    .fail(done)
});

describe("Action", function() {
    afterEach(function(done) {
        dbTasks.reset(db)
        .then(function() {
            done();
        })
        .fail(done)
    })
    /**
     * Actions.createNewUser
     */
    describe("createNewUser", function() {
        it("should create new user", function(done) {
            actions.createNewUser(testUser1)
            .then(function(user) {
                user.firstName.should.be.equal(testUser1.firstName);
                user.lastName.should.be.equal(testUser1.lastName);
            })
            .then(done)
            .fail(done)
        });

        it("should support UTF8 encoding", function(done) {
            actions.createNewUser({
                firstName: "Котенок",
                lastName: "Гав",
                email: "kotgav@gmail.com",
                password: "paradise"
            })
            .then(function() {
                var deferred = Q.defer();
                db.models.user.find({
                    email: "kotgav@gmail.com"
                }, function(err, users) {
                    if (err) return deferred.reject(err);
                    if (users.length !== 1) return deferred.reject(new Error("Single user should be returned; got " + users.length + " instead"));
                    var user = users[0];
                    user.firstName.should.be.equal("Котенок");
                    user.lastName.should.be.equal("Гав");
                    deferred.resolve();
                })
            })
            .then(done)
            .fail(done)
        });

        it("should not create two users with identical email", function(done) {
            actions.createNewUser(testUser1)
            .then(function() {
                return actions.createNewUser({
                    firstName: "Matvey",
                    lastName: "Lushnikov",
                    email: testUser1.email,
                    password: "somepass"
                });
            }).then(function() {
                done(new Error("Two users successfully created"));
            }).fail(function(err) {
                done();
            })
        });
    }); // Actions.createNewUser


    /**
     * Actions.findUsersWithEmail
     */
    describe("findUsersWithEmail", function() {
        it("should return users with email", function(done) {
            var tUser2 = clone(testUser2);
            tUser2.email = testUser1.email
            actions.createNewUser(testUser1)
            .then(function(user) {
                return actions.findUsersWithEmail(user.email);
            })
            .then(function(users) {
                users.length.should.be.equal(1);
                done();
            })
            .fail(done)
        });
    }); // Actions.findUsersWithEmail

    /**
     * Actions.getUserById
     */
    describe("getUserById", function() {
        it("should return user if id is correct", function(done) {
            actions.createNewUser(testUser1)
            .then(function(user) {
                return actions.getUserById(user.id);
            })
            .then(function(user) {
                user.email.should.be.equal(testUser1.email);
                done();
            })
            .fail(done);
        });
        it("should not return unexisting user", function(done) {
            actions.getUserById(1)
            .then(function(user) {
                done(new Error("Some user was returned, also it should not"));
            })
            .fail(function(err) {
                done();
            })
        })
    }); // Actions.getUserById

    /**
     * Actions.createNewWord
     */
    describe("createNewWord", function() {
        it("should create new word without tags", function(done) {
            var user, word;
            actions.createNewUser(testUser1)
            .then(function(_user) {
                user = _user;
                return actions.createNewWord(user, testWord);
            })
            .then(function(_word) {
                word = _word;
                word.user.should.be.equal(user);
                word.original.should.be.equal(testWord.original);
                word.translation.should.be.equal(testWord.translation);
                return Q.denodeify(user.getWords.bind(user))();
            })
            .then(function(words) {
                words.should.have.length(1);
                words[0].translation.should.be.equal(word.translation);
                words[0].original.should.be.equal(word.original);
                done();
            })
            .fail(done);
        });
        it("should create new word with tags", function(done) {
            var user, word;
            actions.createNewUser(testUser1)
            .then(function(_user) {
                user = _user;
                return actions.createNewWord(user, testWordWithTags);
            })
            .then(function(_word) {
                word = _word;
                word.original.should.be.equal(testWord.original);
                word.translation.should.be.equal(testWord.translation);
                return word.fetchUser();
            })
            .then(function(wordUser) {
                wordUser.id.should.be.equal(user.id);
                var tags = word.tagNames();
                tags.should.have.length(2);
                tags.should.containEql(testWordWithTags.tags[0]);
                tags.should.containEql(testWordWithTags.tags[1]);
                return user.fetchWords();
            })
            .then(function(words) {
                words.should.have.length(1);
                words[0].translation.should.be.equal(word.translation);
                words[0].original.should.be.equal(word.original);
                done();
            })
            .fail(done);
        });
        it("should not create word if original is missing", function(done) {
            var user, word;
            actions.createNewUser(testUser1)
            .then(function(_user) {
                user = _user;
                return actions.createNewWord(user, {
                    translation: "bitch",
                });
            })
            .then(function(_word) {
                done(new Error("The word was created - wrong!"));
            })
            .fail(function(err) {
                done();
            })
        });
        it("should not create word if translation is missing", function(done) {
            var user, word;
            actions.createNewUser(testUser1)
            .then(function(_user) {
                user = _user;
                return actions.createNewWord(user, {
                    original: "hablar",
                });
            })
            .then(function(_word) {
                done(new Error("The word was created - wrong!"));
            })
            .fail(function(err) {
                done();
            })
        });
    }); // Actions.createNewWord

    /**
     * Actions.removeWord
     */
    describe("removeWord", function() {
        it("should remove user's word", function(done) {
            var user, word;
            actions.createNewUser(testUser1)
            .then(function(_user) {
                user = _user;
                return actions.createNewWord(user, testWord);
            })
            .then(function(_word) {
                word = _word;
                return Q.denodeify(user.getWords.bind(user))();
            })
            .then(function(words) {
                words.should.have.length(1);
                return actions.removeWord(user, words[0].id);
            })
            .then(function() {
                return Q.denodeify(user.getWords.bind(user))();
            })
            .then(function(words) {
                words.should.have.length(0);
                done();
            })
            .fail(done);
        });
    }); // Actions.removeWord
}); // Actions tests

