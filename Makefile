# Retrieve the UUID from ``metadata.json``
UUID = $(shell grep -E '^[ ]*"uuid":' ./metadata.json | sed 's@^[ ]*"uuid":[ ]*"\(.\+\)",[ ]*@\1@')
MSGSRC = $(wildcard locale/*/*/*.po)

ifeq ($(strip $(DESTDIR)),)
INSTALLBASE = $(HOME)/.local/share/gnome-shell/extensions
else
INSTALLBASE = $(DESTDIR)/usr/share/gnome-shell/extensions
endif
INSTALLNAME = $(UUID)

$(info UUID is "$(UUID)")

.PHONY: all _build clean extension install install-local zip-file

all: extension

clean:
	rm -f ./schemas/gschemas.compiled
	rm -f ./locale/*/*/*.mo
	-rm -fR ./_build
	rm -f gnomehub@hschmidt.suse.com.zip

extension: ./schemas/gschemas.compiled $(MSGSRC:.po=.mo)

./schemas/gschemas.compiled: ./schemas/org.gnome.shell.extensions.github-projects.gschema.xml
	glib-compile-schemas ./schemas/

./locale/%.mo: ./locale/%.po
	msgfmt -c $< -o $@

potfile:
	xgettext -L JavaScript -k_ -kN_ --from-code=UTF-8 -o locale/gnomehub.pot src/*.js

install: install-local

install-local: _build
	rm -rf $(INSTALLBASE)/$(INSTALLNAME)
	mkdir -p $(INSTALLBASE)/$(INSTALLNAME)
	cp -r ./_build/* $(INSTALLBASE)/$(INSTALLNAME)/

zip-file: _build
	cd _build ; \
	zip -qr "$(UUID)$(VSTRING).zip" .
	mv _build/$(UUID)$(VSTRING).zip ./

_build: all
	-rm -fR ./_build
	mkdir -p _build
	cp -r LICENSE metadata.json src/* icons _build
	mkdir -p _build/schemas
	cp schemas/*.xml _build/schemas/
	cp schemas/gschemas.compiled _build/schemas/
	cp -r locale _build/
