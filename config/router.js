'use strict';

var importer = require('anytv-node-importer');

module.exports = function (router) {
    var c = importer.dirloadSync(__dirname + '/../controllers');

    router.del = router.delete;

    //router.get('/user/:id', c.user.get_user);
    router.get('/channels', c.channel.get_channels);
    //router.get('/channels/:id', c.channel.get_channel);
    router.get('/channels/:id/growth', c.growth.get_channel);

    router.all('*', function (req, res) {
        res.status(404)
            .send({
                message: 'Nothing to do here.'
            });
    });

    return router;
};
