anyTV Node Boilerplate
=====

[![Build Status](https://travis-ci.org/anyTV/anytv-node-boilerplate.svg?branch=master)](https://travis-ci.org/anyTV/anytv-node-boilerplate)

Table of contents
-----
- [Introduction](#introduction)
- [Running the application](#running-the-application)
- [Creating a controller](#creating-a-controller)

Introduction
-----
This project **strictly** uses the [company's JS conventions](https://github.com/anyTV/JS-conventions).

Running the application
-----

1. Download Zip
2. Extract to your project's folder
3. Import `database/schema.sql` and `database/seed.sql`
  ```sh
  mysql -uroot < database/schema.sql
  mysql -uroot < database/seed.sql
  ```

4. Run this commands :
  ```sh
  sudo npm i -g forever
  sudo npm i -g nodemon
  sudo npm start
  ```

5. check http://localhost
6. Update package.json repository link
7. Update config/config.js
8. Don't forget tp.


Creating a controller
-----

Controllers are the heart of your application, as they determine how HTTP requests should be handled. They are located at the `controllers` folder. They are not automatically routed. You must explicitly route them in `config/router.js`. Using sub-folders for file organization is allowed.

Here's a typical controller:

```javascript
// user.js

var config = require(__dirname + '/config/config'),
	util = require(__dirname + '/helpers/util'),
	mysql = require('anytv-node-mysql'),
	moment = require('moment');

exports.update_user = function (req, res, next) {
	var data = util.get_data(['user_id'], ['first_name', 'last_name'], req.body),

		start = function () {
			var id;

			if (typeof data === 'string') {
				return next(data);
			}

			id = data.id;
			delete data.id;

			mysql.open(config.mysql_db)
				.query(
					'UPDATE users SET ? WHERE user_id = ? LIMIT 1;',
					[id, data],
					send_response
				)
				.end();
		},

		send_response = function (err, result) {
			if (err) {
				return next(err);
			}

			res.send({message : 'User successfully updated'});
		};

	start();
};



exports.delete_user = function (req, res, next) {
...
```

Detailed explanation:

```javascript
var config = require(__dirname + '/config/config'),
	util = require(__dirname + '/helpers/util'),
	mysql = require('anytv-node-mysql'),
	moment = require('moment');

```

- The first part of the controller contains the config, helpers, and libraries to be used by the controller's functions
- Notice the order of imported files, local files first followed by 3rd-party libraries
- This block should always be followed by at least one new line to separate them visually easily



```javascript
exports.update_user = function (req, res, next) {
```

- snake_case on exported function names
- `req` is an object from express, it contains user's request
- `res` also an object from express, use this object to respond to the request
- `next` a function from express, use this to pass to the next middleware which is the error handler


```javascript
	var data = util.get_data(['user_id'], ['first_name', 'last_name'], req.body),
```

- it is common to use `data` as the variable to store the parameters given by the user
- `util.get_data` helps on filtering the request payload
- non-function variables are also declared first
- new line after non-function variables to make it more readable

```javascript
		start = function () {
			var id;

			if (typeof data === 'string') {
				return next(data);
			}

			id = data.id;
			delete data.id;

			mysql.open(config.mysql_db)
				.query(
					'UPDATE users SET ? WHERE user_id = ? LIMIT 1;',
					[id, data],
					send_response
				)
				.end();
		},
```

- `start` function is required for uniformity
- the idea is to have the code be readable like a book, from top-to-bottom
- since variables are declared first and functions are assigned to variables, we thought of having `start` function to denote the start of the process
- as much as possible there should be no more function inside this level except for `forEach`, `map`, `filter`, and `reduce`, if lodash is available, use it

```javascript
		send_response = function (err, result) {
			if (err) {
				return next(err);
			}

			res.send({message : 'User successfully updated'});
		};

	start();
```

- `send_response` is common to be the last function to be executed
- use `next` for passing errors
- after all variable declarations, call `start`

Notes:
- use `res.warn(status, message)` or `res.warn(message)`  instead of `next(error)` of the server guy does not need to know the error like "user not found", etc