var builder = require('botbuilder');
var restify = require('restify');
var redditClient = require('./reddit-client.js');

var connector = new builder.ChatConnector();
var bot = new builder.UniversalBot(connector);

var dialog = new builder.IntentDialog();
dialog.matches(/^search/i, [
    function (session, args, next) {
        if (session.message.text.toLowerCase() == 'search') {
            builder.Prompts.text(session, 'What are you looking for?');
        } else {
            var query = session.message.text.substring(7);
            next({ response: query });
        }
    },
    function (session, result, next) {
        var query = result.response;
        if (!query) {
            session.endDialog('Request cancelled');
        } else {
            redditClient.executeSearch(query, function (profiles) {
                var totalCount = profiles.total_count;
                if (totalCount == 0) {
                    session.endDialog('Sorry, no results found.');
                } else if (totalCount > 10) {
                    session.endDialog('More than 10 results were found. Please provide a more restrictive query.');
                } else {
                    session.dialogData.property = null;
                    var posts = profiles.data.children.map((item) => { 
                        return item.data.title + `|` + item.data.id; 
                    });
                    console.log(`OwO`);
                    // console.log(posts);
                    builder.Prompts.choice(session, 'What post do you want to load?', posts);
                }
            });
        }
    }, function (session, result, next) {
        console.log(result)
        var string = result.response.entity;
        var id = string.substring(string.indexOf('|') + 1);
        console.log(id);
        redditClient.loadContent(id, function (content) {
            // console.log(`~whats this??~`);
            // console.log(content[0].data.children[0].data.title);
            var childContent = content[0].data.children[0].data;
            var card = new builder.ThumbnailCard(session);
            // console.log(childContent);
            card.title(childContent.title);

            card.images([builder.CardImage.create(session, childContent.thumbnail)]);

            card.tap(new builder.CardAction.openUrl(session, `https://old.reddit.com` + childContent.permalink));
            
            var message = new builder.Message(session).attachments([card]);
            session.send(message);
        });
    }
]);

bot.dialog('/', dialog);

var server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log('%s listening to %s', server.name, server.url);
});
server.post('/api/messages', connector.listen());