"use strict";
window.Flash = {};

$(document).ready(function() {
    if (!window.bootstrapWords) {
        console.warn("Words were not bootstrapped");
        return;
    }
    Flash.words = Flash.WordCollection.parsePayload(window.bootstrapWords);
    delete window.bootstrapWords;
});

(function(Flash){

Flash.Word = function(payload)
{
    this._original = payload.original;
    this._translation = payload.translation;
    this._creationDate = new Date(payload.creationDate);
    this._id = payload.id;
    this._tags = [];
    for (var i = 0; i < payload.tags.length; ++i)
        this._tags.push(payload.tags[i].name);
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
        for (var i = 0; i < this._words; ++i) {
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
}

}(Flash));

(function(Flash){

$(document).ready(function() {
    if (!Flash.words)
        return;
    if (window.questionType === "original") {
        $(".box.question legend").text("Original");
        $(".box.answer legend").text("Translation");
    } else {
        $(".box.answer legend").text("Original");
        $(".box.question legend").text("Translation");
    }
    $(".button.next").hammer().on("tap", function() {
        roll();
    });
    $(".button.fail").hammer().on("hold", function() {
        $(this).addClass("step2").text("Whole word");
        $(".text.answer").text(currentWordAnswer().substr(0, 1));
        $(".text.answer").text(currentWordAnswer());
    })
    $(".button.fail").hammer().on("tap", function() {
        var elem = $(this);
        if (!elem.hasClass("step2")) {
            elem.addClass("step2").text("Whole word");
            hintFirstLetter();
        } else {
            revealAnswer();
        }
    });
    $("html").keydown(function(e) {
        if (e.which === 13)
            roll;
        else if (e.which === 27)
            hintFirstLetter();
        else if (e.which === 32)
            revealAnswer();
    });

    var words = Flash.words.toArray();
    var currentWordIndex = -1;
    shuffle(words);
    roll();

    function shuffle(words) {
        for (var i = 0; i < words.length; ++i) {
            var position = (Math.random() * (words.length - i))|0;
            var tmp = words[i];
            words[i] = words[position + i];
            words[position + i] = tmp;
        }
    }

    function hintFirstLetter() {
        $(".text.answer").text(currentWordAnswer().substr(0, 1));
    }

    function revealAnswer() {
        $(".text.answer").text(currentWordAnswer());
    }

    function currentWordQuestion() {
        return window.questionType === "original" ? words[currentWordIndex].original(): words[currentWordIndex].translation();
    }

    function currentWordAnswer() {
        return window.questionType === "original" ? words[currentWordIndex].translation() : words[currentWordIndex].original();
    }

    function nextWord() {
        if (++currentWordIndex >= words.length) {
            currentWordIndex = 0;
            shuffle(words);
        }
        return words[currentWordIndex];
    }

    function roll() {
        var word = nextWord();
        $(".text.question").text(currentWordQuestion());
        $(".text.answer").text("");
        $(".button.fail").removeClass("step2").text("First letter");
        $(".word-count").text(words.length - currentWordIndex);
    }
});

}(Flash));
