YUI-Based Build System
======================

This directory provides a template for building JavaScript components based on
the [`YUI3`][yui3] library using the [`YUI Builder`][builder] and 
[`YUI Doc`][yuidoc] tools.

For complex web applications, it is highly desirable to write the JavaScript 
components in several smaller source files for ease of understanding and 
code organization and then to bundle these files into a single resource to 
be loaded onto the web page. The final application will include multiple 
components with a complex network of dependencies that need to be loaded onto
the page in the correct order. Code needs to be sandboxed into its own runtime
environment so that other applications that are loaded onto a page will not
intentionally or accidentally interfere with it. JavaScript source files need 
to be minimized and have log statements used during the debugging process 
removed in order to help reduce the size of files that a client must download.
On top of all this, we also need to support good software development practices
such as automated testing and API documentation generated from inline comments. 

The YUI Builder tool helps to automate this process: compiling individual 
source files into compents, tracking dependences, checking code style 
conventions, adding boiler plate code to for sandboxing, registering components 
with the dynamic package loading utilities and more. 

This file descibes the application of the YUI build system to support the IDCH
development process. 


Getting Started
---------------

To get started you will need to obtain a copy of the YUI Builder and YUI Doc 
tools and place them in a location that can be used across your projects.

The YUI framework is designed as a comprehensive system where all components
are developed in the context of a single product release cycle. Reflecting 
this basic arrangment the YUI development process organizes its code-base 
into a top-level directory with the builder, yui2 and yui3 projects in 
sub-directories of this main workspace directory.

At IDCH, we build components in the context of many different projects and 
products. Each of these will have its own release cycle and distribution needs. 
Hence, we recommend deploying the core build utilities in a common location to 
be accessed by accross different projects regardless of how those projects are
organized into working directories. 

To set up the main YUI tools directory, download both the YUI Builder and
[`YUI JavaScript Documenation Tool`][yuidoc] into a central location 
(`~/.yui` in this case). 

    $ mkdir ~/.yui
    $ cd ~/.yui
    $ git clone https://github.com/yui/yuibuilder.git
    $ git clone https://github.com/yui/yuidoc.git

Project Directory Structure
---------------------------

The JavaScript Ant tools can be dropped into the directory structure of a 
regular IDCH project (a Java or Python web application). The recommended 
directory structure for a project is for the main project directory to contain 
a sub-directory called `js`. This directory corresponds to the `src` directory 
used in the YUI3 project setup. Since `src` is typically used for Java source 
files in IDCH project, `js` is prefered for clarity.

Within the top-level `js` directory each component is created in its own
sub-directory. These component directories will contain the build scripts and 
associated configuration files as well as directories for the JavaScript source 
files and resources that implement the component (as described below).

After copying this template directory into your project, be sure to update 
the package.json metadata that describes your project. As with all projects, 
there should be a `README.md`, `LICENSE.md` and a `HISTORY.md` in the main 
project directory. This are are not included in this template structure to 
avoid accidentally overwriting existing files when you copy the template 
directory into an existing project. If these files don't exist, however, 
you should create them.

Build Process
-------------

TODO How do we compile things and where does the output code go?

TODO Items
==========

* Create main `build-js.xml` script to control js build process from the 
  main Ant build tools.
* Document the build process
* Document distribution to a packaged web-site.
* Document unit testing tools and processes
* Document YUI Doc tools
* document index.js and package.json
* figure out how to replace the @VERSION@ tags in the compiled source.

[yui3]: http://yuilibrary.com/
[builder]: http://yuilibrary.com/projects/builder/
[yuidoc]: http://yuilibrary.com/projects/yuidoc

