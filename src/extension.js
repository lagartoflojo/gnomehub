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
const Convenience = Extension.imports.lib.convenience;
const Timing = Extension.imports.lib.timing;
let metadata = Extension.metadata;

const Gettext = imports.gettext.domain('gnomehub');
const _ = Gettext.gettext;

const SETTINGS_GITHUB_USERNAME = 'github-username';
const SETTINGS_GITHUB_PASSWORD = 'github-password';
const SETTINGS_REPOSITORIES = 'repositories';

const Icon = 'git';

const GithubProjects = new Lang.Class({
  Name: 'GithubProjects',
  Extends: PanelMenu.Button,

  _init: function() {
    this.parent(0.0, "GitHub Projects");
    this._settings = Convenience.getSettings();
    this._settings.connect('changed::' + SETTINGS_REPOSITORIES,
      Lang.bind(this, this._initRepos));

    this._settings.connect('changed::' + SETTINGS_GITHUB_USERNAME,
      Lang.bind(this, this._initRepos));

    this._settings.connect('changed::' + SETTINGS_GITHUB_PASSWORD,
      Lang.bind(this, this._initRepos));

    let icon = new St.Icon({
      icon_name: Icon,
      style_class: 'system-status-icon'
    });

    this.actor.add_actor(icon);

    this._repoMenuItems = {};
    this._initMenu();
    this._initRepos();
    this._interval = Timing.setInterval(Lang.bind(this, this._updateRepos), 30000);
  },

  _initMenu: function () {
    let showSettingsMenuItem = new PopupMenu.PopupMenuItem(_("Settings"));
    showSettingsMenuItem.actor.connect('button-press-event',
      Lang.bind(this, this._showSettings));
    this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
    this.menu.addMenuItem(showSettingsMenuItem);
  },

  _getRepoNames: function () {
    return this._settings.get_strv(SETTINGS_REPOSITORIES);
  },

  _initRepos: function () {
    this._github = new GithubFetcher({
      username: this._settings.get_string(SETTINGS_GITHUB_USERNAME),
      password: this._settings.get_string(SETTINGS_GITHUB_PASSWORD)
    });
    if (this._getRepoNames().length) {
      this._setStatusMessage(_('Loading repositories...'));
      this._updateRepos(true);
    }
  },

  _updateRepos: function (reset) {
    if (reset) {
      for(let repoName in this._repoMenuItems) {
        this._repoMenuItems[repoName].destroy();
      }
      this._repoMenuItems = {};
    }


    let repoNames = this._getRepoNames();

    this._github.getRepos(repoNames).then(repos => {
      this._clearStatusMessage();

      let reposByName = {};
      repos.forEach((repo) => reposByName[repo.repoFullName] = repo);

      repoNames.reverse().forEach((repoName) => this._addRepoMenuItem(reposByName[repoName]));
    }).catch(Lang.bind(this, this._handleError));

    this._removeDeletedRepos();
  },

  _addRepoMenuItem: function (repo) {
    let repoMenuItem = this._repoMenuItems[repo.repoFullName];
    if(!repoMenuItem) {
      repoMenuItem = new RepoMenuItem(repo);
      this.menu.addMenuItem(repoMenuItem, 0);
      this._repoMenuItems[repo.repoFullName] = repoMenuItem;
    }

    repoMenuItem.updatePullRequests(repo.pullRequests);
  },

  _removeDeletedRepos: function () {
    let repoNames = this._getRepoNames();
    let repoMenuItems = Object.keys(this._repoMenuItems);
    let removedRepos = repoMenuItems.filter(function(i) { return repoNames.indexOf(i) < 0; });

    removedRepos.forEach((repo) => {
      this._repoMenuItems[repo].destroy();
      delete this._repoMenuItems[repo];
    });
  },

  _handleError: function (error) {
    // No internet: (try to reload data when internet is back)
    // {"message":{},"headers":{},"url":"https://api.github.com/repos/lagartoflojo/minijq/pulls","status":2,"statusText":"Cannot resolve hostname","ok":false}
    // Not found / no permissions:
    // {"message":{},"headers":{},"url":"https://api.github.com/repos/asdsadasd/adaerear/pulls","status":404,"statusText":"Not Found","ok":false}

    log('ERROR (json): ' + JSON.stringify(error))
    log('ERROR: ' + error)

    if (error.status === 2 || error.status === 8) {
      this._setStatusMessage(_('No internet connection'));
    }
    else if (error.status === 403) {
      this._setStatusMessage(_('Github API rate limit exceeded.\nPlease log in in extension settings.'));
    }
    else if (error.status === 404) {
      this._setStatusMessage(_('Repository "') + error.repoFullName + _('" not found.\nIf this is a private repo, please log in in extension settings.'));
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
  }
});

let _githubProjects;

function init(extensionMeta) {
  let theme = imports.gi.Gtk.IconTheme.get_default();
  theme.append_search_path(extensionMeta.path + '/icons');
  Convenience.initTranslations('gnomehub');
}

function enable() {
  log('Enabling GnomeHub...');
  _githubProjects = new GithubProjects();
  Main.panel.addToStatusArea('github-projects', _githubProjects, 0, 'right');
}

function disable() {
  if (_githubProjects) {
    log('Disabling GnomeHub...');
    _githubProjects.destroy();
    _githubProjects = null;
  }
}
