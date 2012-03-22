/* File: lha.js
 * Author: Neal Audenaert <neal@idch.org>
 * Created: 10 May 2011
 * 
 * Description: 
 *   Main bootstrapping script for the LHA site.
 */

var LHA_config = {
	modules : {
                  
//		lha_author   : { fullpath : '/scripts/lha/Author.js', requires : ['base']},
//		lha_category : { fullpath : '/scripts/lha/Category.js', requires : ['base']},
//		lha_document_set : { fullpath : '/scripts/lha/DocumentSet.js', requires : ['base', 'lha_document']},
		lha_document : { fullpath : '/scripts/lha/Document.js', requires : ['base', 'lha_author', 'lha_category']},
		lha_docset : { fullpath : '/scripts/lha/DocumentDisplay.js', requires : ['widget', 'substitute', 'lha_document_set']},
		lha_repo     : { fullpath : '/scripts/lha/LHARepository.js', requires : ['base', 'io-base', 'json', 'lha_document']}
		lha_collection : { fullpath : '/scripts/lha/lha-collection/lha-collection.js', requires : ['base', 'io-base', 'json']}
	}
};

YUI(MODULE_CONF).use('node', 'lha_repo', 'lha_docset',  function(Y) {
	
	var repo = new Y.lha.LHARepository();
	
	var docs = new Y.lha.DocumentSet();
	repo.getDocumentsByAuthor("ab", function(docSet) {
		var groups = docSet.get("groups");
		
//		alert(docSet.get("documents").length);
		for (var name in groups) {
			var group = groups[name];
			alert(name + " has " + group.get("size") + " documents.");
		}
		
		
//		docs.add(doc);
//		alert(doc.get("id"));
	});
	

	
});
