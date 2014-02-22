$(document).ready(function() {
    // this script is only for training url
    if (!window.words || !window.words.length)
        return;
    roll();
    $(".next-word").click(function() {
        roll();
    });

    function roll() {
        var section = $(".word-block");
        // get the form of the event target
        var orig = section.find("textarea[name=original]");
        var trans = section.find("textarea[name=translation]");
        window.currentWord = window.words[(Math.random() * window.words.length)|0];
        if (window.location.hash === "#reverse") {
            orig.val("");
            trans.val(window.currentWord.translation);
        } else {
            orig.val(window.currentWord.original);
            trans.val("");
        }
    }
    $("textarea[name=original]").click(function() {
        $(this).val(window.currentWord.original);
    });
    $("textarea[name=translation]").click(function() {
        $(this).val(window.currentWord.translation);
    });
});
