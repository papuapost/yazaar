/*
Copyright (c) 2007, Husted dot Com, Inc. All rights reserved.
Code licensed under the BSD License: http://developer.yahoo.net/yui/license.txt
*/
if (typeof parent.MY != "undefined") {
    var MY = parent.MY; // Application Class namespace
    var my = parent.my; // Application singleton
} else {
    
    var MY = {};
    var my = {};
    
	my.message = false; // ISSUE: Make private
	my.isMessage = function(b) {
    	if (typeof b == 'boolean') {
        	my.message = b;
    	}
   	return my.message;
	};

	my.error = function (sMessage, sStackTrace) {    
  		var sTemplate = "<table><tr><th valign=top>Message:&nbsp;</th><td>{message}</td></tr><tr><th valign=top>Location:</th><td>{stackTrace}</td></tr></table>";
  		var oContext = {message: sMessage, stackTrace: sStackTrace};
  		document.getElementById("elError").innerHTML = sTemplate.supplant(oContext);
  		alert("Error Communicating with Server! See message area for details.");  
  		my.isMessage(true);
	};

	my.asyncRequestError = function (o) {
    	var oPayload =  eval("(" + o + ")") ; // JSON.eval(o);
    	error(oPayload.error.message,oPayload.error.stackTrace);
	};

	my.asyncRequest = function (sAction, fnCallback) {
		return YAHOO.util.Connect.asyncRequest("POST", sAction, {
            success : function(o)
        		{
             		var oPayload =  eval("(" + o.responseText + ")") ; // JSON.eval(o.responseText)           
             		if (oPayload.error) {
                		my.error( payload.error.message, payload.error.stackTrack );
                 	return;
              	}
            	fnCallback(oPayload);
        	},
        	failure : function(o)
        	{
            	my.asyncRequestError(o.responseText);
        	}
    	});
	};              

    MY.Event = function() {
        return this;
    };
    YAHOO.augment(MY.Event, YAHOO.util.EventProvider);
    my.oEvent = new MY.Event();

    MY.View = function(sName,sTitle) {
        var oView = new YAHOO.widget.Overlay(sName);
        oView.oContent = null;
        my.oViewManager.register(oView);
        my.oViewManager.oViews[sTitle] = oView;
        oView.render();
        return oView;
    };

    my.oLogger = null;   
    my.log = function(msg, cat, src) {
        var l=my.oLogger;
        if(l && l.log) {
            return l.log(msg, cat, src);
        } else { 
            return YAHOO.log(msg, cat, src);
        }
    };

    my.info = function(sMessage) {
        if (my.oLogger) YAHOO.log(sMessage,"info");
    };
    my.error = function(sMessage) {
        if (my.oLogger) YAHOO.log(sMessage,"error");
    };
    my.warn = function(sMessage) {
        if (my.oLogger) YAHOO.log(sMessage,"warn");
    };    

    my.oViewConfig = {
        width:"800px",
        fixedcenter: false,
        constraintoviewport: true,
        underlay:"shadow",
        close:true,
        visible:true,
        draggable:true
    };

    my.oViewManager = new YAHOO.widget.OverlayManager();
    my.oViewManager.oViews = {};
}
