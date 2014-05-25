(function(Flash){

var tagCloud = null;

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

var tagState = {};
function activeTags()
{
    return Object.keys(tagState);
}

function toggleTagState(tag)
{
    if (tagState[tag])
        delete tagState[tag];
    else
        tagState[tag] = true;
}

function startTraining()
{
    var data = { translation: "translation" };
    if ($(".sort-item.groupby-tag").hasClass("active"))
        data.tags = activeTags();
    if ($(".sort-item.groupby-day").hasClass("active"))
        data.newerThen = datePickerValue();
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
    filterWordsNatural(table);

    $(".filter input").on("input", function(e) {
        filterWordsNatural(table);
    });

    tagCloud = new Flash.TagCloud();
    var uniqueTags = Flash.words.uniqueTags();
    for (var i = 0; i < uniqueTags.length; ++i)
        tagCloud.addTag(uniqueTags[i]);
    $(".tagcloud-container").append(tagCloud.element);
    tagCloud.element.hide();
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
        tagCloud.element.slideUp("fast");
        datePicker.slideUp("fast");
        $(".filter").slideDown("fast");
        filterWordsNatural(table);
    });
    $(".sort-item.groupby-day").hammer().on("tap", function(e) {
        tagCloud.element.slideUp("fast");
        $(".filter").slideUp("fast");
        datePicker.slideDown("fast");
        sortWordsByDate(table, datePickerValue());
    });
    $(".sort-item.groupby-tag").hammer().on("tap", function(e) {
        datePicker.slideUp("fast");
        $(".filter").slideUp("fast");
        tagCloud.element.slideDown("fast");
        var tags = activeTags();
        sortWordsByTag(table, tags);
    });
    $(".sort-item").hammer().on("tap", function(e) {
        $(".sort-item.active").removeClass("active");
        $(e.target).addClass("active");
        e.gesture.preventDefault();
    });
    tagCloud.on(Flash.TagCloud.Events.TagClicked, function(event, data) {
        $(data.element).toggleClass("active");
        toggleTagState(data.tag);
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
    var entry = template.clone();
    entry.removeClass("template");
    entry.attr("href", "/word/edit/" + word.id());
    entry.attr("data-word-id", word.id());
    entry.find(".original").text(word.original());
    entry.find(".translation").text(word.translation());
    entry.find(".tags").text(word.tags().join(", "));
    return entry.get(0);
}

function createHTMLWithHighlightedMatches(text, matchIndexes)
{
    var html = "";
    var lastIndex = -1;
    for (var i = 0; i < matchIndexes.length; ++i) {
        html += text.substring(lastIndex + 1, matchIndexes[i]);
        html += "<span class='text-match'>" + text[matchIndexes[i]] + "</span>";
        lastIndex = matchIndexes[i];
    }
    html += text.substring(lastIndex + 1);
    return html;
}

function renderRowWithMatch(template, matchFunction, word)
{
    var originalIndexes = matchFunction(word.original());
    var translationIndexes = matchFunction(word.translation());
    var entry = template.clone();
    entry.removeClass("template");
    entry.attr("href", "/word/edit/" + word.id());
    entry.attr("data-word-id", word.id());
    entry.find(".original").html(createHTMLWithHighlightedMatches(word.original(), originalIndexes));
    entry.find(".translation").html(createHTMLWithHighlightedMatches(word.translation(), translationIndexes));
    entry.find(".tags").text(word.tags().join(", "));
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

function matchFunction(filterValue, text)
{
    if (!filterValue)
        return [];
    var index = text.toUpperCase().indexOf(filterValue.toUpperCase());
    if (index === -1)
        return [];
    var result = [];
    for (var i = 0; i < filterValue.length; ++i)
        result.push(index + i);
    return result;
}

function filterWordsNatural(table)
{
    var words = Flash.words;
    var filterValue = $(".filter input").val();
    if (filterValue) {
        words = Flash.words.filter(function(word) {
            return matchFunction(filterValue, word.original()).length || matchFunction(filterValue, word.translation()).length;
        });
    }
    var sortResult = Flash.WordsHelper.naturalSort(words);
    var rowTemplate = $(".entry.template");
    var sectionTemplate = $(".section.template");
    $(".title-item .count").text(words.size());
    table.render(sortResult.sections, sortResult.words, renderRowWithMatch.bind(null, rowTemplate, matchFunction.bind(null, filterValue)), renderSection.bind(null, sectionTemplate));
}

function sortWordsByDate(table, maxAge)
{
    var words = Flash.words.newerThen(maxAge);
    var sortResult = Flash.WordsHelper.dateSort(words);
    $(".title-item .count").text(words.size());
    var rowTemplate = $(".entry.template");
    var sectionTemplate = $(".section.template");
    table.render(sortResult.sections, sortResult.words, renderRow.bind(null, rowTemplate), renderSection.bind(null, sectionTemplate));
}

function sortWordsByTag(table, tags)
{
    var words = Flash.words.withAnyTag(tags);
    var sortResult = Flash.WordsHelper.tagSort(words);
    $(".title-item .count").text(words.size());
    var rowTemplate = $(".entry.template");
    var sectionTemplate = $(".section.template");
    table.render(sortResult.sections, sortResult.words, renderRow.bind(null, rowTemplate), renderSection.bind(null, sectionTemplate));
}

}(Flash));
