// START WRAPPER: The YUI.add wrapper is added by the build system, when you use YUI Builder
//                to build your component from the raw source in this file
//YUI.add("lha-repo", function(Y) {
	// TODO design and implement a strategy for attaching a repository to an object.

    /* Any frequently used shortcuts, strings and constants 
     * THESE SHOULD GET MERGED ON THE BUILD
    var Lang = Y.Lang,
    	Author = Y.lha.collection.Author,
    	Document = Y.lha.collection..Document,
    	DocumentSet = Y.lha.collection..DocumentSet;

     * */

/**
 * Wraps a supplied callback method in error handling code in order to 
 * prevent client implemented code from breaking things.
 * 
 * @param cb { Function } Client supplied callback. If no function is 
 *      supplied (or the supplied object is not a function, this will 
 *      generate a dummy method. 
 */
function __wrapCallback(cb) {
    return function () {
        if (!Lang.isFunction(cb))
            return;

        try {
            return cb.apply(cb, arguments);
        } catch (ex) {
            Y.log("Error in supplied callback method: " + ex, "error", this.__LOG);
        }
    };
}
    
/* LHARepository class constructor */
function LHARepository(config) {
   LHARepository.superclass.constructor.apply(this, arguments);
}

/* Required NAME static field */
LHARepository.NAME = "lhaRepository";

/* The attribute configuration for the component. */
LHARepository.ATTRS = {
    // FIXME this is a mess

    baseUri : {   value : 'http://localhost:8080/LHA/data',
                  writeOnce : 'initOnly' },

    // TODO figure out how to specify a base value
    resources : { value : {     baseUri : 'http://localhost:8080/LHA/data',

        authors : "http://localhost:8080/LHA/data/authors/{id}",
        categories : "http://localhost:8080/LHA/data/categories/{id}",
        documents : "http://localhost:8080/LHA/data/documents/{id}",

        findDocsByAuthorId : "http://localhost:8080/LHA/data/documents?authorId={id}",
        findDocsByAuthor   : "http://localhost:8080/LHA/data/documents?by={prefix}"
    }
    },

    cache : {  value : { },
                readOnly : true
            }
};
    
    
    
    /* LHARepository extends the Base class */
    Y.extend(LHARepository, Y.Base, {
    	_authors   : null,
    	_documents : null,
    	
    	__LOG : LHARepository.NAME,

        initializer: function() {
        	this._authors = new Y.Cache({max : 100});
        	this._documents = new  Y.Cache({max : 100});
        	
        	// add event listeners to monitor cache effectiveness
        },

        destructor : function() {
            // flush caches
        	this.flushCaches();
        	
        	// terminate any pending requests
        },
        
        flushCaches : function() {
        	this._authors.flush();
        	this._documents.flush();
        },
        
        //====================================================================================
        // UTILITY METHODS
        //====================================================================================
        
        /**
         * Looks up an object from one of the object caches used by this 
         * repository.
         *  
         * @method _lookupInCache
         * @private
         * @param cache { YUI3.Cache } The cache from which to retrieve the object.
         * @param key { Object } The key value that identifies the object 
         *      to retrieve
         * @returns { Object } The cached object or <tt>null</tt> if no object 
         *      was registered under the specified key.
         */
        _lookupInCache : function(cache, key) {
        	if (!(cache instanceof Y.Cache)) {
        		throw new Error("Internal Error: Invalid cache supplied.");
        	}
        	
        	var obj = cache.retrieve(key);
        	if (obj) {
        		Y.log("Cache hit");
        	} else Y.log("Cache miss"); 
        	return (obj) ? obj.response : null;
        	
        	// TODO modify to use a single cache with a string valued prefix. Compute actual
        	//		cache keys as <tt>prefix + ":" + key</tt>.
        },
        
        /**
         * Adds an object to the specified cache.
         * 
         * @_cacheObjectInstance
         * @private
         * @param cache { YUI3.Cache } The cache in which to store the object.
         * @param key { Object } The key value that identifies the object to be cache
         * @param obj { Object } The object to cache
         * @param cls { Class } (Optional) The class of the object to be cached to be used 
         * 		for type checking. If provided, this method will generate an error if the 
         * 		supplied object is not of the indicated type. 
         */
        _cacheObjectInstance : function(cache, key, obj, cls) {
        	if (!(cache instanceof Y.Cache)) {
        		throw new Error("Internal Error: Invalid cache supplied.");
        	}
        	
        	if (cls && !(obj instanceof cls)) {
        		var msg = "Internal Error: Attempted to cache invalid object.";
        		if (cls.NAME)
        			msg += " Expected " + cls.NAME;
        		throw new Error(msg);
        	}
        	
        	cache.add(key, obj);
        },
        
        //====================================================================================
        // AUTHOR MANIPULATION METHODS
        //====================================================================================
    

        /** 
         * Converts a JSON representation (or object literal) of an <tt>Author</tt> to 
         * an instantiated object.
         * 
         * @method _instantiateAuthor
         * @private
         * @param obj { String | Object } An object literal or JSON representation of the 
         * 		author.
         * @return { lha.Author } The instantiated author
         * @throws { Error } If the supplied object was not a valid representation of an 
         * 		author 
         */
        _instantiateAuthor : function(obj) {
        	if (obj instanceof Author) 
        		return obj;
        	
    		if (Lang.isString(obj)) 
    			obj = Y.JSON.parse(obj);
    		
    		var author = (obj.id) ? this._lookupInCache(this._authors, obj.id) : null;
    		if (!author) {
    			author = new Author(obj);
    			this._cacheObjectInstance(this._authors, author.get("id"), author, Author);
    		}
    		
    		if (author.get("repo") !== this)
    			author.set("repo", this);
    		return author;
        },
        
        /**
         * Called by <tt>getAuthor()</tt> iff we need to execute a request 
         * against the server.
         * 
         * @param id { Number } The id of the author to retrieve
         * @param callback { Function } A callback function to be invoked with 
         *      the response.
         * @throw { Error } If the server response doesn't make sense.
         */
        _execAuthorIORequest : function(id, callback) {
        	var SUCCESS_MSG = "Retrieved Author ({id}): {name}",
	    	    FAILURE_MSG = "Could not retrieve Author ({id}): {status}";
        
            var uri = Y.substitute(this.get("resources.authors"), {id : id});
            Y.log("Executing author request: " + uri, 'debug', this.__LOG);
            Y.io(uri, { 
	            on : {
	        		/* Handle success response. */
	    			success :  Y.bind(function (transactionId, o, args) {
	    				var author = this._instantiateAuthor(o.responseText);
	    				callback(author);
	    				
	    				Y.log(Y.substitute(SUCCESS_MSG, 
	    						{ id   : id, 
	    					      name : author.get('last') + ', ' + author.get('first')
	    					    }), 'info', this.__LOG);
		            }, this),
		            
		            /* Handle failure response. */
		            failure :  Y.bind(function(transactionId, o, args) {
		            	var msg = Y.substitute(FAILURE_MSG, { id : id, status : o.status});
	
		            	Y.log(msg, 'warn', this.__LOG);
		            	callback(false, msg);
		            }, this)
	        	} });
        },
        
        /**
         * Retrieves the indicated author from the server (using a local cache, 
         * if available) or instantiates it from supplied JSON data. 
         * 
         * @method getAuthor
         * @public
         * @param who { Number | Object } The id of the <tt>Author</tt> to 
         *      lookup from the server or else an object literal (or unparsed 
         *      JSON string) to instantiate.  
         * @param callback { Function } A callback function. On success, this 
         *      method will be called with a single parameter, the retrieved 
         *      <tt>Author</tt>. On failure, this will be called with two 
         *      parameters: the first the boolean value <tt>false</tt>, the 
         *      second an error message detailing what went wrong. 
         * @param force { boolean } If <tt>true</tt> forces retrieval of the 
         *      identified author from the server even if the author object 
         *      has been cached or a JSON object is provided. <tt>false</tt> 
         *      by default.
         * @return The <tt>Author</tt> if a JSON object is supplied or if the 
         *      identified <tt>Author</tt> is present in an internal cache. 
         *      Otherwise, <tt>null</tt>.
         */
        getAuthor : function(who, callback, force) {
        	var msg, id, author = null;
        	
        	callback = __wrapCallback(callback);	// wrap callback function
        	if (force !== true)						// set default value for force
        		force = false;
        	
        	// sanity check
        	if (!(Lang.isString(who) || Lang.isObject(who) || Lang.isNumber(who))) {
        		msg = "Invalid author (" + who + "): Expected an author id, " +
    				"object literal or JSON string.";
        		callback(false, msg);
        		throw new Error(msg);
        	}
        	
        	// retrieve author by ID
    		if (Lang.isNumber(who)) {
        		id = who;
        		if (!force)
        			author = this._lookupInCache(this._authors, id);
        		
        	// instantiate author from data object
    		} else { 
        		author = this._instantiateAuthor(who);
        		if (!author || !(author instanceof Author)) 
        			throw new Error("Internal Error: Failed to instantiate author.");
        		
        		id = author.get("id");
            }

            if (author && !force) {
            	callback(author);
            } else {
            	this._execAuthorIORequest(id, callback);
            }
            
        	return author;
        },
        
        //====================================================================================
        // DOCUMENT MANIPULATION METHODS
        //====================================================================================
        
        /** 
         * Converts a JSON representation (or object literal) of an <tt>Document</tt> to 
         * an instantiated object.
         * 
         * @method _instantiateDocument
         * @private
         * @param obj { String | Object } An object literal or JSON representation of the 
         * 		document.
         * @return { lha.Document } The instantiated document
         * @throws { Error } If the supplied object was not a valid representation of a 
         * 		document
         */
        _instantiateDocument : function(obj) {
        	if (obj instanceof Document) 
        		return obj;
        	
    		if (Lang.isString(obj)) 
    			obj = Y.JSON.parse(obj);
    		
    		var document = (obj.id) ? this._lookupInCache(this._documents, obj.id) : null;
    		if (!document) {
    			// prepare authors
    			if (obj.authors) {
    				var authors = obj.authors, i = authors.length;
    				while (i--) {
    					authors[i] = this._instantiateAuthor(authors[i]);
    				}
    			}
    			
    			document = new Document(obj);
    			document._repo = this;
    			this._cacheObjectInstance(this._documents, document.get("id"), document, Document);
    		}
    		
    		return document;
        },
        
        /**
         * Executes an AJAX IO request to retrieve the indicated document. 
         * 
         * @_execDocumentIORequest
         * @private
         * @param id { Number } The id of the document to retrieve
         * @param callback { function } The (wrapped) callback function. 
         */
        _execDocumentIORequest : function(id, callback) {
        	var SUCCESS_MSG = "Retrieved Document ({id}): {title}",
	    	    FAILURE_MSG = "Could not retrieve Document ({id}): {status}";
	    
	        var uri = Y.substitute(this.get("resources.documents"), {id : id});
	        Y.log("Executing document request: " + uri, 'debug', this.__LOG);
	        Y.io(uri, { 
	            on : {
	        		/* Handle success response. */
	    			success : Y.bind(function (transactionId, o, args) {
	    				var document = this._instantiateDocument(o.responseText);
	    				callback(document);
	    				
	    				Y.log(Y.substitute(SUCCESS_MSG, { id : id, title : document.get('title')}), 
	    						'info', this.__LOG);
		            }, this),
		            
		            /* Handle failure response. */
		            failure : Y.bind(function(transactionId, o, args) {
		            	var msg = Y.substitute(FAILURE_MSG, { id : id, status : o.status});
	
		            	Y.log(msg, 'warn', this.__LOG);
		            	callback(false, msg);
		            }, this)
	        	} });
        },
        
        /**
         * Retrieves the identified document.
         * 
         * @method getDocument
         * @public
         * @param id { Number } The id of the document to retrieve.
         * @param callback { function } A callback function. If the call is successful, the 
         * 		document will be passed as the first parameter to this object. Otherwise, 
         *      <tt>false</tt> will be passed as the first parameter and an error mesasage 
         *      as the second parameter. 
         * @param force { boolean } If <tt>true</tt> forces retrieval of the identified 
         * 		document from the server even if it can be found in the local cache.
         * 		<tt>false</tt> by default.
         * @return { Document } The identified document if it is present in an internal cache. 
         * 		Otherwise, <tt>null</tt>.
         */
        getDocument : function(id, callback, force) {
        	callback = __wrapCallback(callback);	// wrap callback function
        	if (force !== true)						// set default value for force
        		force = false;
        	
        	// sanity check
        	if (!Lang.isNumber(id)) {
        		var msg = "Invalid request to retrieve a document. Expected a numeric id, " +
        				"but found: " + id;
        		callback(false, msg);
        		throw new Error(msg);
        	}
        	
        	var document = null;
        	if (!force) 
        		document = this._lookupInCache(this._documents, id);
        	
        	
            if (document) callback(document);
            else 		 this._execDocumentIORequest(id, callback);
            
        	return document;
        },
        
        /**
         * Retrieves all documents associated with the identified author or authors. If a 
         * numerical id is supplied, documents will be retrieved for the identified author. If 
         * a string valued id is supplied, documents will be looked up for all authors whose
         * last name begins with the supplied prefix. 
         * 
         * @method getDocumentsByAuthor
         * @public
         * @param q The id of the author to be queried for or else the string formatted
         * 		author prefix. 
         * @param callback A callback function. If the call is successful, the document will
         * 		be passed as the first parameter to this object. Otherwise, <tt>false</tt> 
         * 		will be passed. 
         */
        getDocumentsByAuthor : function(q, callback) {
        	// TODO cache responses
        	// TODO more robust error handling
        	
        	var uri, cb = __wrapCallback(callback);

        	if (q instanceof Author) {
        		uri = Y.substitute(this.get("resources.findDocsByAuthorId"), {id : q.get("id")});
        	} else if (Lang.isNumber(q)) {
        		uri = Y.substitute(this.get("resources.findDocsByAuthorId"), {id : q});
        	} else {
        		uri = Y.substitute(this.get("resources.findDocsByAuthor"), {prefix : q});
        	}
            
            // Define a function to handle the response data.
        	function onSuccess(transactionId, o, args) {
            	var resp   = Y.JSON.parse(o.responseText),
            		docs   = resp.documents,
            		result = [], doc;
            	
            	for (var d in docs) {
            		doc = this._instantiateDocument(docs[d]);
            		result.push(doc);
            	}
            	
            	cb(result);
            }
            
            function onFailure(transactionId, o, args) {
            	Y.log("Could not retrieve documents for author (" + q + "): " + o.status, 'warn', this.__LOG); 
            }
         
            var request = Y.io(uri, {
            			on : {
            				success : Y.bind(onSuccess, this),
            				failure : Y.bind(onFailure, this)
            			}
            		});
        }

    });

    Y.namespace("lha").LHARepository = LHARepository;

}, "3.3.0", {requires:["base", "io-base", "json", "cache", "lha-documents"]});
// END WRAPPER
