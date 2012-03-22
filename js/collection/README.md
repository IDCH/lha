YUI Component Template Directory
================================

This directory provides a template for building an individual JavaScript 
component based on the [`YUI3`][yui3] library using the [`YUI Builder`][builder]
and [`YUI Doc`][yuidoc] tools. For more details about how to organize the JS
components of a project into the top-level project codebase, see the main
README file at `../../JS_README.md`.

Component Setup
---------------

A JavaScript component represents a major unit of functionality (perhaps with 
multiple classes) that accomplishes a specific well-defined task. Components 
can frequently be used between many different applications, although they may
be developed within the scope of a specific product or project.

Components should be organized into sub-directories under the project's main 
scripts directory: `<project_home>/js/component`. When compiled, the generated
script files will be placed in the project's main build directory under:
`<project_home>/build/js/component`.

To start working with a new component, simply copy this template directory 
into your `js` directory and give it a name that matches your component, 
for example, `idch-tzivi` (we recommend adding a project prefix to your 
component names to help distinguish them for other people's components). 

**build tools** To set up the build you'll need to create `build.properties` 
file. To ensure that project specific configurations aren't checked into 
source control, the template directory j
doOnce you've done this, you'll want to edit the 
`build.properties` file (copy `build.properties.template` to 
`build.properties` to reflect the specifics of your new component. 

**source files** The Javascript source files that will form the core of your
applications are stored in the `js` directory. These files will be merged as
part of the build process in order to form a single `.js` file for 
distribution and the appropriate boiler-plate code will be added to register 
components with the YUI loader. Template files from the YUI project are 
provided as examples.

**component documentation** Begin by editing this file to provide a 
description of the component you are working with. You should also edit the
`HISTORY.md` file to reflect changes to this component as it tracks with the 
version history of the project. If this component's license differs from that
of its parent project, or if you need to specify additional notes, credits or
acknowledgments, do this in the `LICENSE.md` file.

Directory Structure
-------------------

A detailed discussion of how this directory is organized follows:

* **build_temp** A directory that will hold the result of local compilations 
  (that is, the result of calling `ant`)

* **docs** Where the generated API docs will go.

* **css** For CSS components, this should hold the various CSS source files. 
  This must not be present unless you are not implementing a CSS component.

* **js** For CSS components, this should hold the various JavaScript source 
  files. This may hold multiple files that will be appended when the module 
  is built. These files can be arranged into sub-directories for convenience
  if needed. See the YUI3 source code for examples (the `app` component is
  suitably complex).

* **meta** Holds an app.json component descriptor that documents the meta
  information abut the structure and dependencies of this component.

* **tests** Holds JavaScript test scripts.

* **docs.sh** A shell script to run the yuidocs processor.

* **build.xml** The Ant build file that controls compiles the module. This 
  file comes in two different formats. In the simple case, there is a single 
  `build.xml`. In cases where there are multiple sub-components, there is a 
  main `build.xml` file that calls the `build-component.xml` files for the 
  different sub-components. These files are distributed in the template 
  directory as `build-component.xml` and `build-all-modules.xml`. The 
  appropriate version of the file should be renamed `build.xml`.

* **build.properties** Supplies the configuration properties for the build 
  system. For a project that contains no sub-components, there should be 
  exactly one `build.xml` file and one `build.properties` file. Otherwise, 
  there should be no `build.properties` file and one `build-component.properties` 
  file for each corresponding `build-component.xml` file. 
  
  Properties files may be specific to individual development environments and 
  hence should not be checked into source control. Instead, defualt properties 
  should be set in a build.properties.template flile. This file should be 
  copied and edited as needed when a developer sets up his or her working 
  environment. A .gitignore file has been provided in the example directory 
  that will prevent .property files from being checked into source control by 
  default.
   
* **README.md** A description of the component and its sub-components. Replace 
  this file with something that describes your component.

* **HISTORY.md** A summary of the major changes to the component made during
  each release cycle of the product.

* **LICENSE.md** If the license information for this component differs from
  the license for the main project, or if special notes or acknowledgements
  are needed, they should be placed in a LICENSE.md file.

RUNNING UNIT TESTS
------------------
TODO Document this

API DOCUMENTATION
-----------------
TODO Document this

TODO Items
==========

* Document unit testing tools and processes
* Document YUI Doc tools

[yui3]: http://yuilibrary.com/
[builder]: http://yuilibrary.com/projects/builder/
[yuidoc]: http://yuilibrary.com/projects/yuidoc

