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

gulp.task("build/js/deps", function() {
    gulp.src([
        "bower_components/jquery/dist/jquery.min.js",
        "bower_components/jquery-hammerjs/jquery.hammer-full.min.js",
    ])
    .pipe(gulp.dest("public/javascripts"))
});

gulp.task("css-prefix", function() {
    gulp.src("./css/*.css")
    .pipe(prefix("last 2 versions", "> 1%"))
    .pipe(gulp.dest("./build/css"))
});

gulp.task("build/css/words", ["css-prefix"], function() {
    gulp.src([
        "build/css/normalize.css",
        "build/css/stub.css",
        "build/css/common.css",
        "build/css/screen-words.css",
        "build/css/title.css",
        "build/css/tagcloud.css",
    ])
    .pipe(concat("words.css"))
    .pipe(gulp.dest("./public/stylesheets/"))
});

gulp.task("build/css/login", ["css-prefix"], function() {
    gulp.src([
        "build/css/normalize.css",
        "build/css/common.css",
        "build/css/login.css",
    ])
    .pipe(concat("login.css"))
    .pipe(gulp.dest("./public/stylesheets/"))
});

gulp.task("build/css/train-settings", ["css-prefix"], function() {
    gulp.src([
        "build/css/normalize.css",
        "build/css/common.css",
        "build/css/title.css",
        "build/css/train-settings.css",
    ])
    .pipe(concat("train-settings.css"))
    .pipe(gulp.dest("./public/stylesheets/"))
});

gulp.task("build/css/train", ["css-prefix"], function() {
    gulp.src([
        "build/css/normalize.css",
        "build/css/common.css",
        "build/css/title.css",
        "build/css/train.css",
    ])
    .pipe(concat("train.css"))
    .pipe(gulp.dest("./public/stylesheets/"))
});


gulp.task("build/css/menu", ["css-prefix"], function() {
    gulp.src([
        "build/css/normalize.css",
        "build/css/common.css",
        "build/css/menu.css",
        "build/css/screen-menu.css",
    ])
    .pipe(concat("menu.css"))
    .pipe(gulp.dest("./public/stylesheets/"))
});

gulp.task("build/css/add-word", ["css-prefix"], function() {
    gulp.src([
        "build/css/normalize.css",
        "build/css/common.css",
        "build/css/stub.css",
        "build/css/title.css",
        "build/css/new-word.css",
        "build/css/tagcloud.css",
    ])
    .pipe(concat("add-word.css"))
    .pipe(gulp.dest("./public/stylesheets/"))
});

gulp.task("build/js/add-word", function() {
    gulp.src([
        "js/Flash.js",
        "js/Stub.js",
        "js/add-word.js",
    ])
    .pipe(concat("add-word.js"))
    .pipe(gulp.dest('./public/javascripts'))
});

gulp.task("build/js/words", function() {
    gulp.src([
        "js/Flash.js",
        "js/Stub.js",
        "js/Word.js",
        "js/WordsHelper.js",
        "js/LazyTable.js",
        "js/words.js"
    ])
    .pipe(concat("words.js"))
    .pipe(gulp.dest('./public/javascripts'))
});

gulp.task("build/js/train", function() {
    gulp.src([
        "js/Flash.js",
        "js/Word.js",
        "js/train.js"
    ])
    .pipe(concat("train.js"))
    .pipe(gulp.dest('./public/javascripts'))
});

gulp.task("build/js/train-settings", function() {
    gulp.src([
        "js/Flash.js",
        "js/Word.js",
        "js/train-settings.js"
    ])
    .pipe(concat("train-settings.js"))
    .pipe(gulp.dest('./public/javascripts'))
});

gulp.task("build/css", [
    "build/css/words",
    "build/css/login",
    "build/css/menu",
    "build/css/add-word",
    "build/css/train-settings",
    "build/css/train",
]);

gulp.task("build/js", [
    "build/js/deps",
    "build/js/words",
    "build/js/add-word",
    "build/js/train",
    "build/js/train-settings",
]);

gulp.task("build", ["build/js", "build/css"]);

// Rerun the task when a file changes
gulp.task("watch", function() {
    gulp.watch("css/*.css", ["build/css"]);
    gulp.watch("js/*.js", ["build/js"]);
});

gulp.task("default", ["build", "watch"], function() {
    nodemon({ script: 'app.js', ext: 'html js', ignore: ['public/', 'js/', 'css/'] })
    .on('restart', [])
});
