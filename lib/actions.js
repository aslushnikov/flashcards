var Q = require("q")
  , crypto = require("./crypto")

/**
 * It is safe to use multiple instances of this class
 * with single db and eventBus
 */
var Actions = function(db, eventBus, config)
{
    this._db = db;
    this._eventBus = eventBus;
    this._config = config;
}

Actions.prototype = {
    createNewWord: function(user, options)
    {
        var deferred = Q.defer();
        var Word = this._db.models.word;
        return Q.denodeify(Word.create.bind(Word))([{
            original: options.original,
            translation: options.translation,
            user: user,
            creationDate: new Date(),
        }]).then(function(words) {
            if (words.length !== 1) throw new Error("1 word had to be created; got " + words.length + " instead");
            return word[0];
        })
    },

    // this method will also clean up outdated users with
    // this email
    findUsersWithEmail: function(email)
    {
        var User = this._db.models.user;
        return Q.denodeify(User.find.bind(User))({email: email})
    },

    getUserById: function(id)
    {
        var User = this._db.models.user;
        return Q.denodeify(User.get.bind(User))(id);
    },

    createNewUser: function(options)
    {
        var User = this._db.models.user;
        return Q.denodeify(User.find.bind(User))({email: options.email})
        .then(crypto.encrypt.bind(crypto, options.password))
        .then(function(hash) {
            return Q.denodeify(User.create.bind(User))([{
                firstName: options.firstName,
                lastName: options.lastName,
                email: options.email,
                password: hash,
                registrationDate: new Date(),
                loginDate: new Date(),
            }])
        })
        .then(function(users) {
            if (users.length !== 1) throw new Error("Failed to create a single user - " + users.length + " created instead.")
            return users[0];
        })
    },
};

module.exports = Actions;
