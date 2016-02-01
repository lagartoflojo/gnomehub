const GLib = imports.gi.GLib;

const setTimeout = (func, millis) => {
    return GLib.timeout_add(GLib.PRIORITY_DEFAULT, millis, () => {
        func();

        return false; // Don't repeat
    }, null);
};

const clearTimeout = id => GLib.Source.remove(id);

const setInterval = (func, millis) => {
    let id = GLib.timeout_add(GLib.PRIORITY_DEFAULT, millis, () => {
        func();

        return true; // Repeat
    }, null);

    return id;
};

const clearInterval = id => GLib.Source.remove(id);
