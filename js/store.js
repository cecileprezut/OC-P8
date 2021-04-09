function generateId() {
	const size = 6;
	const charset = "0123456789";
	const charsetLength = charset.length
	let id = ''
	for (let i = 0; i < size; i++) {
		// Random character
		const c = charset.charAt(Math.floor(Math.random() * charsetLength));
		id += c
	}
	return parseInt(id)
}

/*jshint eqeqeq:false */
(function (window) {
	'use strict';

	/**
	 * Creates a new client side storage object and will create an empty
	 * collection if no collection already exists.
	 *
	 * @param {string} name The name of our DB we want to use
	 * @param {function} callback Our fake DB uses callbacks because in
	 * real life you probably would be making AJAX calls
	 */
	function Store(name, callback) {
		callback = callback || function () { };

		this._dbName = name;

		if (!localStorage[name]) {
			const data = {
				todos: []
			};

			localStorage[name] = JSON.stringify(data);
		}

		callback.call(this, JSON.parse(localStorage[name]));
	}

	/**
	 * Finds items based on a query given as a JS object
	 *
	 * @param {object} query The query to match against (i.e. {foo: 'bar'})
	 * @param {function} callback The callback to fire when the query has
	 * completed running
	 *
	 * @example
	 * db.find({foo: 'bar', hello: 'world'}, function (data) {
	 *	 // data will return any items that have foo: bar and
	 *	 // hello: world in their properties
	 * });
	 */
	Store.prototype.find = function (query, callback) {
		if (!callback) {
			return;
		}

		const todos = JSON.parse(localStorage[this._dbName]).todos;

		callback.call(this, todos.filter(function (todo) {
			for (const q in query) {
				//query example= {completed: false} for the 'active' filter
				if (query[q] !== todo[q]) {
					return false;
				}
			}
			return true;
		}));
	};

	/**
	 * Will retrieve all data from the collection
	 *
	 * @param {function} callback The callback to fire upon retrieving data
	 */
	Store.prototype.findAll = function (callback) {
		callback = callback || function () { };
		callback.call(this, JSON.parse(localStorage[this._dbName]).todos);
	};

	/**
	 * Will save the given data to the DB. If no item exists it will create a new
	 * item, otherwise it'll simply update an existing item's properties
	 *
	 * @param {object} updateData The data to save back into the DB
	 * @param {function} callback The callback to fire after saving
	 * @param {number} id An optional param to enter an ID of an item to update
	 */
	Store.prototype.save = function (updateData, callback, id) {
		const data = JSON.parse(localStorage[this._dbName]);
		const todos = data.todos;

		callback = callback || function () { };

		if (!id) {
			let isAlreadyUsed = false
			let newId = 0;

			do {
				newId = generateId()

				// Check id not already used
				const idUsed = todos.find(todo => {
					todo.id === newId
				})

				if (idUsed || idUsed === 0) {
					isAlreadyUsed = true
				} else {
					isAlreadyUsed = false
				}
			} while (isAlreadyUsed);

			// Assign an ID
			updateData.id = newId;

			todos.push(updateData);
			localStorage[this._dbName] = JSON.stringify(data);
			callback.call(this, [updateData]);
		}

		// If an ID was actually given, find the item and update each property
		else {
			for (let i = 0; i < todos.length; i++) {
				if (todos[i].id === id) {
					for (const key in updateData) {
						todos[i][key] = updateData[key];
					}
					break;
				}
			}

			localStorage[this._dbName] = JSON.stringify(data);
			callback.call(this, todos);
		}
	};

	/**
	 * Will remove an item from the Store based on its ID
	 *
	 * @param {number} id The ID of the item you want to remove
	 * @param {function} callback The callback to fire after saving
	 */
	Store.prototype.remove = function (id, callback) {
		const data = JSON.parse(localStorage[this._dbName]);

		data.todos = data.todos.filter(todo => todo.id !== id)

		localStorage[this._dbName] = JSON.stringify(data);
		callback.call(this, data.todos);
	};

	/**
	 * Will drop all storage and start fresh
	 *
	 * @param {function} callback The callback to fire after dropping the data
	 */
	Store.prototype.drop = function (callback) {
		const data = { todos: [] };
		localStorage[this._dbName] = JSON.stringify(data);
		callback.call(this, data.todos);
	};

	// Export to window
	window.app = window.app || {};
	window.app.Store = Store;
})(window);