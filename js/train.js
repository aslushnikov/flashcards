(function(Flash){

$(document).ready(function() {
    var trainSettings = $.deparam(window.location.search.substr(1));
    if (trainSettings.newerThen)
        trainSettings.newerThen = new Date(trainSettings.newerThen);

    if (!Flash.words)
        return;
    if (trainSettings.type === "original") {
        $(".box.question legend").text("Original");
        $(".box.answer legend").text("Translation");
    } else {
        $(".box.answer legend").text("Original");
        $(".box.question legend").text("Translation");
    }
    $(".button.next").hammer().on("tap", function() {
        roll();
    });
    $(".box.answer").hammer().on("hold", function() {
        hintFirstLetter();
    })
    $(".box.answer").hammer().on("tap", function() {
        revealAnswer();
    });
    $("html").keydown(function(e) {
        if (e.which === 13)
            roll();
        else if (e.which === 27)
            hintFirstLetter();
        else if (e.which === 32)
            revealAnswer();
    });

    var words = Flash.words;
    if (trainSettings.newerThen)
        words = words.newerThen(trainSettings.newerThen);
    if (trainSettings.tags)
        words = words.withAnyTag(trainSettings.tags);

    var words = words.toArray();
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

    function hintFirstLetter() {
        $(".text.answer").text(currentWordAnswer().substr(0, 1));
    }

    function revealAnswer() {
        $(".text.answer").text(currentWordAnswer());
    }

    function currentWordQuestion() {
        return trainSettings.type === "original" ? words[currentWordIndex].original(): words[currentWordIndex].translation();
    }

    function currentWordAnswer() {
        return trainSettings.type === "original" ? words[currentWordIndex].translation() : words[currentWordIndex].original();
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
        $(".word-count").text(words.length - currentWordIndex);
    }
});

}(Flash));
