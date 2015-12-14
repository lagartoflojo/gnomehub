const Lang = imports.lang;
const Util = imports.misc.util;
const Signals = imports.signals;
const PopupImageMenuItem = imports.ui.popupMenu.PopupImageMenuItem;

const PullRequestMenuItem = new Lang.Class({
  Name: 'GithubProjects.PullRequestMenuItem',
  Extends: PopupImageMenuItem,

  _init: function (repo, pullRequest) {
    if (pullRequest.title.length > 64) {
      pullRequest.title = pullRequest.title.substr(0, 64) + "...";
    }

    // emblem-ok-symbolic
    // window-close-symbolic
    // content-loading-symbolic
    this.parent(pullRequest.title, 'content-loading-symbolic');

    this.connect('activate', function () {
      Util.spawnApp([
        'xdg-open',
        'https://github.com/' + repo.name + '/pull/' + pullRequest.number
      ]);
    });
  }
});

Signals.addSignalMethods(PullRequestMenuItem.prototype);
