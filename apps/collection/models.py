from django.db import models
from idch.util import short_url

class Person(models.Model):
    """ Represents a natural person, for example, the author of a document. 
    
        This class is, for the moment, a place holder class. It will need to be matured 
        over time as we get a better understanding of the needs for representing people
        in this system. 
    """
    # This is purely about the person. We can add other information (birth, death, etc)
    # as needed later on
    #
    # TODO known_by, sort_by, etc.

    last = models.CharField(max_length=127)
    first = models.CharField(max_length=127, null=True, blank=True)
    middle = models.CharField(max_length=127, null=True,  blank=True)
    suffix = models.CharField(max_length=32, null=True, blank=True)
    title = models.CharField(max_length=32, null=True, blank=True)
    # TODO add full name
    
    @staticmethod
    def parse(person_name):
        last = person_name
        first = None
        if "," in person_name:
            parts = person_name.split(",");
            last = parts[0]
            first = parts[1]
            
        if last: last = last.strip()
        if first: first = first.strip()
        
        return (last, first)
    
    @staticmethod
    def get(last, first):
        if first:
            if len(first) == 1 or first.endswith("."):
                people = Person.objects.filter(last=last, first__startswith=first.rstrip("."))
            else:
                people = Person.objects.filter(last=last, first=first)
        else: 
            people = Person.objects.filter(last=last)
            
        return people
    
    @staticmethod
    def get_by_id(short_id):
        authid = short_url.decode_url(short_id)
        return Person.objects.get(id=authid)
    
    @staticmethod
    def create(person_name):
        """ Creates a new person or returns an existing person based on the supplied name. 
            
            The person's name should be in the format 'last, first'.
        
            TODO Better error handling, look up name candidates from DB
                 Move to 'people' module?
            TODO Support 'first last' format (split by space)
            TODO Support lists separated by ';', e.g. Audenaert, N; Richard Furuta
        """
        
        (last, first) = Person.parse(person_name)
        person = Person()
        person.last = last
        person.first = first
        person.save()
        
        return person
    
    def uid(self):
        """ Returns a formatted version of this person's unique id suitable 
            for use in URLs.
        """
        return short_url.encode_url(self.id)
        
    def __unicode__(self):
        result = ""
        if self.last != None:
            result = self.last
        if self.first != None:
            if len(result) > 0:
                result += ", "
                
            result += self.first;
            
        return result
    
    class Meta:
        # ordering = ['last', 'first']
        pass
    
   
#===============================================================================================
# DOCUMENT INFORMATION 
#===============================================================================================

 
# Create your models here.
class Document(models.Model):
    title = models.CharField(max_length=255)
    subtitle = models.CharField(max_length=255, null=True, blank=True)
    authors = models.ManyToManyField(Person, through='Author')
    
    # define part of relationship.
    volume = models.CharField(max_length=255, null=True, blank=True)
    abstract = models.CharField(max_length=255, null=True, blank=True)
    edition = models.CharField(max_length=63, null=True, blank=True)
   
    publisher = models.CharField(max_length=255, null=True, blank=True)
    pub_date = models.IntegerField(null=True, blank=True)
    pub_location = models.CharField(max_length=255, null=True, blank=True)
    
    # doc_type = models.CharField(max_length=255, null=True, blank=True)     # Book, Volume, Journal, Article, Issue etc
    @staticmethod
    def create(title, vol, ed, pub_date):
        # capture full repr: author, role, title, ed, vol (pubdate)
        
        document = Document(title=title, 
                            edition=ed, 
                            volume=vol, 
                            pub_date=pub_date)
        
        document.save()
        return document
    
    @staticmethod
    def get_by_id(short_id):
        docid = short_url.decode_url(short_id)
        return Document.objects.get(id=docid)
    
    def uid(self):
        """ Returns a formatted version of this person's unique id suitable 
            for use in URLs.
        """
        return short_url.encode_url(self.id)

    def add_author(self, person, role='Author'):
        """ Helper method to create (and save) an authorship relation for the 
            provided person.
        """
        
        # TODO need to support ordering between authors
        author = Author(person=person, document=self, role=role)
        author.save()
        
        return author
    
    def __unicode__(self):
        ret_val = self.title
        if self.subtitle:
            ret_val += ": " + self.subtitle
            
        return ret_val
    
class Author(models.Model):
    """ Defines an author or creator relationship between a person and a document.
    """
    
    person = models.ForeignKey(Person)
    document = models.ForeignKey(Document)
    role = models.CharField(max_length=16, default='Author')
    
    class Meta:
        order_with_respect_to = 'document'
        
#class PartOfRelationship(models.Model):
#    parent_document = models.ForeignKey(Document)
#    child_document = models.ForeignKey(Document)
#    reln_type = models.CharField(max_length=31)        # e.g., Volume, Chapter, Article, Journal Issue, Preface
#    reln_identifier = models.CharField(max_length=63)  # How this relationship is identified, e.g., Third Volume, vol 3
#    sequence_number = models.IntegerField()            # an Integer that determines the sequence of this part in relationship to the whole
#    
#     TODO define meta information, 
#         unique(parent_document, sequence_number)
#         sort by sequence number
#    
#class EditionOfRelationship(models.Model):
#    abstract_document = models.ForeignKey(Document)
#    edition = models.ForeignKey(Document)
#    edition_desc = models.CharField(max_length=31)
#    sequence_number = models.IntegerField()
#    


class DocumentInstance(models.Model):
    """ Maintains a reference to a concrete digital form of this document, for example, a
        PDF file or an HTML document.
    """
    document = models.ForeignKey(Document)
    uri = models.CharField(max_length=255)

    # description and features of this document (e.g., searchable, black and white) that 
    # might make it distinct from other instances 
    description = models.CharField(max_length=255)      
    
    # compute and store MD5.
#    


class FileRecord(models.Model):
    """ Maintains information about a files that have been and are being imported
    """
    INPROGRESS = "prog"
    UPLOADED = "load"
    FAILED = "fail"
    DELETED = "dele"
    
    STATUS_CHOICES = (
        (INPROGRESS, 'In Progress'),
        (UPLOADED, 'Uploaded'),
        (FAILED, 'Failed'),
        (DELETED, 'Deleted'),
    )
    
    base_path = models.CharField(max_length=255)
    relative_path = models.CharField(max_length=255)
    md5 = models.CharField(max_length=32)                       # MAKE UNIQUE, INDEX
    status = models.CharField(max_length=4, choices=STATUS_CHOICES, default=INPROGRESS)
    
    def _get_ident(self):
        if self.id:
            return short_url.encode_url(self.id)
        else:
            return None
            
    ident = property(_get_ident)
