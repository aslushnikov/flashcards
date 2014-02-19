$(document).ready(function() {
    $(".submit-word").click(function() {
        var btn = $(this);
        btn.addClass("disabled");
        // get the form of the event target
        var form = $(btn).parents('form:first');
        // send ajax request
        $.post(form.attr("action"), form.serialize())
        .always(function(err, data) {
            console.log(arguments);
            // clear all text area fields
            form.find("textarea").val('');
            btn.removeClass("disabled");
        });
    });
});
