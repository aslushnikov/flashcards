var Q = require("q")
  , orm = require("orm")

module.exports = function(db, callback) {
    var User = db.define("user", {
        firstName: String,
        lastName: String,
        email: String,
        registrationDate: { type: "date", time: true },
        loginDate: { type: "date", time: true },
    }, {
        autoFetch: false,
        validations: {
            firstName: orm.validators.notEmptyString("missing"),
            lastName: orm.validators.notEmptyString("missing"),
            email: orm.validators.patterns.email("not an email"),
        },
        methods: {
            fullName: function() {
                return this.firstName + " " + this.lastName;
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

    var Word = db.define("word", {
        original: {type: "text", required: true},
        translation: {type: "text", required: true},
        serializedTags: String,
        creationDate: { type: "date", time: true },
    }, {
        autoFetch: false,
        autoFetchLimit: 1,
        validations: {
            original: orm.validators.notEmptyString("missing"),
            translation: orm.validators.notEmptyString("missing"),
        },
        methods: {
            tagNames: function() {
                if (!this._tags)
                    this._tags = JSON.parse(this.serializedTags);
                return this._tags;
            },

            setTags: function(tags) {
                delete this._tags;
                this.serializedTags = JSON.stringify(tags);
                return Q.denodeify(this.save.bind(this))();
            },

            fetchUser: function() {
                return Q.denodeify(this.getUser.bind(this))();
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

    return callback();
}
