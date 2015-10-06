'use strict';

var config = require(__dirname + '/../config/config'),
    mysql = require('anytv-node-mysql'),
    util = require(__dirname + '/../helpers/util');

exports.get_channels = function (req, res, next) {
    var offset = 0,
        total = 0,
        data = util.get_data([], ['page', 'limit', 'q'], req.query);

    function start () {
        var query = 'SELECT COUNT(channel_id) AS aggregate'
                    + ' FROM mcn_channels'
                    + ' WHERE (linked_date != "" OR linked_date IS NOT null)'
                    + ' AND cms != "" AND is_terminated != 1';

        data.page = (+data.page > 0) ? +data.page: 1;
        data.limit = (+data.limit < 51 && +data.limit) ? +data.limit: 50;

        if (data.q) {
            query += ' AND (channel_id = ? OR title = ?)';
        }

        mysql
            .open(config.DB)
            .query(
                query,
                [data.q, data.q],
                get_channels
            );
    }

    function get_channels (err, result) {
        var query;

        if (err) {
            return next(err);
        }

        total = result[0].aggregate;
        offset = data.limit * (data.page - 1);

        query = 'SELECT channel_id, description, title, views, subscribers, cms, '
                + 'published_date, linked_date FROM mcn_channels'
                + ' WHERE (linked_date != "" OR linked_date IS NOT null)'
                + ' AND cms != "" AND is_terminated != 1'
                + ' LIMIT ' + data.limit;

        if (+offset > 0) {
            query += ' OFFSET ' + offset;
        }

        mysql.open(config.DB)
            .query(query, send_response);
    }

    function send_response (err, result) {
        var response = [];

        if (err) {
            return next(err);
        }

        response = {
            'total' : total,
            'limit' : data.limit,
            'page' : data.page,
            'data' : result
        };

        res.send(response);
    }

    start();
};
