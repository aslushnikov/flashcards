(function(Flash){

$(document).ready(function() {
    $(".tag-setting.all-words").hammer().on("tap", function(e) {
        var checkbox = $(this).find("input[type='checkbox']");
        checkbox.prop('checked', !checkbox.prop("checked"));
        var state = checkbox.prop("checked");
        $(".tag-setting.regular > input").prop("disabled", state);
    });
    $(".tag-setting.regular").hammer().on("tap", function(e) {
        var checkbox = $(this).find("input[type='checkbox']");
        if (checkbox.prop("disabled")) {
            $(".tag-setting.regular > input").prop("disabled", false);
            $(".tag-setting.all-words > input").prop("checked", false);
            return;
        }
        checkbox.prop('checked', !checkbox.prop("checked"));
        e.preventDefault();
    });

    $(".type-setting").hammer().on("tap", function(e) {
        var radio = $(this).find("input[type='radio']");
        radio.prop('checked', !radio.prop("checked"));
        e.preventDefault();
    });

    $(".title-item.right").on("click", startTraining);
});

function startTraining(e) {
    e.preventDefault();
    var type = $("input[name='training-type']:checked").val();
    var tags = [];
    if (!$(".tag-setting.all-words > input").prop("checked")) {
        var checked = $(".tag-setting.regular > input:checked");
        for (var i = 0; i < checked.length; ++i) {
            tags.push(checked[i].value);
        }
    }
    var data = {
        type: type,
        tags: tags
    };
    window.location = "/train/start?" + $.param(data);
}

}(Flash));
