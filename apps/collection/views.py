import json
from django.conf import settings
from django.views.decorators.http import require_http_methods
from django.views.decorators.gzip import gzip_page

from StringIO import StringIO
from django.http import HttpResponse
from collection.models import Document, Person

if hasattr(settings, 'COLLECTION_API_ENDPOINT'):
    API_ENDPOINT = settings.COLLECTION_API_ENDPOINT
else: 
    # TODO raise an exception. . . this needs to be configured
    API_ENDPOINT = "/collection"

_API_VERSION_ = 0.1

#===============================================================================================
# AUTHOR RESOURCES
#===============================================================================================

def author_json_repr(author, detail="short"):
    """ Returns a JSON representation of an author.
    """
    
    result = {}
    if detail == "detail":
        # over time, we might add additional metadata and information about 
        # whether the author has a book, biographical information, etc.
        result = { "id" : author.uid(),
                   "uri" : API_ENDPOINT + "/authors/" + author.uid(), 
                   "last" : author.last,
                   "middle" : author.middle,
                   "first" : author.first,
                   "suffix" : author.suffix,
                   "title" : author.title,
                   "name" : unicode(author)
                 }
    else :
        result = { "id" : author.uid(), 
                   "uri" : API_ENDPOINT + "/authors/" + author.uid(), 
                   "name" : unicode(author) }
        
    # TODO add canonical link
    # TODO write to output stream
    return result
    
PAGED_RESULT_PARAMS = "{base_uri}{join_char}offset={offset}&limit={limit}"
def get_paging_details(o, params, default_offset=0, default_limit=25):
    try:
        o.limit = int(params.get("limit", default_limit))
        o.offset = int(params.get("offset", default_offset))
    except ValueError:
        # log exception
        pass
    
    return (o.offset, o.limit)
    
def get_paging_uris(paged_action, base_uri, matched):
    # Better job of joining to URI (check to see if we need to join with ? or &
    
    join_char = "&"
    if "?" not in base_uri:
        join_char = "?"

    # First Page        
    first_uri = None
    if paged_action.offset != 0:
        PAGED_RESULT_PARAMS.format(base_uri=base_uri, 
                                   join_char=join_char, 
                                   offset=0, 
                                   limit=paged_action.limit)
    # Prev Page
    prev_uri = None
    if paged_action.offset > 0:
        offset = max(paged_action.offset - paged_action.limit, 0)
        prev_uri = PAGED_RESULT_PARAMS.format(base_uri=base_uri, 
                                              join_char=join_char, 
                                              offset=offset, 
                                              limit=paged_action.limit)
        
    # Self Page
    self_uri = PAGED_RESULT_PARAMS.format(base_uri=base_uri, 
                                          join_char=join_char, 
                                          offset=paged_action.offset, 
                                          limit=paged_action.limit)
   
    # Next Page
    next_uri = None
    offset = paged_action.offset + paged_action.limit
    if offset < matched:
        next_uri = PAGED_RESULT_PARAMS.format(base_uri=base_uri, 
                                              join_char=join_char, 
                                              offset=offset, 
                                              limit=paged_action.limit)
        
    # Last Page
    last_uri = None
    limit = paged_action.limit
    offset = (matched / limit) * limit
    limit = matched % limit
    if offset > 0:
        last_uri = PAGED_RESULT_PARAMS.format(base_uri=base_uri, 
                                              join_char=join_char, 
                                              offset=offset, 
                                              limit=paged_action.limit)
        
    result = {}
    if first_uri:
        result["first"] = first_uri
    if prev_uri:
        result["prev"] = prev_uri
    if self_uri:
        result["self"] = self_uri
    if next_uri:
        result["next"] = next_uri
    if last_uri:
        result["last"] = last_uri
        
    return result
    
LIST_AUTHOR_URI = API_ENDPOINT + "/authors?last={last}&exact={exact}&fmt={fmt}"
class ListAuthorsAction:
    _NAME_ = "List Authors"
    
    ct_matched = None
    ct_returned = None
    
    # TODO use these rather than a dictionary
    last = None
    exact = False
    fmt = "short"
    limit = 25
    offset = 0
    
    header = None
    authors = None
    qset = None
    
    def __init__(self, request):
        self.request = request
        
        # parse request parameters
        params = self.request.GET;
        self.last = params.get("last", None)
        self.fmt = params.get("fmt", self.fmt)
            
        if self.fmt not in ["short", "detail"]:         # TODO look up available and default 
            self.fmt = "short"                          #      formats by formatter.
            
        if "exact" in params and params["exact"].lower() == "t":
            self.exact = True
            
        get_paging_details(self, params)
    
    def uri(self):
        """ Returns a canonical URI for this query minus any paging information (offset 
            and limit). 
        """
        
        if self.exact: exact = "t"
        else: exact = "f"
    
        if self.last: last = self.last
        else: last = ''
        
        return LIST_AUTHOR_URI.format(last=last, exact=exact, fmt=self.fmt)

    def build_qset(self):
        """ Builds a query set to retrieve the specified authors. This does not restrict
            the query based on the range of authors to retrieve (using limit and offset).
            
        """
        if not self.qset:
            qset = Person.objects.all()                 # by default, we'll retrieve all authors
            
            # apply filtering criteria
            last = self.last
            if last:
                if self.exact:
                    qset = qset.filter(last__iexact=last)
                else:
                    qset = qset.filter(last__istartswith=last)
                
            # apply ordering
            qset.order_by("last", "first")
            
            self.qset = qset
            self.ct_matched = self.qset.count()
            
        return self.qset
    
    def list_authors(self):
        if not self.qset:
            # make sure that we've build the query set
            self.build_qset()
            
        if not self.authors:
            self.authors = self.qset[self.offset : self.offset + self.limit]
            
        self.ct_returned = len(self.authors)
        return self.authors
    
    def _query_dict(self):
        """ Returns a dict of the parsed query. """
        return { "last" : self.last,
                 "exact" : self.exact,
                 "fmt" : self.fmt,
                 "limit" : self.limit,
                 "offset" : self.offset }
        
    
    def get_header(self):
        """ Returns a dictionary containing the header values for this response.
        """
        if not self.authors:
            self.list_authors()     # make sure that we've retrieved the authors for this query
        
        if not self.header:
            self.header = {
                "name"          : self._NAME_,
                "api_version"   : _API_VERSION_,
                "request_uri"   : self.request.build_absolute_uri(),
                "total_matched" : self.ct_matched,
                "num_returned"  : self.ct_returned,
                
                "links" : get_paging_uris(self, self.uri(), self.ct_matched),
                "q"     : self._query_dict()
            }
            
        return self.header
    
    def _to_json(self, data):
        io = StringIO()
        json.dump(data, io, indent=4)
        return HttpResponse(io.getvalue(), content_type="application/json")
    
    def _to_xml(self):
        # TODO implement me
        pass
    
    def _to_html(self):
        # TODO implement me
        pass
    
    def generate_response(self):
        # TODO determine the response representation
        data = { "header" : self.get_header() }
        
        authors = []
        for a in self.authors:
            authors.append(author_json_repr(a, self.fmt))
                           
        data["authors"] = authors
        
        return self._to_json(data)
            
class GetAuthorAction():
    _NAME_= "Get Author"
        
    def __init__(self, request, auth_id):
        self.auth_id = auth_id
        self.request = request
        self.person = Person.get_by_id(auth_id)
    
    def get_header(self):
        # TODO get time stamp information for caching purposes
        return { "name"          : self._NAME_,
                 "api_version"   : _API_VERSION_,
                 "request_uri"   : self.request.build_absolute_uri(),
                 "author_id"     : self.auth_id }
        
    def _to_json(self, data):
        io = StringIO()
        json.dump(data, io, indent=4)
        return HttpResponse(io.getvalue(), content_type="application/json")
    
    def generate_response(self):
        data = { "header" : self.get_header() }
        data["author"] = author_json_repr(self.person, "detail")
        
        return self._to_json(data)
        # TODO determine correct format for response (HTML, XML, JSON)
    
#===============================================================================================
# DOCUMENT RESOURCES
#===============================================================================================

def document_dict(document):
    """ Returns a dictionary representation of a document.
    """
    
    result = {
        "id" : document.uid(),
        "uri" : API_ENDPOINT + "/documents/" + document.uid(),
        "title" : document.title,
        "subtitle" : document.subtitle,
        "authors" : [],
        "volume" : document.volume,
        "edition" : document.edition,
        "publisher" : document.publisher,
        "pub_date" : document.pub_date,
        "pub_location" : document.pub_location
    }
    
    authors = []
    for a in document.author_set.all():
        auth = { "role" : a.role, "person": author_json_repr(a.person) }
        authors.append(auth)
        
    result["authors"] = authors 
    return result;

class SearchDocumentAction:
    _NAME_ = "Search Documents"
    
    ct_matched = -1
    ct_returned = -1
    
    # TODO use these rather than a dictionary
    title = None
    author = None
    exact = False
    before = None
    after = None
    order = None
    limit = 25
    offset = 0
    
    def __init__(self, request):
        self.request = request
        self.params = self.request.GET;
        
    def uri(self):
        """ 
        Returns a canonical URI for this query minus any paging information 
        (offset and limit parameters). This should be called after the action has 
        been executed to ensure that the request has been parsed.
        """
        
        uri = API_ENDPOINT + "/documents"
        join_ch = "?"
        if self.author:
            if self.exact: exact = "t"
            else: exact = "f"
            uri = uri + join_ch + "author=" + self.author + "&exact=" + exact
            join_ch = "&"
    
        if self.title:
            uri = uri + join_ch + "title=" + self.title
            join_ch = "&"
            
        if self.before:
            uri = uri + join_ch + "before=" + self.before
            join_ch = "&"
    
        if self.after:
            uri = uri + join_ch + "after=" + self.after
            join_ch = "&"
            
        if self.order:
            uri = uri + join_ch + "order" + self.order
            join_ch = "&"
            
        return uri

    def _query_dict(self):
        """ 
        Returns a dictionary containing the parsed query parameters for this request. 
        This must be called after the action has been executed.
        """
        
        q =  { "limit" : self.limit,
               "offset" : self.offset }
        
        if self.author:
            q['author'] = self.author
            if self.exact: q['exact'] = 't'
            else: q['exact'] = 'f'
            
        if self.title: q['title'] = self.title
        if self.before: q['before'] = self.before
        if self.after: q['after'] = self.after
            
        return q
    
    def execute(self):
        params = self.request.GET;
        qset = Document.objects.all()                 # by default, we'll retrieve all authors
            
        # filter by author
        last = params.get("author", None)
        if last:
            self.author = last
            if "exact" in params and params["exact"].lower() == "t":
                self.exact = True
                qset = qset.filter(author__person__last__iexact=last)
            else:
                self.exact = False
                qset = qset.filter(author__person__last__istartswith=last)
                
        # filter by title
        title = params.get("title", None)
        if title:
            self.title = title
            for part in title.split():
                qset = qset.filter(title__icontains=part)
                
        # add before, after filters
        before = params.get("before", None)
        if before:
            self.before = before
            qset = qset.filter(pub_date__lte=before)
            
        after = params.get("after", None)
        if after:
            self.after = after
            qset = qset.filter(pub_date__gte=after)
            
        # apply ordering and record number of matched document
        # TODO apply custom orderings: author, date, title
        order = params.get("order", "author")
        self.order = order
        if order == "author":
            qset = qset.order_by('author__person__last', 'author__person__first', 'pub_date')
        elif order == "date":
            qset = qset.order_by('pub_date', 'author__person__last', 'author__person__first', 'title')
        elif order == "recent":
            qset = qset.order_by('-pub_date', 'author__person__last', 'author__person__first', 'title')
        elif order == "title":
            qset = qset.order_by('title', 'author__person__last', 'pub_date')
            
        self.ct_matched = qset.count()
        
        # retrieve documents
        (offset, limit) = get_paging_details(self, self.params)
        documents = qset[offset : offset + limit]
        self.ct_returned = len(documents)
        
        return documents
    
    def get_header(self):
        """ Returns a dictionary containing the header values for this response. """
        
        return {
            "name"          : self._NAME_,
            "api_version"   : _API_VERSION_,
            "request_uri"   : self.request.build_absolute_uri(),
            "total_matched" : self.ct_matched,
            "num_returned"  : self.ct_returned,
            
            "links" : get_paging_uris(self, self.uri(), self.ct_matched),
            "q"     : self._query_dict()
        }
    
    def generate_response(self):
        
        documents = self.execute()
        data = { "header" : self.get_header() }
        
        docs = []
        for doc in documents:
            docs.append(document_dict(doc))
                           
        data["documents"] = docs
        
        io = StringIO()
        json.dump(data, io, indent=4)
        return HttpResponse(io.getvalue(), content_type="application/json")
        
class GetDocumentAction:
    # NOTE this is simple enough at the moment that it doesn't warrant its own class, 
    #      however, I envision adding additional functionality later so this is here to 
    #      make it easier to expand when the time comes.
    
    _NAME_ = "Get Document"
    
    def __init__(self, request, doc_id):
        self.doc_id = doc_id
        self.request = request
        self.document = Document.get_by_id(doc_id)
        
    def get_header(self):
        # TODO get time stamp information for caching purposes
        return { "name"          : self._NAME_,
                 "api_version"   : _API_VERSION_,
                 "request_uri"   : self.request.build_absolute_uri(),
                 "document_id"     : self.doc_id }
        
    def _to_json(self, data):
        io = StringIO()
        json.dump(data, io, indent=4)
        return HttpResponse(io.getvalue(), content_type="application/json")
    
    def generate_response(self):
        data = { "header" : self.get_header() }
        data["document"] = document_dict(self.document)
        
        return self._to_json(data)
    
#===============================================================================================
# REQUEST HANDLERS
#===============================================================================================

@gzip_page
@require_http_methods(["GET"])
def list_authors(request):
    action = ListAuthorsAction(request)
    return action.generate_response()

@require_http_methods(["GET"])
def get_author(request, auth_id):
    action = GetAuthorAction(request, auth_id)
    return action.generate_response()

@gzip_page
@require_http_methods(["GET"])
def search_documents(request):
    action = SearchDocumentAction(request)
    return action.generate_response()

@gzip_page
@require_http_methods(["GET"])
def get_document(request, doc_id):
    action = GetDocumentAction(request, doc_id)
    return action.generate_response()

    
