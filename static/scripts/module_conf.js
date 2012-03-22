var MODULE_DEF_LHA_PREFIX = "/scripts/lha/";
var MODULE_CONF = {
    modules : {
        'lha-collection' : { 
            fullpath : MODULE_DEF_LHA_PREFIX + 'lha-collection/lha-collection.js', 
            requires : ['base', 'io-base', 'json', 'cache']
        }

        //'lha-docdisp'  : { 
        //	fullpath : MODULE_DEF_LHA_PREFIX + '/DocumentDisplay.js', 
        //	requires : ['widget', 'widget-parent', 'widget-child', 'substitute', 'lha-documents']
        //}
    }
};
