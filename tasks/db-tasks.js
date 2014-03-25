var Q = require("q")

module.exports.clear = function(db)
{
    var clearPromises = [];
    for (var modelName in db.models) {
        var model = db.models[modelName];
        var clear = Q.denodeify(model.clear.bind(model));
        var promise = clear()
        .fail(function(modelName, error) {
            console.error("Failed to clear model " + modelName);
            throw error;
        }.bind(this, modelName));
        clearPromises.push(promise);
    }
    return Q.all(clearPromises)
    .then(function() {
        return db;
    })
    .fail(function(error) {
        console.error("Failed to clear database");
        throw error;
    })
}

module.exports.drop = function(db)
{
    return Q.denodeify(db.drop.bind(db))()
    .then(function() {
        return db;
    })
}

module.exports.init = function(db)
{
}

module.exports.reset = function(db)
{
    return module.exports.clear(db)
    .then(module.exports.init)
    .then(function() {
        return db;
    });
}

