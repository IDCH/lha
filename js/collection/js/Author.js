/**
 * File: Author.js
 * Creator: Neal Audenaert <neal@idch.org>
 * Created: 20 March 2012
 * Description:
 *
 *
 * 
 */

/* Any frequently used shortcuts, strings and constants */
var Lang = Y.Lang;
   

/**
 * Wraps a supplied callback method in error handling code in order to 
 * prevent client implemented code from breaking things.
 * 
 * @method wrapCallback
 * @static
 * @private
 * @param cb { Function } Client supplied callback. If no function is 
 *      supplied (or the supplied object is not a function, this will 
 *      generate a dummy method. 
 */
function wrapCallback(cb) {
    // TODO this needs to find its way to a happy place
    return function () {
        if (!Lang.isFunction(cb)) { 
            return;
        }

        try {
            return cb.apply(cb, arguments);
        } catch (ex) {
            Y.log("Error in supplied callback method: " + ex, "error");
        }
    };
}

//===========================================================================
// Author Class
//===========================================================================

/* Author class constructor */
function Author(config) {
    Author.superclass.constructor.apply(this, arguments);
}

Author.NAME = "author";

/**
 * Returns a formated string with the specified author's name.
 * TODO make this pluggable
 */
Author.formatName = function(author) {
    var last = null, first = null,
        result = "unknown";

    if (author !== null) {
        last = author.get("last");
        first = author.get("first");

        result = (last !== null) ? last : "";
        if (first !== null) {
            result += (result.length > 0) ? ", " + first : first;
        }
    }

    return result;
};

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
    },

    proxy : {
        value : null
    }
};
    
/* Author extends the Base class */
Y.extend(Author, Y.Base, {
    _LOG : Author.NAME,

    initializer: function() {
        if (this.get('proxy') === null) {
            this.set('proxy', Author.PROXY);
        }
    },

    destructor : function() {

    },

    restore : function(callback) {
        var proxy = this.get('proxy'),
            id = this.get('id'), 
    
            ERR_PROXY_NOT_SET = 
                "Could not restore author: no remote proxy",
            ERR_NO_IDENTIFIER = 
                "Could not restore author: author id not initialized";
            
        if (proxy === null) {
            Y.log(ERR_PROXY_NOT_SET, 'warn', this._LOG);
            throw new Error(ERR_PROXY_NOT_SET);
        } else if (id === null) {
            Y.log(ERR_NO_IDENTIFIER, 'warn', this._LOG);
            throw new Error(ERR_NO_IDENTIFIER);
        }

        Y.log(Y.substitute("Restoring author from server {id}...", { id : id }), 'debug', this._LOG);
        proxy.restore(this, 
            Y.bind(function(author, errmsg) {
                if (author) {
                    Y.log(Y.substitute("Restored author from server {id}.", { id : id }), 'debug', this._LOG);
                    // TODO FIRE CUSTOM EVENT
                } else {
                    // log failure
                }

                callback(author, errmsg);
            }, this)
        );
    },

    save : function() {
        throw new Error('Not Implemented');
    },

    create : function() {
        throw new Error('Not Implemented');
    },

    remove : function() {
        throw new Error('Not Implemented');
    },

    listDocuments : function() {
        throw new Error('Not Implemented');
    },

    /**
     * Provides a weak test of the identity of two authors. To understand 
     * this method it is important to first recognize that two distinct 
     * people may share the same name. To distinguish authors in these 
     * cases, this method first checks the supplied identifier values. 
     * Assuming that both author's came from the same server-side 
     * repository these id values should distinguish between distinct 
     * people. If either this object or the supplied author do not have a 
     * value set for their <tt>id</tt> attribute, this will test for 
     * equality of the author's names (first, middle and last). This is 
     * important to handle situations where an author is not currently 
     * associated with a server-side reposititory.
     * 
     * @method equals
     * @public
     * @param author { Author } The author to check.
     * @return { Boolean } <tt>true</tt> if the supplied author is the
     *      same as this author.
     */
    equals : function(author) {
        var result = false;
        if (!(author instanceof Author)) { 
            if ((author.get("id") !== null) && (this.get("id") !== null)) {
                result = author.get("id") == this.get("id");
            } else {
                result = author.get("first") === this.get("first") &&
                         author.get("last") === this.get("last") &&
                         author.get("middle") == this.get("middle");
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
    // FIXME this seems like a bad idea. Is anyone using it?
    var author, msg;
    if (obj instanceof Author) {
        return obj;
    }

    if (Lang.isString(author)) {
        try {
            obj = Y.JSON.parse(obj);
        } catch (ex) {
            msg = "Did not recognize author JSON: " + obj;
            Y.log(msg, "error", Author.NAME);
            throw new Error(msg); 
        }
    }

    if (obj.id && Author.cache[obj.id]) {
        author = Author.cache[obj.id];
    } else { 
        author = new Author(author);
        Author.cache[author.get("id")] = author;
    }

    return author;
};
    

//===========================================================================
// AuthorProxy Class
//===========================================================================

function AuthorProxy(config) {
    AuthorProxy.superclass.constructor.apply(this, arguments);
}

AuthorProxy.NAME = "author-proxy";

AuthorProxy.ATTRS = {
    apiEndpoint : {
        value : '/collection/',
        validator : Lang.isString   // TODO test that this is a valid endpoint
    }
};

Y.extend(AuthorProxy, Y.Base, {
    _LOG : AuthorProxy.NAME,
    _cache : null,

    initializer: function() {
    },

    destructor: function() {
    },

    getUri: function(id) {
        return this.get("apiEndpoint") + "/authors/" + id;
    },
     
    /**
     * Checks to determine if a supplied value is a potentially valide author
     * identifier. Throws an error if it is not.
     *
     * @method _checkId
     * @private
     * @param id { String } The identifier to check.
     */
    _checkId: function(id, callback) {
        // sanity check - we might do something more sophisticated later
        if (!(Lang.isString(id) || Lang.isNumber(id))) {
            var msg = "Invalid author identifier (" + id + ").";
            if (Lang.isFunction(callback)) {
                callback(false, msg);
            }
            throw new Error(msg);
        }
    },

    /** 
     * Converts a JSON representation (or object literal) of an <tt>Author</tt> 
     * to an instantiated object.
     * 
     * @method instantiate
     * @private
     * @param obj { String | Object } An object literal or JSON representation 
     *      of the author.
     * @return { Author } The instantiated author
     * @throws { Error } If the supplied object was not a valid representation 
     *      of an author 
     */
    instantiate : function(obj) {
        if (obj instanceof Author) {
            return obj;
        }

        if (Lang.isString(obj)) {
            obj = Y.JSON.parse(obj);
        }
        
//        var author = (obj.uri) ? this._lookupInCache(obj.uri) : null;
        var author = null;
        if (author === null) {
            author = new Author(obj);
//          this._cacheObject(obj.uri, author);
        }

        author.set("repo", this);
        return author;
    },

    _updateAuthor : function(author, resp) {
        var json = resp.author,
            id = author.get('id');

        if (id !== null) {
            author.set('id', json.id);
        } else if (id !== json.id) {
            // make sure author is the right data
            Y.log(Y.substitute(
                "Cannot update author author ({id}): the id of the supplied data ({jsonid}) does not match.",
                    { id : id, jsonid : json.id}), 'warn', author._LOG);

        }

        if (author.get('first') !== json.first) {
            author.set('first', json.first);
        }

        if (author.get('middle') !== json.middle) {
            author.set('middle', json.middle);
        }

        if (author.get('last') !== json.last) {
            author.set('last', json.last);
        }

        if (author.get('name') !== json.name) {
            author.set('name', json.name);
        }

        // keep track of this response
        author._rawjsonresp = resp;
    },

    /**
     * Retrieves the indicated author from the server (using a local cache, 
     * if available).
     * 
     * @method getAuthor
     * @public
     * @param id { String } The id of the <tt>Author</tt> to lookup.
     * @param callback { Function } A callback function. On success, this 
     *      method will be called with a single parameter, the retrieved 
     *      <tt>Author</tt>. On failure, this will be called with two 
     *      parameters: the first the boolean value <tt>false</tt>, the 
     *      second an error message detailing what went wrong. 
     */
    restore : function(author, callback, force) {
        var msg, id, uri,

            SUCCESS_MSG = "Retrieved Author ({id}): {name}",
            FAILURE_MSG = "Could not retrieve Author ({id}): {status}",
            ERR_NO_ID = "Could not restore Author: no id specified.";

        // initialize request variables
        if (Lang.isString(author)) {
            id = author;
            author = new Author();
        } else {
            id = author.get('id');
        }
        
        if (id === null || !Lang.isString(id)) {
            Y.log(ERR_NO_ID, 'warn', this._LOG);
            throw new Error(ERR_NO_ID);
        }

        uri = this.getUri(id);

        // execute the IO request
        callback = wrapCallback(callback);      // wrap callback function
        
        Y.log("Executing author request: " + uri, 'debug', this._LOG);
        Y.io(uri, { on : {
            // Handle success response. 
            success :  Y.bind(function (transactionId, o, args) {
                var data = Y.JSON.parse(o.responseText);
                this._updateAuthor(author, data);
                callback(author);

                msg = Y.substitute(SUCCESS_MSG,
                        { id : data.author.id, 
                          name : data.author.name });
                Y.log(msg, 'info', this._LOG);
            }, this),

           // Handle failure response.
           failure :  Y.bind(function(transactionId, o, args) {
                msg = Y.substitute(FAILURE_MSG, 
                        { id : id, status : o.status});
   
                Y.log(msg, 'warn', this._LOG);
                callback(false, msg);
            }, this)
        } });
    }
});

/** Default Proxy */
Author.PROXY = new AuthorProxy();

Y.namespace("lha.collection").Author = Author;
Y.namespace('lha.collection').AuthorProxy = AuthorProxy;
