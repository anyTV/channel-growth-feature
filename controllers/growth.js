'use strict';

var config = require(__dirname + '/../config/config'),
    mysql = require('anytv-node-mysql'),
    util = require(__dirname + '/../helpers/util'),
    moment = require('moment');

exports.get_channel = function (req, res, next) {
    var start = function () {
        var query = '',
            from = moment().subtract(29, 'day').format('YYYY-MM-DD'), // default
            to = moment().format('YYYY-MM-DD'), // default
            data = util.get_data(['id'], [], req.params);

            query = 'SELECT * FROM channel_growth WHERE channel_id = ? ';
            query += 'AND date BETWEEN ? AND ?';

            if (req.query.from && moment(req.query.from).isValid()) {
                from = moment(req.query.from).format('YYYY-MM-DD');
            }

            if (req.query.to && moment(req.query.to).isValid()) {
                to =  moment(req.query.to).format('YYYY-MM-DD');
            }

            mysql.open(config.DB)
                .query(
                    query, [data.id, from, to],
                    send_response
                )
                .end();
        },

        send_response = function (err, result) {
            if (err) {
                return next(err);
            }

            if (!result.length) {
                return res.warn(404, 'No channel statistics');
            }

            res.send(result);
        };

    start();
};
