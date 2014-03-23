var Q = require("q")
  , _ = require("lodash")

module.exports = function(app, actions, config) {

    app.get("/login", function(req, res) {
        res.render("login");
    });

    app.get("/logout", function(req, res) {
        req.logout();
        res.redirect("/login");
    });

    app.get("/", ensureLogin, function(req, res, next) {
        res.render("index", {
            user: req.user
        });
    });

    app.get("/word/new", ensureLogin, function(req, res, next) {
        res.render("new-word", {
            user: req.user,
            original: "",
            translation: "",
            activeTags: [],
            allTags: req.user.tags.map(function(value) { return value.name; }),
            wordId: "",
            callback: ""
        });
    });

    app.post("/word/new", function(req, res, next) {
        actions.createNewWord(req.user, req.body)
        .then(function() {
            res.send(200);
        })
        .fail(next)
    });

    app.get("/word/edit/:id", ensureLogin, function(req, res, next) {
        actions.findWordByUserAndId(req.user, req.params.id)
        .then(function(word) {
            var allTags = req.user.tags.map(function(value) { return value.name; });
            var wordTags = word.tags.map(function(value) { return value.name; });
            res.render("new-word", {
                user: req.user,
                original: word.original,
                translation: word.translation,
                activeTags: wordTags,
                allTags: _.without(allTags, wordTags),
                wordId: word.id,
                callback: "/words#" + word.id
            });
        })
        .fail(next)
    });

    app.post("/word/edit/:id", function(req, res, next) {
        actions.updateWord(req.user, req.params.id, req.body)
        .then(function() {
            res.send(200);
        })
        .fail(next)
    });

    app.get("/words", ensureLogin, function(req, res, next) {
        res.render("words", {
            user: req.user,
            words: req.user.words
        });
    });

    app.post("/word/remove/:id", ensureLogin, function(req, res, next) {
        actions.removeWord(req.user, req.params.id)
        .then(function() {
            res.send(200);
        })
        .fail(next);
    });

    app.get("/train", ensureLogin, function(req, res, next) {
        res.render("train", {
            user: req.user,
            words: req.user.words
        });
    });

}

function ensureLogin(req, res, next)
{
    if (!req.user) {
        req.session.authRedirect = req.url;
        res.redirect("/login");
    } else {
        delete req.session.authRedirect;
        next();
    }
}

