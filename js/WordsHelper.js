(function(Flash){

var MONTHS_SHORT = [ "Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec" ];
function formatDate(date)
{
    return MONTHS_SHORT[date.getMonth()] + " " + date.getDate() + ", " + date.getFullYear();
}

Flash.WordsHelper = {
    naturalSort: function(words)
    {
        if (!words || !words.size())
            return;
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
        if (!words || !words.length)
            return;
        words = words.slice();
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
            sections: sections,
            words: wordsPerDate
        };
    },

    tagSort: function(words)
    {
        tags.sort();
        var wordsPerTag = {};
        for (var i = 0; i < tags.length; ++i)
            wordsPerTag[tags[i]] = [];
        for (var i = 0; i < words.length; ++i) {
            var word = words[i];
            for (var j = 0; j < word.tags.length; ++j) {
                var tag = word.tags[j].name;
                if (!wordsPerTag[tag])
                    continue;
                wordsPerTag[tag].push(word);
            }
        }
        for (var i = 0; i < tags.length; ++i) {
            var w = wordsPerTag[tags[i]];
            w.sort(Flash.Word.compareOriginals);
        }
        return {
            sections: tags,
            words: wordsPerTag,
        };
    }
};

}(Flash));
