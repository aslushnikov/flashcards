$(document).ready(function() {
    if (window.location.hash) {
        var element = $("[data-word-id=" + window.location.hash.substr(1) + "]");
        $('html, body').scrollTop(element.offset().top)
    }
});

