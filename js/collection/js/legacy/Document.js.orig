// START WRAPPER: The YUI.add wrapper is added by the build system, when you use YUI Builder
//                to build your component from the raw source in this file
// YUI.add("lha-documents", function(Y) {

	// TODO break into individual classes and incorporate build tools to aggregate
	
//=============================================================================================
// AUTHOR CLASS IMPLEMENTATION
//=============================================================================================
	
	/* Any frequently used shortcuts, strings and constants */
    var Lang = Y.Lang;

    function stringToCfg(config) {
    	if (!Lang.isString(config))
    		return config;
    	
    	// TODO else parse name string (e.g. "Audenaert, Neal" or "Michael Neal Audenaert")  
    	// and return a configuration object
    	return config;  // for now, we'll just pass it on through.
    }
    
    /* Author class constructor */
    function Author(config) {
        Author.superclass.constructor.apply(this, arguments);
    }

    /* 
     * Required NAME static field
     */
    Author.NAME = "author";

    /*
     * The attribute configuration for the component. This defines the core user facing 
     * state of the component
     */
    Author.ATTRS = {
    	id : {
    		value : null,
    		writeOnce : 'initOnly'
    	},
    	
    	first : {
    		value : null,
    		validator : Lang.isString
    	},
    	
    	middle : {
    		value : null,
    		validator : Lang.isString
    	},
    	
    	last : {
    		value : null,
    		validator : Lang.isString
    	},
    	
    	name : {
    		value : null,
    		validator : Lang.isString
    	}
    };
    
    /* Author extends the Base class */
    Y.extend(Author, Y.Base, {

        initializer: function() {
        },

        destructor : function() {
            
        },
        
        // TODO build query functions into the author?
        
        /**
         * Provides a weak test of the identity of two authors. To understand this method
         * it is important to first recognize that two distinct people may share the same name. 
         * To distinguish authors in these cases, this method first checks the supplied
         * identifier values. Assuming that both author's came from the same server-side 
         * repository these id values should distinguish between distinct people. If either 
         * this object or the supplied author do not have a value set for their <tt>id</tt> 
         * attribute, this will test for equality of the author's names (first, middle and 
         * last). This is important to handle situations where an author is not currently 
         * associated with a server-side reposititory.
         * 
         * @param author The author to check.
         */
        equals : function(author) {
        	var result = false;
        	if (!(author instanceof Author)) { 
	        	if ((author.get("id") != null) && (this.get("id") != null))
	        		result = author.get("id") == this.get("id");
	        	else {
	        		result = author.get("first") === this.get("first") 
		        		  && author.get("last") === this.get("last")
		        		  && author.get("middle") == this.get("middle");
	        	}
        	}
        	
        	return result;
        }

    });

    /** 
     * Converts a variety of supplied values into Author objects. This includes JSON 
     * formatted strings, object literals and author identifiers.
     */
    Author.reify = function(obj, callback) {
    	if (obj instanceof Author) 
    		return obj;
    	
		if (Lang.isString(author)) {
			try {
				obj = Y.JSON.parse(obj);
			} catch (ex) {
				var msg = "Did not recognize author JSON: " + obj;
				Y.log(msg, "error", Author.NAME);
				throw new Error(msg); 
			}
		}
		
		var author;
		if (obj.id && Author.cache[obj.id]) {
			author = Author.cache[obj.id];
		} else { 
			author = new Author(author);
			Author.cache[author.get("id")] = author;
		}
		
		return author;
    };
    
    Y.namespace("lha").Author = Author;

    
//=============================================================================================
// CATEGORY CLASS IMPLEMENTATION
//=============================================================================================
    // TODO IMPLEMENT ME
	// This is currently a thin stub class for representing hierarchical categories. 
    
    /* Category class constructor */
    function Category(config) {
        Category.superclass.constructor.apply(this, arguments);
    }

    /* 
     * Required NAME static field
     */
    Category.NAME = "category";

    /*
     * The attribute configuration for the component. This defines the core user facing 
     * state of the component
     */
    Category.ATTRS = {
    		
    	id : {
    		value : null,
    		writeOnce : 'initOnly',
    		validator : Lang.isNumber
    	},
    	
    	name : {
    		value : null,
    		validator : Lang.isString
    	},
    	
    	description : {
    		value : null,
    		validator : Lang.isString
    	},
    	
    	parent : {
    		value : null,
    		validator : function(value) {
    		}
    	},
    	    	
    	children : {
    		value : null,
    		writeOnce : 'initOnly',
    		validator : Lang.isArray,
    		
    		setter : function(value) {
    		},
    		
    		getter : function(value, name) {
    			
    		}
    	}
    	
    };
    
    /* Category extends the Base class */
    Y.extend(Category, Y.Base, {

        initializer: function() {

        },

        destructor : function() {
            
        }
        

    });

    Y.namespace("lha").Category = Category;
    
//=============================================================================================
// DOCUMENT CLASS IMPLEMENTATION
//=============================================================================================
	
    /* Document class constructor */
    function Document(config) {
        Document.superclass.constructor.apply(this, arguments);
    }

    /* 
     * Required NAME static field
     */
    Document.NAME = "document";

    /*
     * The attribute configuration for the component. This defines the core user facing 
     * state of the component
     */
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
    			//		make this read only (i.e. restrict access to internal getters/setters.
    			
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
    			
    			for (var i = 0; i < authors.length; i++) {
    				var auth = authors[i]; 
    				if (!(auth instanceof Author)) {
    					if (Lang.isNumber(auth))
    						// load by ID - possibly asynchronous
    						loadAuthor(auth, i);
    					else {
    						// should be instantiating the author from the supplied data
    						authors[i] = this_repo.getAuthor(auth);
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
    			return Lang.isNumber(value) && (value > 1000) && (value < 2100);
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
         * 		as an object literal (or JSON equivalent).
         * @param ix { Number } The index at which to insert the author. If not supplied 
         * 		(or out of bounds), the author will be added to the end of the list.
         */
        addAuthor : function(auth, ix) {
        	this.get("repo").getAuthor(author, function(author, errmsg) {
        		if (author) {
        			var authors = this.get("authors");
        			if (Lang.isNumber(ix) && ix >= 0 && ix < authors.length)
        				authors.splice(ix, 0, author);
        			else 
        				authors.push(author);
        			this._set("authors", authors);
        		} else {
        			Y.Log("Could not add author: " + errmsg, "warn", Document.NAME);
        		}
        		
        	});
        },
        
        /**
         * Returns the index of the supplied author or -1 if the author is not present.
         * 
         * @param author The author whose index should be returned. If this value is a number, 
         * 		it will search based on author id.
         */
        getAuthorIndex : function(author) {
        	var ix = -1, checkId = Lang.isNumber(author), found;
        	for (var i = 0; i < authors.length; i++) {
    			found = (checkId)  
    					    ? (authors[i].get("id") == author)  
    			         	: author.equals(authors[i]);
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
         * 		If no value is supplied, this removes the last author in the list.
         * @return The removed author or <tt>null</tt> if no author was removed from the list. 
         */
        removeAuthor : function(author) {
        	var result = null; 
        		authors = this.get("authors"),
        	    ix = (!Lang.isValue(author)) 
		        			? authors.length - 1					
		        		    : this.indexOfAuthor(author);					
        	
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
        			((this.get("id") != null) ? " (id=" + this.get("id") + ")" : "");
        }
    });

    Y.namespace("lha").Document = Document;
    
    // TODO build query functions into the document?
    // TODO Make documents persistent
    
    
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
    
    function formatAuthorName(author) {
    	var last = null, first = null,
			result = "unknown";
    	
		if (author != null) {
			last = author.get("last");
			first = author.get("first");
			
			result = (last != null) ? last : "";
			if (first != null) {
				result += (result.length > 0) ? ", " + first : first;
			}
		}
		
		return result;
    }
    
    /**
     * Grouping function, returns the first author's name in the format
     * <tt>last, first</tt>.
     */
    function groupByAuthor(document) {
    	if (!(document instanceof Document))
    		throw new Error("Invalid object. Expected a document");
    	
    	var author = getFirstAuthor(document);
    	return formatAuthorName(author);
    }
    
    function groupByPublicationDate(document) {
    	
    }
    
    /**
     * A function that compares its two documents for order. Returns a negative integer, zero, 
     * or a positive integer as the first document is less than, equal to, or greater than 
     * the second.
     * 
     * <p>The implementor must ensure that <tt>sgn(compare(x, y)) == -sgn(compare(y, x))</tt>
     * for all <tt>x</tt> and <tt>y</tt>. (This implies that <tt>compare(x, y)</tt> must throw 
     * an exception if and only if <tt>compare(y, x)</tt> throws an exception.)
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
    
    /* 
     * Required NAME static field
     */
    DocumentGroup.NAME = "documentGroup";

    /*
     * The attribute configuration for the component. This defines the core user facing 
     * state of the component
     */
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
        	if (!(document instanceof Document))
        		throw new Error("Invalid object. Expected a document");
        	
        	if (this.contains(document))
        		return this;
        	
        	var comparator = this.get("sortBy"),
        		documents = this.get("documents");

        	if (comparator == null) {
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
        	if (!this.contains(document))
        		return this;
        	
        	var documents = this.get("documents"),
        	    id = document.get("id");
        	
        	var i = group.docs.length;
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

    /* 
     * Required NAME static field
     */
    DocumentSet.NAME = "documentSet";

    /*
     * The attribute configuration for the component. This defines the core user facing 
     * state of the component
     */
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

        initializer: function() {

        },

        destructor : function() {
            
        },
        
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
        		group = new DocumentGroup({
        			ref : key,
        			sortBy : this.get("sortBy")
        		});
        		
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
        	if (!(document instanceof Document))
        		throw new Error("Invalid object. Expected a document");
        		
        	if (this.contains(document)) 
        		return this;
        	
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
        	// The following seems like it should work, but this quickly gums up the works.
	    	// Looks like there may be a bug in YUI here where this ultimately ends up taking
	    	// time proportional to the size of the array. 
	    	// this.set("documents." + id, document);
	    	
	    	var docs = this.get("documents");
	    	docs[id] = document;
	    	this.set("documents", document);
	    	
        	this._increment();
        	
        	return this;
        },
        
        remove : function(document) { 
        	
        },
        
        contains : function(document) {
        	var doc = this.get("documents." + document.get("id"));
        	return (Lang.isValue(doc));
        },
        
        setGroupingFunction : function(grouper) {
        	
        },
        
        setComparator : function(comparator) {
        	
        }
        // TODO build query functions into the document?

    });

    Y.namespace("lha").DocumentSet = DocumentSet;

}, "3.3.0", {requires:["base"]});
// END WRAPPER
