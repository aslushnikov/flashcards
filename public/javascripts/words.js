$(document).ready(function() {
    $(".words").click(function(event) {
        var node = event.target;
        while (node && !node.classList.contains("word-container"))
            node = node.parentNode;
        if (node)
            onWordClick(node);
    });
});

function showWordDetails(wordContainer)
{
    var template = $("#word-details-template");
    var docFragment = document.importNode(template.get(0).content, true);
    var details = docFragment.querySelector(".details")
    wordContainer.appendChild(details);
    $(details).hide().slideDown("fast");
    wordContainer.classList.add("show-details");
}

function hideWordDetails(wordContainer)
{
    console.assert(wordContainer.classList.contains("show-details"));
    var details = wordContainer.querySelector(".details");
    $(details).slideUp("fast", function() {
        details.remove();
    });
    wordContainer.classList.remove("show-details");
}

function onWordClick(wordContainer)
{
    if (wordContainer.classList.contains("show-details"))
        hideWordDetails(wordContainer);
    else
        showWordDetails(wordContainer);
}
