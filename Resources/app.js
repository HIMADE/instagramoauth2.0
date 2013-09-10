var Google = require('core/google').GoogleService;  //Make sure path is correct
 
var win = Ti.UI.createWindow({
    fullscreen: true,
    backgroundColor: '#fff',
    navBarHidden: false,
    title: 'Demo'
});
win.open();
 
// Google params
var ggParams = {
    clientId: ' 470b822ca5a7475ea07f907003cfda0d',
    clientSecret: ' 3808a4af22cd4548b363a690a080f690',
    redirectUri: 'http://localhost',
    devKey: '',
}
 
// Initialize Google Service
var google = new Google(ggParams);
 
google.login(function(e){
    Ti.API.info('Token: ' + google.accessToken());
 
    google.refreshToken(function(e){
        Ti.API.info('New Token: ' + e.token);
    });
 
    var params = {
        params: [],
        call: 'userinfo',
        method: 'GET'
    };
 
    google.callMethod(params, function(e) {
        Ti.API.info(e);
    }, null);
});