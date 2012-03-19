from django.conf.urls.defaults import *

# Uncomment the next two lines to enable the admin:
# from django.contrib import admin
# admin.autodiscover()

urlpatterns = patterns('',
    # Example:
    # (r'^lha/', include('lha.foo.urls')),
    url(r'^authors/(?P<auth_id>[a-zA-Z0-9]*)$', 'collection.views.get_author'),
    url(r'^authors/?$', 'collection.views.list_authors'),
    
    url(r'^documents/(?P<doc_id>[a-zA-Z0-9]*)$', 'collection.views.get_document'),
    url(r'^documents/?$', 'collection.views.search_documents'),
    
    #url(r'^admin/', include(admin.site.urls)),

    #(r'^collection/', include('collection.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # (r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    # (r'^admin/', include(admin.site.urls)),
)
