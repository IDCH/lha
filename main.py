'''
Created on Feb 27, 2012

@author Neal Audenaer
'''

from libs.idch.util.importer import DocumentFileParser
from collection.models import FileRecord, Person, Author, Document
from path import path
import os
import errno
import datetime
import cli.log
import time

FILETYPES = {'.pdf':'application/pdf'
            }
 
def get_doc(creator, title, ed=None, vol=None):
    """ Returns a document from the database. This assumes that documents can 
        be uniquely identified by their title, edition and volume. 
    """
    # TODO add filter for author (by name)
    # TODO handle institionally authored documents
    documents = Document.objects.filter(author__person=creator,
                                        title=title, 
                                        edition=ed, 
                                        volume=vol)
    if documents:
        # validate number of documents
        return documents[0]
    else:
        return None
 
def create_bibliographic_record(parser, creator, app):
    """ Creates a new document. If a document with the same This is called by the main parser loop if the 
        document being imported is not already present in the system. 
    """

    document = get_doc(creator,
                       parser.title, 
                       ed=parser.edition, 
                       vol=parser.volume)
    if document:
        app.log.info("Document already exists. Skipping %s" % (parser))
        return document
        
    app.log.info("Creating bibliographic record for %s" % (parser.filepath))
    document = Document(title=parser.title, 
                        edition=parser.edition, 
                        volume=parser.volume, 
                        pub_date=parser.pub_date)

    document.save()
        #self._create_author(document, parser.authorname, parser.author_role)
    return document

def get_or_create_person(authorname, app):
    """ Retrieves the person object that represents the author of this document
        or creates a new person if no person with this name exists.

        NOTE that this does not yet enable disambiguation of multiple people 
        with the same name.
    """
    (last, first) = Person.parse(authorname)
    people = Person.get(last, first)
    if people:
        person = people[0]
        app.log.debug("Retrieved author (%s)..." % (person))
    else:
        app.log.info("Creating author (%s)..." % (authorname))
        person = Person.create(authorname)

    return person

def associate_author(person, document, parser, app):
    role = "Author"
    if parser.author_role is None:
        role = "Author"
    if parser.author_role == "tr":
       role = "Translator"
    elif parser.author_role == "ed":
        role = "Editor"
        
    return document.add_author(person, role)

def create_file_record(parser, app):
    """ Creates the initial database entry for a specific file.
    """
    # lookup file metadata first.
    relpath = parser.get_relpath()
    record = FileRecord.get_by_path(relpath)
    if record is not None:
        # This is done on ingest, but we'll check again to make sure.
        app.log.info("Found existing file record for %s" % (relpath))
        return record

    # Check the MD5 hash to make sure that this isn't a file that has moved
    # TODO simplify this by using py.path in the parser
    md5 = path(parser.filepath).read_hexhash('md5')
    record = FileRecord.find(md5)
    if record is not None:
        # TODO should we require user input?
        app.log.warn("Found duplicate file: $s is the currently stored as %s" % (relpath, record.filepath))
        record.update(relpath)
    else:
        app.log.info("Creating a file record for %s" % (relpath))

        description = ""
        if parser.misc is not None:
            description = parser.misc

        if parser.searchable:
            description = description + " (searchable)"

        len(str(md5))
        record = FileRecord(md5=md5,
                            description=description.strip(),
                            filepath=relpath,
                            last_updated=datetime.datetime.now(),
                            last_checked=datetime.datetime.now())
        record.save()

    return record


#=============================================================================
# FileImporter Class
#=============================================================================
class FileImporter:
    import_queue = []
    document_ct = 0
    rootpath = None
    _app = None

    def __init__(self, app, rootpath):
        self._app = app
        root = rootpath.realpath()
        if not root.exists():
            raise IOError((errno.ENOENT, "The supplied document root does not exist.", path))
        if not root.isdir():
            raise IOError((errno.ENOTDIR, "The document root must refer to a directory.", path))

        self.rootpath = root 

    # Methods to queue files for import
    #--------------------------------------------------------------------------
    def add_dir(self, directory):
        """ Adds all files in a given directory tree to the import queue.
        """
        log = self._app.log
        if self.rootpath is None:
            self.rootpath = directory

        # Sanity checks
        if not directory.exists():
            raise IOError((errno.ENOENT, "Cannot add directory: does not exist.", directory))
        if not directory.isdir():
            raise IOError((errno.ENOTDIR, "Cannot add directory: not a directory.", directory))
        if self.rootpath.relpathto(directory).startswith(".."):
            raise ValueError("The supplied directory is not a child of the document root.")

        # Skip hidden files (i.e. files that begin with a dot)
        dirname = directory.basename()
        if dirname.startswith('.'):
            log.debug("Skipping: '" + directory + "'")
            return

        log.debug("Adding directory: '" + directory + "'")

        for f in directory.files():     # add files to queue
            self.add_file(f)

        for d in directory.dirs():      # process directories recursively
            self.add_dir(d)

    def add_file(self, p):
        """ Adds the specified file to the import queue.
        """
        log = self._app.log

        # Sanity checks 
        if not p.exists():
            raise IOError((errno.ENOENT, "Cannot add file: does not exist.", p))
        if not p.isfile():
            raise IOError((errno.ENOTDIR, "Cannot add file: not a file.", p))
        if self.rootpath.relpathto(p).startswith(".."):
            raise ValueError("The supplied file is not a child of the document root.")

        if p.ext not in FILETYPES:
            log.debug("Skipping file %s. Filetype not supported." % (p));
            return 
        
        if self.has_been_imported(p):
            # TODO check datestamp to see if it needs to be updated
            log.debug("Skipping file %s. Already processed.");
            return

        log.info("Queueing file for import: '%s'" % (p))
        parser = DocumentFileParser(p, self.rootpath, log)
        parser.parse()
        self.import_queue.append(parser)

    def process_next(self):
        """ Processes the next file in the import queue.
        """
        app = self._app
        log = self._app.log

        if len(self.import_queue) == 0:
            log.warn("No documents left to import.")
            return

        # TODO log info statement
        parser = self.import_queue.pop()

        # create db record for this file record
        record = create_file_record(parser, app)

        # Lookup or create bibligraphic record.
        creator = None
        authorname = parser.authorname
        if parser.authorname:
            creator = get_or_create_person(parser.authorname, app)
        else:
            # TODO handle institutional authors
            creator = get_or_create_person("unknown", app)
        
        document = create_bibliographic_record(parser, creator, app)
        author = associate_author(creator, document, parser, app)

        # Associate file record with bibliographic data
        record.document = document
        record.save()

        # TODO items:
        # Store filesystem metadata so that we can track whether or not 
        #       we've processed this file
        # Upload file to S3. Set metadata as appropriate
        # Handle institutional authors


    def has_been_imported(self, p):
        """ Indicates whether there is an existing file record for this file.
        """
        relpath = os.path.relpath(p, self.rootpath)
        record = FileRecord.get_by_path(relpath)

        return record is not None


@cli.log.LoggingApp
def import_docs(app):

    path_to_import = path('.')
    if app.params.directory is not None:
        path_to_import = app.params.directory

    path_to_import = path(path_to_import).realpath()

    if not path_to_import.exists():
        pass
    elif not path_to_import.isdir():
        pass

    importer = FileImporter(app, path_to_import)
    importer.add_dir(path_to_import)
    print(len(importer.import_queue))
    importer.process_next()

import_docs.add_param("-d", "--directory", help="The directory containing files to import", default=None)
import_docs.add_param("-t", "--test", help="Test the import, but don't actually create new records", default=False, action="store_true")
if __name__ == "__main__":
    import_docs.run()
