'''
Created on Dec 9, 2011

@author: Neal Audenaert
'''
import os
import sys
import re
import hashlib
import string
import urllib

try: 
    from collection.models import Person, Document, Author
except ImportError:
    try:
        import settings.settings
        from collection.models import Person, Document, Author
    except ImportError:
        print("Could not import Django Environment.")
        raise



# TODO Milestones
#      1) Parse Topics
#      4) Create Documents
#      5) Impl multiple files for the same document
#      6) Generate table of MD5 hashes for files
#      7) Detect duplicates
#      8) Upload to S3


root_path = r"I:\LHAFiles"
FILETYPES = {'.pdf':'application/pdf'
            } 


unrecognized_documents_ct = 0
ignored_documents_ct = 0
document_table = {}

authors = {};
publications = [];

def split_path(path, strip_prefix=None, normalize_path=True):
    """ Given a filesystem path, splits the path into an array of its parts. 
    
        This function will first normalize the supplied path using the os.path.realpath
        and os.path.normpath functions. If specified, it will also strip a leading 
        prefix from the path.
    """
    if normalize_path == True:
        path = os.path.normpath(os.path.realpath(path))
    if strip_prefix:
        path = os.path.relpath(path, strip_prefix)
    
    array = []
    head = path
    prev = head;
    while True:
        (head, tail) = os.path.split(head)
        if tail and len(tail) > 0: 
            array = [tail] + array
        
        if head == None or len(head) == 0:
            break;
        elif head == prev:
            array = [head] + array
            break
        
        prev = head
    return array
    
def compute_md5(path):
    f = open(path)
    block_size = 128*256
    md5 = hashlib.md5()
    while True:
        data = f.read(block_size)
        if not data:
            break
        md5.update(data)
    return md5.hexdigest()
        
    
def get_doc(title, edition=None, volume=None):
    """ Returns a document from the database. This assumes that documents can 
        be uniquely identified by their title, edition and volume. 
    """
    # TODO validate this assumption (false, same name, no edition/volume).
    #        We need to use the first author's last name to disambiguate
    documents = Document.objects.filter(title=title, edition=edition, volume=volume)
    if documents:
        # validate number of documents
        return documents[0]
    else:
        return None
    
def get_doc_ident(author, role, title, ed, vol, pubdate):
    ident = ""
    if author:
        ident += author
        if role:
            author += ", " + role + "."
        else: 
            ident += "."
    
    ident += title + "."
    
    if ed:
        ident += " " + ed
        
    if vol:
        ident += " " + vol
        
    if pubdate:
        ident += "(" + pubdate + ")"
        
    # TODO additional normalization for whitespace, capitalization, etc
    return ident.lowercase()
            


    
PUBLICATION_REGEX = re.compile(r"(?:^[Tt]he )|Lectures|Review|Journal|Letters|Magazine|Articles|Bulletin|Examiner|Grammars|ExApologist")
TITLE_REGEX = re.compile(r"""
        (?:(?P<author>[^,]*),)?                # Capture the initial author field, if present -- TODO capture author role
        (?:\s*(?P<role>tr|ed).?,\s+)?          # capture the author's role
        \s*(?P<title>.*?)\s*                   # capture the work's title
        (?:,?\s*
            (?:(?P<edition>[^,]*\s+ ed\.?),\s?)?
            (?:(?P<volume>vol\s+\d+),\s?)?     # capture volume information
            (?:(?P<search>searchable),\s*)?    # capture whether searchable
            (?:                                # Date Field
               \s+(?P<pubdate>\d{4})           # capture the publication date 
               (?P<misc>,\s+[^.]+)?            # capture miscelaneous trailing information
            )?
        )
        \.(?P<ext>[a-zA-Z]*)$                  # filepath extension
    """, re.VERBOSE)

class DocumentFileParser:        
    """ Used to manage the import process of a single document.
    
        This class maintains the state variables associated with importing 
        a document into the Library of Historical Apologetics.
    """
    filepath = None     # The full path of the file to be processed
    author = None       # The author of this document
    author_role = None
    authorname = None

    publication = None

    title = None
    edition = None
    volume = None
    searchable = None
    pub_date = None
    misc = None
    ext = None
    
    unrecognized = False
    ignored = False
        
    def __init__(self, filename, root_path, log):
        """ Constructs a new DocumentFileImporter
          
            filename The path to the file to be imported. This should be an
              absolute path.
            root_path the relative path to the main document directory. 
              Documents are assumed to be organized in a semi-standardized
              directory tree.

        """
        # TODO fix the documentation

        # need to convert the filename into Unicode before we start using it
        filename = unicode(filename, sys.getfilesystemencoding())
        root_path = unicode(root_path, sys.getfilesystemencoding())

        self.filepath = filename
        self.rootpath = root_path 
        self.log = log

    def get_relpath(self):
        path = os.path.normpath(os.path.realpath(self.filepath))
        root = os.path.normpath(os.path.realpath(self.rootpath))
        
        return os.path.relpath(path, root)
    
    def _extract_author_or_publication(self, parts):
        """ Extracts information about the author of a document or the publication
            in which it occurred from the file path.
        """
        if len(parts) <= 2:
            return              # category/work.ext (no author folder)
        
        directory = parts[-2]
        if PUBLICATION_REGEX.search(directory):
            # This directory has the contents of a publication, not an author's works
            self.publication = directory
            self.log.debug("... By: %s" % self.publication)
        else:
            # This directory represents the formated name of the author for 
            # documents in this directory
            self.authorname = directory
            self.log.debug("... By: %s" % self.authorname)
                    
    def _extract_category(self, parts):
        """ Extracts information about a document's category from the file path.
        """
        category_dir = parts[0]
        parts = category_dir.split(r" -- ")
        
        # TODO lookup (or create) category - for now, this is unused

    def _create_author(self, document, authorname, role="Author"):
        if not authorname:
            return None
        
        (last, first) = Person.parse(authorname)
        people = Person.get(last, first)
        if people:
            person = people[0]
        else:
            print("    Creating author (%s)..." % (authorname))
            person = Person.create(authorname)
        
        if role == "tr":
            role = "Translator"
        elif role == "ed":
            role = "Editor"
        elif not role:
            role = "Author"
        
        author = document.add_author(person, role)
        return author
    
    def _create_bibliographic_record(self):
        """ Creates a new document. This is called by the main parser loop if the document 
            being imported is not already present in the system. 
        """
        return # FIXME move to a different class
        document = get_doc(self.title, edition=self.edition, volume=self.volume)
        if document:
            return document
        
        print("    Creating bibliographic record...")
        document = Document(title=self.title, 
                            edition=self.edition, 
                            volume=self.volume, 
                            pub_date=self.pub_date)
        document.save()
        self._create_author(document, self.authorname, self.author_role)
        return document
                
    def _parse_pubdate(self, pubdate):
        if not pubdate:
            return None
        
        retval = None
        try:
            retval = int(pubdate)
        except:
            print("Could not parse publication date: " + pubdate)
            
        return retval
        
    def _parse_filename(self, filename, author=None):
        """ Extracts bibliographic details from the filename of the document  
            being imported.
        """
        global document_table
        self.log.debug("... Parsing filename %s" % (filename))
    
        m = TITLE_REGEX.search(filename)
        if (m != None):
            self.unrecognized = False
            
            # TODO capture filename (sans .ext) and use as disambiguator
            #         e.g., author, role, title, ed, vol (pubdate)
            self.author_lname = m.group('author')
            self.author_role = m.group('role')
            
            self.title = m.group('title')
            if len(self.title) == 0:
                # sometimes, we grab the title as the author's last name by accident
                #     e.g. Title, 3rd ed, vol 2 (1901).pdf
                self.title = self.author_lname
                self.author_lname = None
                
            self.edition = m.group('edition')
            self.volume = m.group('volume')
            self.pub_date = self._parse_pubdate(m.group('pubdate'))
            
            self.searchable = m.group('search')
            self.misc = m.group('misc')
            self.ext = m.group('ext')
                
        else:
            self.unrecognized = True
        
    def md5(self, force=False):
        """ Returns an MD5 hash of this file. Note that if the file changes 
            after the hash is first computed, this will not not recompute the 
            hash unless the 'force' parameter is set to true.
        """
        if self.md5 is None or force:
            self.md5 = compute_md5(self.filepath)
        return self.md5

    def __unicode__(self):
        result = ""
        if self.authorname is not None:
#            result = urllib.quote(self.authorname.encode("UTF-8"), safe=' ')
            result = self.authorname
        else:
            result = "unknown"

        if self.title is not None:
            result = result + ". " + self.title + "."
        else:
            result = result + ". unknown."

        if self.edition is not None:
            result = result + " " + self.edition 

        if self.volume is not None:
            result = result + " " + self.volume

        return result

    def __str__(self):
        return self.__unicode__().encode("UTF-8")

    def parse(self):
        self.log.debug("Parsing %s" % (self.filepath))

        parts = split_path(self.filepath, self.rootpath);
        # self._extract_category(parts)
        self._extract_author_or_publication(parts)
        self._parse_filename(parts[-1])

#        if self.unrecognized:
#            return False
#        
#        print("    Importing Document: %s" % (self.title))
#        self._create_bibliographic_record()
#        
#        document_desc = parts[-1]
        pass

    def process(self):
        """ Imports this file into the Library of Historical Apologetics. 
        """
        (dummy, ext) = os.path.splitext(self.filepath)
        (dummy, filename) = os.path.split(self.filepath)
        
        if ext not in FILETYPES:
            return
        
        md5digest = compute_md5(self.filepath)


