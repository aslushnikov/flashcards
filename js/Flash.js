"use strict";
window.Flash = {};

$(document).ready(function() {
    if (!window.bootstrapWords) {
        return console.warn("Words were not bootstrapped");
    }
    Flash.words = Flash.WordCollection.parsePayload(window.bootstrapWords);
    delete window.bootstrapWords;
});
