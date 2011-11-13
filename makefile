# To run this makefile, you must do the following.
#
# 1.)  Download http://closure-compiler.googlecode.com/files/compiler-latest.zip
#      and place compiler.jar within the tools directory.
#
# 2.)  Install closure-linter tool at by....
#
#        a.) Install easy_install by running...
#
#               sudo apt-get install python-setuptools
#
#        b.) Install the Google Closure linter tool by following...
#
#               http://code.google.com/closure/utilities/docs/linter_howto.html
#
# 3.)  Download the JSDoc toolkit found at
#      http://code.google.com/p/jsdoc-toolkit and place the jsdoc-toolkit
#      directory within the tools directory.
#

# Create the list of files
files =	js/src/allplayers.api.js\
	js/src/allplayers.entity.js\
	js/src/allplayers.date.js\
	js/src/allplayers.event.js\
	js/src/allplayers.group.js\
	js/src/allplayers.location.js\
	js/src/allplayers.calendar.js

.DEFAULT_GOAL := all

all: jslint js jsdoc

# Perform a jsLint on all the files.
jslint: ${files}
	gjslint $^

# Create an aggregated js file and a compressed js file.
js: ${files}
	@echo "Generating aggregated js/allplayers.js file"
	@cat > js/allplayers.js $^
	@echo "Generating compressed js/allplayers.compressed file"
	@java -jar tools/compiler.jar --js js/allplayers.js --js_output_file js/allplayers.compressed.js

# Create the documentation from source code.
jsdoc: ${files}
	@echo "Generating documetation."
	@java -jar tools/jsdoc-toolkit/jsrun.jar tools/jsdoc-toolkit/app/run.js -a -t=tools/jsdoc-toolkit/templates/jsdoc -d=doc $^

# Fix the js style on all the files.
fixjsstyle: ${files}
	fixjsstyle $^
