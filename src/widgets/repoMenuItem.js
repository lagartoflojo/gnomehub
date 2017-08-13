const Lang = imports.lang;
const Util = imports.misc.util;
const Signals = imports.signals;
const PopupMenuItem = imports.ui.popupMenu.PopupMenuItem;
const PopupSubMenuMenuItem = imports.ui.popupMenu.PopupSubMenuMenuItem;

const Extension = imports.misc.extensionUtils.getCurrentExtension();
const PullRequestMenuItem = Extension.imports.widgets.pullRequestMenuItem.PullRequestMenuItem;

const RepoMenuItem = new Lang.Class({
  Name: 'GithubProjects.RepoMenuItem',
  Extends: PopupSubMenuMenuItem,

  _init: function (repo) {
    this.repo = repo;
    this.parent(repo.repoFullName, true);
    this.icon.icon_name = 'repo';
    this._pullRequestMenuItems = [];
    // this.status.text = "The text on the right side";
    this._initMenu();
  },

  _initMenu: function () {
    // Open repo in browser
    let openRepoMenuItem = new PopupMenuItem("Open repo in browser");
    openRepoMenuItem.connect('activate', () => {
      Util.spawnApp(['xdg-open', 'https://github.com/' + this.repo.repoFullName]);
    });
    this.menu.addMenuItem(openRepoMenuItem);
  },

  updatePullRequests: function (pullRequests) {
    this._pullRequestMenuItems.forEach(menuItem => menuItem.destroy());
    this._pullRequestMenuItems.splice(0);

    pullRequests.forEach(pr => {
      let prMenuItem = new PullRequestMenuItem(this.repo, pr);
      this.menu.addMenuItem(prMenuItem);
      this._pullRequestMenuItems.push(prMenuItem);
    });
  }
});

Signals.addSignalMethods(RepoMenuItem.prototype);
