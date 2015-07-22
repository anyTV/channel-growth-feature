'use strict';

var importer = require('anytv-node-importer');

module.exports = function (router) {
    var c = importer.dirloadSync(__dirname + '/../controllers');

    router.del = router.delete;

    router.get ('/channels', c.channel.get_channels);
    router.get ('/channels/growth', c.growth.get_grouped_channel);

    router.all('*', function (req, res) {
        res.status(404)
            .send({
                message: 'Nothing to do here.'
            });
    });

    return router;
};
