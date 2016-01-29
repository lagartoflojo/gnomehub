const St = imports.gi.St;
const Main = imports.ui.main;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const PopupSubMenuMenuItem = imports.ui.popupMenu.PopupSubMenuMenuItem;
const Lang = imports.lang;
const Util = imports.misc.util;

const Extension = imports.misc.extensionUtils.getCurrentExtension();
const GithubFetcher = Extension.imports.githubFetcher.GithubFetcher;
const RepoMenuItem = Extension.imports.repoMenuItem.RepoMenuItem;
const Convenience = Extension.imports.convenience;
const Timing = Extension.imports.timing;
let metadata = Extension.metadata;

const SETTINGS_GITHUB_USERNAME = 'github-username';
const SETTINGS_GITHUB_PASSWORD = 'github-password';
const SETTINGS_REPOSITORIES = 'repositories';

const Icon = 'octoface';

const GithubProjects = new Lang.Class({
  Name: 'GithubProjects',
  Extends: PanelMenu.Button,
  _github: null,
  _repoMenuItems: [],

  _init: function() {
    this.parent(0.0, "Github Projects");
    this._settings = Convenience.getSettings();
    this._settings.connect('changed::' + SETTINGS_REPOSITORIES,
      Lang.bind(this, this._initRepos));

    this._github = new GithubFetcher({
      username: this._settings.get_string(SETTINGS_GITHUB_USERNAME),
      password: this._settings.get_string(SETTINGS_GITHUB_PASSWORD)
    });

    let icon = new St.Icon({
      icon_name: Icon,
      style_class: 'system-status-icon'
    });

    this.actor.add_actor(icon);

    this._initMenu();
    this._initRepos();
    this._interval = Timing.setInterval(Lang.bind(this, this._updateRepos), 30000);
  },

  _initMenu: function () {
    let showSettingsMenuItem = new PopupMenu.PopupMenuItem("Add repository");
    showSettingsMenuItem.actor.connect('button-press-event',
      Lang.bind(this, this._showSettings));
    this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
    this.menu.addMenuItem(showSettingsMenuItem);
  },

  _getRepoNames: function () {
    return this._settings.get_strv(SETTINGS_REPOSITORIES);
  },

  _initRepos: function () {
    if (this._getRepoNames().length) {
      this.loading = new imports.ui.popupMenu.PopupMenuItem('Loading repos...');
      this.loading.setSensitive(false);
      this.menu.addMenuItem(this.loading, 0);

      this._updateRepos();
    }
  },

  _stopLoading: function () {
    if(this.loading) {
      this.loading.destroy();
      this.loading = null;
    }
  },

  _updateRepos: function () {
    this._github.getRepos(this._getRepoNames()).then(repos => {
      this._repoMenuItems.forEach(menuItem => menuItem.destroy());
      this._repoMenuItems.splice(0); // Clear the array

      repos.forEach(repo => {
        let menuItem = new RepoMenuItem(repo);
        this._repoMenuItems.push(menuItem);
        this.menu.addMenuItem(menuItem, 0);
      });
    }).catch(error => {
      // No internet: (try to reload data when internet is back)
      // {"message":{},"headers":{},"url":"https://api.github.com/repos/lagartoflojo/minijq/pulls","status":2,"statusText":"Cannot resolve hostname","ok":false}
      // Not found / no permissions:
      // {"message":{},"headers":{},"url":"https://api.github.com/repos/asdsadasd/adaerear/pulls","status":404,"statusText":"Not Found","ok":false}

      log('ERROR (json): ' + JSON.stringify(error))
      log('ERROR: ' + error)
    }).finally(() => {
      this._stopLoading();
    });
  },

  _showSettings: function() {
    Util.spawn(['gnome-shell-extension-prefs', metadata.uuid]);
  },

  destroy: function () {
    Timing.clearInterval(this._interval);
    this.parent();

    // Menu items are destroyed automatically when the extension is disabled,
    // but they are not cleared from this array, so we must do it manually.
    this._repoMenuItems.splice(0);
  }
});

let _githubProjects;

function init(extensionMeta) {
  let theme = imports.gi.Gtk.IconTheme.get_default();
  theme.append_search_path(extensionMeta.path + '/icons');
}

function enable() {
  log('Enabling Github Projects...');
  _githubProjects = new GithubProjects();
  Main.panel.addToStatusArea('github-projects', _githubProjects, 0, 'right');
}

function disable() {
  if (_githubProjects) {
    log('Disabling Github Projects...');
    _githubProjects.destroy();
    _githubProjects = null;
  }
}
