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

gulp.task("css-prefix", function() {
    gulp.src("./css/*.css")
    .pipe(prefix("last 2 versions", "> 1%"))
    .pipe(gulp.dest("./build/css"))
});

gulp.task("screen/words/css", ["css-prefix"], function() {
    gulp.src([
        "build/css/common.css",
        "build/css/screen-words.css",
        "build/css/title.css",
        "build/css/tagcloud.css",
    ])
    .pipe(concat("words.css"))
    .pipe(gulp.dest("./public/stylesheets/"))
});

gulp.task("screen/words/js", function() {
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

gulp.task("rebuild/css", [
    "screen/words/css",
]);

gulp.task("rebuild/js", [
    "screen/words/js",
]);

// Rerun the task when a file changes
gulp.task("watch", function() {
    gulp.watch("css/*.css", ["rebuild/css"]);
    gulp.watch("js/*.js", ["rebuild/js"]);
});

gulp.task("default", ["watch"], function() {
    nodemon({ script: 'app.js', ext: 'html js', ignore: ['public/', 'js/', 'css/'] })
    .on('restart', [])

});
