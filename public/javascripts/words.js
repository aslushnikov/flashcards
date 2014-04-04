$(document).ready(function() {
    $(".sort-item.alphabetically").addClass("active");
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

    renderWords(SortTypes.date);
})

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

function tagNames(tags)
{
    var result = [];
    for (var i = 0; i < tags.length; ++i)
        result.push(tags[i].name);
    return result;
}

function renderWord(word, template)
{
    var entry = template.clone();
    entry.removeClass("template");
    entry.attr("href", "/word/edit/" + word.id);
    entry.attr("data-word-id", word.id);
    entry.find(".original").text(word.original);
    entry.find(".translation").text(word.translation);
    entry.find(".tags").text(tagNames(word.tags).join(", "));
    return entry.get(0);
}

function stringifyDate(date)
{
    return date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
}

var SortTypes = {
    natural: "natural",
    date: "date"
};
function renderWords(sortType)
{
    function naturalSort(word1, word)
    {
        if (word1.original < word2.original)
            return -1;
        if (word1.original > word2.original)
            return 1;
        return 0;
    }

    function dateSort(word1, word2)
    {
        return word1.creationDate - word2.creationDate;
    }

    var words = this.bootstrapWords || [];
    if (!words.length)
        return;
    words.sort(sortType === SortTypes.natural ? naturalSort : dateSort);
    var template = $(".entry.template");
    var fragment = document.createDocumentFragment();
    var lastRenderedDate = "";
    for (var i = 0; i < words.length; ++i) {
        var word = words[i];
        var wordDate = new Date(word.creationDate);
        if (sortType === SortTypes.date && lastRenderedDate !== stringifyDate(wordDate)) {
            lastRenderedDate = stringifyDate(wordDate);
            fragment.appendChild(document.createTextNode(lastRenderedDate));
        }
        var render = renderWord(word, template);
        fragment.appendChild(render);
    }

    $(".dictionary-container").empty().append(fragment);
}

