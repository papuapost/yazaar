/*
* JavaScript Bubbling Library (c) MIT License 2007
* http://bubbling.comarq.com/eng/licence
* Free Support: http://bubbling.comarq.com/
* V 2.2.0
*/
(function() {
	
    var $CMS = YAHOO.CMS,
  	    $B = YAHOO.CMS.Bubble,
  	    $Y = YAHOO.util,
  	    $L = YAHOO.lang,
	    $E = YAHOO.util.Event,
	    $D = YAHOO.util.Dom,
	    $C = YAHOO.util.Connect,
	    $ =  YAHOO.util.Dom.get;

	/**
	* @class Tips
	* Tooltips manager object....
	* @constructor
	*/
	YAHOO.CMS.widget.Tips = function() {
		var obj = {};
		var forbbidenAncestors = ['yuimenu', 'yuimenubar', 'yui-nav'];
		// private stuff
	    var actionControlTips = function (layer, args) {
		  if (!args[1].decrepitate) {
		  	  var el = $B.getAncestorByTagName( args[1].target, 'A' );
		      if (el && !(obj.lastTarget && (obj.lastTarget === el))) {
		      	// apply customized filters
		   		for (var i=0; i<forbbidenAncestors.length; i++)
			      if ($L.isObject( $B.getAncestorByClassName( el, forbbidenAncestors[i] ))) {
			         return;
			      }   
			    // the tooltip will be showed... and the event continue...     
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
			  if ($L.isObject(el)) {
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


	/**
	* @class Balloons
	* Balloons manager object....
	* @constructor
	*/
	YAHOO.CMS.widget.Balloons = function() {
		var obj = {};
		// private stuff
		var actions = {
			actionToogleBalloons: function (layer, args) {
				obj.toggle();
			},
			actionHideBalloons: function () {
				obj.hide();
			},
			actionShowBalloons: function () {
				obj.show();
			}
		};		
	    var actionControlBalloons = function (layer, args) {
		  $B.processingAction (layer, args, actions);
	    };
	    var actionRepaintBalloons = function (layer, args) {
		  if (!args[1].decrepitate) {
		  	obj.relocate(args[0]);
		  }
	    };
		$B.bubble.navigate.subscribe(actionControlBalloons);
		$B.bubble.repaint.subscribe(actionRepaintBalloons);

		// public vars
		obj.items = {};
		obj.visible = true;
		// public methods
		obj.add = function( el, userConfig ) {
			if (el && ((typeof el == 'object') || (el = $( el )))) {
				var ref = $E.generateId (el);
				this.release(ref);
				this.items[ref] = new YAHOO.CMS.widget.Helphint(ref+'-hint', { 
							  preventoverlap:false,
							  constraintoviewport:true,
							  zIndex: 10,
							  context:el, 
							  text: String(userConfig.text),
							  alt: String(userConfig.alt), 
							  trigger: userConfig.trigger, 
							  position: userConfig.position
						  });
				return ref;
			  }
			  else 
			    return null;
		};
		obj.get = function (ref) {
			if (ref && this.items.hasOwnProperty(ref))
			  return this.items[ref];
			else
			  return null;
		}
		obj.release = function( ref ) {
			if (ref && this.items.hasOwnProperty(ref) && this.items[ref]) {
			  this.items[ref].hide();
			  this.items[ref].destroy();
			  this.items[ref] = null;
			}
		};
		obj.show = function() {
		  for (ref in this.items) {
			if (this.items.hasOwnProperty(ref) && this.items[ref]) {
   				this.items[ref].doShow();
   				this.items[ref].relocate();
			}
		  }			
		  this.visible = true;
		};
		obj.hide = function () {
		  for (ref in this.items) {
			if (this.items.hasOwnProperty(ref) && this.items[ref]) {
   				this.items[ref].hide();
			}
		  }			
		  this.visible = false;
		};
		obj.toggle = function () {
		  if (this.visible) 
		    this.hide();
	      else
		    this.show();
		};
		obj.relocate = function(e) {
		  for (ref in this.items) {
			if (this.items.hasOwnProperty(ref) && this.items[ref]) {
   				this.items[ref].relocate(e);
			}
		  }			
		};			
		
		return obj;
	}();


	/**
	* @class
	* Helphint is an implementation of Overlay that behaves like an OS helphint, displaying when the user mouses over a particular element, and disappearing on mouse out.
	* @param {string}	el	The element ID representing the Helphint <em>OR</em>
	* @param {Element}	el	The element representing the Helphint
	* @param {object}	userConfig	The configuration object literal containing the configuration that should be set for this Overlay. See configuration documentation for more details.
	* @constructor
	*/
	YAHOO.CMS.widget.Helphint = function(el, userConfig) {
		YAHOO.CMS.widget.Helphint.superclass.constructor.call(this, el, userConfig);
	}
	
	YAHOO.extend(YAHOO.CMS.widget.Helphint, YAHOO.widget.Overlay);
	
	/**
	* Constants representing the Helphint CSS class
	* @type string
	* @final
	*/
	YAHOO.CMS.widget.Helphint.CSS_HELPHINT = "hh";
	YAHOO.CMS.widget.Helphint.CSS_HELPHINT_RIGHT_TOP    = "hhtr";
	YAHOO.CMS.widget.Helphint.CSS_HELPHINT_RIGHT_BOTTOM = "hhbr";
	YAHOO.CMS.widget.Helphint.CSS_HELPHINT_LEFT_TOP     = "hhtl";
	YAHOO.CMS.widget.Helphint.CSS_HELPHINT_LEFT_BOTTOM  = "hhbl";
	YAHOO.CMS.widget.Helphint.opacity  = "0.85";
	
	/**
	* The Helphint initialization method. This method is automatically called by the constructor. A Helphint is automatically rendered by the init method, and it also is set to be invisible by default, and constrained to viewport by default as well.
	* @param {string}	el	The element ID representing the Helphint <em>OR</em>
	* @param {Element}	el	The element representing the Helphint
	* @param {object}	userConfig	The configuration object literal containing the configuration that should be set for this Helphint. See configuration documentation for more details.
	*/
	YAHOO.CMS.widget.Helphint.prototype.init = function(el, userConfig) {
		if (document.readyState && document.readyState != "complete") {
			var deferredInit = function() {
				this.init(el, userConfig);
			}
			$E.addListener(window, "load", deferredInit, this, true);
		} else {
			YAHOO.CMS.widget.Helphint.superclass.init.call(this, el);
	
			this.beforeInitEvent.fire(YAHOO.CMS.widget.Helphint);
	
			if (userConfig) {
				this.cfg.applyConfig(userConfig, true);
			}
			
			this.cfg.queueProperty("visible",false);
			this.cfg.queueProperty("constraintoviewport",false);
			
			// dynamic class and position
			$D.addClass(this.element, YAHOO.CMS.widget.Helphint.CSS_HELPHINT);
			var position = new String(userConfig.position);
		    switch (position.toString()) {
			  case "2cw": 
					   this.cfg.addProperty("position", { value: 'tr'} );
					   this.cfg.addProperty("corner"  , { value: 'bl'} );
					   $D.addClass(this.element, YAHOO.CMS.widget.Helphint.CSS_HELPHINT_RIGHT_TOP);
			           break;
			  case '4cw': 
					   this.cfg.addProperty("position", { value: 'br'} );
					   this.cfg.addProperty("corner"  , { value: 'tl'} );
					   $D.addClass(this.element, YAHOO.CMS.widget.Helphint.CSS_HELPHINT_RIGHT_BOTTOM);
			           break;
			  case '7cw': 
					   this.cfg.addProperty("position", { value: 'bl'} );
					   this.cfg.addProperty("corner"  , { value: 'tr'} );
					   $D.addClass(this.element, YAHOO.CMS.widget.Helphint.CSS_HELPHINT_LEFT_BOTTOM);
			           break;
			  case "10cw": 
					   this.cfg.addProperty("position", { value: 'tl'} );
					   this.cfg.addProperty("corner"  , { value: 'br'} );
					   $D.addClass(this.element, YAHOO.CMS.widget.Helphint.CSS_HELPHINT_LEFT_TOP);
			           break;
			  default:
					   this.cfg.addProperty("position", { value: 'tr'} );
					   this.cfg.addProperty("corner"  , { value: 'bl'} );
					   $D.addClass(this.element, YAHOO.CMS.widget.Helphint.CSS_HELPHINT_RIGHT_TOP);
		    }
			// end position definition...
	
	        this.setBody("");
			this.render(this.cfg.getProperty("container"));
			$D.setStyle (this.element, 'opacity', YAHOO.CMS.widget.Helphint.opacity);
	
			this.initEvent.fire(YAHOO.CMS.widget.Helphint);
			this.doShow( el );
			
	        var obj = this;
			$E.addListener ( this.element, 'click', this.hide, obj, true );
			if (this.cfg && this.cfg.getProperty("trigger"))
			  $E.addListener ( this.cfg.getProperty("trigger"), 'mouseover', this.hide, obj, true );
		}
	}
	
	/**
	* Initializes the class's configurable properties which can be changed using the Overlay's Config object (cfg).
	*/
	YAHOO.CMS.widget.Helphint.prototype.initDefaultConfig = function() {
		YAHOO.CMS.widget.Helphint.superclass.initDefaultConfig.call(this);
	
		this.cfg.addProperty("preventoverlap",		{ value:true, validator:this.cfg.checkBoolean, supercedes:["x","y","xy"] } );
	
		this.cfg.addProperty("autodismissdelay",	{ value:1000, handler:this.configAutoDismissDelay, validator:this.cfg.checkNumber } );
		this.cfg.addProperty("hidedelay",			{ value:2500, handler:this.configHideDelay, validator:this.cfg.checkNumber } );
	
		this.cfg.addProperty("text",				{ handler:this.configText, suppressEvent:true } );
		this.cfg.addProperty("container",			{ value:document.body, handler:this.configContainer } );
	
		this.cfg.addProperty("alt",				    {} );
		this.cfg.addProperty("trigger",			    {} );
	
	}
	
	// BEGIN BUILT-IN PROPERTY EVENT HANDLERS //
	
	/**
	* The default event handler fired when the "text" property is changed.
	*/
	YAHOO.CMS.widget.Helphint.prototype.configText = function(type, args, obj) {
		var text = args[0];
		if (text) {
			this.setBody(text);
		}
	}
	
	/**
	* The default event handler fired when the "container" property is changed.
	*/
	YAHOO.CMS.widget.Helphint.prototype.configContainer = function(type, args, obj) {
		var container = args[0];
		if (typeof container == 'string') {
			this.cfg.setProperty("container", document.getElementById(container), true);
		}
	}
	
	/**
	* The default event handler fired when the "context" property is changed.
	*/
	YAHOO.CMS.widget.Helphint.prototype.configContext = function(type, args, obj) {
		var context = args[0];
		if (context) {
			
			// Normalize parameter into an array
			if (! (context instanceof Array)) {
				if (typeof context == "string") {
					this.cfg.setProperty("context", [$(context)], true);
				} else { // Assuming this is an element
					this.cfg.setProperty("context", [context], true);
				}
				context = this.cfg.getProperty("context");
			}
	
			// Add mouseover/mouseout listeners to context elements
			this._context = context;
			for (var c=0;c<this._context.length;++c) {
				var el = this._context[c];
				$E.addListener(el, "mouseover", this.onContextMouseOver, this);
			}
		}
	}
	
	// END BUILT-IN PROPERTY EVENT HANDLERS //
	
	// BEGIN BUILT-IN DOM EVENT HANDLERS //
	
	/**
	* The default event handler fired when the user mouses out of the context element.
	* @param {DOMEvent} e	The current DOM event
	* @param {object}	obj	The object argument
	*/
	YAHOO.CMS.widget.Helphint.prototype.onContextMouseOver = function(e, obj) {
		var el = this;
	
	    if (obj.cfg.getProperty("alt") == 'undefined') {
			obj.hide();
			return;
		}
		obj.setBody(obj.cfg.getProperty("alt"));
	
		if (obj._tempTitle) {
			el.title = obj._tempTitle;
			obj._tempTitle = null;
		}
		
		if (obj.showProcId) {
			clearTimeout(obj.showProcId);
			obj.showProcId = null;
		}
	
		if (obj.hideProcId) {
			clearTimeout(obj.hideProcId);
			obj.hideProcId = null;
		}
	
	
		obj.hideProcId = setTimeout(function() {
					obj.hide();
					}, obj.cfg.getProperty("hidedelay"));
	}
	
	// END BUILT-IN DOM EVENT HANDLERS //
	
	/**
	* Processes the showing of the Helphint by setting the timeout delay and offset of the Helphint.
	* @param {DOMEvent} e	The current DOM event
	* @return {int}	The process ID of the timeout function associated with doShow
	*/
	YAHOO.CMS.widget.Helphint.prototype.doShow = function(e, context) {
		
	    this.setBody(this.cfg.getProperty("text"));	
		var me = this;
		me.align(me.cfg.getProperty("corner"), me.cfg.getProperty("position"));
		me.show();
	}
	/**
	* Processes the relocate  of the Helphint by setting the correct XY of the Helphint.
	* @param {DOMEvent} e	The current DOM event
	* @return {int}	The process ID of the timeout function associated with doShow
	*/
	YAHOO.CMS.widget.Helphint.prototype.relocate = function(e) {
		if (this.cfg.getProperty("visible") == true) {
		  this.align(this.cfg.getProperty("corner"), this.cfg.getProperty("position"));
		  this.show();
		}
	}
	
	/**
	* Sets the timeout for the auto-dismiss delay, which by default is 5 seconds, meaning that a helphint will automatically dismiss itself after 5 seconds of being displayed.
	*/
	YAHOO.CMS.widget.Helphint.prototype.doHide = function() {
		var me = this;
		return setTimeout(
			function() {
				me.hide();
			},
			this.cfg.getProperty("autodismissdelay"));
	}
	
	/**
	* Returns a string representation of the object.
	* @type string
	*/ 
	YAHOO.CMS.widget.Helphint.prototype.toString = function() {
		return "Helphint " + this.id;
	}
})();