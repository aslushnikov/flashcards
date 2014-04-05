var SortTypes = {
    natural: "natural",
    date: "date"
};
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

    renderWords(SortTypes.natural);
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

function renderDate(date, template)
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

function renderWords(sortType)
{
    function naturalSort(word1, word2)
    {
        if (word1.original < word2.original)
            return -1;
        if (word1.original > word2.original)
            return 1;
        return 0;
    }

    function dateSort(word1, word2)
    {
        return new Date(word2.creationDate) - new Date(word1.creationDate);
    }

    var words = this.bootstrapWords || [];
    if (!words.length)
        return;
    words.sort(sortType === SortTypes.natural ? naturalSort : dateSort);
    var entryTemplate = $(".entry.template");
    var dateTemplate = $(".date.template");
    var fragment = document.createDocumentFragment();
    var lastRenderedDate = "";
    for (var i = 0; i < words.length; ++i) {
        var word = words[i];
        var wordDate = new Date(word.creationDate);
        if (sortType === SortTypes.date && lastRenderedDate !== stringifyDate(wordDate)) {
            lastRenderedDate = stringifyDate(wordDate);
            fragment.appendChild(renderDate(lastRenderedDate, dateTemplate));
        }
        var render = renderWord(word, entryTemplate);
        fragment.appendChild(render);
    }

    $(".dictionary-container").empty().append(fragment);
}

