var Q = require("q")
  , crypto = require("./crypto")
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
    createNewWord: function(user, options)
    {
        var deferred = Q.defer();
        var Word = this._db.models.word;
        var Tag = this._db.models.tag;
        return Q.denodeify(Word.create.bind(Word))([{
            original: options.original,
            translation: options.translation,
            user: user,
            creationDate: new Date(),
        }]).then(function(words) {
            if (words.length !== 1) throw new Error("1 word had to be created; got " + words.length + " instead");
            return words[0];
        }).then(function(word) {
            var tags = options.tags || [];
            if (!tags.length)
                return word;
            tags = _.uniq(tags.map(function(value) { return value.trim(); }));
            var findTag = Q.denodeify(Tag.find.bind(Tag));
            var createTag = Q.denodeify(Tag.create.bind(Tag));
            var tagPromises = tags.map(function(value) {
                return findTag({name: value, user: user })
                .then(function(tags) {
                    if (!tags.length) return createTag({name: value, user: user });
                    if (tags.length > 1) throw new Error("more then one tag was found for the value " + value);
                    return tags[0];
                })
            });
            return Q.all(tagPromises)
            .then(function(tags) {
                return Q.denodeify(word.setTags.bind(word))(tags);
            }).then(function() {
                return word;
            });
        });
    },

    removeWord: function(user, wordId)
    {
        var Word = this._db.models.word;
        return Q.denodeify(Word.find.bind(Word))({id: wordId, user: user})
        .then(function(words) {
            if (words.length !== 1) throw new Error("1 word had to be found for this id");
            return Q.denodeify(words[0].remove.bind(words[0]))();
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

    editUser: function(user, options)
    {
        function innerEditUser(hash)
        {
            return Q.denodeify(user.save.bind(user))({
                firstName: options.firstName || user.firstName,
                lastName: options.lastName || user.lastName,
                email: options.email || user.email,
                password: options.password ? hash : user.password
            });
        }
        if (options.password) {
            return crypto.encrypt(options.password)
            .then(innerEditUser);
        } else {
            return innerEditUser("");
        }
    },
};

module.exports = Actions;
