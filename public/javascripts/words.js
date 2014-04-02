$(document).ready(function() {
    if (window.location.hash) {
        var element = $("[data-word-id=" + window.location.hash.substr(1) + "]");
        $('html, body').scrollTop(element.offset().top)
    }
});

$(document).ready(function() {
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