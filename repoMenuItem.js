const Lang = imports.lang;
const Util = imports.misc.util;
const Signals = imports.signals;
const PopupMenuItem = imports.ui.popupMenu.PopupMenuItem;
const PopupImageMenuItem = imports.ui.popupMenu.PopupImageMenuItem;
const PopupSubMenuMenuItem = imports.ui.popupMenu.PopupSubMenuMenuItem;

const RepoMenuItem = new Lang.Class({
  Name: 'GithubProjects.RepoMenuItem',
  Extends: PopupSubMenuMenuItem,
  repo: null,

  _init: function (repo) {
    this.repo = repo;
    this.parent(repo.name, true);
    this.icon.icon_name = 'repo';
    // this.status.text = "The text on the right side";
    this._initMenu();
  },

  _initMenu: function () {
    var self = this;

    // Open repo in browser
    let openRepoMenuItem = new PopupMenuItem("Open repo in browser");
    openRepoMenuItem.actor.connect('button-press-event', function () {
      Util.spawnApp(['xdg-open', 'https://github.com/' + self.repo.name]);
    });
    this.menu.addMenuItem(openRepoMenuItem);

    //  Pull requests
    this.repo.pullRequests.forEach(function (pr) {
      // emblem-ok-symbolic
      // window-close-symbolic
      // content-loading-symbolic
      let prMenuItem = new PopupImageMenuItem(pr.title, 'emblem-ok-symbolic');
      prMenuItem.actor.connect('button-press-event', function () {
        Util.spawnApp([
          'xdg-open',
          'https://github.com/' + self.repo.name + '/pull/' + pr.number
        ]);
      });
      self.menu.addMenuItem(prMenuItem);
    });
  }
});
Signals.addSignalMethods(RepoMenuItem.prototype);
