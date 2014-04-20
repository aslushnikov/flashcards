(function(Flash){

/** Autofocus */
$(document).ready(function() {
    $("[autofocus]").focus();
});

function wordData() {
    return {
        original: $(".entry.original > .input").text(),
        translation: $(".entry.translation > .input").text(),
        tags: $(".active-tags > .tagcloud > .tag").toArray().map(function(value) { return value.textContent; })
    };
}

function submitWord() {
    var stub = new Flash.Stub($(".content"));
    var editedWord = getEditedWord();
    var url = editedWord ? "/word/edit/" + editedWord.id() : "/word/new";
    $.post(url, wordData())
    .done(function() {
        if (editedWord) {
            window.location = "/words#" + editedWord.id();
        } else {
            stub.success();
            $(".entry.original > .input").text("").focus();
            $(".entry.translation > .input").text("");
        }
    })
    .fail(function(obj, err, errDescr) {
        stub.failure("Error: " + errDescr);
    })
}

function setupTagListeners(allTagCloud, activeTagCloud, tags)
{
    tags.hammer().on("tap", function(e) {
        if (activeTagCloud.has($(this)).length) {
            allTagCloud.prepend(this);
        } else {
            activeTagCloud.append(this);
        }
    });
}

$(document).ready(function() {
    // Cannot really use hammer here as it arises problems with
    // focusing input.
    $(".entry").on("click", function(e) {
        $(this).find(".input").focus();
    });
    $(".title-item.right").click(function(e) {
        submitWord();
        e.preventDefault();
    });
    $(".entry > .input").keydown(function(e) {
        if (e.which === 13) {
            $(this).blur();
            submitWord();
        }
    });

/** Setup tag listeners */
    var activeTagCloud = $(".active-tags > .tagcloud");
    var allTagCloud = $(".all-tags > .tagcloud");
    // Setup new tag button listener.
    $(".new-tag-button").hammer().on("tap", function(e) {
        var result = prompt("New tag name");
        if (!result)
            return;
        var tag = $("<div class='tag'>" + result + "</div>");
        setupTagListeners(allTagCloud, activeTagCloud, tag);
        activeTagCloud.append(tag);
    });

    fillFormData(getEditedWord());
});

function getEditedWord()
{
    var editedWord = null;
    if (window.location.pathname.indexOf("edit") !== -1) {
        var wordId = parseInt(window.location.pathname.split("/").pop(), 10);
        editedWord = Flash.words.wordWithId(wordId);
    }
    return editedWord;
}

function fillFormData(editedWord)
{
    var activeTagCloud = $(".active-tags > .tagcloud");
    var allTagCloud = $(".all-tags > .tagcloud");
    var tags = Flash.words.uniqueTags();
    for (var i = 0; i < tags.length; ++i) {
        var tag = tags[i];
        var tagElement = $("<div class='tag'>" + tag + "</div>");
        var cloud = editedWord && editedWord.hasTag(tag) ? activeTagCloud : allTagCloud;
        cloud.append(tagElement);
    }
    if (!editedWord)
        return;
    $(".original .input").text(editedWord.original());
    $(".translation .input").text(editedWord.translation());
    setupTagListeners(allTagCloud, activeTagCloud, $(".tag"));
}

function initializeAllTagCloud()
{
}

}(Flash));
