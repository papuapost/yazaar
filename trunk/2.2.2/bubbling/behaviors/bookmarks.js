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
	* @class BookmarkLinks
	* BookmarkLinks is an implementation of a Context Menu to link to the most importants Bookmark Systems on the WEB.
	* @constructor
	*/
	YAHOO.CMS.behaviors.BookmarkLinks = function() {
		var obj = {};
		var menuClassName = "cms_bookmark_contextmenu";
		var properties = {
			actionBookmark: function (layer, args) {
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

	    // ----------------------------------------------
	    // Define the items for the context menu
	    // ----------------------------------------------
	    var aMenuItems = [
	        { text: CMO_BOOKMARK_MENEAME, url:'http://meneame.net/submit.php?url={URI}', value:true, target: 'blank' }, 
	        { text: CMO_BOOKMARK_DIGG, url:'http://www.digg.com/submit?url={URI}', value:true, target: 'blank' }, 
	        { text: CMO_BOOKMARK_DELICIOUS, url:'http://del.icio.us/post?url={URI}&amp;title={TITLE}', value:true, target: 'blank' }, 
	        { text: CMO_BOOKMARK_TECHNORATI, url:'http://technorati.com/faves?add={URI}', value:true, target: 'blank' }, 
	        { text: CMO_BOOKMARK_YAHOO, url:'http://myweb2.search.yahoo.com/myresults/bookmarklet?u={URI}&amp;t={TITLE}', value:true, target: 'blank' }, 
	        { text: MCMS_CLOSE }
	    ];	
	    // "click" event handler for each item in the context menu
	    var onContextMenuClick = function (p_sType, p_aArgs, p_oMenu) {
	        var oItem = p_aArgs[1];
			obj.oContextMenu.hide();
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
				if (oItem.value) {// if true, then apply the escape function for each params...
				  uri = escape(uri);
				  title = escape(title);
				}  
				rss = rss.replace( new RegExp( "{URI}", "g" ), uri );
				rss = rss.replace( new RegExp( "{TITLE}", "g" ), title );
				oItem.cfg.setProperty("url", rss);
	        }
		};
	    // "render" event handler for the context menu
	    var onContextMenuRender = function (p_sType, p_aArgs, p_oMenu) {
			$D.addClass(this.getItem(0).element, 'cms_bm_meneame');
			$D.addClass(this.getItem(1).element, 'cms_bm_digg');
			$D.addClass(this.getItem(2).element, 'cms_bm_delicious');
			$D.addClass(this.getItem(3).element, 'cms_bm_technorati');
			$D.addClass(this.getItem(4).element, 'cms_bm_yahoo');
			$D.addClass(this.getItem(5).element, 'closemenu');
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