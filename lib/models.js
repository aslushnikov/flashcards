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
        autoFetch: true,
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
        }
    });

    var Tag = db.define("tag", {
        name: String,
    }, {
        autoFetch: true,
        validations: {
            name: orm.validators.notEmptyString("missing"),
        }
    });
    Tag.hasOne("user", User, { reverse: "tags" });

    var Word = db.define("word", {
        original: String,
        translation: String,
        creationDate: Date,
    }, {
        autoFetch: true,
        validations: {
            original: orm.validators.notEmptyString("missing"),
            translation: orm.validators.notEmptyString("missing"),
        }
    });
    Word.hasOne("user", User, { reverse: "words" });
    Word.hasMany("tags", Tag);

    return callback();
}
