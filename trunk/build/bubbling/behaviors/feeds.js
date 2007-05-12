/*
* JavaScript Bubbling Library (c) MIT License 2007
* http://bubbling.comarq.com/eng/licence
* Free Support: http://bubbling.comarq.com/
* V 2.2.0
*/
(function() {
	
    var $B = YAHOO.CMS.Bubble,
  	    $Y = YAHOO.util,
	    $E = YAHOO.util.Event,
	    $D = YAHOO.util.Dom,
	    $ =  YAHOO.util.Dom.get;

    var GetListItemFromEventTarget = function (p_oNode) {
        var oLI;
        if(p_oNode.tagName == "LI") {
            oLI = p_oNode;
        }
        else {
            /*   If the target of the event was a child of an LI, get the parent LI element */
            do {
                if(p_oNode.tagName == "LI") {
                    oLI = p_oNode;                            
                    break;
                }
            }
            while((p_oNode = p_oNode.parentNode));
        }
        return oLI;
    };

	/**
	* @class FeedLinks
	* FeedLinks is an implementation of a Context Menu to link to the most importants RSS reader on the WEB.
	* @constructor
	*/
	YAHOO.CMS.behaviors.FeedLinks = function () {
		var obj = {};
		var menuClassName = "cms_rssfeed_contextmenu";
		var properties = {
			actionRSSFeed: function (layer, args) {
			  var e = args[0], 
				  o = args[1] || {},
				  el = o.target || $E.getTarget(e);
			  el = $B.getAncestorByTagName( el, 'A' );
			  if (obj.oContextMenu) {
			  	obj.oContextMenu.clearContent ();
			  	obj.oContextMenu.destroy ();
			  }

			  // ----------------------------------
			  // Create the SaveAs context menu
			  // ----------------------------------
			  obj.oContextMenu = new YAHOO.widget.ContextMenu(
	                                menuClassName, 
	                                {
	                                    trigger: el,
	                                    itemdata: aMenuItems,
	                                    lazyload: true
	                                }
	                            );
			  // Add a "render" event handler to the AutoReader context menu
			  obj.oContextMenu.renderEvent.subscribe(onContextMenuRender, obj.oContextMenu, true);
			  obj.oContextMenu.render ();
			  obj.oContextMenu.show();
			  obj.oContextMenu._onTriggerContextMenu( e, obj.oContextMenu );
			  // add the correct opacity value...	
			  $D.setStyle (menuClassName, 'opacity', 0.9);
			}
		};
		var actionControlContextMenus = function (layer, args) {
		  $B.processingAction (layer, args, properties);
		};
		$B.bubble.navigate.subscribe(actionControlContextMenus);		
		$B.bubble.property.subscribe(actionControlContextMenus);
		
	    // -----------------------------------------
	    // Define the items for the context menu
	    // -----------------------------------------
	    var aMenuItems = [
	        { text: CMO_RSS_BLOGLINES, url:'http://www.bloglines.com/sub/{URI}', value:true, target: 'blank' }, 
	        { text: CMO_RSS_YAHOO, url:'http://add.my.yahoo.com/rss?url={URI}', value:true, target: 'blank' }, 
	        { text: CMO_RSS_GOOGLE, url:'http://fusion.google.com/add?feedurl={URI}', value:true, target: 'blank' }, 
	        { text: CMO_RSS_NETVIBES, url:'http://www.netvibes.com/subscribe.php?url={URI}', value:true, target: 'blank' }, 
	        { text: CMO_RSS_MSN, url:'http://my.msn.com/addtomymsn.armx?id=rss&amp;ut={URI}&amp;ru='+document.location, value:true, target: 'blank' }, 
	        { text: CMO_RSS_NEWSGATOR, url:'http://www.newsgator.com/ngs/subscriber/subext.aspx?url={URI}', value:true, target: 'blank' }, 
	        { text: CMO_RSS_LIVE, url:'{URI}', value:false, target: 'blank' }, 
	        { text: MCMS_CLOSE }
	    ];
	
	    // "click" event handler for each item in the context menu
	    var onContextMenuClick = function (p_sType, p_aArgs, p_oMenu) {
	        var oItem = p_aArgs[1];
			obj.oContextMenu.hide();
		 	$B.eventGarbage(p_sType);
		};	

	    // "processing" each element... to get the correct url...
		var onContextMenuCompile = function ( oItem ) {
			var rss = oItem.cfg.getProperty("url");
	        if(oItem && rss) {
				// proccesing the url...
				var t = $B.getFirstChildByTagName ( oItem.element, 'A' ),
					uri = oItem.parent.cfg.getProperty("trigger").href,
					title = oItem.parent.cfg.getProperty("trigger").title;
				t.setAttribute ('target', 'blank');
				if (oItem.value) // if true, then apply the escape function for each params...
				  uri = escape(uri);
				rss = rss.replace( new RegExp( "{URI}", "g" ), uri );
				oItem.cfg.setProperty("url", rss);
	        }
		}; 

	    // "render" event handler for the context menu
	    var onContextMenuRender = function (p_sType, p_aArgs, p_oMenu) {
			$D.addClass(this.getItem(0).element, 'cms_rss_bloglines');
			$D.addClass(this.getItem(1).element, 'cms_rss_yahoo');
			$D.addClass(this.getItem(2).element, 'cms_rss_google');
			$D.addClass(this.getItem(3).element, 'cms_rss_netvibes');
			$D.addClass(this.getItem(4).element, 'cms_rss_msn');
			$D.addClass(this.getItem(5).element, 'cms_rss_newsgator');
			$D.addClass(this.getItem(6).element, 'cms_rss_link');
			$D.addClass(this.getItem(7).element, 'closemenu');
		    //  Add a "click" event handler to the context menu
		    this.clickEvent.subscribe(onContextMenuClick, this, true);
			$D.batch (this._getItemGroup(), onContextMenuCompile, this, true);
	    };

		// public vars
		obj.oContextMenu = null;
		// public methods
		return obj;
	}();
})();