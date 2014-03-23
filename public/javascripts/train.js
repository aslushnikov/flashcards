$(document).ready(function() {
    if (!window.bootstrapWords || !window.bootstrapWords.length)
        return;
    $(".button.next").hammer().on("tap", function() {
        roll();
    });
    $(".button.fail").hammer().on("tap", function() {
        var elem = $(this);
        if (!elem.hasClass("step2")) {
            elem.addClass("step2");
            $(".text.answer").text(currentWordAnswer().substr(0, 1));
            elem.text("Whole word");
        } else {
            $(".text.answer").text(currentWordAnswer());
        }
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

    function currentWordAnswer() {
        return words[currentWordIndex].original;
    }

    function nextWord() {
        if (++currentWordIndex >= words.length) {
            currentWordIndex = 0;
            shuffle(words);
        }
        return words[currentWordIndex];
    }

    function roll() {
        var word = nextWord();
        $(".text.question").text(word.translation);
        $(".text.answer").text("");
        $(".button.fail").removeClass("step2").text("First letter");
    }
});
