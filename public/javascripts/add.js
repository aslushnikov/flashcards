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

function submitWord(url) {
    var stub = new App.Stub($(".content"));
    $.post(url, wordData())
    .done(function() {
        var callback = $("meta[data-callback]").attr("data-callback");
        if (callback) {
            window.location = callback;
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

$(document).ready(function() {
    // Cannot really use hammer here as it arises problems with
    // focusing input.
    $(".entry").on("click", function(e) {
        $(this).find(".input").focus();
    });
    $(".title-item.right").click(function(e) {
        submitWord($(this).attr("href"));
        e.preventDefault();
    });
    $(".entry > .input").keydown(function(e) {
        if (e.which === 13) {
            $(this).blur();
            submitWord();
        }
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

