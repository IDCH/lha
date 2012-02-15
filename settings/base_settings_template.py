# We split our setting configuration into two separate files. common.py 
# contains settings for a project that are common across different deployments.
# common.py will be checked into source control and should not contain 
# sensitive values such as database passwords or the CSRF secret. It should
# also not contain context specific values su
from common import * 

# Common settings that are likely to need to be overridden. Uncomment these
# to change the project defaults.
#
# DEBUG = True
# TEMPLATE_DEBUG = DEBUG
# TIME_ZONE = 'America/Chicago'
# LANGUAGE_CODE = 'en-us'
# USE_I18N = True
# USE_L10N = True
#
# Admins and Managers
# ADMINS = (
#    ('Neal Audenaert', 'neal@idch.org'),
# )

# MANAGERS = ADMINS

# DATABASE CONFIGURATION
# ---------------------------------------------------------------------
# Below are examples of several typical database configurations. 
# For development purposes, SQLLite is encouraged. For deployment
# 
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.',
#         # Add 'postgresql_psycopg2', 'postgresql', 'mysql', 'sqlite3' or 'oracle'.
#         'NAME': '',                      # Or path to database file if using sqlite3.
#         'USER': '',                      # Not used with sqlite3.
#         'PASSWORD': '',                  # Not used with sqlite3.
#         'HOST': '',                      # Set to empty string for localhost. Not used with sqlite3.
#         'PORT': '',                      # Set to empty string for default. Not used with sqlite3.
#     }
# }

# MySQL Example
# DATABASES = {
#     'default': {
#         'ENGINE': 'django.db.backends.mysql',
#         'NAME': 'lha',
#         'USER': 'lha_admin',
#         'PASSWORD': 'changeme',
#     }
# }

# PostgreSQL Example
# This depends on the psycopg2 module. To get it configured, you'll need
# some additional libraries. On Debian (or other systems with apt) the 
# following should work: sudo apt-get install libpq-dev python-dev
#
# Then install psycopg2 as normal: pip install psycopg2
#
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'lha',
        'USER': 'lha_admin',
        'PASSWORD': 'changeme',
    }
}

# Absolute filesystem path to the directory that will hold user-uploaded files.
# Example: "/home/media/media.lawrence.com/"
MEDIA_ROOT = ''

# URL that handles the media served from MEDIA_ROOT. Make sure to use a
# trailing slash if there is a path component (optional in other cases).
# Examples: "http://media.lawrence.com", "http://example.com/media/"
MEDIA_URL = ''

# URL prefix for admin media -- CSS, JavaScript and images. Make sure to use a
# trailing slash.
# Examples: "http://foo.com/media/", "/media/".
ADMIN_MEDIA_PREFIX = '/media/'

# Make this unique, and don't share it with anybody.
SECRET_KEY = '@lm&3_lv)=q4x)5mlkeo9kd1*t=f%#9s5gmpeeqem3j6mm7x_-'

ROOT_URLCONF = 'lha.urls'
