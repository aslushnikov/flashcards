$(document).ready(function() {
    $("textarea[name=original]").focus();
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
            $("textarea[name=original]").focus();
        });
    })
    $("#create-word").keypress(function(e) {
        if(e.which == 13) {
            jQuery(this).blur();
            jQuery('.submit-word').focus().click();
        }
    });
});

