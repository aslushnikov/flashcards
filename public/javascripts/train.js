$(document).ready(function() {
    if (!window.bootstrapWords || !window.bootstrapWords.length)
        return;
    if (window.questionType === "original") {
        $(".box.question legend").text("Original");
        $(".box.answer legend").text("Translation");
    } else {
        $(".box.answer legend").text("Original");
        $(".box.question legend").text("Translation");
    }
    $(".button.next").hammer().on("tap", function() {
        roll();
    });
    $(".button.fail").hammer().on("hold", function() {
        $(this).addClass("step2").text("Whole word");
        $(".text.answer").text(currentWordAnswer().substr(0, 1));
        $(".text.answer").text(currentWordAnswer());
    })
    $(".button.fail").hammer().on("tap", function() {
        var elem = $(this);
        if (!elem.hasClass("step2")) {
            elem.addClass("step2").text("Whole word");
            $(".text.answer").text(currentWordAnswer().substr(0, 1));
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

    function currentWordQuestion() {
        return window.questionType === "original" ? words[currentWordIndex].original : words[currentWordIndex].translation;
    }

    function currentWordAnswer() {
        return window.questionType === "original" ? words[currentWordIndex].translation : words[currentWordIndex].original;
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
        $(".text.question").text(currentWordQuestion());
        $(".text.answer").text("");
        $(".button.fail").removeClass("step2").text("First letter");
    }
});
