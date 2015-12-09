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

let gf = new GithubFetcher();

const GithubProjects = new Lang.Class({
  Name: 'GithubProjects.GithubProjects',
  Extends: PanelMenu.Button,
  text: gf.text,

  _init: function () {
    this.parent(0.0, "Github Projects", false);

    let icon = new St.Icon({
      icon_name: Icon,
      style_class: 'system-status-icon'
    });

    this.actor.add_actor(icon);

    let repo = {
      name: 'SUSE/happy-customer',
      pullRequests: [
        {
          number: 2461,
          title: "add more syslog objects for easy access to object history..."
        },
        {
          number: 2465,
          title: "Update Sprint25 scrum data 2905"
        },
        {
          number: 2466,
          title: "Fix bug when user has no orgs with support, or all orgs with..."
        }
      ]
    };
    let rails = {
      name: 'rails/rails',
      pullRequests: [
        {
          number: 22534,
          title: "ActionMailer: support overriding template name in multipart"
        },
        {
          number: 22526,
          title: "WIP: Add methods for querying exactly one record from a relation"
        }
      ]
    }

    this.menu.addMenuItem(new RepoMenuItem(repo));
    this.menu.addMenuItem(new RepoMenuItem(rails));

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
