var querystring = require('querystring');
var https = require('https');

module.exports = {
    executeSearch: function (query, callback) {
        this.loadData('/r/PrequelMemes/search?q=' + querystring.escape(query) + '&limit=9&restrict_sr=on', callback);
    },

    loadContent: function (id, callback) {
        this.loadData('/r/PrequelMemes/comments/' + querystring.escape(id), callback);
    },

    loadData: function (path, callback) {
        var options = {
            host: 'api.reddit.com',
            port: 443,
            path: path,
            method: 'GET',
            headers: {
                'User-Agent': 'sample-bot'
            }
        };
        var content;
        var request = https.request(options, function (response) {
            var data = '';
            response.on('data', function (chunk) { data += chunk; });
            response.on('end', function () {
                callback(JSON.parse(data));
            });
        });
        request.end();
    }
}