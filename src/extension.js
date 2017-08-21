const Extension = imports.misc.extensionUtils.getCurrentExtension();
const GnomeHubController = Extension.imports.controllers.gnomeHubController.GnomeHubController;

let gnomeHub;

function init(extensionMeta) {
  let theme = imports.gi.Gtk.IconTheme.get_default();
  theme.append_search_path(extensionMeta.path + '/icons');
}

function enable() {
  log('Enabling GnomeHub...');
  gnomeHub = new GnomeHubController();
}

function disable() {
  if (gnomeHub) {
    log('Disabling GnomeHub...');
    gnomeHub.destroy();
    gnomeHub = null;
  }
}
