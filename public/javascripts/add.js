/** Autofocus */
$(document).ready(function() {
    $("[autofocus]").focus();
});

function wordData() {
    return {
        original: $(".entry.original > .input").text(),
        translation: $(".entry.translation > .input").text(),
    };
}

function addWord() {
    $.post("/word/new", wordData())
    .always(function(err, data) {
        console.log(arguments);
    });
}

$(document).ready(function() {
    $(".entry").click(function(e) {
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
    $(".tag").hammer().on("tap", function(e) {
        if (activeTagCloud.has($(this)).length) {
            allTagCloud.append(this);
        } else {
            activeTagCloud.append(this);
        }
    });
});
