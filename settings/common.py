import logging

# This file contains settings that are common across different configurations
# and deployments of this project along with more or less sensible defaults
# for some values that may need to be overridden for specific configurations.
#
# Note that this file is checked into source control, so it is important 
# that it not contain confidential information such as database passwords 
# and/or secret keys.

DEBUG = True
TEMPLATE_DEBUG = DEBUG
SITE_ID = 1
TIME_ZONE = 'America/Chicago'
LANGUAGE_CODE = 'en-us'
USE_I18N = True
USE_L10N = True
ROOT_URLCONF='urls'

# Admins and Managers
# A tuple that lists people who get code error notifications. When DEBUG=False
# and a view raises an exception, Django will email these people with the full 
# exception information. Each member of the tuple should be a tuple of 
# (Full name, email address).
ADMINS = (
    ('Neal Audenaert', 'neal@idch.org'),
)

MANAGERS = ADMINS

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
)

INSTALLED_APPS = (
    'collection',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.sites',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    # Uncomment the next line to enable the admin:
    # 'django.contrib.admin',
    # Uncomment the next line to enable admin documentation:
    # 'django.contrib.admindocs',
)


# Basic Logging Configuration
LOG_DATE_FORMAT = '%d %b %Y %H:%M:%S'
LOG_FORMATTER = logging.Formatter(
            u'%(asctime)s | %(levelname)-7s | %(name)s | %(message)s',
                datefmt=LOG_DATE_FORMAT)
    
CONSOLE_HANDLER = logging.StreamHandler() # defaults to stderr
CONSOLE_HANDLER.setFormatter(LOG_FORMATTER)
CONSOLE_HANDLER.setLevel(logging.DEBUG)
