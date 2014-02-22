$(document).ready(function() {
    if (!window.bootstrapWords || !window.bootstrapWords.length)
        return;
    $(".next-word").click(function() {
        roll();
    });

    var words = window.bootstrapWords;
    var currentWordIndex = -1;
    shuffle(words);
    roll();

    function shuffle(words) {
        for (var i = 0; i < words.length; ++i) {
            var position = (Math.random() * (words.length - i))|0;
            var tmp = words[i];
            words[i] = words[position + i];
            words[position + i] = tmp;
        }
    }

    function currentWord() {
        return words[currentWordIndex];
    }

    function nextWord() {
        if (++currentWordIndex >= words.length) {
            currentWordIndex = 0;
            shuffle(words);
        }
    }

    function roll() {
        var section = $(".word-block");
        // get the form of the event target
        var orig = section.find("textarea[name=original]");
        var trans = section.find("textarea[name=translation]");
        nextWord();
        if (window.location.hash === "#reverse") {
            orig.val("");
            trans.val(currentWord().translation);
        } else {
            orig.val(currentWord().original);
            trans.val("");
        }
    }
    $("textarea[name=original]").click(function() {
        $(this).val(currentWord().original);
    });
    $("textarea[name=translation]").click(function() {
        $(this).val(currentWord().translation);
    });
});
