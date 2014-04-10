"use strict";
window.Flash = {};

$(document).ready(function() {
    if (!window.bootstrapWords)
        throw new Error("Words were not bootstrapped");
    Flash.words = Flash.WordCollection.parsePayload(window.bootstrapWords);
    delete window.bootstrapWords;
});
