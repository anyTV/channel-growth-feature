'use strict';
/**
    Utilities
*/

exports.hash = function (string, hash) {
    return require('crypto').createHash(hash || 'sha1').update('' + string).digest('hex');
};


exports.get_data = function (reqd, optional, body) {
    var i = reqd.length,
        ret = {},
        temp;

    while (i--) {
        if (!body[temp = reqd[i]] || typeof body[temp] === 'object') {
            return temp + ' is missing';
        }
        ret[temp] = body[temp];
    }

    i = optional.length;

    while (i--) {
        if (body[temp = optional[i]]) {
            ret[temp] = body[temp];
        }
    }
    return ret;
};


exports.random_string = function (i) {
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789',
        str = '',
        l = i || 32;

    while (l--) {
        str += possible.charAt(~~(Math.random() * 62));
    }

    return str;
};

/**
 * Fast UUID generator, RFC4122 version 4 compliant.
 * @author Jeff Ward (jcward.com).
 * @license MIT license
 * @link http://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid-in-javascript/21963136#21963136
 **/

exports.generate_UUID = function () {
    var UUID = (function () {
        var self = {},
            lut = [],
            i = 0;

        for (; i < 256; i += 1) {
            lut[i] = (i < 16 ? '0' : '') + (i).toString(16);
        }

        self.generate = function () {
            var d0 = Math.random() * 0xffffffff | 0,
                d1 = Math.random() * 0xffffffff | 0,
                d2 = Math.random() * 0xffffffff | 0,
                d3 = Math.random() * 0xffffffff | 0;

            return lut[d0 & 0xff] + lut[d0 >> 8 & 0xff] + lut[d0 >> 16 & 0xff] + lut[d0 >> 24 & 0xff] +
                '-' +
                lut[d1 & 0xff] + lut[d1 >> 8 & 0xff] + '-' + lut[d1 >> 16 & 0x0f | 0x40] + lut[d1 >> 24 &
                    0xff] + '-' +
                lut[d2 & 0x3f | 0x80] + lut[d2 >> 8 & 0xff] + '-' + lut[d2 >> 16 & 0xff] + lut[d2 >> 24 &
                    0xff] +
                lut[d3 & 0xff] + lut[d3 >> 8 & 0xff] + lut[d3 >> 16 & 0xff] + lut[d3 >> 24 & 0xff];
        };

        return self;
    })();

    return UUID.generate();
};


exports.unique_short_string = function (n) {
    return (+new Date() * Math.random())
        .toString(36)
        .replace('.', '')
        .substring(0, n);
};


exports.pad = function (num, size) {
    return ('000000000' + num).substr(-(size || 2));
};

exports.to_title_case = function (str) {
    if (str) {
        return str.replace(/\w\S*/g, function (txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    }
    return false;
};


exports.caps_first = function (string) {
    return string.charAt(0)
        .toUpperCase() + string.slice(1);
};


exports.clean_string = function (string) {
    return string
        .match(/\S{1,30}/g)
        .join(' ');
};


exports.split = function (a, n) {
    var len = a.length,
        out = [],
        i = 0;

    while (i < len) {
        out.push(a.slice(i, i += Math.ceil((len - i) / n--)));
    }

    return out;
};


exports.slice = function (a, n) {
    var len = a.length,
        out = [],
        number_of_slice = Math.ceil(len / n),
        i = 0;

    while (number_of_slice--) {
        out.push(a.splice(0, n));
        i += n;
    }

    return out;
};


exports.extend = function (obj, source) {
    var prop;

    for (prop in source) {
        if (source.hasOwnProperty(prop)) {
            obj[prop] = source[prop];
        }
    }

    return obj;
};


exports.get_log_stream = function (dir) {
    var moment = require('moment'),
        fs = require('fs'),
        proc_id = process.env.cpu_number || '';

    return fs.createWriteStream(
        dir + '/access.' + proc_id + '.-' + moment().format('YYYY-MM-DD') + '.log',
        {flags: 'a'}
    );
};


exports.clone = function (obj) {
    return JSON.parse(JSON.stringify(obj));
};
