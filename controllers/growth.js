'use strict';

var config = require(__dirname + '/../config/config'),
    logger = require('anytv-node-logger'),
    mysql = require('anytv-node-mysql'),
    mongo = require('anytv-node-mongo'),
    util = require(__dirname + '/../helpers/util'),
    moment = require('moment'),
    crypto = require('crypto');

exports.get_grouped_channel = function (req, res, next) {
    var date = moment(),
        start_month = date.subtract(3, 'month').format('YYYY-MM'),
        end_month = date,
        data = util.get_data(
            [],
            ['month', 'network', 'duration'],
            req.query),
        cache_key,
        channels = [];

    function start () {
        var simple_key;

        if (data.month) {
            end_month = moment(data.month + '-01').format('YYYY-MM');
        }

        if (+data.duration) {
            start_month = moment(end_month + '-01')
                .subtract(+data.duration, 'month').format('YYYY-MM');
        }

        logger.log('info', 'From ' + start_month + ' to ' + end_month);
        logger.log('info', 'Retrieving channels with network ' + data.network);

        data.network = (data.network) ? data.network.split(',') : 'anytv_affiliate';
        simple_key = data.network + ':' + start_month + ':' + end_month;
        cache_key = crypto.createHash('md5').update(simple_key).digest('hex');

        // check cache first
        mongo
            .open({
                    host: config.MONGO.host,
                    port: config.MONGO.port,
                    database: 'channel-growth-feature'
                })
            .collection('cache')
            .findOne({ _id: cache_key }, retrieve_cache);
    }

    function retrieve_cache (err, cache_result) {
        if (err || !cache_result) {
            // retrieve list of channels
            return mysql.open(config.DB)
                .query('SELECT SQL_CACHE channel_id, title, linked_date ' +
                       'FROM mcn_channels ' +
                       'WHERE network IN (?) ' +
                       'AND DATE_FORMAT(linked_date, "%Y-%m") = ?',
                       [data.network, start_month],
                       get_stat
                )
                .end();
        }

        logger.log('info', 'Retrieved from cache');

        return res.send(cache_result.data);
    }

    function get_stat (err, result) {
        var channel_ids = [];

        if (err) {
            return next(err);
        }

        if (!result.length) {
            return res.send({ results: [] });
        }

        channels = result;

        channels.map(function (row) {
            channel_ids.push(row.channel_id);
        });

        logger.log('info', 'No of channels: ' + channel_ids.length);

        mysql.open(config.DB)
            .query(
                'SELECT SQL_CACHE DATE_FORMAT(insert_date, "%Y-%m") AS month, ' +
                'channel_id, MAX(views) AS views, ' +
                'MAX(subscribers) AS subscribers, MAX(comments) AS comments ' +
                'FROM channel_stats WHERE channel_id IN (?) ' +
                'AND DATE_FORMAT(insert_date, "%Y-%m") BETWEEN ? AND ? ' +
                'GROUP BY month, channel_id ' +
                'ORDER BY month',
                [channel_ids, start_month, end_month],
                send_response
            )
            .end();
    }

    function send_response (err, result) {
        var count = 0,
            new_date = 0,
            statistics = [],
            statistic = [],
            response = { results: [], channels: channels };

        if (err) {
            return next(err);
        }

        if (!result.length) {
            return res.send({ results: [] });
        }

        statistics = result;

        statistics.forEach(function (row) {
            statistic = statistics[new_date];

            if (count) {
                if (row.month !== statistics[count - 1].month) {
                    response.results.push(statistic);
                    new_date = count;
                    count++;
                    return;
                }

                statistic.views += row.views;
                statistic.subscribers += row.subscribers;
                statistic.comments += row.comments;

            }

            count++;
        });

        response.results.push(statistic);


        // Cache result to mongo

        mongo
            .open({
                host: config.MONGO.host,
                port: config.MONGO.port,
                database: 'channel-growth-feature'
            })
            .collection('cache')
            .insert({
                _id: cache_key,
                data: response
            },
            function (error) {

                if (error) {
                    logger.log('error', 'Problem caching result', error);
                }

                logger.log('info', cache_key, ' Successfully cached');
            });

        return res.send(response);
    }

    start();
};
