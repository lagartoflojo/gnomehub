const Lang = imports.lang;
const Util = imports.misc.util;
const Signals = imports.signals;
const PopupImageMenuItem = imports.ui.popupMenu.PopupImageMenuItem;

const PullRequestMenuItem = new Lang.Class({
  Name: 'GithubProjects.PullRequestMenuItem',
  Extends: PopupImageMenuItem,

  statusIcons: {
    pending: 'content-loading-symbolic',
    failure: 'window-close-symbolic',
    success: 'emblem-ok-symbolic',
    null: null
  },

  _init: function (repo, pullRequest) {
    if (pullRequest.title.length > 64) {
      pullRequest.title = pullRequest.title.substr(0, 64) + "...";
    }

    this.parent(pullRequest.title, this.statusIcons[pullRequest.status]);

    this.connect('activate', function () {
      Util.spawnApp([
        'xdg-open',
        'https://github.com/' + repo.repo_full_name + '/pull/' + pullRequest.number
      ]);
    });
  }
});

Signals.addSignalMethods(PullRequestMenuItem.prototype);
