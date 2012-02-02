# Django settings for lha project.
import sys
import logging
from path import path

DEBUG = False
TEMPLATE_DEBUG = DEBUG

ADMINS = (
    ('Neal Audenaert', 'neal@idch.org'),
)

MANAGERS = ADMINS

# Default paramters for the time zone, language code, etc.
# These can be overwritten in a deployment specific file.
TIME_ZONE = 'America/Chicago'
LANGUAGE_CODE = 'en-us'
SITE_ID = 1
USE_I18N = True
USE_L10N = True

# Configure the main directories for this project
SITE_ROOT = PROJECT_ROOT.dirname()
SITE_URL = "http://lha.idch.org/"

PROJECT_ROOT = path(__file__).abspath().dirname().dirname()
MEDIA_ROOT = PROJECT_ROOT / 'media'
MEDIA_URL = SITE_URL + '/media/'
ADMIN_MEDIA_PREFIX = '/media/'

ROOT_URLCONF = 'lha.urls'

# Add apps/ and lib/ to the Python path
sys.path.append(SITE_ROOT)
sys.path.append(PROJECT_ROOT / 'apps')
sys.path.append(PROJECT_ROOT / 'libs')

# List of callables that know how to import templates from various sources.
TEMPLATE_LOADERS = (
    'django.template.loaders.filesystem.Loader',
    'django.template.loaders.app_directories.Loader',
#     'django.template.loaders.eggs.Loader',
)

MIDDLEWARE_CLASSES = (
    'django.middleware.common.CommonMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
)


TEMPLATE_DIRS = (
    # Put strings here, like "/home/html/django_templates" or "C:/www/django/templates".
    # Always use forward slashes, even on Windows.
    # Don't forget to use absolute paths, not relative paths.
    unicode(PROJECT_ROOT / 'templates'),
)


INSTALLED_APPS = (
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    # Uncomment the next line to enable the admin:
    # 'django.contrib.admin',
    # Uncomment the next line to enable admin documentation:
    # 'django.contrib.admindocs',
)

# CONFIGURE BASIC LOGGING
LOG_DATE_FORMAT = '%d %b %Y %H:%M:%S'
LOG_FORMATTER = logging.Formatter(
            u'%(asctime)s | %(levelname)-7s | %(name)s | %(message)s',
                datefmt=LOG_DATE_FORMAT)
    
CONSOLE_HANDLER = logging.StreamHandler() # defaults to stderr
CONSOLE_HANDLER.setFormatter(LOG_FORMATTER)
CONSOLE_HANDLER.setLevel(logging.DEBUG)
