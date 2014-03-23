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

function addWord() {
    $.post("/word/new", wordData())
    .always(function(err, data) {
        console.log(arguments);
    });
}

$(document).ready(function() {
    // Cannot really use hammer here as it arises problems with
    // focusing input.
    $(".entry").on("click", function(e) {
        $(this).find(".input").focus();
    });
    $(".title-item.right > a").click(function() {
        addWord();
    });
});

/** Setup tag listeners */
$(document).ready(function() {
    var activeTagCloud = $(".active-tags > .tagcloud");
    var allTagCloud = $(".all-tags > .tagcloud");
    function setupTagListeners(tags)
    {
        tags.hammer().on("tap", function(e) {
            if (activeTagCloud.has($(this)).length) {
                allTagCloud.prepend(this);
            } else {
                activeTagCloud.append(this);
            }
        });
    }
    setupTagListeners($(".tag"));
    // Setup new tag button listener.
    $(".new-tag-button").hammer().on("tap", function(e) {
        var result = prompt("New tag name");
        if (!result)
            return;
        var tag = $("<div class='tag'>" + result + "</div>");
        setupTagListeners(tag);
        activeTagCloud.append(tag);
    });
});

