var passport = require('passport')
  , GoogleStrategy = require('passport-google').Strategy
  , Q = require("q")

module.exports = function(app, actions, config) {

    function onLogin(identifier, profile, done)
    {
        actions.findUsersWithEmail(profile.emails[0].value)
        .then(function(users) {
            if (users.length > 1) return done(new Error("multiple users with such email found"), null);
            if (users.length === 1) return done(null, users[0]);
            return actions.createNewUser({
                firstName: profile.name.givenName,
                lastName: profile.name.familyName,
                email: profile.emails[0].value,
            }).then(function(user) {
                done(null, user);
            })
        })
        .fail(done);
    }

    app.use(passport.initialize());
    app.use(passport.session());

    passport.serializeUser(function(user, done) {
        done(null, user.id + "");
    });

    passport.deserializeUser(function(id, done) {
        actions.getUserById(id)
        .then(function(user) {
            done(null, user);
        })
        .fail(function(err) {
            done(null, false);
        });
    });

    passport.use(new GoogleStrategy({
        returnURL: config.auth.realm + "/auth/google/return",
        realm: config.auth.realm
    }, onLogin));

    app.post('/login', passport.authenticate('local', {
        failureRedirect: '/login' }), function(req, res) {
        res.redirect('/');
    });

    // Redirect the user to Google for authentication.  When complete, Google
    // will redirect the user back to the application at
    //     /auth/google/return
    app.get('/auth/google', passport.authenticate('google'));

    // Google will redirect the user to this URL after authentication.  Finish
    // the process by verifying the assertion.  If valid, the user will be
    // logged in.  Otherwise, authentication has failed.
    app.get('/auth/google/return', passport.authenticate('google', {
        failureRedirect: '/login'
    }), function (req, res) {
        res.redirect(req.session.authRedirect || "/words");
    });

}
