// START WRAPPER: The YUI.add wrapper is added by the build system, when you use YUI Builder
//                to build your component from the raw source in this file
// YUI.add("lha-documents", function(Y) {


    
    //======================================================================================
    // DocumentGroup UTILITY METHODS
    //======================================================================================
    
function getFirstAuthor(document) {
    var author = null, authors = document.get("authors");
    if (authors.length > 0) {
        author = authors[0];
    }

    return author;
}
       
/**
 * Grouping function, returns the first author's name in the format
 * <tt>last, first</tt>.
 */
function groupByAuthor(document) {
    if (!(document instanceof Document)) {
        throw new Error("Invalid object. Expected a document");
    }

    var author = getFirstAuthor(document);
    return Author.formatName(author);
}
    
function groupByPublicationDate(document) {
    	
}
    
/**
 * A function that compares its two documents for order. Returns a 
 * negative integer, zero, or a positive integer as the first document 
 * is less than, equal to, or greater than the second.
 * 
 * <p>The implementor must ensure that <tt>sgn(compare(x, y)) == 
 * -sgn(compare(y, x))</tt> for all <tt>x</tt> and <tt>y</tt>. (This 
 * implies that <tt>compare(x, y)</tt> must throw an exception if and only if <tt>compare(y, x)</tt> throws an exception.)
 * 
 * <p>The implementor must also ensure that the relation is transitive: 
 * <tt>((compare(x, y) > 0) && (compare(y, z)>0))</tt> implies <tt>compare(x, z) > 0</tt>.
 * 
 * <p>Finally, the implementer must ensure that <tt>compare(x, y) == 0</tt> implies that 
 * <tt>sgn(compare(x, z)) == sgn(compare(y, z))</tt> for all <tt>z</tt>.
 * 
 * TODO determine appropriate behavior relative to 'equality'.
 * 
 * <p>It is generally the case, but not strictly required that 
 * <tt>(compare(x, y)==0) == (x.equals(y))</tt>. Generally speaking, any comparator that 
 * violates this condition should clearly indicate this fact. The recommended language is 
 * "Note: this comparator imposes orderings that are inconsistent with equals."
 */
function sortByDate(doc1, doc2) {
    if (!(doc1 instanceof Document))
        throw new Error("Invalid object. Expected a document");
    if (!(doc2 instanceof Document))
        throw new Error("Invalid object. Expected a document");

    var date1 = doc1.get("pubDate"),
        date2 = doc2.get("pubDate");

    result = 0;
    if (date1 == null || date2 == null) {
        if ((date1 == null) && (date2 == null)) return 0;
        else if (date1 == null) 			    return -1;
        else 									return 1;
    }

    if (date1 < date2) 		return -1;
    else if (date1 > date2) return 1;
    else 				    return 0;
}
    
//======================================================================================
// DocumentGroup Class
//======================================================================================
    
function DocumentGroup(config) {
    DocumentGroup.superclass.constructor.apply(this, arguments);
    // TODO allow duplicates or not
}
    
/* Required NAME static field */
DocumentGroup.NAME = "documentGroup";

/* The attribute configuration for the component. */
DocumentGroup.ATTRS = {
    ref : {
        value : "unknown"
    },

    sortBy : {
        value : sortByDate
    },

    size : {
        value : 0,
        readOnly : true
    },

    documents : {
        value : [],
        readOnly : true
    },

    docMap : {
        value : { },
        readOnly : true
    }
};
    
/* DocumentSet extends the Base class */
Y.extend(DocumentGroup, Y.Base, {


    /**
     * 
     */
    initializer: function() {
                     // TODO bind sort listener to the sortBy attribute
                     // TODO implement list interface
    },

    /**
     * 
     */
    destructor : function() {

    },

    /**
     * 
     */
    _increment : function() {
        this._set("size", this.get("size") + 1);
    },

    /**
     * 
     */
    _decrement : function() {
        var sz = this.get("size"); 
        if (sz < 1) {
             var msg = "Constraint failed. Size is less than zero."; 
             Y.log(msg, "error", DocumentGroup.NAME);
             throw new Error(msg);
        }

        this._set("size", sz - 1);
    },

    /**
     * 
     * @param id
     */
    getDocument : function(id) {
        this.get("docMap")[id];
    },

    /**
     * 
     * @param id
     * @param doc
     */
    _mapDocument : function(id, doc) {
        this._set("docMap")[id] = doc;
    },

    /**
     * 
     * @param document
     * @returns {___anonymous16441_18867}
     */
    add : function(document) {
        if (!(document instanceof Document)) {
            throw new Error("Invalid object. Expected a document");
        }

        if (this.contains(document)) {
            return this;
        }

        var comparator = this.get("sortBy"),
            documents = this.get("documents");

        if (comparator === null) {
             documents.push(document);
        } else {
            // perform sorted insertion 
            // (we'll assume that we have modestly sized groups) 
            var i = documents.length;
            while (i--) {
                if (comparator(document, documents[i]) > 0) {
                    break;
                }
            }

            documents.splice(i + 1, 0, document);
        }

        this._mapDocument(document.get("id"), document);
        this._set("documents", documents);
        this._increment();
        return this;
    },

    /**
     * 
     * @param document
     * @returns {___anonymous16441_18753}
     */
    remove : function(document) {
        if (!this.contains(document)) {
            return this;
        }

        var documents = this.get("documents"),
            id = document.get("id"),
            i = group.docs.length;

        while (i--) {
            if (group.docs[i].get("id") === id) {
                documents.splice(i, 1);
            }
        }

        this._mapDocument(id, null);
        return this;
    },

    contains : function(document) {
        var doc = this.getDocument[document.get("id")];
        return Lang.isValue(doc);
    }
});
    
//======================================================================================
// DocumentSet Class
//======================================================================================

/* DocumentSet class constructor */
function DocumentSet(config) {
    DocumentSet.superclass.constructor.apply(this, arguments);
}

/* Required NAME static field */
DocumentSet.NAME = "documentSet";

/* The attribute configuration for the component. */
DocumentSet.ATTRS = {

    size : {
        value : 0,
        readOnly : true
    },

    sortBy : {
        value : sortByDate
    },

    groupBy : { 
        value : groupByAuthor
    },

    groups : {
        value : {}
    },

    documents : {
        value : {}
    }
};
    
/* DocumentSet extends the Base class */
Y.extend(DocumentSet, Y.Base, {

    initializer: function() { },

    destructor : function() { },

    _increment : function() {
        this._set("size", this.get("size") + 1);
    },

    _decrement : function() {
        var sz = this.get("size"); 
        if (sz < 1) {
            var msg = "Constraint failed. Size is less than zero."; 
            Y.log(msg, "error", DocumentGroup.NAME);
            throw new Error(msg);
        }

        this._set("size", sz - 1);
    },

    _getOrCreateGroup : function(key) {
        var group = this.get("groups." + key);

        if (!(group instanceof DocumentGroup)) { 
            group = new DocumentGroup(
                    { ref : key, sortBy : this.get("sortBy") });

            // SETTER BUG WORKAROUND
            //        		this.set("groups." + key, group);
            var groups = this.get("groups");
            groups[key] = group;
            this.set("groups", groups);
        }

        return group;
    },

    _groupAndSortDocument : function(document) {
        // TODO support multiple group memberships
    },

    getDocument : function(id) {
        return this.get("documents." + id);
    },

    add : function(document) {
        if (!(document instanceof Document)) { 
            throw new Error("Invalid object. Expected a document");
        }

        if (this.contains(document)) {
            return this;
        }

        var grouper = this.get("groupBy"),
            keys = grouper ? grouper(document) : "flat", 
            group = null,
            id = document.get('id');

        if (Lang.isArray(keys)) {
            for(var ix in keys) {
                group = this._getOrCreateGroup(keys[ix]).add(document);
            } 
         } else {
             this._getOrCreateGroup(keys).add(document);
         }

         // WORKAROUND
         // The following seems like it should work, but this quickly gums 
         // up the works. Looks like there may be a bug in YUI here where 
         // this ultimately ends up taking time proportional to the size 
         // of the array. 
         // this.set("documents." + id, document);

         var docs = this.get("documents");
         docs[id] = document;
         this.set("documents", document);

         this._increment();
         return this;
    },

    remove : function(document) { },

    contains : function(document) {
        var doc = this.get("documents." + document.get("id"));
        return (Lang.isValue(doc));
    },

    setGroupingFunction : function(grouper) { },

    setComparator : function(comparator) { }
// TODO build query functions into the document?

});

Y.namespace("lha.collection").DocumentSet = DocumentSet;

// }, "3.3.0", {requires:["base"]});
// END WRAPPER
