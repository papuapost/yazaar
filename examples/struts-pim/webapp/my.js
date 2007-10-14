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
