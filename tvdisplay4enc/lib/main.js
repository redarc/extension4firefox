var buttons = require('sdk/ui/button/action');
var tabs = require("sdk/tabs");
var timer = require("sdk/timers");
var pageExist = false;
var data = require("sdk/self").data;
var urlArray = new Array();
var config = new Object();
config.switchInterval = 10000;//ms
config.scrollInterval = 2000;//ms
config.scrollTime = 500;//ms
config.scrollStep = 2500;//px

var i = 0;

/////////////////////////////////////////////////////////////////////

var {Cc, Ci} = require("chrome");
var {Cu} = require("chrome");
const {components} = require("chrome");
Cu.import("resource://gre/modules/FileUtils.jsm");
Cu.import("resource://gre/modules/NetUtil.jsm");
Cu.import("resource://gre/modules/Services.jsm");
var parser = Cc["@mozilla.org/xmlextras/domparser;1"].createInstance(Ci.nsIDOMParser);
//var xmlfile = new FileUtils.File("C:\\Users\\eyaogan\\Desktop\\test.xml");
//var xmlfile = new FileUtils.File("Desk\\test.xml");
var xmlfile = FileUtils.getFile("Desk", ["tvdisplay.xml"]);

NetUtil.asyncFetch(xmlfile, function(inputStream, status) {
	if (!components.isSuccessCode(status)) {
		// Handle error!
		return;
	}
	var content = NetUtil.readInputStreamToString(inputStream, inputStream.available());
	var document = parser.parseFromString(content, "text/xml");
	var rootElement = document.documentElement;	
	var rootChildren = rootElement.children;

	for (var j = 0; j < rootChildren.length; j++) {
	   var nodeItem = rootChildren[j];
	   var nodeName = rootChildren[j].nodeName;
	   if("urls" == nodeName){
		   var nodeItemChildren = nodeItem.children;
	       for(var m=0; m<nodeItemChildren.length; m++){
		       urlArray[m] = nodeItemChildren[m].textContent;
		   }
	   }else if("config" == nodeName){
		   var nodeItemChildren = nodeItem.children;
	       for(var n=0; n<nodeItemChildren.length; n++){
		       var text = nodeItemChildren[n].textContent;
		       switch(nodeItemChildren[n].nodeName){
			       case "switchInterval":
				       config.switchInterval = text;
				       break;
				   case "scrollInterval":
				       config.scrollInterval = text;
					   break;
				   case "scrollTime":
				       config.scrollTime = text;
					   break;
				   case "scrollStep":
				       config.scrollStep = text;
					   break;					   
			       default: 
				       break;
			   }  
		   }
		   console.log('dddddddddddddddddd');
	   }
	}
});


/////////////////////////////////////////////////////////////////////////

var contentScriptString = 'function autoScroll(index){$(\'html,body\').animate({scrollTop: ' + 
    config.scrollStep + 
	'*index},' + 
	config.scrollTime +
	');}times=1;setInterval(\"autoScroll(times++)\",' + 
	config.scrollInterval +
	');'

tabs.on('ready', function(tab){
    tab.attach({
		contentScript: contentScriptString,
		contentScriptFile: data.url('jquery.min.js')
	});
});

var button = buttons.ActionButton({
    id: "mozilla-link",
    label: "Visit Mozilla",
    icon: {
      "16": "./icon-16.png",
      "32": "./icon-32.png",
      "64": "./icon-64.png"
    },
    onClick: handleClick
});

function handleClick(state) {
    if(i == urlArray.length){
	    i = 0;
	}
	
    for each (var tab in tabs){
       if(tab.url == urlArray[i]){
	       pageExist = true;
		   break;
	   }else{
	       pageExist = false;
	   }
	}
	
	if(pageExist){
	    tab.activate();
		tab.reload({
		    ready: function switchWeb2(tab){
			    timer.setTimeout(handleClick, config.switchInterval);
		    }
		});
	}else{
		tabs.open({
		    url: urlArray[i],
		    onReady: function switchWeb(tab){
			    timer.setTimeout(handleClick, config.switchInterval);
		    }
		});
	}
	i++;
}