(function(Flash){

var MONTHS_SHORT = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
function formatDate(date)
{
    return MONTHS_SHORT[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
}

Flash.WordsHelper = {
    naturalSort: function(words)
    {
        words = words.toArray();
        words.sort(Flash.Word.compareOriginals);
        var sections = [];
        var wordsPerSection = {};
        for (var i = 0; i < words.length; ++i) {
            var word = words[i];
            var section = word.original().substr(0, 1).toUpperCase();
            if (!wordsPerSection[section]) {
                wordsPerSection[section] = [];
                sections.push(section);
            }
            wordsPerSection[section].push(word);
        }
        return {
            sections: sections,
            words: wordsPerSection
        };
    },

    dateSort: function(words)
    {
        words = words.toArray();
        var wordsPerDate = {};
        var dates = [];
        for (var i = 0; i < words.length; ++i) {
            var formattedDate = formatDate(words[i].date());
            if (!wordsPerDate[formattedDate]) {
                wordsPerDate[formattedDate] = [];
                dates.push(words[i].date());
            }
            wordsPerDate[formattedDate].push(words[i]);
        }
        for (var formattedDate in wordsPerDate) {
            var w = wordsPerDate[formattedDate];
            w.sort(Flash.Word.compareOriginals);
        }
        dates.sort(function(date1, date2) {
            return date2 - date1;
        });
        dates = dates.map(formatDate);
        return {
            sections: dates,
            words: wordsPerDate
        };
    },

    tagSort: function(words)
    {
        words = words.toArray();
        var wordsPerTag = {};
        for (var i = 0; i < words.length; ++i) {
            var word = words[i];
            var tags = word.tags();
            for (var j = 0; j < tags.length; ++j) {
                var tag = tags[j];
                if (!wordsPerTag[tag])
                    wordsPerTag[tag] = [];
                wordsPerTag[tag].push(word);
            }
        }
        for (var tag in wordsPerTag) {
            var w = wordsPerTag[tag];
            w.sort(Flash.Word.compareOriginals);
        }
        return {
            sections: Object.keys(wordsPerTag).sort(),
            words: wordsPerTag,
        };
    }
};

}(Flash));
