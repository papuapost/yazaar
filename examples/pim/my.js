/*
Copyright (c) 2007, Husted dot Com, Inc. All rights reserved.
Code licensed under the BSD License: http://developer.yahoo.net/yui/license.txt
*/
if (typeof parent.MY != "undefined") {
    var MY = parent.MY; // Application Class namespace
    var my = parent.my; // Application singleton
} else {
    var $ = YAHOO.util.Dom.get;

    var MY = {};

    var my = {};

    MY.Events = function() {
        this.createEvent("contactsList")
        return this;
    };
    YAHOO.augment(MY.Events, YAHOO.util.EventProvider);

    MY.View = function(sName,sTitle) {
        var oView = new YAHOO.widget.Overlay(sName);
        oView.oContent = null;
        my.oViewManager.register(oView);
        my.oViewManager.oViews[sTitle] = oView;
        oView.render();
        return oView;
    };

    my.info = function(sMessage) {
        YAHOO.log(sMessage,"info");
    };

    my.error = function(sMessage) {
        YAHOO.log(sMessage,"error");
    };

    my.warn = function(sMessage) {
        YAHOO.log(sMessage,"warn");
    };

    my.oEvents = new MY.Events();

    my.oEvents.onContactsListReturn = function(oData) {
        YAHOO.log("contactsList Event");
        my.oEvents.fireEvent("contactsList", oData);
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
