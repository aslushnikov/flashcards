(function(Flash) {

/**
 * @constructor
 * @param {!Element} parentElement
 */
Flash.Stub = function(parentElement) {
    this._dom = $("<div class='screen-stub'><div class='text'>...</div></div>");
    $(parentElement).append(this._dom);
}

Flash.Stub.prototype = {
    success: function()
    {
        this._dom.remove();
    },

    failure: function(text)
    {
        this._dom.find(".text").text(text);
        this._dom.addClass("failure");
        this._dom.hammer().on("tap", function() {
            this._remove();
        }.bind(this));
    },

    _remove: function()
    {
        this._dom.fadeOut("fast", function() {
            this._dom.remove();
        }.bind(this));
    },
}

}(Flash));
