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

var newWindow = Ti.UI.createWindow({
		backgroundColor: 'purple',
		width: '100%',
		height: '100%',
		layout:'horizontal'
	});

Ti.App.addEventListener('tokenReceived',function(e){
	
	
	function createView(image){
		var self = Ti.UI.createImageView({
			image: image,
			height: '100dp',
			width: '100dp'
		});
		
		return self;
	};
	
	 var url = "https://api.instagram.com/v1/tags/coffee/media/recent?access_token=" + e.token;
	 var client = Ti.Network.createHTTPClient({
	     // function called when the response data is available
	     onload : function(e) {
	         Ti.API.info("Received text: " + this.responseText);
	         var data = JSON.parse(this.responseText);
	         
	         for(i=0; i< data.data.length; i++){
	         	var view = new createView(data.data[i].images.thumbnail.url);
	         	newWindow.add(view);
	         };
	         
	     },
	     // function called when an error occurs, including a timeout
	     onerror : function(e) {
	         Ti.API.debug(e.error);
	         alert('error');
	     },
	     timeout : 5000  // in milliseconds
	 });
	 // Prepare the connection.
	 client.open("GET", url);
	 // Send the request.
	 client.send();
		
		
});

newWindow.open();
