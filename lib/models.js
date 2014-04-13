var Q = require("q")
  , orm = require("orm")
  , crypto = require("./crypto")

module.exports = function(db, callback) {
    var User = db.define("user", {
        firstName: String,
        lastName: String,
        email: String,
        registrationDate: { type: "date", time: true },
        loginDate: { type: "date", time: true },
        password: String,
    }, {
        autoFetch: false,
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
                return Q.denodeify(this.getWords.bind(this))()
                .then(function(words) {
                    var pojos = [];
                    for (var i = 0; i < words.length; ++i)
                        pojos.push(words[i].toPOJO());
                    return pojos;
                })
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
        creationDate: { type: "date", time: true },
    }, {
        autoFetch: true,
        autoFetchLimit: 1,
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

            tagNames: function() {
                return this.tags.map(function(tag) {
                    return tag.name;
                });
            },

            toPOJO: function() {
                return {
                    id: this.id,
                    original: this.original,
                    translation: this.translation,
                    creationDate: this.creationDate,
                    tags: this.tagNames()
                };
            }
        }
    });
    Word.hasOne("user", User, { reverse: "words" });
    Word.hasMany("tags", Tag);

    return callback();
}
