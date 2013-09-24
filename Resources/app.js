var Instagram = require('core/instagram').InstagramService;  //Make sure path is correct
 
var win = Ti.UI.createWindow({
    fullscreen: true,
    backgroundColor: '#fff',
    navBarHidden: false,
    title: 'Demo'
});
win.open();
 
 Ti.include("secret.js");
// Instagram params
var ggParams = {
    clientId: clientid,
    clientSecret: clientsecret,
    redirectUri: 'http://localhost',
    devKey: ''
};
 
// Initialize Instagram Service
var instagram = new Instagram(ggParams);
 
instagram.login(function(e){
    Ti.API.info('App.js Token: ' + instagram.accessToken());
 
    instagram.refreshToken(function(e){
        Ti.API.info('New Token: ' + e.token);
    });
 
    var params = {
        params: [],
        call: 'userinfo',
        method: 'GET'
    };
 
    instagram.callMethod(params, function(e) {
        Ti.API.info(e);
    }, null);
});

Ti.App.addEventListener('tokenReceived',function(e){
		var InstaMap = require('ui/common/instamap');
		var instamap = new InstaMap(e);
		instamap.open();
});

