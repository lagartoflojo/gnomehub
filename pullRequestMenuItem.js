const Lang = imports.lang;
const Util = imports.misc.util;
const Signals = imports.signals;
const St = imports.gi.St;
const PopupBaseMenuItem = imports.ui.popupMenu.PopupBaseMenuItem;

const PullRequestMenuItem = new Lang.Class({
  Name: 'GithubProjects.PullRequestMenuItem',
  Extends: PopupBaseMenuItem,

  statusIcons: {
    pending: 'content-loading-symbolic',
    failure: 'window-close-symbolic',
    success: 'emblem-ok-symbolic',
    null: null
  },

  _init: function (repo, pullRequest) {
    this.parent();

    let title = pullRequest.title;
    if (title.length > 64) {
      title = title.substr(0, 64) + "...";
    }

    this.titleLabel = new St.Label({ text: title });
    this.numberLabel = new St.Label({ text: '#' + pullRequest.number });
    this.numberLabel.set_style('color: #888');
    this.actor.add_child(this.numberLabel);
    this.actor.add_child(this.titleLabel);
    this.actor.label_actor = this.titleLabel;

    this._icon = new St.Icon({ style_class: 'popup-menu-icon' });
    this.actor.add_child(this._icon, { align: St.Align.END });

    // this.setIcon(iconName);

    this.connect('activate', function () {
      Util.spawnApp([
        'xdg-open',
        'https://github.com/' + repo.repoFullName + '/pull/' + pullRequest.number
      ]);
    });
  },

  setIcon: function(name) {
    this._icon.icon_name = name;
  }
});

Signals.addSignalMethods(PullRequestMenuItem.prototype);
