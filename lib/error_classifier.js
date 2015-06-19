'use strict';

module.exports = function () {
	return function (req, res, next) {
		res.warn = function (status, error) {
	        if (typeof(error) === 'undefined' ) {
	            error = status;
	            status = 400;
	        }

	        res.status(status)
	            .send(error);
	    };

	    next();
	};
};
