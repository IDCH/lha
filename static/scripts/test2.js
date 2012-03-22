YUI(MODULE_CONF).use('node', 'substitute', 'lha-collection', function(Y) {

    var API_ENDPOINT = '/collection/',

        id = "867nv"
        author = new Y.lha.collection.Author(
            { id : id });

    author.restore(function(author, msg) {
        alert(author.get('name'));
    });

});
