'use strict';

var config = require(__dirname + '/../config/config'),
    mysql = require('anytv-node-mysql');

exports.get_channels = function (req, res, next) {
    var limit = 50,
        offset = 0,
        total = 0,
        page = 1,

    start = function () {
        var query = '';

        if (+req.query.page && +req.query.page > 0) {
            page = +req.query.page;
        }

        if (+req.query.per_page && +req.query.per_page < 51) {
            limit = +req.query.per_page;
        }

        query = 'SELECT count(channel_id) as aggregate FROM mcn_channels';

        mysql.open(config.DB)
            .query(query, get_channels);
    },

    get_channels = function (err, result) {
        var query = '';

        if (err) {
            return next(err);
        }

        total = result[0]['aggregate'];
        offset = limit * (page -1);

        query = 'SELECT channel_id, description, title, views, subscribers, network, '
                + 'published_date, linked_date FROM mcn_channels ';
        query += 'LIMIT ' + limit;

        if (+offset > 0) {
            query += ' OFFSET ' + offset;
        }

        mysql.open(config.DB)
            .query(query, send_response);
    },

    send_response = function (err, result) {
        var response = [];

        if (err) {
            return next(err);
        }

        response = {
            'total' : total,
            'per_page' : limit,
            'page' : page,
            'data' : result
        };

        res.send(response);
    }

    start();
};
