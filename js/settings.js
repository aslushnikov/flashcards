(function(Flash) {

$(document).ready(function() {
    $("#file-selector").on("change", onFileSelected);
    $(".import-link").on("click", function() {
        $("#file-selector").click();
    });
    $(".clear-words-link").on("click", clearWords);
});

function clearWords()
{
    var response = prompt("Are you sure want to remove all words? Type 'remove' to proceed");
    if (!response || response.toUpperCase() !== "REMOVE")
        return;
    var timestamp = +new Date();
    var stub = new Flash.Stub($(".content"));
    $.post("/words/clear?timestamp=" + timestamp)
    .done(function() {
        stub.success();
    })
    .fail(function(obj, err, errDescr) {
        stub.failure("Error: " + errDescr);
    })
}

function onFileSelected()
{
    var selector = $("#file-selector");
    var files = selector.get(0).files;
    // clear selected files
    selector.replaceWith(selector.clone(true));
    var submit = confirm("Do you really want to import this file?");
    if (!submit)
        return;

    if (files.length !== 1)
        return;
    var file = files[0];
    var reader = new FileReader();
    reader.onload = function(e) {
        var data = { csv: e.srcElement.result };
        var stub = new Flash.Stub($(".content"));
        $.post("/import", data)
        .done(function() {
            stub.success();
        })
        .fail(function(obj, err, errDescr) {
            stub.failure("Error: " + errDescr);
        })
        console.log(submit);
    }
    reader.readAsBinaryString(file);
}

})(Flash);
