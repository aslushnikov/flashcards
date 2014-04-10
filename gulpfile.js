var gulp = require("gulp")
  , gutil = require("gulp-util")
  , prefix = require('gulp-autoprefixer')
  , nodemon = require('gulp-nodemon')
  , orm = require("orm")
  , database = require("./lib/database")
  , Q = require("q")
  , config = require(process.env.FLASHCARDS_CONFIG || "./config.js")
  , dbTasks = require("./tasks/db-tasks")
  , concat = require('gulp-concat')

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

gulp.task("css", function() {
    gulp.src("./css/*.css")
    .pipe(prefix("last 2 versions", "> 1%"))
    .pipe(gulp.dest("./public/stylesheets"))
});

gulp.task("scripts", function() {
    gulp.src([
        "js/Flash.js",
        "js/Word.js",
        "js/WordsHelper.js",
        "js/LazyTable.js",
        "js/words.js"
    ])
    .pipe(concat("words.js"))
    .pipe(gulp.dest('./public/javascripts'))
});

// Rerun the task when a file changes
gulp.task("watch", function() {
    gulp.watch("css/*.css", ["css"]);
    gulp.watch("js/*.js", ["scripts"]);
});

gulp.task("default", ["watch"], function() {
    nodemon({ script: 'app.js', ext: 'html js', ignore: ['public/', 'js/', 'css/'] })
    .on('restart', [])

});
