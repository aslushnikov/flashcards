var Q = require("q")
  , orm = require("orm")

var connect = Q.denodeify(orm.connect.bind(orm));

module.exports.connect = function(config, doNotSyncTables) {
    return connect(config.database)
    .then(function(db) {
        db.settings.set("instance.cache", config.database.instanceCache);
        if (doNotSyncTables)
            return db;
        var deferred = Q.defer();
        db.load("./models", function(err) {
            if (err) return deferred.reject(err);
            db.sync(function(err) {
                if (err) return deferred.reject(err);
                deferred.resolve(db);
            });
        });
        return deferred.promise;
    })
};
