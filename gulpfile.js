var gulp = require("gulp")
  , gutil = require("gulp-util")
  , prefix = require('gulp-autoprefixer')
  , nodemon = require('gulp-nodemon')
  , orm = require("orm")
  , database = require("./lib/database")
  , Q = require("q")
  , config = require(process.env.FLASHCARDS_CONFIG || "./config.js")
  , dbTasks = require("./tasks/db-tasks")

gulp.task("db/reset", function() {
    return database.connect(config)
    .then(function(db) {
        return dbTasks.reset(db);
    })
    .then(function(db) {
        return Q.denodeify(db.close.bind(db))();
    })
});

gulp.task("db/drop", function() {
    return database.connect(config, true)
    .then(function(db) {
        return dbTasks.drop(db);
    })
    .then(function(db) {
        return Q.denodeify(db.close.bind(db))();
    })
});

gulp.task("db/clear", function() {
    return database.connect(config)
    .then(function(db) {
        return dbTasks.clear(db);
    })
    .then(function(db) {
        return Q.denodeify(db.close.bind(db))();
    })
});

gulp.task("css/prefix", function() {
    gulp.src("./css/*.css")
    .pipe(prefix("last 2 versions", "> 1%"))
    .pipe(gulp.dest("./public/stylesheets"))
});

gulp.task("default", function() {
    // watch for CSS changes
    gulp.watch("css/*.css", function() {
        gulp.run("css/prefix");
    });
    nodemon({ script: 'app.js', ext: 'html js', ignore: ['public/'] })
    .on('restart', [])

});
