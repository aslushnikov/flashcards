(function(Flash) {

Flash.TagCloud = function()
{
    this.element = $("<div>").addClass("tagcloud");
    this._tagsToElement = {};
    jQuery.extend(Flash.TagCloud.prototype, jQuery.eventEmitter);
}

Flash.TagCloud.Events = {
    TagClicked: "TagClicked"
};

Flash.TagCloud.prototype = {
    _onTagClicked: function(event)
    {
        var tag = $(event.target).text();
        this.emit(Flash.TagCloud.Events.TagClicked, {
            tag: tag,
            element: this._tagsToElement[tag]
        });
    },

    addTag: function(tag)
    {
        if (this._tagsToElement[tag])
            return;
        var tagElement = $("<div>").addClass("tag").text(tag);
        tagElement.hammer().on("tap", this._onTagClicked.bind(this));
        this.element.append(tagElement);
        this._tagsToElement[tag] = tagElement;
    },

    removeTag: function(tag)
    {
        if (!this._tagsToElement[tag])
            return;
        this._tagsToElement[tag].remove();
        delete this._tagsToElement[tag];
    },

    tags: function()
    {
        return Object.keys(this._tagsToElement);
    },
}

}(Flash));
