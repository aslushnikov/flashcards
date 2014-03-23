$(document).ready(function() {
    $(".tag-setting.all-words").hammer().on("tap", function(e) {
        var checkbox = $(this).find("input[type='checkbox']");
        checkbox.prop('checked', !checkbox.prop("checked"));
        var state = checkbox.prop("checked");
        $(".tag-setting.regular > input").prop("disabled", state);
    });
    $(".tag-setting.regular").hammer().on("tap", function(e) {
        var checkbox = $(this).find("input[type='checkbox']");
        if (checkbox.prop("disabled"))
            return;
        checkbox.prop('checked', !checkbox.prop("checked"));
        e.preventDefault();
    });
});
