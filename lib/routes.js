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
        res.redirect("words");
    });

    app.get("/settings", ensureLogin, function(req, res, next) {
        res.render("settings", {
            user: req.user
        });
    });

    app.get("/export", ensureLogin, function(req, res, next) {
        actions.exportUserWords(req.user)
        .then(function(csv) {
            res.header("content-type", "text/csv");
            res.send(200, csv);
        })
        .fail(next);
    });

    app.post("/import", ensureLogin, function(req, res, next) {
        actions.importUserWords(req.user, req.body.csv)
        .then(function() {
            res.redirect("/words");
        })
        .fail(function() {
            res.send(400);
        })
    });

    app.post("/words/clear", ensureLogin, function(req, res, next) {
        if (!req.query || !req.query.timestamp)
            return res.send(400);
        var clientTime = parseInt(req.query.timestamp, 10);
        if (isNaN(clientTime))
            return res.send(400);
        var serverTime = +new Date();
        var delta = serverTime - clientTime;
        if (delta < 0 || delta > 60 * 1000)
            return res.send(400);
        actions.clearUserWords(req.user)
        .then(function() {
            res.send(200);
        })
        .fail(function() {
            return res.send(500);
        })
    });

    app.get("/word/new", ensureLogin, function(req, res, next) {
        req.user.fetchWords()
        .then(function(words) {
            res.render("new-word", {
                user: req.user,
                words: words,
            });
        })
        .fail(next)
    });

    app.post("/word/new", ensureLogin, function(req, res, next) {
        actions.createNewWord(req.user, req.body)
        .then(function() {
            res.send(200);
        })
        .fail(next)
    });

    app.get("/word/edit/:id", ensureLogin, function(req, res, next) {
        req.user.fetchWords()
        .then(function(words) {
            res.render("new-word", {
                user: req.user,
                words: words,
            });
        })
        .fail(next)
    });

    app.post("/word/edit/:id", ensureLogin, function(req, res, next) {
        actions.updateWord(req.user, req.params.id, req.body)
        .then(function() {
            res.send(200);
        })
        .fail(next)
    });

    app.get("/words", ensureLogin, function(req, res, next) {
        req.user.fetchWords()
        .then(function(words) {
            res.render("words", {
                user: req.user,
                words: words,
            });
        })
        .fail(next);
    });

    app.post("/word/remove/:id", ensureLogin, function(req, res, next) {
        actions.removeWord(req.user, req.params.id)
        .then(function() {
            res.send(200);
        })
        .fail(next);
    });

    app.get("/train/start", ensureLogin, function(req, res, next) {
        req.user.fetchWords()
        .then(function(words) {
            res.render("train", {
                user: req.user,
                words: words,
            });
        })
        .fail(next);
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

