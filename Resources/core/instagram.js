/*
 *InstagramService
 * 
 * CommonJS module for Instagram
 * Uses OAuth2 for authentication/authorization
 * 
 * Wayne grimes Hirakawa based off of Google.js by Ayorinde Adesugba
 * HIMADE.ORG
 */

var clientId;
var clientSecret;
var redirectUri;
var responseType = 'token';
var accessType = 'offline';
var scope = "likes"; 
var state;
var devKey;

var ACCESS_TOKEN = null;
var REFRESH_TOKEN = null;
var xhr = null;
var OAUTH_URL = 'https://instagram.com/oauth/authorize/';
var API_URL = 'https://api.instagram.com/v1/';
var success_callback = null;
var window = null;

var inSimulator = Ti.Platform.model.indexOf('Simulator') !== -1 || Ti.Platform.model == "x86_64" || Ti.Platform.model == "instagram_sdk";

var self;

/* 
 * Module Initialization
 * 
 * Sets @clientId, @clientSecret, @redirectUri and @devKey
 * 
 */
function InstagramService(args) {
	self = this;
	
	clientId = args.clientId;
	clientSecret = args.clientSecret;
	redirectUri = args.redirectUri;
	devKey = args.devKey;
	
	Ti.API.debug("InstagramService object initialized");
};


/*
 * Getter got Instagram ACCESS_TOKEN
 */
InstagramService.prototype.accessToken = function() {
	return Ti.App.Properties.getString("GG_ACCESS_TOKEN");
};



/*
 * Instagram ACCESS_TOKEN in invalidated after a predefined period
 * REFRESH_TOKEN is used to callout to API for new ACCESS_TOKEN
 * 
 */
InstagramService.prototype.refreshToken = function(callback) {	
	if (REFRESH_TOKEN){
		var args = {
			call: 'token',
			method: 'POST',
			params: {
				client_id: clientId,
				client_secret: clientSecret,
				refresh_token: REFRESH_TOKEN,
				grant_type: 'refresh_token',
			}
		};
		
		self.callMethod(args, function(e){
			Ti.API.info('[refreshToken] '+e);
			if (e.success){
				Ti.API.info('[refreshToken] '+ JSON.parse(e.data).access_token);
				ACCESS_TOKEN = JSON.parse(e.data).access_token;
				Ti.App.Properties.setString("GG_ACCESS_TOKEN", ACCESS_TOKEN);
				callback({
					success: true,
					token: ACCESS_TOKEN
				});
			}
			else{
				Ti.API.error('Error getting tokens');
				callback({
					success: false,
					token: null
				});
			}
		}, true);
	}
	else {
		return null;
	}
};


/*
 * OAuth2 Login
 * 
 * Displays Instagram login page
 */
InstagramService.prototype.login = function(authSuccess_callback) {
	ACCESS_TOKEN = Ti.App.Properties.getString("GG_ACCESS_TOKEN");
	REFRESH_TOKEN = Ti.App.Properties.getString("GG_REFRESH_TOKEN");
	Ti.API.info("InstagramService login " + ACCESS_TOKEN);
	
	// if the property is save then user is logged in already... move on
	if (ACCESS_TOKEN !== null) {
		ACCESS_TOKEN = Ti.App.Properties.getString("GG_ACCESS_TOKEN");
		success_callback = authSuccess_callback;
		authSuccess_callback(true);
		return;
	} 
	else {
		if(authSuccess_callback !== undefined) {
			Ti.API.info("auth call back detected");
			success_callback = authSuccess_callback;
		}
		var url = String.format(OAUTH_URL+'?client_id=%s&redirect_uri=%s&scope=%s&response_type=%s', clientId, redirectUri, scope, responseType);
		Ti.API.info("about to show authorizedUI");
		showAuthorizeUI(url);  //Load 
	}
	return;
};

/** ------------------------------------------------------------------------------
 *
 * ------------------------------------------------------------------------------ */
InstagramService.prototype.callMethod = function(args, callback, getToken) {

	var params = args.params;
	var method = args.method;
	var call = args.call;

	var paramsString = "";
	try {
		if (!xhr){
			xhr = Titanium.Network.createHTTPClient();
		}
		
		if(params && method === "GET") {
			for(var a in params) {
				paramsString += '&' + Titanium.Network.encodeURIComponent(a) + '=' + Titanium.Network.encodeURIComponent(params[a]);
			}
			var url = API_URL + call + "?access_token=" + ACCESS_TOKEN + '&alt=json&v=2&key='+devKey+paramsString;
			Ti.API.info('getting' + url);
			xhr.open("GET", url);
		} 
		else if(method === "POST") {
			Ti.API.info("Executing Post");
			if (getToken){
				Ti.API.info("Calling: " + OAUTH_URL + call + "&redirect_uri="+ redirectUri);
				xhr.open("POST", OAUTH_URL + call + "&redirect_uri="+ redirectUri);
			}
			else{
				Ti.API.info(API_URL + call + "?alt=json&v=2&access_token=" + ACCESS_TOKEN+'&key='+devKey);
				xhr.open("POST", API_URL + call + "?alt=json&v=2&access_token=" + ACCESS_TOKEN+'&key='+devKey);
			}
		}

		xhr.onerror = function(e) {
			Ti.API.error("InstagramService ERROR " + e.error);
			Ti.API.error("InstagramService ERROR " + e);
			if(callback) {
				callback({
					error : e,
					success : false
				});
			}
		};

		xhr.onload = function(_xhr) {
			if(callback) {
				callback({
					error : null,
					success : true,
					data : xhr.responseText
				});
			}
		};
		if(method === "POST") {
			xhr.send(params);
		} else {
			xhr.send();
		}
	} 
	catch(err) {
		Titanium.UI.createAlertDialog({
			title : "Error",
			message : String(err),
			buttonNames : ['OK']
		}).show();
	}
};


/*
 * Display login UI
 */

function showAuthorizeUI(pUrl) {
	
	window = Ti.UI.createWindow({
		modal : true,
		fullscreen : true,
		width : '100%'
	});
	closeLabel = Ti.UI.createLabel({
		textAlign : 'right',
		font : {
			fontWeight : 'bold',
			fontSize : '12pt'
		},
		text : '(X)',
		top : 5,
		right : 12,
		height : 14
	});
	
	webView = Ti.UI.createWebView({
		top : 0,
		width : '100%',
		url : pUrl,
		autoDetect : [Ti.UI.AUTODETECT_NONE]
	});
	webView.addEventListener('beforeload', function(e) {
		Ti.API.info('Preload: '+e.url+' : ' +e.url.indexOf(redirectUri));
		if (e.url.indexOf('http://localhost/#') === 0) {
			webView.stopLoading();
			authorizeUICallback(e);
		}
		else if (e.url.indexOf('https://accounts.instagram.com/Logout') !== -1) {
			authorizeUICallback(e);
		}
	});
	
	webView.addEventListener('load', function(e){
		Ti.API.info(ACCESS_TOKEN);
		Ti.API.info('Load: '+e.url+' : ' +e.url.indexOf(redirectUri));
		if (e.url.indexOf('approval') !== -1) {
			authorizeUICallback(e);
		}
	});
	//webView.addEventListener('error', authorizeUICallback);

	closeLabel.addEventListener('click', destroyAuthorizeUI);
	window.add(closeLabel);

	window.add(webView);

	window.open();

};


/*
 * unloads the UI used to have the user authorize the application
 */
function destroyAuthorizeUI() {
	Ti.API.debug('destroyAuthorizeUI');
	// if the window doesn't exist, exit
	if(window == null) {
		return;
	}

	// remove the UI
	try {
		webView.removeEventListener('load', authorizeUICallback);
		window.remove(webView);
		webView = null;
		window.hide();
		window.close();
	} catch(ex) {
		Ti.API.error('Cannot destroy the authorize UI. Ignoring.');
	}
};


/*
 * Gets the temporary token for OAuth2
 */
function getTokens(tempToken, callback){
	var args = {
		call: 'token',
		method: 'POST',
		params: {
			client_id: clientId,
			client_secret: clientSecret,
			redirect_uri: redirectUri,
			grant_type: 'authorization_code',
			code: tempToken
		}
	};
	
	self.callMethod(args, function(e){
		Ti.API.info(e);
		if (e.success){
			callback(e.data);
		}
		else{
			Ti.API.error('Error getting tokens');
		}
	}, true);
	
}


/** ------------------------------------------------------------------------------
 * fires event when login fails
 * app:instagram_access_denied
 *
 * fires event when login successful
 * app:instagram_token
 *
 * executes callback if specified when creating object
 * ------------------------------------------------------------------------------ */
function authorizeUICallback(e) {
	Ti.API.info('authorizeUILoaded ' + e.type);
	var status;
	var tokenReturned = false;
	
	if (e.url.indexOf('http://localhost/#') === 0) {
		Ti.API.info(e.url);
		var token = e.url.split("=")[1];
		Ti.API.info("/////Instagram.js Line 331 - Token = "+token);
		Ti.App.fireEvent('tokenReceived',{'token': token});
		tokenReturned = true;
		Ti.API.info('/////Instagram.js Line 334 - Temp Token: ' + token);
	} else if (e.url.indexOf('approval') !== -1) {
		Ti.API.info(e.url);
		//Extract code from title
		var title = webView.evalJS("document.title");
		var token = title.split("=")[1];
		tokenReturned = true;
		Ti.API.info('/////Instagram.js Line 341 - Temp Token: ' + token);
	} else if (e.url.indexOf('https://accounts.instagram.com/Logout') === 0) {
		Ti.App.fireEvent('app:instagram_logout', {});
		destroyAuthorizeUI();
		Ti.App.Properties.setString("GG_ACCESS_TOKEN", null);
		Ti.App.Properties.setString("GG_REFRESH_TOKEN", null);
		success_callback(false);
	}
	
	if (tokenReturned){
		Ti.API.info("/////Instagram.js Line 351 - tokenReturned = True");
		if (token === "access_denied"){
			Ti.API.info("/////Instagram.js Line 353 - token === access_denied");
			Ti.App.fireEvent('app:instagram_access_denied', {});
			status = false;
			Ti.App.Properties.setString("GG_ACCESS_TOKEN", null);
			Ti.App.Properties.setString("GG_REFRESH_TOKEN", null);
			if(success_callback != undefined) {
				success_callback(status);
			}
		}else {
			
			getTokens(token, function(e){
				var res = JSON.parse(e);
				Ti.API.debug(res);
				Ti.API.debug('Setting ACCESS_TOKEN: '+res.access_token);
				Ti.API.debug('Setting REFRESH_TOKEN: '+res.refresh_token);
				ACCESS_TOKEN = res.access_token;
				REFRESH_TOKEN = res.refresh_token;
				status = true;
				Ti.App.Properties.setString("GG_ACCESS_TOKEN", ACCESS_TOKEN);
				Ti.App.Properties.setString("GG_REFRESH_TOKEN", REFRESH_TOKEN);
				Ti.App.fireEvent('app:instagram_token', {
					access_token: ACCESS_TOKEN,
					refresh_token: REFRESH_TOKEN
				});
				if(success_callback != undefined) {
					success_callback(status);
				}
			});	
		}
		
		//destroyAuthorizeUI();
	}
};

exports.InstagramService = InstagramService;