from django.conf.urls.defaults import patterns, include, url

# Uncomment the next two lines to enable the admin:
from django.contrib import admin

admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    # url(r'^$', 'PyLHA.views.home', name='home'),
    # url(r'^PyLHA/', include('PyLHA.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),
    
    #url(r'^collection/', include('lha.collection.urls')),
    
    url(r'^authors/(?P<auth_id>[a-zA-Z0-9]*)$', 'lha.collection.views.get_author'),
    url(r'^authors/?$', 'lha.collection.views.list_authors'),
    
    url(r'^documents/(?P<doc_id>[a-zA-Z0-9]*)$', 'lha.collection.views.get_document'),
    url(r'^documents/?$', 'lha.collection.views.search_documents'),
    
    url(r'^admin/', include(admin.site.urls)),
    # Uncomment the next line to enable the admin:
)
