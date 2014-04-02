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
        req.user.fetchTags()
        .then(function(tags) {
            res.render("new-word", {
                user: req.user,
                original: "",
                translation: "",
                activeTags: [],
                allTags: tags,
                wordId: "",
                callback: ""
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
        var word;
        actions.findWordByUserAndId(req.user, req.params.id)
        .then(function(_word) {
            word = _word;
            return Q.all([req.user.fetchTags(), word.fetchTags()]);
        })
        .spread(function(userTags, wordTags) {
            res.render("new-word", {
                user: req.user,
                original: word.original,
                translation: word.translation,
                activeTags: wordTags,
                allTags: _.difference(userTags, wordTags),
                wordId: word.id,
                callback: "/words#" + word.id
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

    function naturalWordSort(word1, word2)
    {
        var o1 = word1.original.toUpperCase();
        var o2 = word2.original.toUpperCase();
        if (o1 < o2)
            return -1;
        if (o1 > o2)
            return 1;
        return 0;
    }

    function timeWordSort(word1, word2)
    {
        var o1 = word1.creationDate;
        var o2 = word2.creationDate;
        return o2 - o1;
    }

    app.get("/words", ensureLogin, function(req, res, next) {
        req.user.fetchWords()
        .then(function(words) {
            words.sort(timeWordSort);
            res.render("words", {
                user: req.user,
                words: words
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

    app.get("/train", ensureLogin, function(req, res, next) {
        req.user.fetchTags()
        .then(function(tags) {
            res.render("train-settings", {
                user: req.user,
                tags: tags
            });
        })
        .fail(next);
    });

    app.get("/train/start", ensureLogin, function(req, res, next) {
        var promise = req.query.tags && req.query.tags.length ? actions.userWordsForTags(req.user, req.query.tags) : req.user.fetchWords();
        promise
        .then(function(words) {
            res.render("train", {
                user: req.user,
                words: words,
                questionType: req.query.type
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

