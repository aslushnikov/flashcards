var Q = require("q")
  , orm = require("orm")
  , crypto = require("./crypto")

module.exports = function(db, callback) {
    var User = db.define("user", {
        firstName: String,
        lastName: String,
        email: String,
        registrationDate: Date,
        loginDate: Date,
        password: String,
    }, {
        validations: {
            firstName: orm.validators.notEmptyString("missing"),
            lastName: orm.validators.notEmptyString("missing"),
            email: orm.validators.patterns.email("not an email"),
        },
        methods: {
            verifyPassword: function(password) {
                return crypto.compare(password, this.password);
            },

            fullName: function() {
                return this.firstName + " " + this.lastName;
            },

            fetchTags: function() {
                return Q.denodeify(this.getTags.bind(this))()
                .then(function(tags) {
                    return tags.map(function(value) { return value.name; });
                });
            },

            fetchWords: function() {
                return Q.denodeify(this.getWords.bind(this))();
            },
        }
    });

    var Tag = db.define("tag", {
        name: String,
    }, {
        validations: {
            name: orm.validators.notEmptyString("missing"),
        },
        methods: {
            fetchUser: function() {
                return Q.denodeify(this.getUser.bind(this))();
            },
        }
    });
    Tag.hasOne("user", User, { reverse: "tags" });

    var Word = db.define("word", {
        original: String,
        translation: String,
        creationDate: Date,
    }, {
        /* autoFetch: true is not currently working.
         * https://github.com/dresende/node-orm2/issues/282
         */
        validations: {
            original: orm.validators.notEmptyString("missing"),
            translation: orm.validators.notEmptyString("missing"),
        },
        methods: {
            fetchTags: function() {
                return Q.denodeify(this.getTags.bind(this))()
                .then(function(tags) {
                    return tags.map(function(value) { return value.name; });
                });
            },
            fetchUser: function() {
                return Q.denodeify(this.getUser.bind(this))();
            },
        }
    });
    Word.hasOne("user", User, { reverse: "words" });
    Word.hasMany("tags", Tag);

    return callback();
}
