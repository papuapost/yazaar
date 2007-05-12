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

	/**
	* @class Tips
	* Tooltips manager object....
	* @constructor
	*/
	YAHOO.CMS.behaviors.tooltipManager = function() {
		var obj = {};
		// private stuff
	    var actionControlTips = function (layer, args) {
		  if (!args[1].decrepitate) {
		  	  var el = $B.getAncestorByTagName( args[1].target, 'A' );
		      if (el && !(obj.lastTarget && (obj.lastTarget === el))) {
			  	obj.compile ( args[0], el );
			  }
		  }
	    };
		$B.bubble.rollover.subscribe(actionControlTips);
		var userConfig = { className: 'yui-tt', opacity: '0.9' };
		// public vars
		obj.tooltip = null;
		obj.lastTarget = null;
		obj.lastTitle = '';
		// public methods
		obj.compile = function( e, el ) {
			  if (el && (el.getAttribute)) {
				// setting the object
		  	    if (this.tooltip) {
				  	restore ();
				}
				else {
					create (el);
				}
				// saving the values for restoration...
				save(el);
				var path = el.getAttribute('href'),
					access = ( el.accessKey ? " ["+el.accessKey+"]" : "" ),
					tip = (this.lastTitle?this.lastTitle + '<br />' : "" );
				if (!path || (path.indexOf('/#') === 0) || (path.indexOf('#') === 0) || (path.indexOf('javascript:') === 0) || (path == '/')) {
				  path = ''; // remove the anchor links if it´s empty or null	
				}
				else {
				  path = (path.length > 30 ? path.substring(0,30)+"..." : path); // remove the anchor links if it´s empty or null	
				}
				// verifing if we really have text to display in the tooltip
				if (tip+access+path != '') {
				  this.tooltip.cfg.setProperty("text", tip+'<em>'+access+'<em>'+path, true);
				  // Eliminando todos los ATL de las imagenes que estan dentro del Anchor - for IE
				  try {
					var childs = el.getElementsByTagName("img");
					if (childs && (childs.length > 0)) 
					  for (var i=0; i<childs.length; i++)
					    childs[i].alt = '';
				  } catch (e) {}
				  show (e, el);
				  return true;
			    }
			  }
			  return false;
		};
		var save = function (el) {
			obj.lastTarget = el;
			obj.lastTitle = el.getAttribute('title');
			el.setAttribute('title', '');
			
		};
		var restore = function () {
			obj.lastTarget.setAttribute ('title', obj.lastTitle);
		};
		var create = function (el) {
			obj.tooltip = new YAHOO.widget.Tooltip(userConfig.className, { 
							  preventoverlap:true,
							  constraintoviewport:true,
							  context:el,
							  hidedelay: 0,
							  autodismissdelay: 5000,
							  text: '' 
						  });
		    $D.setStyle (userConfig.className, 'opacity', userConfig.opacity);
		};
		var show = function (e, el) {
			obj.tooltip.cfg.setProperty("context", el, true);
			obj.tooltip.onContextMouseMove(e, obj.tooltip);
			obj.tooltip.onContextMouseOver(e, obj.tooltip);
			//obj.tooltip.doShow();
		};
		return obj;
	}();
})();