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

const Soup = imports.gi.Soup;
const Extension = imports.misc.extensionUtils.getCurrentExtension();
const Promise = Extension.imports.lib.promise.Promise;

function Response(message) {
    this.message = message;

    this.headers = message.response_headers;

    this.url = message.get_uri().to_string(false);

    this.status = message.status_code;
    this.statusText = Soup.Status.get_phrase(this.status);

    this.ok = (this.status === Soup.Status.OK);
}

Response.prototype.blob = function() {
    return new Promise(resolve => resolve(this.message.response_body.data));
};

Response.prototype.text = function() {
    return new Promise(resolve => resolve(this.message.response_body.data.toString()));
};

Response.prototype.json = function() {
    return new Promise(resolve => resolve(JSON.parse(this.message.response_body.data.toString())));
};

function fetch(url, options) {
    return new Promise(resolve => {
        options = typeof options === "object" ? options : {};

        options.method = options.method || "GET";
        options.userAgent = options.userAgent || "Mozilla/5.0";

        let session = new Soup.SessionAsync({ user_agent: options.userAgent });

        Soup.Session.prototype.add_feature.call(session, new Soup.ProxyResolverDefault());

        let request = Soup.Message.new(options.method, url);

        if (options.preprocess) {
          options.preprocess(request);
        }

        session.queue_message(request, (source, message) => {
            resolve(new Response(message));
        });
    });
}
