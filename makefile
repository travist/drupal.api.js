# To run this makefile, you must have all the necessary tools installed.
#
# To install all the necessary tools, simply run the following...
#
#    sudo make -B tools
#

# Create the list of files
lintfiles = src/drupal.api.js\
	src/drupal.entity.js\
	src/drupal.system.js\
	src/drupal.node.js\
	src/drupal.user.js

files =	lib/json2.js\
	src/drupal.api.js\
	src/drupal.entity.js\
	src/drupal.system.js\
	src/drupal.node.js\
	src/drupal.user.js

.DEFAULT_GOAL := all

all: jslint js jsdoc

# Perform a jsLint on all the files.
jslint: ${lintfiles}
	gjslint $^

# Create an aggregated js file and a compressed js file.
js: ${files}
	@echo "Generating aggregated bin/drupal.api.js file"
	@cat > bin/drupal.api.js $^
	@echo "Generating compressed bin/drupal.api.compressed.js file"
	@java -jar tools/compiler.jar --js bin/drupal.api.js --js_output_file bin/drupal.api.compressed.js

# Create the documentation from source code.
jsdoc: ${files}
	@echo "Generating documetation."
	@java -jar tools/jsdoc-toolkit/jsrun.jar tools/jsdoc-toolkit/app/run.js -a -t=tools/jsdoc-toolkit/templates/jsdoc -d=doc $^

# Fix the js style on all the files.
fixjsstyle: ${files}
	fixjsstyle $^

# Install the necessary tools.
tools:
	apt-get install python-setuptools
	apt-get install unzip
	wget http://closure-compiler.googlecode.com/files/compiler-latest.zip -P tools
	unzip tools/compiler-latest.zip -d tools
	rm tools/compiler-latest.zip tools/COPYING tools/README
	easy_install http://closure-linter.googlecode.com/files/closure_linter-latest.tar.gz
	wget http://jsdoc-toolkit.googlecode.com/files/jsdoc_toolkit-2.4.0.zip -P tools
	unzip tools/jsdoc_toolkit-2.4.0.zip -d tools
	mv tools/jsdoc_toolkit-2.4.0/jsdoc-toolkit tools/jsdoc-toolkit
	rm -rd tools/jsdoc_toolkit-2.4.0
	rm tools/jsdoc_toolkit-2.4.0.zip
