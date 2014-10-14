"use strict";
var Flash = {};

$(document).ready(function() {
    if (!window.bootstrapWords) {
        console.warn("Words were not bootstrapped");
        return;
    }
    Flash.words = Flash.WordCollection.parsePayload(window.bootstrapWords);
    delete window.bootstrapWords;
});

