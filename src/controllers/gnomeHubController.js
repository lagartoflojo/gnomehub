const Extension = imports.misc.extensionUtils.getCurrentExtension();
const Lang = imports.lang;
const Util = imports.misc.util;
const Main = imports.ui.main;

const GithubFetcher = Extension.imports.githubFetcher.GithubFetcher;
const GnomeHubPanelButton = Extension.imports.views.gnomeHubPanelButton.GnomeHubPanelButton;
const Convenience = Extension.imports.lib.convenience;
const Timing = Extension.imports.lib.timing;

const SETTINGS_GITHUB_USERNAME = 'github-username';
const SETTINGS_GITHUB_PASSWORD = 'github-password';
const SETTINGS_REPOSITORIES = 'repositories';

const GnomeHubController = new Lang.Class({
  Name: 'GnomeHubController',

  _init: function () {
    this.initSettings();
    this.panelButton = new GnomeHubPanelButton();
    Main.panel.addToStatusArea('gnomehub', this.panelButton, 0, 'right');
    this.initEvents();
    this._interval = Timing.setInterval(Lang.bind(this, this.showRepos), 30000);

    this._github = new GithubFetcher({
      username: this._settings.get_string(SETTINGS_GITHUB_USERNAME),
      password: this._settings.get_string(SETTINGS_GITHUB_PASSWORD)
    });

    this.showRepos();
  },

  initSettings: function () {
    this._settings = Convenience.getSettings();
    this._settings.connect('changed::' + SETTINGS_REPOSITORIES, () => this.showRepos());
    this._settings.connect('changed::' + SETTINGS_GITHUB_USERNAME, () => this.showRepos());
    this._settings.connect('changed::' + SETTINGS_GITHUB_PASSWORD, () => this.showRepos());
  },

  initEvents: function () {
    this.panelButton.connect('show-settings', this.showSettings);
  },

  getUserRepos: function () {
    return this._settings.get_strv(SETTINGS_REPOSITORIES);
  },

  showRepos: function () {
    this._github.getRepos(this.getUserRepos()).then(repos => {
      this.panelButton.render(repos);
    }).catch((error) => this.panelButton.renderError(error));
  },

  showSettings: function () {
    Util.spawn(['gnome-shell-extension-prefs', Extension.metadata.uuid]);
  },

  destroy: function () {
    Timing.clearInterval(this._interval);
    this.panelButton.destroy();
  }
});
