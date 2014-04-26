var Q = require("q")
  , _ = require("lodash")

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
    _validateTags: function(tags)
    {
        if (!tags || !tags.length)
            return [];
        tags = _.uniq(tags.map(function(value) {
            return value.trim();
        }));
        return tags;
    },

    createNewWord: function(user, options)
    {
        var Word = this._db.models.word;
        var tags = this._validateTags(options.tags);
        return Q.denodeify(Word.create.bind(Word))([{
            original: options.original,
            translation: options.translation,
            user: user,
            serializedTags: JSON.stringify(tags),
            creationDate: new Date(),
        }]).then(function(words) {
            if (words.length !== 1) throw new Error("1 word had to be created; got " + words.length + " instead");
            return words[0];
        }.bind(this));
    },

    removeWord: function(user, wordId)
    {
        return this.findWordByUserAndId(user, wordId)
        .then(function(word) {
            return Q.denodeify(word.remove.bind(word))();
        });
    },

    updateWord: function(user, wordId, options)
    {
        var tags = this._validateTags(options.tags);
        return this.findWordByUserAndId(user, wordId)
        .then(function(word) {
            word.original = options.original;
            word.translation = options.translation;
            return word.setTags(tags);
        })
    },

    findWordByUserAndId: function(user, wordId)
    {
        var Word = this._db.models.word;
        return Q.denodeify(Word.find.bind(Word))({id: wordId, user_id: user.id})
        .then(function(words) {
            if (words.length !== 1) throw new Error("1 word had to be found for this id");
            return words[0];
        });
    },

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
        .then(function(users) {
            if (users && users.length > 0) throw new Error("User with such an email already exists");
        })
        .then(function() {
            return Q.denodeify(User.create.bind(User))([{
                firstName: options.firstName,
                lastName: options.lastName,
                email: options.email,
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
