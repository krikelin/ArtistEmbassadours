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
	context.EmbassadourCollection.forUser = function (user, callback) {
		require(['$api/models'], function (models) {
			user.load('username').done(function (user) {
				context.EmbassadourCollection.fromURI('spotify:user:' + user.username, callback);
			});
		});
	}
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
							collection.items.push({user: 'spotify:user:' + user.username, accepted: user.accepted, accepted_artist: user.accepted_artist});
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
		document.querySelector('#admin #embassadours').innerHTML = '';
		document.querySelector('#admin #embassadours').innerHTML = '';

	}
	function userLoaded (user) {
		cleanUI();
		require(['$api/models'], function(models) {
			require(['$views/image#Image', '$views/buttons'], function(Image, buttons) {
			//	document.querySelector("#role").innerHTML = text;
				var image = Image.forUser(user, {
				    width: 128,
				    height: 128,
				    placeholder: 'user'
				  })
				document.querySelector("#imgbox").appendChild(image.node);
				new models.Session().user.load('username').done(function (user2) {
					if(user.username !== user2.username) {
						var button = buttons.SubscribeButton.forUser(user);
						document.querySelector("#role").appendChild(button.node);
					}
					document.querySelector("#role").appendChild(document.createElement('br'));
				});
			});
			console.log(user.artist);

			// Hardcode hack for nomy
			if(user.username == 'nomy') {
				user.artist = models.Artist.fromURI('spotify:artist:20bAxKr0YrCvceZeLqs37e');
			}
			if(user.artist != '') {
				console.log('user', user);
				var text = "artist";
				document.querySelector("#embdetails").style.display = "block";
				require(['$views/buttons'], function(buttons) {

				  	var button = buttons.CustomButton.withClass('sp-button sp-button-small btn', 'Show discography');
				 	 button.addEventListener('click', function() {
				    	self.location = user.artist.uri;
				  	});
				  document.querySelector("#role").appendChild(button.node);

				});
				user.artist.load('name').done(function (artist) {
					document.querySelector("#username").innerText = artist.name;
				});
				// Load embassadours
				 context.EmbassadourCollection.forUser(user, function (collection) {
				 	require(['$api/models'] , function (models) {
					 	console.log(collection);
					 	var embds = [];
					 	var data = [];
					 	collection.items.forEach(function (item) {
					 		console.log(item);
					 		data.push(item)
					 		embds.push(models.User.fromURI(item.user).load('name', 'image'));

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
					 					isAdmin = true;
					 					document.querySelector('#divider_admin').style.display = 'block';
			
					 					document.querySelector('#admin').style.display = 'block';

					 					// add buttons to buttonland

					 				}
					 				var i = 0;
						 			users.forEach(function (user) {

							 			console.log(user);
							 			console.log(user.image);
							 			var image = Image.forUser(user, {
							 				width: 40,
							 				height: 40,
							 				placeholder: 'user',
							 				'link': 'spotify:app:bungalow:user:' + user.username
							 				
							 			}); 

  document.body.appendChild(image.node);
  image.node.style.cssFloat = 'left';
  image.node.style.marginRight = '3px';
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
									 	if(data[i].accepted) {
							 				document.querySelector('#embassadours').appendChild(image.node);
							 			}
							 			// add to admin
							 			if (isAdmin) {
							 				require(['$views/buttons'], function (buttons) {
							 					console.log('f');
							 					var item = document.createElement('tr');
							 					
							 					var button = buttons.Button.withLabel('Increase reputation');
							 					var image = Image.forUser(user, {
									 				width: 90,
									 				height: 90,
									 				link: 'spotify:app:bungalow:user:' + user.username,
							 						placeholder: 'user'
									 			});
									 			
									 			var label = document.createElement('td');

									 			
									 			var td = document.createElement('td');
									 			td.appendChild(image.node);
									 			item.appendChild(label)
									 			var n = document.createElement('span');
									 			n.style.fontSize = '16px';
									 			n.style.lineHeight = '32px';
									 			n.innerText = user.username;
									 			console.log(data);

									 			if(!data[i].accepted) {
									 				n.innerHTML += '<span style=\"color: #888888\"> (Pending response)</span>';
									 			}
									 			//label.appendChild(n);
									 			var td2 = document.createElement('td');

									 	//		
									 			
									 			item.style.width = '100%';
									 			var td3 = document.createElement('td');

									 			var btnSubscribe = buttons.SubscribeButton.forUser(user);;
									 			td3.appendChild(n)
									 			td3.appendChild(document.createElement('br'));
									 			td3.appendChild(btnSubscribe.node);
									 			
									 			td3.appendChild(document.createElement('br'));
									 			td2.appendChild(button.node);
									 			td3.setAttribute('valign', 'top');
									 			item.appendChild(td);
									 			item.appendChild(td3);
									 			item.appendChild(td2);

									 			document.querySelector('#admin #embassadours').appendChild(item);
									 			document.querySelector('#admin #embassadours').appendChild(document.createElement('br'));

							 				});
							 			}
							 			i++;
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
				require(['$views/buttons'], function (buttons) {
					new models.Session().user.load('username').done(function (user2) {
						if(user.username != user2.username) {
		 					
		 					var button = buttons.Button.withLabel('Invite to be embassadour');
		 					document.querySelector('#role').appendChild(button.node)
		 				}
		 			});
		 		});
				xmlHttp.open('GET', 'http://home:8080/myproject/bungalow/api/v1_api/user/?format=json&user=' + user.username, true);
				xmlHttp.onreadystatechange = function () { 
					if(xmlHttp.readyState == 4) {
						if(xmlHttp.status == 200) {
							require(['$api/models', '$views/image#Image', '$views/buttons', '$views/popup#Popup'], function (models, Image, buttons, Popup) {
								
					 			console.log(xmlHttp.responseText);
								var data = eval('(' + xmlHttp.responseText + ')');
								var collection = new context.EmbassadourCollection();
								console.log('coll', collection.items);
								data.objects.forEach(function (user) {
									collection.items.push('spotify:artist:' + user.identifier);
								});
								console.log(collection);
								var promises = [];
								collection.items.forEach(function (item) {
									promises.push(models.Artist.fromURI(item).load('image', 'name', 'user'));
								});
								var artists = [];
								var promise = models.Promise.join(promises).each(function (artist) {
									artists.push(artist);
								}).done(function (artists_) {
									console.log('g');
									document.querySelector('#artistdetails').style.display = 'block';
									document.querySelector('#artistdetails').innerHTML = '<b>Embassadour for</b><ul class=\"flow\" id=\"artistflow\"></ul>';
									console.log(Image);

									artists.forEach(function (artist) {
										artist.user.load('name', 'image').done(function (user3) {
											var image = Image.forUser(user3, {
												width: 40,
												height: 40,
												placeholder: 'artist',
												link: 'spotify:app:bungalow:user:' + user3.username 
											});
											var popup = Popup.withText(artist.name);
								 			console.log(image.node);
								 			image.node.style.cssFloat = 'right';
										    image.node.addEventListener('mouseover', showPopup, false);
										    image.node.addEventListener('mouseout', hidePopup, false);
										    document.querySelector('#artistflow').appendChild(image.node);
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
							});
						}
					}
				};
				xmlHttp.send(null);
				document.querySelector("#username").innerText = user.name;
			}
			
		});

	}
	var bungalow = new context.Bungalow();
	bungalow.init();
})(this);