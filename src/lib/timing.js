// Copyright (c) 2015 Satyajit Sahoo
//
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.


const GLib = imports.gi.GLib;

var setTimeout = (func, millis) => {
    return GLib.timeout_add(GLib.PRIORITY_DEFAULT, millis, () => {
        func();

        return false; // Don't repeat
    });
};

var clearTimeout = id => GLib.Source.remove(id);

var setInterval = (func, millis) => {
    let id = GLib.timeout_add(GLib.PRIORITY_DEFAULT, millis, () => {
        func();

        return true; // Repeat
    });

    return id;
};

var clearInterval = id => GLib.Source.remove(id);
