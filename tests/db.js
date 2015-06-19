'use strict';

var config = require(__dirname + '/../config/config'),
    util = require(__dirname + '/../helpers/util'),
    mysql = require('anytv-node-mysql'),
    fs = require('fs'),
    reset_query = fs.readFileSync(__dirname + '/../database/truncate.sql').toString() + fs.readFileSync(__dirname +
        '/../database/seed.sql').toString();

config.DB.multipleStatements = true;

before(function (done) {
    var db_config = util.clone(config.DB),
        real_db = db_config.database.replace('_test', ''),
        sql = fs.readFileSync(__dirname + '/../database/schema.sql')
        .toString()
        .replace(new RegExp(real_db, 'gi'), db_config.database);

    db_config.database = real_db;

    mysql.open(config.DB)
        .query(sql, function (err) {
            if (err) {
                console.log(err);
            }
            done();
        })
        .end();
});

beforeEach(function (done) {
    mysql.open(config.DB)
        .query(reset_query, function (err) {
            if (err) {
                console.log(err);
            }
            done();
        })
        .end();
});
