'use strict';
/**
embassadour
@module
**/
(function (context) {
	require(['$api/models'], function(models) {
		/**
		Embassadour
		@class
		@constructor
		**/
		context.Embassadour = function (artist, user, reputation) {
			var _artist = '';
			var _user = '';
			var _reputation = 0;
			_artist = artist;
			_user = user;
			_reputation = 0;
			this.__defineGetter__('artist', function () {
				return _artist;
			})
			this.__defineGetter__('user', function () {
				return _user;
			});
			this.__defineGetter__('reputation', function () {
				return _reputation;
			});
			
		};
		context.embassadour.fromURI = function (uri, callback) {

			// TEST CODE ONLY, HARDCODED
		/*	if (uri.indexOf('spotify:embassadour:') == 0) {
				var parts = uri.split(':');
				return new Embassadour(parts[2], parts[3], parts[4]);
			}*/

			// Read from a static database for now
			var examples = models.application.readfile('example/embassadours').done(function (contents) {
				var lines = content.split('\n');
				for(var i = 0; i < lines.length; i++) {
					var line = lines[i].split(' ');
					if(line[0] === uri) {
						callback(new Embassadour(line[1], line[2]));
					}
				}
			}).fail(function () {
				console.log("fail");
			});

		};
		
		context.EmbassadourCollection = function() {
			var items = [];
			this.__defineGetter__('items', function () {
				return items;
			})
			this.add = function (item) {
				items.push(item);
			};
			
		};
			
		/**
		Retrieves an collection of Embassadours for the resource specified
		@function
		**/
		context.EmbassadourCollection.fromURI = function (uri, callback) {
			var examples = models.application.readfile('example/' + uri.split(':')[2] + '.collection').done(function (contents) {
				var lines = content.split('\n');
				var collection = new EmbassadourCollection();
				for(var i = 0; i < lines.length; i++) {
					var line = lines[i];
					
					collection.add(line);
					
				}
			}).fail(function () {
				console.log("fail");
			});
			if(uri == 'spotify:user:drsounds') {
				context.Embassadour.fromURI('spotify:embassadour:1acf2g3f2a8af', function (embassadour) {
					items.push(embassadour);
				});
			}
			
		});
	});

})(this.exports);