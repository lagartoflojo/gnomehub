
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

let gf = new GithubFetcher();

const GithubProjects = new Lang.Class({
  Name: 'GithubProjects.GithubProjects',
  Extends: PanelMenu.Button,
  text: gf.text,

  _init: function () {
    this.parent(0.0, "Github Projects", false);

    let icon = new St.Icon({
      icon_name: 'system-run-symbolic',
      style_class: 'system-status-icon'
    });

    this.actor.add_actor(icon);

    // Repo sub menu
    this._repoSubMenu = new PopupSubMenuMenuItem('SUSE/happy-customer', false);
    this._openRepoMenuItem = new PopupMenu.PopupMenuItem("Open repo in browser", {
      reactive: true
    });
    this._openRepoMenuItem.actor.connect('button-press-event', function () {
      Util.spawnApp(['xdg-open', 'https://github.com/SUSE/happy-customer']);
    });
    this._prMenuItem = new PopupMenu.PopupMenuItem("add more syslog objects for easy access to object history...", {
      reactive: true
    });
    this._prMenuItem.actor.connect('button-press-event', function () {
      Util.spawnApp(['xdg-open', 'https://github.com/SUSE/happy-customer/pull/2461']);
    });

    this._repoSubMenu.menu.addMenuItem(this._openRepoMenuItem);
    this._repoSubMenu.menu.addMenuItem(this._prMenuItem);
    this.menu.addMenuItem(this._repoSubMenu);

    // Add repo menu item
    this._addRepoMenuItem = new PopupMenu.PopupMenuItem("Add repository", {
      reactive: true
    });
    this._addRepoMenuItem.actor.connect('button-press-event', Lang.bind(this, this._showAddRepoDialog));
    this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
    this.menu.addMenuItem(this._addRepoMenuItem);
  },

  _showAddRepoDialog: function () {
    let dialog = new AddRepoDialog(Lang.bind(this, function(newRepo) {
      log(newRepo);
    }));
    dialog.open(null);
  }
});

let _githubProjects;

function init() {
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
