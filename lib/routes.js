var Q = require("q")

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
            user: req.user
        });
    });

    app.get("/word/list", ensureLogin, function(req, res, next) {
        res.render("list-words", {
            user: req.user,
            words: req.user.words
        });
    });

    app.post("/word/new", function(req, res, next) {
        actions.createNewWord(req.user, req.body)
        .then(function() {
            //res.render("registrationSuccess");
            console.log("Done!");
            res.send(200);
        })
        .fail(next)
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

