const St = imports.gi.St;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const PopupSubMenuMenuItem = imports.ui.popupMenu.PopupSubMenuMenuItem;
const Lang = imports.lang;
const Util = imports.misc.util;

const Extension = imports.misc.extensionUtils.getCurrentExtension();
const GithubFetcher = Extension.imports.githubFetcher.GithubFetcher;
const AddRepoDialog = Extension.imports.addRepoDialog.AddRepoDialog;
const RepoMenuItem = Extension.imports.repoMenuItem.RepoMenuItem;

const Icon = 'octoface';

let github = new GithubFetcher();

const GithubProjects = new Lang.Class({
  Name: 'GithubProjects.GithubProjects',
  Extends: PanelMenu.Button,

  _init: function () {
    this.parent(0.0, "Github Projects", false);

    let icon = new St.Icon({
      icon_name: Icon,
      style_class: 'system-status-icon'
    });

    this.actor.add_actor(icon);

    this._initMenu();
    this._startGithubSync();
  },

  _initMenu: function () {
    let addRepoMenuItem = new PopupMenu.PopupMenuItem("Add repository", {
      reactive: true
    });
    addRepoMenuItem.actor.connect('button-press-event', Lang.bind(this, this._showAddRepoDialog));
    this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
    this.menu.addMenuItem(addRepoMenuItem);
  },

  _startGithubSync: function () {
    var self = this;
    let prs = github.getRepos();

    prs.forEach(function (pr) {
      self.menu.addMenuItem(new RepoMenuItem(pr), 0);
    });
  },

  _showAddRepoDialog: function () {
    let dialog = new AddRepoDialog(Lang.bind(this, function(newRepo) {
      log(newRepo);
    }));
    dialog.open(null);
  }
});

let _githubProjects;

function init(extensionMeta) {
  let theme = imports.gi.Gtk.IconTheme.get_default();
  theme.append_search_path(extensionMeta.path + "/icons");
}

function enable() {
  _githubProjects = new GithubProjects();
  if(_githubProjects) {
    Main.panel.addToStatusArea('github-projects', _githubProjects);
  }
}

function disable() {
  if(_githubProjects) {
    _githubProjects.destroy();
    _githubProjects = null;
  }
}
