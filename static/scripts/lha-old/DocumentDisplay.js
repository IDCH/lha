// START WRAPPER: The YUI.add wrapper is added by the build system, when you use YUI Builder to build your component from the raw source in this file
YUI.add("lha-docdisp", function(Y) {

    /* Any frequently used shortcuts, strings and constants */
    var Lang = Y.Lang,
		Node = Y.Node,
		Author = Y.lha.Author,
		Document = Y.lha.Document,
	    DocumentSet = Y.lha.DocumentSet;
    
    //=======================================================================================
    // PRIVATE METHODS
    //=======================================================================================

    /**
     * Default document formatter.
     * 
      <div>
        <a class="title-link" href="/books/ID/" rel="bookmark">
        <span class="title">An Essay on Mr. Hume’s Essay on Miracles</span>: 
        <span class="subtitle">A sub-title goes here</span>
        </a>
       <span class="pubinfo">
        (<span class="location">New York</span>:
         <span class="publisher">American Tract Society</span>
         <span class="date">1752</span>; 
         <span class="edition">3rd ed., retitled, 1767</span>)
       </span>
      </div>
     *
     * TODO need to look into making this a plugin.
     */
    function docFormatter(document) {
    	var DOC_TEMPLATE = 
	    		'<a class="title-link" href="/books/{docId}/" rel="bookmark">' +
	    		'<span class="title">{title}</span>{subtitle}' + 
	    		'</a>',
	    		
    		subtitle  = document.get("subtitle"),
			location  = document.get("location"),
		    publisher = document.get("publisher"),
		    date      = document.get("pubDate"),
		    edition   = document.get("edition"),
		    		    
    		pubInfo, tail, title;
    				
		// construct document entry
    	title = Y.substitute(DOC_TEMPLATE, {
				docId : document.get("id"),
				title : document.get("title"),
				subtitle : Lang.isString(subtitle) 
								? ': <span class="subtitle">' + subtitle + '</span>' : ''
			});
		
    	// construct publication info
    	pubInfo = '';
		if (Lang.isString(edition)) {
			pubInfo = edition;
		}
		
		if (Lang.isString(date) || Lang.isNumber(date)) {
			pubInfo = '<span class="date">' + date + '</span> ' + pubInfo;
		}
		
		if (Lang.isString(publisher)) {
			tail = (pubInfo.length > 0) ? '</span>; ' + pubInfo: '</span>';
			pubInfo = '<span class="publisher">' + publisher + tail;
		}
		
		if (Lang.isString(location)) {
			tail = (pubInfo.length > 0) ? '</span>: ' + pubInfo: '</span>';
			pubInfo += '<span class="location">' + location + tail;
		}
			
		if (pubInfo.length > 0) 
			pubInfo = '<span class="pubinfo">(' + pubInfo.trim() + ')</span>'; 
		
		// assemble the pieces
		return title + pubInfo;
	}

    /**
	 * Creates the search links for a particular document.
	 * 
       <div class="search-links">
         Search: 
         <span class="google">
           <a target="blank" href="http://www.google.com/search?tbo=p&tbm=bks&q=intitle:An+Essay+on+Mr+Hume's+Essay+on+Miracles+inauthor:Adams">Google Books</a>
         </span> | 
         <span class="archive">
           <a target="blank" href="http://www.google.com/search?tbo=p&tbm=bks&q=intitle:An+Essay+on+Mr+Hume's+Essay+on+Miracles+inauthor:Adams">Internet Archive</a>
         </span> |
         <span class="worldcat">
           <a target="blank" href="http://www.google.com/search?tbo=p&tbm=bks&q=intitle:An+Essay+on+Mr+Hume's+Essay+on+Miracles+inauthor:Adams">WorldCat</a>
         </span> 
       </div>
	 *
	 * TODO need to look at making this a plugin
	 */
	function linkFormatter(document) {
		var authors = document.get("authors"),
	        params = {
				title : encodeURIComponent(document.get("title")),
				author : authors.length > 0 ? encodeURIComponent(authors[0].get("last")) : ''
			},
			
			GOOGLE_HREF  = 'http://www.google.com/search?tbo=p&tbm=bks&q=intitle:{title}+inauthor:{author}',
			ARCHIVE_HREF = 'http://www.archive.org/search.php?query=title%3A%28{title}%29%20AND%20creator%3A%28{author}%29',
			WORLDCAT_HREF = 'http://www.worldcat.org/search?q=ti%3A{title}+au%3A{author}',
			
			SEARCH_TMPL = 
				'<span class="{engine_css}">' +
	              '<a target="blank" href="{href}">{engine_name}</a>' +
	            '</span>';
	      
		return  Y.substitute(SEARCH_TMPL, {
				    engine_css : 'google',
				    engine_name : 'Google Books',
				    href : Y.substitute(GOOGLE_HREF, params)}) + ' | ' +
				Y.substitute(SEARCH_TMPL, {
					engine_css : 'archive',
				    engine_name : 'Internet Archive',
				    href : Y.substitute(ARCHIVE_HREF, params)}) + ' | ' +
				Y.substitute(SEARCH_TMPL, {
					engine_css : 'worldcat',
				    engine_name : 'WorldCat',
				    href : Y.substitute(WORLDCAT_HREF, params)});
	}
    
    //=======================================================================================
    // DOCUMENT PANEL IMPLEMENTATION
    //=======================================================================================

    var DocumentPanel = Y.Base.create("documentPanel", Y.Widget, [Y.WidgetChild], {
     
        // Override the default DIVs used for rendering the bounding box and content box.
        CONTENT_TEMPLATE : "<div></div>",
        BOUNDING_TEMPLATE : '<li class="doc"></li>',
     
        // Handle rendering the label attribute
        renderUI: function () {
        	var doc = this.get("document");
        	var html = 
    			'<div>{formatted_entry}</div>' +
    			'<div class="search-links">Search: {formatted_links}</div>';
    		
    		html = Y.substitute(html, {
    			formatted_entry : this.get("docFormatter")(doc),
    			formatted_links : this.get("linkFormatter")(doc)
    		});
    		
            this.get("contentBox").setContent(html);
        },
        
        bindUI: function() {
        	
        }
     
    }, {
     
        ATTRS : {
     
            // Setup Label Attribute
            document : {
            	value : null,
                validator: function (value) { 
                	return !value || value instanceof Document; 
                }
            },
     
            // function responsible for generating HTML formatted display of a document.
            docFormatter : {
            	value : docFormatter,
            	validator: Lang.isFunction
            },
            
            // function responsible for generating links to search for a document on the web 
            linkFormatter : {
            	value : linkFormatter,
            	validator: Lang.isFunction
            }
        }
    });
    
    Y.namespace("lha").DocumentPanel = DocumentPanel;

//============================================================================================
// DocumentListDisplay CLASS IMPLEMENTATION
//============================================================================================    
var AuthorGroupPanel = Y.Base.create("authorGroupPanel", Y.Widget, [Y.WidgetParent, Y.WidgetChild], {
	// TODO this is implemented as an author group. Need to either make that explicit or else 
	//		implement author specific functionality as a plugin.
	
	/* PROTOTYPE PROPERTIES */
    CONTENT_TEMPLATE : '<ol class="documents"></ol>',
    BOUNDING_TEMPLATE : '<li class="author-group expanded"></li>',
	
    _renderAuthor : function() {
    	var ADD_AUTHOR_LINK = false,
	    	LINK_TEMPLATE = '<a href="/authors/{authorId}/" title="{authorLinkTitle}" rel="bookmark">{authorName}</a>',
	    	HEADING_TEMPLATE = '<h3 class="author-name">{headingText}</h3>',

	    	html, heading = "unknown",
	    	bbox = this.get('boundingBox');
    	    author = this.get('author');
    	
    	if (author) {
    		heading = author.get('last') + ", " + author.get('first');
    		if (ADD_AUTHOR_LINK)
    			heading = Y.substitute(LINK_TEMPLATE, {
					  authorId : author.get("id"),
					  authorName : heading,
					  authorLinkTitle : "Details for " + heading
				  });
    	} 
    	
    	html = Y.substitute(HEADING_TEMPLATE, { headingText : heading });
    	bbox.prepend(bbox.create(html));
    },
    
	renderUI : function() {
		this._renderAuthor();
		
	},
	
	bindUI : function() {
		
	},
	
	syncUI : function() {
		
	}
}, {
	/* STATIC PROPERTIES */
	ATTRS : { 
		defaultChildType: {  
            value: DocumentPanel
        },
        
        label : {
        	value : "unknown"
        },
        
        author : {
        	value : null,
        	validator : function(value) {
        		return value instanceof Author;
        	}
        }
	}
});

Y.namespace("lha").AuthorGroupPanel = AuthorGroupPanel;

//============================================================================================
// DocumentSetDisplay CLASS IMPLEMENTATION
//============================================================================================  
var BrowseResultsDisplay = Y.Base.create("browseResultsDisplay", Y.Widget, [Y.WidgetParent], {
	
	/* PROTOTYPE PROPERTIES */
//    CONTENT_TEMPLATE : '<ol class="documents"></ol>',
//    BOUNDING_TEMPLATE : '<li class="author-group expanded"></li>',
	
    
    
	renderUI : function() {
		
	},
	
	bindUI : function() {
		
	},
	
	syncUI : function() {
		
	}
}, {
	ATTRS : { 
		
	}
});

Y.namespace("lha").BrowseResultsDisplay = BrowseResultsDisplay;

    
    /**
     * Displays a set of documents in a scrollable list.
     */
    function DocumentSetDisplay(config) {
    	DocumentSetDisplay.superclass.constructor.apply(this, arguments);
    }
    DocumentSetDisplay.INPUT_CLASS = "docinput";

    DocumentSetDisplay.NAME = "documentSetDisplay";

    /*
     * The attribute configuration for the widget. This defines the core user facing state of the widget
     */
    DocumentSetDisplay.ATTRS = {

        docSet : {
            value: null,
            validator : function(set) {
            	return (set instanceof DocumentSet) || (set == null);
            }
        },
        
        strings : { 
        	value : {
        		tooltip : "This is a test"
        	} 
        }
    };

    /* 
     * The HTML_PARSER static constant is used if the Widget supports progressive enhancement, 
     * and is used to populate the configuration for the MyWidget instance from markup already 
     * on the page.
     */
//    DocumentSetDisplay.HTML_PARSER = {
//
//    };

    /* Templates for any markup the widget uses. Usually includes {} tokens, which are replaced through Y.substitute */
    DocumentSetDisplay.BOX_TEMPLATE = 
    	'<ol id="{docset.id}" class="">' +
    	'</ol>';

    DocumentSetDisplay.INPUT_TEMPLATE =  
    	'<input type="text" class="' + DocumentSetDisplay.INPUT_CLASS + '"/>';

    /* DocumentSetDisplay extends the base Widget class */
    Y.extend(DocumentSetDisplay, Y.Widget, {

        initializer: function() {
            
        },

        destructor : function() {
            
        },

        renderUI : function() {
        	var contentBox = this.get("contentBox");
        	
        	 var contentBox = this.get("contentBox"),
	             strings = this.get("strings");
	      
        	 
             // this._mynode = Node.create(Y.substitute(MyWidget.MYNODE_TEMPLATE, {mynodeid: this.get("id") + "_mynode"})); 
        },

        bindUI : function() {
            
        },

        syncUI : function() {
            
        },
        
        // 
        _displayPanels : function() {
        	
        }
    });


}, "3.2.0", {requires:['widget', 'widget-parent', 'widget-child', 'substitute', 'lha-documents']});
// END WRAPPER