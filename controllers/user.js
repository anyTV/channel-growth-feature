'use strict';

var config = require(__dirname + '/../config/config'),
    mysql = require('anytv-node-mysql');


exports.get_user = function (req, res, next) {
    var start = function () {

            mysql.open(config.DB)
                .query(
                    'SELECT * FROM users WHERE user_id = ? LIMIT 1;', [req.params.id],
                    send_response
                )
                .end();
        },

        send_response = function (err, result) {
            if (err) {
                return next(err);
            }

            if (!result.length) {
                return res.warn(404, 'User not found');
            }

            res.send(result[0]);
        };

    start();
};
