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
        "bower_components/jquery-bbq-deparam/jquery-deparam.min.js",
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


gulp.task("build/css/settings", ["css-prefix"], function() {
    gulp.src([
        "build/css/normalize.css",
        "build/css/common.css",
        "build/css/title.css",
        "build/css/stub.css",
        "build/css/screen-settings.css",
    ])
    .pipe(concat("settings.css"))
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

var LIB_SOURCES = [
        "js/Flash.js",
        "js/EventEmitter.js",
        "js/Stub.js",
        "js/Word.js",
        "js/WordsHelper.js",
        "js/LazyTable.js",
        "js/TagCloud.js",
];

gulp.task("build/js/lib", function() {
    gulp.src(LIB_SOURCES)
    .pipe(concat("lib.js"))
    .pipe(gulp.dest('./public/javascripts'))
});

gulp.task("lint", function() {
    var exec = require("child_process").exec;
    exec("bash scripts/compile.sh " + LIB_SOURCES.join(" "), { cwd: "." }, function(error, stdout, stderr) {
        console.log(stderr);
    });
});

gulp.task("build/css", [
    "build/css/words",
    "build/css/login",
    "build/css/settings",
    "build/css/add-word",
    "build/css/train",
]);

gulp.task("build/js", [
    "build/js/deps",
    "build/js/lib",
], function() {
    gulp.src([
        "js/add-word.js",
        "js/words.js",
        "js/train.js",
        "js/settings.js",
    ])
    .pipe(gulp.dest("./public/javascripts"))
});

gulp.task("build", ["build/js", "build/css"]);

// Rerun the task when a file changes
gulp.task("watch", function() {
    gulp.watch("css/*.css", ["build/css"]);
    gulp.watch("js/*.js", ["build/js"]);
});

function gitHEAD(path, callback)
{
    var exec = require('child_process').exec
    exec('git rev-parse --short HEAD', {cwd: path}, function(error, stdout, stderr) {
        if (error) return callback(error, stderr.trim());
        callback(null, stdout.trim());
    });
}

gulp.task("default", ["build", "watch"], function() {
    gitHEAD(".", function(err, sha) {
        nodemon({ env: {"VERSION": sha }, script: 'app.js', ext: 'html js', ignore: ['public/', 'js/', 'css/'] })
        .on('restart', [])
    });
});
