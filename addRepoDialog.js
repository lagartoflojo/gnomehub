const Clutter = imports.gi.Clutter;
const Lang = imports.lang;
const ModalDialog = imports.ui.modalDialog;
const Signals = imports.signals;
const St = imports.gi.St;

const AddRepoDialog = new Lang.Class({
  Name: 'AddRepoDialog',
  Extends: ModalDialog.ModalDialog,

  _init: function(callback) {
    this.callback = callback;
    this.parent({
      styleClass: 'prompt-dialog'
    });

    let label = new St.Label({
      style_class: 'edit-dialog-label',
      text: 'Repository (ie. wycats/jquery-offline):'
    });

    this.contentLayout.add(label, {
      y_align: St.Align.START
    });

    let entry = new St.Entry({
      style_class: 'edit-dialog-entry'
    });
    entry.label_actor = label;

    this._entryText = entry.clutter_text;
    this.contentLayout.add(entry, {
      y_align: St.Align.START
    });
    this.setInitialKeyFocus(this._entryText);

    let buttons = [{
      label: 'Cancel',
      action: Lang.bind(this, this._onCancelButton),
      key: Clutter.Escape
    },
    {
      label: 'Add repo',
      action: Lang.bind(this, this._onOkButton)
    }];

    this.setButtons(buttons);

    this._entryText.connect('key-press-event', Lang.bind(this, function(o, e) {
      let symbol = e.get_key_symbol();
      if (symbol == Clutter.Return || symbol == Clutter.KP_Enter) {
        this._onOkButton();
      }
    }));
  },

  close: function() {
    this.parent();
  },

  _onCancelButton: function() {
    this.close();
  },

  _onOkButton: function() {
    this.callback(this._entryText.get_text());
    this.close();
  },

  open: function(initialText) {
    if (initialText === null) {
      this._entryText.set_text('');
    }
    else {
      this._entryText.set_text(initialText);
    }

    this.parent();
  }
});
Signals.addSignalMethods(AddRepoDialog.prototype);

/* vi: set expandtab tabstop=4 shiftwidth=4: */
