$(document).ready(function() {
    $(".words").click(function(event) {
        var node = event.target;
        while (node && !node.classList.contains("word-container"))
            node = node.parentNode;
        if (node)
            onWordClick(node);
    });
});

