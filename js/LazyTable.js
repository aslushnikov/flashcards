(function(Flash) {

Flash.LazyTable = function(dictionaryElement)
{
    var dictionary = $(dictionaryElement);
    this._containerElement = dictionary.find(".dictionary-container");
    this._loadMore = dictionary.find(".load-next");
    this._loadMore.hide();
    this._loadMore.hammer().on("tap", this._onLoadMore.bind(this));
    $(document).scroll(this._onScroll.bind(this));
}

Flash.LazyTable.DOMElementsPerFirstChunk = 25;
Flash.LazyTable.DOMElementsPerChunk = 1000;

Flash.LazyTable.prototype = {
    _isScrolledIntoView: function(elem)
    {
        var docViewTop = $(document).scrollTop();
        var docViewBottom = docViewTop + $(document).height();

        var elemTop = $(elem).offset().top;
        var elemBottom = elemTop + $(elem).height();

        return docViewTop <= elemTop && elemTop <= docViewBottom;
    },

    _onScroll: function()
    {
        if (this._loadMore.is(":visible") && this._isScrolledIntoView(this._loadMore))
            this._flushNext();
    },

    _onLoadMore: function(event)
    {
        event.gesture.stopPropagation();
        event.gesture.preventDefault();
        this._flushNext();
    },

    _flushNext: function()
    {
        if (!this._fragments.length)
            return false;
        this._containerElement.append(this._fragments.shift());
        if (!this._fragments.length) {
            this._loadMore.hide();
            return false;
        }
        this._loadMore.show();
        return true;
    },

    _appendAndRecreateIfNeeded: function(fragment, child)
    {
        fragment.appendChild(child);
        if (fragment.childNodes.length < this._chunkSize)
            return fragment;
        this._fragments.push(fragment);
        this._chunkSize = Flash.LazyTable.DOMElementsPerChunk;
        return document.createDocumentFragment();
    },

    render: function(sections, wordsPerSection, rowRenderer, sectionHeaderRenderer)
    {
        this._containerElement.empty();
        this._fragments = [];
        var fragment = document.createDocumentFragment();
        this._chunkSize = Flash.LazyTable.DOMElementsPerFirstChunk;
        for (var i = 0; i < sections.length; ++i) {
            var section = sections[i];
            var words = wordsPerSection[section];
            var sectionElement = sectionHeaderRenderer ? sectionHeaderRenderer(section) : null;
            if (sectionElement)
                fragment = this._appendAndRecreateIfNeeded(fragment, sectionElement);
            for (var j = 0; j < words.length; ++j) {
                var rowElement = rowRenderer(words[j]);
                rowElement.__data = words[j];
                fragment = this._appendAndRecreateIfNeeded(fragment, rowElement);
            }
        }
        if (fragment.childNodes.length > 0)
            this._fragments.push(fragment);

        if (!this._fragments.length) {
            this._loadMore.hide();
            return;
        }
        this._flushNext();
    },

    scrollTo: function(rowData)
    {
        var children = this._containerElement.children();
        for (var i = 0; i < children.length; ++i) {
            var entry = children[i];
            if (entry.__data === rowData) {
                entry.scrollIntoViewIfNeeded(true);
                return;
            }
        }
    },

    flush: function()
    {
        while (this._flushNext());
    }
};
}(Flash));
