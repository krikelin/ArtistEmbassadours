'use strict';
/**
embassadour
@module
**/
(function (context) {
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
	Loads the embassadour collection for the current user
	@function
	**/
	context.EmbassadourCollection.forCurrentUser = function (callback) {
		require(['$api/models'], function (models) {
			new models.Session().user.load('username').done(function (user) {
				context.EmbassadourCollection.fromURI('spotify:user:' + user.username, callback);
			});
		});
	}
	/**
	Retrieves an collection of Embassadours for the resource specified
	@function
	**/
	context.EmbassadourCollection.fromURI = function (uri, callback) {
		require(['$api/models'], function (models) {

			//var examples = models.application.readFile('example/' + uri.split(':')[2] + '.collection').done(function (content) {
			var xmlHttp = new XMLHttpRequest();
			xmlHttp.open('GET', 'http://home:8080/myproject/bungalow/api/v1_api/embassadour/?format=json&user=' + uri.split(':')[2], true);
			xmlHttp.onreadystatechange = function () { 
				if(xmlHttp.readyState == 4) {
					if(xmlHttp.status == 200) {
						var data = eval('(' + xmlHttp.responseText + ')');
						var collection = new context.EmbassadourCollection();
						data.objects.forEach(function (user) {
							collection.items.push('spotify:user:' + user.username);
						});
						console.log(collection);
						callback(collection);
					}
				}
				
				
					
					
		
			
			};
			xmlHttp.send(null);
		});
		
	};
	context.setSection = function (args) {
		var sections = document.querySelectorAll("section");
		if (args.length < 1)
			return;
		for(var i = 0; i < sections.length; i++) {
			var section = sections[i];
			if(section.getAttribute("id") == args[args.length-1]) {
				section.style.display = "block";
			} else {
				section.style.display = "none";
			}
		}
	};
	/**
	The application bungalow 
	**/
	context.Bungalow = function () {
		
	};
	context.Bungalow.prototype.init = function () {
		
		window.addEventListener('load', function () {

			require(['$views/tabbar#TabBar', '$api/models'], function(TabBar, models) {
				models.application.addEventListener('arguments', function (app) {
					models.application.load('arguments').done(function (app) {
						init(app.arguments);
					});	
				});
				init([]);
			});

		});

	}
	function init (args) {
		require(['$views/tabbar#TabBar', '$api/models'], function(TabBar, models) {
			new models.Client().load('features').done(function (app) {
				console.log(app.features);
			});
			setSection(args);
			if(args.length > 0) {
				if(args[0] == 'user') {
					
				
					models.User.fromURI('spotify:user:' + args[1]).load('artist', 'image', 'name', 'uri', 'username').done(userLoaded);
				}
			} else {
				new models.Session().user.load('artist', 'image', 'name', 'uri', 'username').done(userLoaded);
			}
		});
	}
	function cleanUI() {
		document.querySelector("#embdetails").innerHTML = "";

		document.querySelector("#artistdetails").innerHTML = "";
		document.querySelector("#embdetails").style.display = "none";
		document.querySelector("#artistdetails").style.display = "none";
		document.querySelector("#role").innerHTML = "";
		document.querySelector("#imgbox").innerHTML = "";
		document.querySelector('#admin').style.display = 'none';
		document.querySelector('#divider_admin').style.display = 'none';

	}
	function userLoaded (user) {
		cleanUI();
		
		require(['$views/image#Image'], function(Image) {
		//	document.querySelector("#role").innerHTML = text;
			var image = Image.fromSource(user.image, {
			    width: 120,
			    height: 120
			  })
			document.querySelector("#imgbox").appendChild(image.node);
		});
		console.log(user.artist);
		if(user.artist != '') {
			console.log('user', user);
			var text = "artist";
			document.querySelector("#embdetails").style.display = "block";
			require(['$views/buttons'], function(buttons) {

			  	var button = buttons.Button.withLabel('View artist profile');
			  	button.setSize('small');
			 	 button.addEventListener('click', function() {
			    	self.location = user.artist.uri;
			  	});
			  document.querySelector("#role").appendChild(button.node);

			});
			user.artist.load('name').done(function (artist) {
				document.querySelector("#username").innerText = artist.name;
			});
			// Load embassadours
			 context.EmbassadourCollection.forCurrentUser(function (collection) {
			 	require(['$api/models'] , function (models) {
				 	console.log(collection);
				 	var embds = [];
				 	collection.items.forEach(function (item) {
				 		console.log(item);
				 		embds.push(models.User.fromURI(item).load('name', 'image'));

				 	});
				 	var users = [];
				 	models.Promise.join(embds).each(function (user) {
				 		
				 			users.push(user);
				 	}).done(function (d) {
				 		require(['$views/image#Image', '$views/popup#Popup'], function(Image, Popup) {
				 			document.querySelector('#embdetails').style.display = 'block';
					 		document.querySelector('#embdetails').innerHTML = '<b>Embassadours</b><ul id=\"embassadours\"></ul>';
					 		new models.Session().user.load('username').done(function (user2) {
				 				var isAdmin = false;
				 				if(user.username === user2.username) {
				 					alert('a');
				 					isAdmin = true;
				 					document.querySelector('#div_admin').style.display = 'block';
		
				 					document.querySelector('#admin').style.display = 'block';
				 				}
				 			
					 			users.forEach(function (user) {
						 			console.log(user);
						 			console.log(user.image);
						 			var image = Image.fromSource(user.image, {
						 				width: 40,
						 				height: 40
						 			});
						 			image.node.style.cssFloat = 'right';
						 			var popup = Popup.withText(user.username);
						 			console.log(image.node);
								    image.node.addEventListener('mouseover', showPopup, false);
								    image.node.addEventListener('mouseout', hidePopup, false);
								    function showPopup() {
								    	// Set the text that is found in the target's data-tooltip attribute
								   		 // This is just an example, and you can get the text from anywhere
										// popup.setText(this.getAttribute('data-tooltip'));

									 	// Show the popup for this target element
									    popup.showFor(this);
								 	}
								  	function hidePopup() {
								  	  	popup.hide();
								 	 }
						 			document.querySelector('#embassadours').appendChild(image.node);

						 			// add to admin
						 			if (isAdmin) {
						 				require(['$views/buttons'], function (buttons) {
						 					console.log('f');
						 					var item = document.createElement('article');
						 					item.style.display = 'block';
						 					var button = buttons.Button.withLabel('Increase reputation');
						 					var image = Image.fromSource(user.image, {
								 				width: 90,
								 				height: 90,

								 			});
								 			
								 			var label = document.createElement('span');
								 			image.node.style.display = 'inline';
								 			
								 			
								 			item.appendChild(image.node);
								 			item.appendChild(label)
								 			var n = document.createElement('b');
								 			n.innerText = user.username;
								 			label.appendChild(n);
								 			label.appendChild(document.createElement('br'))
								 			label.appendChild(button.node);
								 			item.appendChild(label);
								 			item.style.width = '100%';
								 			document.querySelector('#admin #embassadours').appendChild(item);
								 			document.querySelector('#admin #embassadours').appendChild(document.createElement('br'));

						 				});
						 			}
						 		});
					 		});
					 	});
				 	}).fail(function (users) {

				 	});
				 });
			 });
		} else {
			document.querySelector('#embdetails').style.display = 'block';

			// Get artists associated with the account
			var xmlHttp = new XMLHttpRequest();
			console.log(user);
			xmlHttp.open('GET', 'http://home:8080/myproject/bungalow/api/v1_api/user/?format=json&user=' + user.username, true);
			xmlHttp.onreadystatechange = function () { 
				if(xmlHttp.readyState == 4) {
					if(xmlHttp.status == 200) {
						require(['$api/models', '$views/image#Image', '$views/buttons'], function (models, image, buttons) {
							new models.Session().user.load('username').done(function (user2) {
								if(user.username != user2.username) {
				 					
				 					var button = buttons.Button.withLabel('Invite to be embassadour');
				 					document.querySelector('#role').appendChild(button.node)
				 				}
				 			});
							var data = eval('(' + xmlHttp.responseText + ')');
							var collection = new context.EmbassadourCollection();
							data.objects.forEach(function (user) {
								collection.items.push('spotify:artist:' + user.identifier);
							});
							console.log(collection);
							var promises = [];
							collection.items.forEach(function (item) {
								promises.push(models.Artist.fromURI(item).load('image', 'name'));
							});
							var artists = [];
							var promise = models.Promise.join(promises).each(function (artist) {
								artists.append(artist);
							}).done(function (artists_) {
								document.querySelector('#artistdetails').style.display = 'block';
								document.querySelector('#artistdetails').innerHTML = '<b>Embassadour for</b><ul class=\"flow\" id=\"artistflow\"></ul>';

								artists.forEach(function (artist) {
									var image = Image.forArtist(artist, {
										width: 40,
										height: 40,
										placeholder: 'artist'
									});
									var popup = Popup.withText(artist.name);
						 			console.log(image.node);
								    image.node.addEventListener('mouseover', showPopup, false);
								    image.node.addEventListener('mouseout', hidePopup, false);
								    document.querySelector('artistflow').appendChild(image.node);
								    function showPopup() {
								    	// Set the text that is found in the target's data-tooltip attribute
								   		 // This is just an example, and you can get the text from anywhere
										// popup.setText(this.getAttribute('data-tooltip'));

									 	// Show the popup for this target element
									    popup.showFor(this);
								 	}
								  	function hidePopup() {
								  	  	popup.hide();
								 	}
								});

							});
						});
					}
				}
			};
			xmlHttp.send(null);
			document.querySelector("#username").innerText = user.name;
		}
		
		

	}
	var bungalow = new context.Bungalow();
	bungalow.init();
})(this);