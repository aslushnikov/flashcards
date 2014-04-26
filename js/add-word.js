(function(Flash){

/** Autofocus */
$(document).ready(function() {
    $("[autofocus]").focus();
});

function wordData(activeTagCloud) {
    return {
        original: $(".entry.original > .input").text(),
        translation: $(".entry.translation > .input").text(),
        tags: activeTagCloud.tags(),
    };
}

function submitWord(activeTagCloud) {
    var stub = new Flash.Stub($(".content"));
    var editedWord = getEditedWord();
    var url = editedWord ? "/word/edit/" + editedWord.id() : "/word/new";
    $.post(url, wordData(activeTagCloud))
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
    var activeTagCloud = new Flash.TagCloud();
    $(".active-tags").append(activeTagCloud.element);
    var allTagCloud = new Flash.TagCloud();
    $(".all-tags").append(allTagCloud.element);
    activeTagCloud.on(Flash.TagCloud.Events.TagClicked, function(event, tag) {
        activeTagCloud.removeTag(tag);
        allTagCloud.addTag(tag);
    });
    allTagCloud.on(Flash.TagCloud.Events.TagClicked, function(event, tag) {
        allTagCloud.removeTag(tag);
        activeTagCloud.addTag(tag);
    });
    submitWord = submitWord.bind(null, activeTagCloud);
    // Cannot really use hammer here as it arises problems with
    // focusing input.
    $(".entry").on("click", function(e) {
        $(this).find(".input").focus();
    });
    $(".title-item.right").click(function(e) {
        submitWord(activeTagCloud);
        e.preventDefault();
    });
    $(".entry > .input").keydown(function(e) {
        if (e.which === 13) {
            $(this).blur();
            submitWord();
        }
    });

    // Setup new tag button listener.
    $(".new-tag-button").hammer().on("tap", function(e) {
        var result = prompt("New tag name");
        if (!result)
            return;
        activeTagCloud.addTag(result);
    });

    fillFormData(getEditedWord(), activeTagCloud, allTagCloud);
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

function fillFormData(editedWord, activeTagCloud, allTagCloud)
{
    var tags = Flash.words.uniqueTags();
    for (var i = 0; i < tags.length; ++i) {
        var tag = tags[i];
        var cloud = editedWord && editedWord.hasTag(tag) ? activeTagCloud : allTagCloud;
        cloud.addTag(tag);
    }
    if (!editedWord)
        return;
    $(".original .input").text(editedWord.original());
    $(".translation .input").text(editedWord.translation());
}

}(Flash));
