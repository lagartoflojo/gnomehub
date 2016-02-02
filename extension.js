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
  _repoMenuItems: {},

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
      this._setStatusMessage('Loading repositories...');
      this._updateRepos();
    }
  },

  _updateRepos: function () {
    let repoNames = this._getRepoNames();

    this._github.getRepos(repoNames).then(repos => {
      this._clearStatusMessage();

      let reposByName = {};
      repos.forEach((repo) => reposByName[repo.repoFullName] = repo);

      repoNames.reverse().forEach((repoName) => this._addRepoMenuItem(reposByName[repoName]));
    }).catch(Lang.bind(this, this._handleError));
  },

  _addRepoMenuItem: function (repo) {
    let repoMenuItem = this._repoMenuItems[repo.repoFullName];
    if(!repoMenuItem) {
      repoMenuItem = new RepoMenuItem(repo);
      this.menu.addMenuItem(repoMenuItem, 0);
      this._repoMenuItems[repo.repoFullName] = repoMenuItem;
    }

    repoMenuItem.updatePullRequests(repo.pullRequests);
  }, // TODO Remove removed repos

  _handleError: function (error) {
    // No internet: (try to reload data when internet is back)
    // {"message":{},"headers":{},"url":"https://api.github.com/repos/lagartoflojo/minijq/pulls","status":2,"statusText":"Cannot resolve hostname","ok":false}
    // Not found / no permissions:
    // {"message":{},"headers":{},"url":"https://api.github.com/repos/asdsadasd/adaerear/pulls","status":404,"statusText":"Not Found","ok":false}

    log('ERROR (json): ' + JSON.stringify(error))
    log('ERROR: ' + error)

    if (error.status === 2 || error.status === 8) {
      this._setStatusMessage('No internet connection');
    }
    else if (error.status === 403) {
      this._setStatusMessage('Github API rate limit exceeded.\nPlease login in extension settings.');
    }
    else {
      this._setStatusMessage(error.statusText);
    }
  },

  _setStatusMessage: function (message) {
    this._clearStatusMessage();
    this._statusMessage = new imports.ui.popupMenu.PopupMenuItem(message);
    this._statusMessage.setSensitive(false);
    this.menu.addMenuItem(this._statusMessage, 0);
  },

  _clearStatusMessage: function () {
    if(this._statusMessage) {
      this._statusMessage.destroy();
      this._statusMessage = null;
    }
  },

  _showSettings: function() {
    Util.spawn(['gnome-shell-extension-prefs', metadata.uuid]);
  },

  destroy: function () {
    Timing.clearInterval(this._interval);
    this.parent();
    this._repoMenuItems = {};
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
