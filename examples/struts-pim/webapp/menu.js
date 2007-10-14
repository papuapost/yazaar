/*
Copyright (c) 2007, Husted dot Com, Inc. All rights reserved.
Code licensed under the BSD License: http://developer.yahoo.net/yui/license.txt
*/
MY.Menu = function(elName,sTitleTemplate) {   
    var sTemplate = sTitleTemplate || "";    
    if (elName) {
        // MY.Menu.superclass.constructor.call(this, elName);
        this.oTabView = new YAHOO.widget.TabView(elName);
        this.oTabView.oMenu = this;
        this.sTitleTemplate = sTemplate;
        this.init();
    } else {
        my.error("Menu: Missing parameter elName. Object not initialized","error");
    }
};

// YAHOO.lang.extend(MY.Menu, YAHOO.widget.TabView); // FIXME: Why doesn't extending work? (or is not extending better?)

MY.Menu.prototype.aFrameTitles = [];

MY.Menu.prototype.initTab = function(nTab, sTitle, sLocation, isLoaded) {
    if (arguments<4) {
        my.error("initTab: All parameters are required!");
        return;
    }
    var oTab = this.oTabView.getTab(nTab); 
    // Extend via expando
    oTab.sTitle = sTitle;
    oTab.sLocation = sLocation;
    oTab.isLoaded = isLoaded;
    this.aFrameTitles.push(sTitle); // FIXME: Should be [nTab]
};

MY.Menu.prototype.setTitle = function(nIndex) {
    var oTab = this.oTabView.getTab(nIndex);
    if (YAHOO.lang.isUndefined(oTab)) {
        my.error("setTitle: No such tab " + n);
        return false;
    }
    if (!oTab.isLoaded) {
        window.frames[oTab.sTitle].location = oTab.sLocation;
        oTab.isLoaded = true;
    }
    var sTitle = oTab.sTitle;
    document.title = this.sTitleTemplate.supplant({sTitle: sTitle}); 
    // YAHOO.util.Dom.setStyle(this.aFrameTitles, 'display', 'non'); // FIXME: Why doesn't an array property work?
    // TODO: Extend ViewManager from OverlayManager and add the iFrame hide/show code
    YAHOO.util.Dom.setStyle(['Welcome', 'Contacts', 'Notes', 'Logs'], 'display', 'none'); 
    YAHOO.util.Dom.setStyle(sTitle, 'display', 'block');
    var oView = my.oViewManager.oViews[sTitle];
    if (oView) oView.focus();    
    return true;
};

MY.Menu.prototype.init = function () {    
    // TODO: Post tab/iframe settings from constructure using a config object, 
    // so that tokens like "Home" are in the same file. 
    this.initTab(0,"Welcomes","welcome.html",true);
    this.initTab(1,"Contacts","contact.html",false);
    this.initTab(2,"Notes","../jsnotes/index.html",false);
    this.initTab(3,"Logs","Log.html",true);
    var onActiveTabChange = function(e) {
        var nIndex = this.get('activeIndex');
        this.oMenu.setTitle(nIndex);
	};
    this.oTabView.on('activeTabChange', onActiveTabChange);     
};

