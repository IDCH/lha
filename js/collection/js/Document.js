/**
 * File: Document.js
 * Creator: Neal Audenaert <neal@idch.org>
 * Created: 20 March 2012
 * Description:
 *
 *
 * 
 */

// START WRAPPER: The YUI.add wrapper is added by the build system, when you use YUI Builder
//                to build your component from the raw source in this file
// YUI.add("lha-documents", function(Y) {
    
/* Document class constructor */
function Document(config) {
    Document.superclass.constructor.apply(this, arguments);
}

/* Required NAME static field */
Document.NAME = "document";

/* Attribute configuration. */
Document.ATTRS = {

    id : {
       value : null,
       writeOnce : 'initOnly',
       validator : function(value) {
           return Lang.isNumber(value);
       }
    },

    authors : {
        value : [],

        setter : function(authors) {
            // TODO probably ought to do this only once in the init method and then 
            //      make this read only (i.e. restrict access to internal getters/setters.

            if (!Lang.isArray(authors)) {
                authors = [authors];
            } 

            function loadAuthor(authId, ix) {
                // TODO need to keep track to see when this gets loaded.
                this._repo.getAuthor(authId, function(author, msg) {
                    if ((author) && (authors[ix] === authId)) {
                        authors[ix] = authId;
                    } else {
                        // XXX NOW WHAT?
                    }
                });

            }

            var i, auth;
            for (i = 0; i < authors.length; i++) {
                auth = authors[i]; 
                if (!(auth instanceof Author)) {
                    if (Lang.isNumber(auth)) {
                        // load by ID - possibly asynchronous
                        loadAuthor(auth, i);
                    } else {
                        // should be instantiating the author from the supplied data
                        authors[i] = this._repo.getAuthor(auth);
                    } 

                }
            }
        }
    },

    title : {
        value : null,
        validator : Lang.isString
    },

    subtitle : {
        value : null,
        validator : Lang.isString
    },

    pubDate: {
        value : null,
        validator : function(value) {
            // Some basic sanity checks. This may need to change if we want to include
            // older material. Naturally, at some point, we might use real dates.
            return Lang.isNumber(value) && 
                  (value > 1000) && 
                  (value < 2100);
        }
    },

    volume : {
        value : null,
        validator : Lang.isString
    },

    edition : {
        value : null,
        validator : Lang.isNumber
    },

    publisher : {
        value : null,
        validator : Lang.isString
    },

    location : {
        value : null,
        validator : Lang.isString
    },

    repo : {
        value : null,
        validator : function() {}
    }
};
    
/* Document extends the Base class */
Y.extend(Document, Y.Base, {

    initializer: function() {

    },

    destructor : function() {

    },

    /**
     * Adds an author to the specified position in the array. If the index to insert
     * the author is omitted, the author will be appended to the list of authors.
     *  
     * @param author { Number | String } The author to add specified as an author ID or
     *     as an object literal (or JSON equivalent).
     * @param ix { Number } The index at which to insert the author. If not supplied 
     *     (or out of bounds), the author will be added to the end of the list.
     */
    addAuthor : function(auth, ix) {
        this.get("repo").getAuthor(auth, function(author, errmsg) {
            if (author) {
                var authors = this.get("authors");
                if (Lang.isNumber(ix) && ix >= 0 && ix < authors.length) {
                    authors.splice(ix, 0, author);
                } else {
                    authors.push(author);
                    this._set("authors", authors);
                }
            } else {
                Y.Log("Could not add author: " + errmsg, "warn", Document.NAME);
            }
        });
    },

    /**
     * Returns the index of the supplied author or -1 if the author is not present.
     * 
     * @param author The author whose index should be returned. If this value is a number, 
     *     it will search based on author id.
     */
    getAuthorIndex : function(author) {
        var ix = -1, authors = this.get("authors"), i, found;

        for (i = 0; i < authors.length; i++) {
            found = (Lang.isNumber(author)) ?
                        (authors[i].get("id") == author) : 
                        author.equals(authors[i]);

            if (found) {
                ix = i;
                break;
            }
        }

        return ix;
    },

    /**
     * Removes the specified author from the list (if present).
     *  
     * @param author The reified author object or else the index of the author to remove.
     *     If no value is supplied, this removes the last author in the list.
     * @return The removed author or <tt>null</tt> if no author was removed from the list. 
     */
    removeAuthor : function(author) {
        var result = null, authors, ix;

        authors = this.get("authors");
        ix = (!Lang.isValue(author)) ? authors.length - 1 : this.indexOfAuthor(author);

        if (ix >= 0 && ix < authors.length()) {
            result = authors.splice(ix, 1);
        }


        this._set("authors", authors);
        return result;
    },

    /** 
     * Returns a string-based representation of this document.  
     */
    toString : function() {
        return this.get("title") + 
               ((this.get("id") !== null) ? " (id=" + this.get("id") + ")" : "");
    }
});

Y.namespace("lha.collection").Document = Document;
    
    // TODO build query functions into the document?
    // TODO Make documents persistent
    
// }, "3.3.0", {requires:["base"]});
// END WRAPPER
