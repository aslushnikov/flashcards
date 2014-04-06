var SortTypes = {
    natural: "natural",
    date: "date"
};

function initializeWords()
{
    for (var i = 0; i < bootstrapWords.length; ++i) {
        var word = bootstrapWords[i];
        word.creationDate = new Date(word.creationDate);
    }
}

function removeWord(wordId, callback)
{
    $.post("/word/remove/" + wordId)
    .done(function() {
        callback();
    })
    .fail(function(obj, err, errDescr) {
        stub.failure("Error: " + errDescr);
    })
}

$(document).ready(function() {
    initializeWords();
    sortWordsNatural(bootstrapWords);

    var tagcloud = $(".tagcloud");
    tagcloud.hide();
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
        sortWordsNatural(bootstrapWords);
    });
    $(".sort-item.groupby-day").hammer().on("tap", function(e) {
        tagcloud.slideUp("fast");
        sortWordsByDate(bootstrapWords);
    });
    $(".sort-item.groupby-tag").hammer().on("tap", function(e) {
        tagcloud.slideDown("fast");
        var tags = $(".tagcloud .tag.active").map(function(a, b) { return b.textContent; });
        sortWordsByTag(bootstrapWords, tags);
    });
    $(".sort-item").hammer().on("tap", function(e) {
        $(".sort-item.active").removeClass("active");
        $(e.target).addClass("active");
    });
    $(".tagcloud .tag").hammer().on("tap", function(e) {
        $(e.target).toggleClass("active");
        var tags = $(".tagcloud .tag.active").map(function(a, b) { return b.textContent; });
        sortWordsByTag(bootstrapWords, tags);
    });
})

function renderWord(template, word)
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
    entry.attr("href", "/word/edit/" + word.id);
    entry.attr("data-word-id", word.id);
    entry.find(".original").text(word.original);
    entry.find(".translation").text(word.translation);
    entry.find(".tags").text(tagNames(word.tags).join(", "));
    return entry.get(0);
}

function renderDate(template, date)
{
    var node = template.clone();
    node.removeClass("template");
    node.text(date);
    return node.get(0);
}

function stringifyDate(date)
{
    return date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
}

function naturalSort(word1, word2)
{
    if (word1.original < word2.original)
        return -1;
    if (word1.original > word2.original)
        return 1;
    return 0;
}

function sortWordsNatural(words)
{
    if (!words || !words.length)
        return;
    var rowTemplate = $(".entry.template");
    words.sort(naturalSort);
    renderTable(["all"], {
        "all": words,
    }, renderWord.bind(null, rowTemplate));
}

function sortWordsByDate(words)
{
    if (!words || !words.length)
        return;
    var wordsPerDate = {};
    var dates = [];
    for (var i = 0; i < words.length; ++i) {
        var formattedDate = stringifyDate(words[i].creationDate);
        if (!wordsPerDate[formattedDate]) {
            wordsPerDate[formattedDate] = [];
            dates.push(words[i].creationDate);
        }
        wordsPerDate[formattedDate].push(words[i]);
    }
    for (var formattedDate in wordsPerDate) {
        var words = wordsPerDate[formattedDate];
        words.sort(naturalSort);
    }
    dates.sort(function(date1, date2) {
        return date2 - date1;
    });
    dates = dates.map(stringifyDate);

    var rowTemplate = $(".entry.template");
    var sectionTemplate = $(".section.template");
    renderTable(dates, wordsPerDate, renderWord.bind(null, rowTemplate), renderDate.bind(null, sectionTemplate));
}

function sortWordsByTag(words, tags)
{
    tags.sort();
    var wordsPerTag = {};
    for (var i = 0; i < tags.length; ++i)
        wordsPerTag[tags[i]] = [];
    for (var i = 0; i < words.length; ++i) {
        var word = words[i];
        for (var j = 0; j < word.tags.length; ++j) {
            var tag = word.tags[j].name;
            if (!wordsPerTag[tag])
                continue;
            wordsPerTag[tag].push(word);
        }
    }
    var rowTemplate = $(".entry.template");
    var sectionTemplate = $(".section.template");
    renderTable(tags, wordsPerTag, renderWord.bind(null, rowTemplate), renderDate.bind(null, sectionTemplate));
}

function renderTable(sections, wordsPerSection, rowRenderer, sectionHeaderRenderer)
{
    var fragment = document.createDocumentFragment();
    for (var i = 0; i < sections.length; ++i) {
        var section = sections[i];
        var words = wordsPerSection[section];
        var sectionElement = sectionHeaderRenderer ? sectionHeaderRenderer(section) : null;
        if (sectionElement)
            fragment.appendChild(sectionElement);
        for (var j = 0; j < words.length; ++j) {
            var rowElement = rowRenderer(words[j]);
            fragment.appendChild(rowElement);
        }
    }
    $(".dictionary-container").empty().append(fragment);
}
