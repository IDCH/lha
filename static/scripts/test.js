/* File: test.js
 * Author: Neal Audenaert <neal@idch.org>
 * Created: 10 May 2011
 * 
 * Description: 
 *   Main bootstrapping script for the LHA site.
 */
YUI(MODULE_CONF).use('node', 'autocomplete', 'autocomplete-highlighters', 'lha-repo', 'lha-docdisp',  function(Y) {
	var MAX_AUTHORS = 45;
	
	var Lang = Y.Lang;
	
	var repo = new Y.lha.LHARepository(),
		authorACNode = Y.one('#authors-ac-input'),
		display;

	/**
	 * Activates the author auto-complete input box and registers an event handler that
	 * loads the documents for a selected author. 
	 */
	function createAuthorSearchAC() {
		authorACNode.plug(Y.Plugin.AutoComplete, {
			maxResults: MAX_AUTHORS,
			resultHighlighter: 'startsWith',
			resultListLocator: 'authors',
			resultTextLocator: function(result) {
				return result.name;
			},
			
			source:  '/LHA/data/authors?lname={query}&limit=' + MAX_AUTHORS
		});

		// Handle selection events
		authorACNode.ac.on('select', function (e) {
			var authorPanel, 
			    result = e.result,
				authorId = result.raw.id;

			repo.getDocumentsByAuthor(authorId, function(docs) {
				// clear the display & remove documents
				display.removeAll();
				
				// add the new documents
				authorPanel = new Y.lha.AuthorGroupPanel({
					author : repo.getAuthor(authorId)
				});
				
				for (var i = 0; i < docs.length; i++) {
					authorPanel.add({ document : docs[i] });
				}
				
				display.add(authorPanel);
			});
		});
	} 

	function displayDocument(document, element) {
		var panel = new Y.lha.DocumentPanel({ document : document });
		panel.render(display.get("contentBox"));
	}
	
	function main() {
		createAuthorSearchAC();
		
		display = new Y.lha.BrowseResultsDisplay({
			srcNode : "#doc-list-frame"
		});
		
		display.render();
		
	}
	
	main();
	
});
