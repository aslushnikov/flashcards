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

(function(Flash) {

Flash.Stub = function(parentElement) {
    this._dom = $("<div class='screen-stub'><div class='text'>...</div></div>");
    $(parentElement).append(this._dom);
}

Flash.Stub.prototype = {
    success: function()
    {
        this._dom.remove();
    },

    failure: function(text)
    {
        this._dom.find(".text").text(text);
        this._dom.addClass("failure");
        this._dom.hammer().on("tap", function() {
            this._remove();
        }.bind(this));
    },

    _remove: function()
    {
        this._dom.fadeOut("fast", function() {
            this._dom.remove();
        }.bind(this));
    },
}

}(Flash));

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

var MONTHS_SHORT = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
function formatDate(date)
{
    return MONTHS_SHORT[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
}

Flash.WordsHelper = {
    naturalSort: function(words)
    {
        words = words.toArray();
        words.sort(Flash.Word.compareOriginals);
        var sections = [];
        var wordsPerSection = {};
        for (var i = 0; i < words.length; ++i) {
            var word = words[i];
            var section = word.original().substr(0, 1).toUpperCase();
            if (!wordsPerSection[section]) {
                wordsPerSection[section] = [];
                sections.push(section);
            }
            wordsPerSection[section].push(word);
        }
        return {
            sections: sections,
            words: wordsPerSection
        };
    },

    dateSort: function(words)
    {
        words = words.toArray();
        var wordsPerDate = {};
        var dates = [];
        for (var i = 0; i < words.length; ++i) {
            var formattedDate = formatDate(words[i].date());
            if (!wordsPerDate[formattedDate]) {
                wordsPerDate[formattedDate] = [];
                dates.push(words[i].date());
            }
            wordsPerDate[formattedDate].push(words[i]);
        }
        for (var formattedDate in wordsPerDate) {
            var w = wordsPerDate[formattedDate];
            w.sort(Flash.Word.compareOriginals);
        }
        dates.sort(function(date1, date2) {
            return date2 - date1;
        });
        dates = dates.map(formatDate);
        return {
            sections: dates,
            words: wordsPerDate
        };
    },

    tagSort: function(words)
    {
        words = words.toArray();
        var wordsPerTag = {};
        for (var i = 0; i < words.length; ++i) {
            var word = words[i];
            var tags = word.tags();
            for (var j = 0; j < tags.length; ++j) {
                var tag = tags[j];
                if (!wordsPerTag[tag])
                    wordsPerTag[tag] = [];
                wordsPerTag[tag].push(word);
            }
        }
        for (var tag in wordsPerTag) {
            var w = wordsPerTag[tag];
            w.sort(Flash.Word.compareOriginals);
        }
        return {
            sections: Object.keys(wordsPerTag).sort(),
            words: wordsPerTag,
        };
    }
};

}(Flash));

(function(Flash) {

Flash.LazyTable = function(dictionaryElement)
{
    var dictionary = $(dictionaryElement);
    this._containerElement = dictionary.find(".dictionary-container");
    this._loadMore = dictionary.find(".load-next");
    this._loadMore.hide();
    this._loadMore.hammer().on("tap", this._onLoadMore.bind(this));
}

Flash.LazyTable.DOMElementsPerFirstChunk = 10;
Flash.LazyTable.DOMElementsPerChunk = 1000;

Flash.LazyTable.prototype = {
    _onLoadMore: function(event)
    {
        event.gesture.stopPropagation();
        event.gesture.preventDefault();
        this._flushNext();
    },

    _flushNext: function()
    {
        if (!this._fragments.length)
            return false;
        this._containerElement.append(this._fragments.shift());
        if (!this._fragments.length) {
            this._loadMore.hide();
            return false;
        }
        this._loadMore.show();
        return true;
    },

    _appendAndRecreateIfNeeded: function(fragment, child)
    {
        fragment.appendChild(child);
        if (fragment.childNodes.length < this._chunkSize)
            return fragment;
        this._fragments.push(fragment);
        this._chunkSize = Flash.LazyTable.DOMElementsPerChunk;
        return document.createDocumentFragment();
    },

    render: function(sections, wordsPerSection, rowRenderer, sectionHeaderRenderer)
    {
        this._containerElement.empty();
        this._fragments = [];
        var fragment = document.createDocumentFragment();
        this._chunkSize = Flash.LazyTable.DOMElementsPerFirstChunk;
        for (var i = 0; i < sections.length; ++i) {
            var section = sections[i];
            var words = wordsPerSection[section];
            var sectionElement = sectionHeaderRenderer ? sectionHeaderRenderer(section) : null;
            if (sectionElement)
                fragment = this._appendAndRecreateIfNeeded(fragment, sectionElement);
            for (var j = 0; j < words.length; ++j) {
                var rowElement = rowRenderer(words[j]);
                rowElement.__data = words[j];
                fragment = this._appendAndRecreateIfNeeded(fragment, rowElement);
            }
        }
        if (fragment.childNodes.length > 0)
            this._fragments.push(fragment);

        if (!this._fragments.length) {
            this._loadMore.hide();
            return;
        }
        this._flushNext();
    },

    scrollTo: function(rowData)
    {
        var children = this._containerElement.children();
        for (var i = 0; i < children.length; ++i) {
            var entry = children[i];
            if (entry.__data === rowData) {
                entry.scrollIntoViewIfNeeded(true);
                return;
            }
        }
    },

    flush: function()
    {
        while (this._flushNext());
    }
};
}(Flash));

(function(Flash){

function removeWord(wordId, callback)
{
    var stub = new Flash.Stub($(".content"));
    $.post("/word/remove/" + wordId)
    .done(function() {
        stub.success();
        callback();
    })
    .fail(function(obj, err, errDescr) {
        stub.failure("Error: " + errDescr);
    })
}

function activeTags()
{
    var tags = $(".tagcloud .tag.active").map(function(a, b) { return b.textContent; });
    return tags.toArray();
}

function startTraining()
{
    var tagTrain = $(".sort-item.groupby-tag").hasClass("active");
    var tags = tagTrain ? activeTags() : [];
    var data = {
        type: "translation",
        tags: tags
    };
    window.location = "/train/start?" + $.param(data);
}

function datePickerValue()
{
    var value = $(".date-picker .option.active").attr("data-days");
    if (!value)
        return null;

    var date = new Date();
    var daysBefore = parseInt(value, 10);
    date.setDate(date.getDate() - daysBefore);
    date.setHours(0, 0, 0, 0);
    return date;
}

function setupInitialScroll(table)
{
    table.flush();
    if (!window.location.href)
        return;
    var wordId = parseInt(window.location.hash.substring(1), 10);
    if (typeof wordId !== "number")
        return;
    var word = Flash.words.wordWithId(wordId);
    if (word)
        table.scrollTo(word);
}

$(document).ready(function() {
    var table = new Flash.LazyTable($(".dictionary"));
    sortWordsNatural(table);

    var tagcloud = $(".tagcloud");
    tagcloud.hide();
    var datePicker = $(".date-picker");
    datePicker.hide();
    $(".title-item.right").hammer().on("tap", function(e) {
        startTraining();
    });
    $(".dictionary").hammer().on("hold", function(e) {
        var entry = $(e.target).closest(".entry");
        var word = entry.find(".original").text();
        var shouldRemove = confirm("Remove word '" + word + "'?");
        if (!shouldRemove)
            return;
        var wordId = entry.attr("data-word-id");
        removeWord(wordId, onWordRemoved);

        function onWordRemoved()
        {
            entry.slideUp("fast");
        }
    });
    $(".sort-item.alphabetically").addClass("active");
    $(".sort-item.alphabetically").hammer().on("tap", function(e) {
        tagcloud.slideUp("fast");
        datePicker.slideUp("fast");
        sortWordsNatural(table);
    });
    $(".sort-item.groupby-day").hammer().on("tap", function(e) {
        tagcloud.slideUp("fast");
        datePicker.slideDown("fast");
        sortWordsByDate(table, datePickerValue());
    });
    $(".sort-item.groupby-tag").hammer().on("tap", function(e) {
        datePicker.slideUp("fast");
        tagcloud.slideDown("fast");
        var tags = activeTags();
        sortWordsByTag(table, tags);
    });
    $(".sort-item").hammer().on("tap", function(e) {
        $(".sort-item.active").removeClass("active");
        $(e.target).addClass("active");
        e.gesture.preventDefault();
    });
    $(".tagcloud .tag").hammer().on("tap", function(e) {
        $(e.target).toggleClass("active");
        var tags = activeTags();
        sortWordsByTag(table, tags);
    });
    $(".date-picker .option").hammer().on("tap", function(e) {
        var me = $(e.target);
        var isActive = me.hasClass("active");
        $(".date-picker .option.active").removeClass("active");
        if (!isActive)
            me.toggleClass("active");
        sortWordsByDate(table, datePickerValue());
    });
    setupInitialScroll(table);
})

function renderRow(template, word)
{
    function tagNames(tags)
    {
        var result = [];
        for (var i = 0; i < tags.length; ++i)
            result.push(tags[i].name);
        return result;
    }
    var entry = template.clone();
    entry.removeClass("template");
    entry.attr("href", "/word/edit/" + word.id());
    entry.attr("data-word-id", word.id());
    entry.find(".original").text(word.original());
    entry.find(".translation").text(word.translation());
    entry.find(".tags").text(tagNames(word.tags()).join(", "));
    return entry.get(0);
}

function renderSection(template, sectionHeader)
{
    var node = template.clone();
    node.removeClass("template");
    node.text(sectionHeader);
    return node.get(0);
}

function formatDate(date)
{
    return MONTHS_SHORT[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
}

function sortWordsNatural(table)
{
    var words = Flash.words;
    var sortResult = Flash.WordsHelper.naturalSort(words);
    var rowTemplate = $(".entry.template");
    var sectionTemplate = $(".section.template");
    $(".title-item.center .count").text(words.length);
    table.render(sortResult.sections, sortResult.words, renderRow.bind(null, rowTemplate), renderSection.bind(null, sectionTemplate));
}

function sortWordsByDate(table, maxAge)
{
    var words = Flash.words.newerThen(maxAge);
    var sortResult = Flash.WordsHelper.dateSort(words);
    $(".title-item.center .count").text(words.length);
    var rowTemplate = $(".entry.template");
    var sectionTemplate = $(".section.template");
    table.render(sortResult.sections, sortResult.words, renderRow.bind(null, rowTemplate), renderSection.bind(null, sectionTemplate));
}

function sortWordsByTag(table, tags)
{
    var words = Flash.words.withAnyTag(tags);
    var sortResult = Flash.WordsHelper.tagSort(words);
    $(".title-item.center .count").text(words.size());
    var rowTemplate = $(".entry.template");
    var sectionTemplate = $(".section.template");
    table.render(sortResult.sections, sortResult.words, renderRow.bind(null, rowTemplate), renderSection.bind(null, sectionTemplate));
}

}(Flash));
