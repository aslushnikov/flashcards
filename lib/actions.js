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
    userWordsForTags: function(user, tags)
    {
        var words;
        return user.fetchWords()
        .then(function(_words) {
            words = _words;
            var fetchWordTags = words.map(function(word) { return word.fetchTags(); });
            return Q.all(fetchWordTags);
        })
        .then(function(wordTags) {
            var taggedWords = [];
            for (var i = 0; i < wordTags.length; ++i) {
                if (_.intersection(wordTags[i], tags).length > 0)
                    taggedWords.push(words[i]);
            }
            return taggedWords;
        })
    },

    ensureTagsForUser: function(user, tags)
    {
        if (!tags || !tags.length)
            return [];
        tags = _.uniq(tags.map(function(value) {
            return value.trim();
        }));
        var Tag = this._db.models.tag;
        var findTag = Q.denodeify(Tag.find.bind(Tag));
        var createTag = Q.denodeify(Tag.create.bind(Tag));
        var tagPromises = tags.map(function(value) {
            return findTag({name: value, user_id: user.id})
            .then(function(tags) {
                if (!tags.length) return createTag({name: value, user: user });
                if (tags.length > 1) throw new Error("more then one tag was found for the value " + value);
                return tags[0];
            })
        });
        return Q.all(tagPromises)
    },

    createNewWord: function(user, options)
    {
        var Word = this._db.models.word;
        return Q.denodeify(Word.create.bind(Word))([{
            original: options.original,
            translation: options.translation,
            user: user,
            creationDate: new Date(),
        }]).then(function(words) {
            if (words.length !== 1) throw new Error("1 word had to be created; got " + words.length + " instead");
            return words[0];
        }).then(function(word) {
            if (!options.tags || !options.tags.length)
                return word;
            return this.ensureTagsForUser(user, options.tags)
            .then(function(tags) {
                return Q.denodeify(word.setTags.bind(word))(tags);
            }).then(function() {
                return word;
            });
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
        var word;
        return this.findWordByUserAndId(user, wordId)
        .then(function(_word) {
            word = _word;
            return this.ensureTagsForUser(user, options.tags);
        }.bind(this))
        .then(function(tags) {
            word.original = options.original;
            word.translation = options.translation;
            // Updating assosiation will save the model.
            return Q.denodeify(word.setTags.bind(word))(tags);
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
