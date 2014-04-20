(function(Flash){

Flash.Word = function(payload)
{
    this._original = payload.original;
    this._translation = payload.translation;
    this._creationDate = new Date(payload.creationDate);
    this._id = payload.id;
    this._tags = payload.tags;
    //FIXME: this needs to be a real set
    this._tagsSet = {};
    for (var i = 0; i < this._tags.length; ++i) {
        this._tagsSet[this._tags[i]] = true;
    }
}

Flash.Word.prototype = {
    tags: function()
    {
        return this._tags.slice();
    },

    hasTag: function(tag)
    {
        return !!this._tagsSet[tag];
    },

    hasAny: function(tags)
    {
        for (var i = 0; i < tags.length; ++i) {
            if (this._tagsSet[tags[i]])
                return true;
        }
        return false;
    },

    original: function()
    {
        return this._original;
    },

    date: function()
    {
        return this._creationDate;
    },

    translation: function()
    {
        return this._translation;
    },

    id: function()
    {
        return this._id;
    },
}

Flash.Word.compareOriginals = function(word1, word2)
{
    var o1 = word1.original().toUpperCase();
    var o2 = word2.original().toUpperCase();
    if (o1 < o2)
        return -1;
    if (o1 > o2)
        return 1;
    return 0;
}

Flash.WordCollection = function(words)
{
    this._words = words;
}

Flash.WordCollection.parsePayload = function(payload)
{
    var words = [];
    for (var i = 0; i < payload.length; ++i)
        words.push(new Flash.Word(payload[i]));
    return new Flash.WordCollection(words);
}

Flash.WordCollection.prototype = {
    wordWithId: function(id)
    {
        for (var i = 0; i < this._words.length; ++i) {
            if (id === this._words[i].id())
                return this._words[i];
        }
        return null;
    },

    toArray: function()
    {
        return this._words.slice();
    },

    size: function()
    {
        return this._words.length;
    },

    newerThen: function(maxAge)
    {
        var filteredWords = this._words.filter(function(word) {
            return word.date() >= maxAge;
        });
        return new Flash.WordCollection(filteredWords);
    },

    withAnyTag: function(tags)
    {
        var filteredWords = this._words.filter(function(word) {
            return word.hasAny(tags);
        });
        return new Flash.WordCollection(filteredWords);
    },

    uniqueTags: function()
    {
        var tagSet = {};
        for (var i = 0; i < this._words.length; ++i) {
            var tags = this._words[i].tags();
            for (var j = 0; j < tags.length; ++j) {
                tagSet[tags[j]] = true;
            }
        }
        return Object.keys(tagSet);
    },
}

}(Flash));
