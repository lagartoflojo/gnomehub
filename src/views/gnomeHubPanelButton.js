const Extension = imports.misc.extensionUtils.getCurrentExtension();

const St = imports.gi.St;
const RepoMenuItem = Extension.imports.widgets.repoMenuItem.RepoMenuItem;
const Convenience = Extension.imports.lib.convenience;
const PanelMenu = imports.ui.panelMenu;
const PopupMenu = imports.ui.popupMenu;
const PopupSubMenuMenuItem = imports.ui.popupMenu.PopupSubMenuMenuItem;
const Lang = imports.lang;

const GnomeHubPanelButton = new Lang.Class({
  Name: 'GnomeHub',
  Extends: PanelMenu.Button,

  _init: function() {
    this.parent(0.0, "GnomeHub");

    let icon = new St.Icon({
      icon_name: 'git',
      style_class: 'system-status-icon'
    });

    this.actor.add_actor(icon);

    this._repoMenuItems = {};
    this._initMenu();
    // this._initRepos();
  },

  _initMenu: function () {
    let showSettingsMenuItem = new PopupMenu.PopupMenuItem("Settings");
    showSettingsMenuItem.actor.connect('button-press-event', () => this.emit('show-settings'));
    this.menu.addMenuItem(new PopupMenu.PopupSeparatorMenuItem());
    this.menu.addMenuItem(showSettingsMenuItem);
  },

  // _initRepos: function () {
  //   if (this.repositories.length) {
  //     this._setStatusMessage('Loading repositories...');
  //     this._updateRepos(true);
  //   }
  // },

  render: function (repositories, reset) {
    if (reset) {
      for(let repoName in this._repoMenuItems) {
        this._repoMenuItems[repoName].destroy();
      }
      this._repoMenuItems = {};
    }

    this._clearStatusMessage();

    // let reposByName = {};
    // repositories.forEach((repo) => reposByName[repo.repoFullName] = repo);
    //
    // repositories.forEach((repoName) => this._addRepoMenuItem(reposByName[repoName]));
    repositories.forEach((repo) => this._addRepoMenuItem(repo));

    this._removeDeletedRepos(repositories);
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

  _removeDeletedRepos: function (currentRepositories) {
    let repoNames = currentRepositories.map((repo) => repo.repoFullName);
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
      this._setStatusMessage('No internet connection');
    }
    else if (error.status === 403) {
      this._setStatusMessage('Github API rate limit exceeded.\nPlease log in in extension settings.');
    }
    else if (error.status === 404) {
      this._setStatusMessage('Repository "' + error.repoFullName + '" not found.\nIf this is a private repo, please log in in extension settings.');
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

  destroy: function () {
    this.parent();
  }
});
