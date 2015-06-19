'use strict';
/**
    Last maintained : 2014-12-06 (rvnjl)
**/

var config      = require(__dirname + '/config/config'),
    util        = require(__dirname + '/helpers/util'),
    logger      = require('anytv-node-logger'),
    body_parser = require('body-parser'),
    express     = require('express'),
    app         = express();

logger.log('info', 'Starting', config.APP_NAME, 'on', config.ENV, 'environment');

app.disable('x-powered-by');

app.set('views', config.VIEWS_DIR);
app.set('view engine', 'jade');

logger.log('verbose', 'Binding 3rd-party middlewares');

app.use(require('morgan')('combined', {stream: util.get_log_stream(config.LOGS_DIR)}));
app.use(require('method-override')());
app.use(body_parser.urlencoded({extended: true}));
app.use(body_parser.json());
app.use(require('multer')({dest: config.UPLOAD_DIR}));
app.use(require('compression')());

logger.log('verbose', 'Binding custom middlewares');
app.use(require('anytv-node-cors')(config.CORS));
app.use(require(__dirname + '/lib/error_classifier')());
app.use(require(__dirname + '/config/router')(express.Router()));
app.use(require('anytv-node-error-handler')(logger));

app.listen(config.PORT);
logger.log('info', 'Server listening on port', config.PORT);


module.exports = app;
