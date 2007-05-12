/*
* JavaScript Bubbling Library (c) MIT License 2007
* http://bubbling.comarq.com/eng/licence
* Free Support: http://bubbling.comarq.com/
* V 2.2.0
*/
YAHOO.namespace("tms.tabs.cache");
YAHOO.tms.tabs.cache = new Array();
(function() {
	
  var $CMS = YAHOO.CMS,
  	  $B = YAHOO.CMS.Bubble,
  	  $Y = YAHOO.util,
	  $E = YAHOO.util.Event,
	  $D = YAHOO.util.Dom,
	  $C = YAHOO.util.Connect,
	  $ =  YAHOO.util.Dom.get;

	/**
	* @class
	* Tabs and Panels is an implementation of a Multipanel Menu, displaying when the user mouses over a particular element, and disappearing on mouse out.
	* @param {Element}	el	        The element representing the MenuBar
	* @param {object}	userConfig	The configuration object literal containing the configuration that should be set for this Overlay.
	* @constructor
	*/
	YAHOO.CMS.widget.MultiPanels = function(p_oElement, p_oConfig) {
	    this.init(p_oElement, p_oConfig);
	};
	
	YAHOO.CMS.widget.MultiPanels.prototype = {
		
	    area    : null, // div element that represent the dynamic area...
	    list    : null, // ul element...
		context : null, // div element that represent the sliding area (ajax-nail-content)
		opened  : true,
		ready   : false,
		initConfig	: null,
		loading : null,
		cache   : null,
		selected: null,
		anim    : null,
		
		inative_class    	: 'inactive',
		inative_opacity 	: '0.4',
		available_opacity   : '1',
		active_class    	: 'current',
		active_opacity  	: '1',
		discard_opacity  	: '0.6',
		
		timerProcId: null,
		seconds: 1,
	
	    // 
	    init:function (el, userConfig) {
		  this.cache = YAHOO.tms.tabs.cache;
		  this.area  = el;  
		  this.list = userConfig.list || this.list;  
		  this.context  = userConfig.context || this.context;  
			
		  if (
				((typeof this.area == 'object') || (this.area = $( this.area ))) &&
			    ((typeof this.list == 'object') || (this.list = $( this.list ))) && (this.list.tagName == "UL") &&
				((typeof this.context == 'object') || (this.context = $( this.context )))
			 ) {
		    this.ready = true;
		    $D.setStyle(this.context, 'overflow', 'hidden');
	        this.initConfig = userConfig;
	        this.loading = this.context.innerHTML;
		    this.close ( true );
	        var obj = this;
			$E.addListener ( this.area, 'mouseout', this.reset, obj, true );
			$E.addListener ( this.area, "mouseout", this.resetCounting, obj, true);
			
			var el = this.list;
			var l = null;
			for (var i = 0; i < this.list.childNodes.length; i++)
			  if (this.list.childNodes[i].tagName == "LI") {
			    //$E.addListener ( this.list.childNodes[i], 'mouseover', this.trigger, obj, true );
				$E.addListener ( this.list.childNodes[i], "mouseover", this.startCounting, obj, true);
				$E.addListener ( this.list.childNodes[i], "mouseout", this.resetCounting, obj, true);
				$E.addListener ( this.list.childNodes[i], "click", this.trigger, obj, true);
				if (l = this.getLink ( this.list.childNodes[i] )) {
				  //$E.addListener ( l, 'click', $B.eventGarbage );
				}
			  }
		  }
		},    
	
	
	    // disable the tab, and the tab can´t be selected anymore...
	    disable:function ( el ) {
		  if ((typeof el == 'object') || (el = $( el ))) {
			if (el.parentNode && (el.parentNode.tagName == "UL") && (el.tagName == "LI")) {
			  $D.addClass(el, this.inative_class);
			  $D.setStyle(el, 'opacity', this.inative_opacity);
			}
		  }
		},
	    // set available the tab for selection...
	    available:function ( el ) {
		  if ((typeof el == 'object') || (el = $( el ))) {
			if (el.parentNode && (el.parentNode.tagName == "UL") && (el.tagName == "LI")) {
			  $D.removeClass(el, this.inative_class);
			  $D.setStyle(el, 'opacity', this.available_opacity);
			}
		  }
		},
	    // set a tab has active and selected...
	    active: function ( el ) {
		  if ((typeof el == 'object') || (el = $( el ))) {
			if (el.parentNode && (el.parentNode.tagName == "UL") && (el.tagName == "LI")) {
			  $D.addClass(el, this.active_class);
		      $D.setStyle(el, 'opacity', this.active_opacity);
			}
		  }
		},
	
	    // this event reset the state of every tab in the list...
		reset:function (e) {
		  if ((this.ready) && e && (!$B.virtualTarget(e, this.area))) {
			  var el = this.list;
			  for (var i = 0; i < el.childNodes.length; i++)
				if (el.childNodes[i].tagName == "LI") {
				  if ($D.hasClass(el.childNodes[i], this.active_class))
					$D.removeClass(el.childNodes[i], this.active_class);
				  if (!$D.hasClass(el.childNodes[i], this.inative_class))
					$D.setStyle(el.childNodes[i], 'opacity', this.available_opacity);
				}
			  this.close();
		  }
		},
	
	    /**
		* Este metodo se encarga de abrir el panel que debe mostrar el contenido del tab seleccionado
		* @public
		* @return void
		*/
	    open:function () {
		  if (this.ready && !this.opened) {
		    var that = this;
	        try {this.anim.stop();} catch (e) {};
			this.anim = new $Y.Anim(this.context, { height: { from: 0, to: this.context.scrollHeight } }, 1.5, $Y.Easing.easeOutStrong);
			if (that.initConfig.onOpen) {
				this.anim.onComplete.subscribe( that.initConfig.onOpen );
			}
			this.anim.onComplete.subscribe( $B.onRepaint, $B, true );
			this.anim.animate();
		  }
		  this.opened = true;
		},
	    // close the sliding area...
	    close:function ( force ) {
		  if ((this.ready && this.opened) || force) {
			this.update (); // updating the internal cache...
		    var that = this;
	        try {this.anim.stop();} catch (e) {};
			this.anim = new $Y.Anim(this.context, { height: { from: this.context.scrollHeight, to: 0 } }, 1.5, $Y.Easing.easeOutStrong);
			if (that.initConfig.onClose) {
				this.anim.onComplete.subscribe( that.initConfig.onClose );
			}
			this.anim.onComplete.subscribe( $B.onRepaint, $B, true  );
			this.anim.animate();
		  }
		  this.opened = false;
		},
		update:function () {
		  if ((this.ready) && (this.opened) && this.selected){
	 	    if (YAHOO.tms.tabs.cache[this.selected] != this.context.innerHTML)
			  YAHOO.tms.tabs.cache[this.selected] = this.context.innerHTML;
		  }
		},
		
		getLI: function (e) {
		  var t = $E.getTarget ( e );  // target element
		  if (typeof t == 'object')
			  while((t.parentNode) && (typeof t.parentNode == 'object') &&  (t.parentNode.tagName != "BODY")) {
				if (t.parentNode.tagName == "LI")
				  return t.parentNode;
				t = t.parentNode;
			  }
		  return false;
		},
		getLink: function (el) {
		  if ((typeof el == 'object') || (el = $( el ))) {
			  var items = el.getElementsByTagName("a");
			  for (var i=0; i<items.length; i++)
			    if (!$CMS.Common.isEmpty(items[i].href))
				  return items[i];
		  }
		  return false;
		},	
		resetCounting: function () {
			if (this.timerProcId) {
			  window.clearTimeout(this.timerProcId);
			}  
			this.timerProcId = null;
		},
		startCounting: function (ev) {
			this.resetCounting(ev);
			var that = this,
				el   = this.getLI(ev),
				func = function () {
					that.process(el); 
					that.timerProcId = null;
				};
			this.timerProcId = setTimeout(func, Math.abs(this.seconds)*1000);
		},
	    trigger:function (e) {
		  var el = this.getLI(e);
		  if (typeof el == 'object') {
			this.process (el);
			$B.eventGarbage(e);
		  }
	    },
	    process:function (el) {
			if (!$D.hasClass(el, this.active_class) && (!$D.hasClass(el, this.inative_class))) {
			  this.update (); // updating the internal cache for the old tab...
			  if (el.parentNode && (el.parentNode.tagName == "UL"))
				for (var i = 0; i < el.parentNode.childNodes.length; i++)
				  if (el.parentNode.childNodes[i].tagName == "LI") {
					if ($D.hasClass(el.parentNode.childNodes[i], this.active_class))
					  $D.removeClass(el.parentNode.childNodes[i], this.active_class);
					if (!$D.hasClass(el.parentNode.childNodes[i], this.inative_class))
					  $D.setStyle(el.parentNode.childNodes[i], 'opacity', this.discard_opacity);
				  }
			  this.active ( el );
			  this.open ();
			  this.load ( el );
			}
	    },
		display: function ( text ) {
		  if (this.ready) {
			  $CMS.Common.safeInnerHTML ( this.context, text );
			  YAHOO.tms.tabs.cache[this.selected] = this.context.innerHTML;
			  if (this.initConfig.onContentChange)
			    this.initConfig.onContentChange.call();
		  }
		},
		// class function...
		tabLoadingSuccess: function(o){ // ojo, todos los valores que se pasan a esta función vienen sin el ambito del objeto, es una función de clase...
			if ((o.responseText != 'undefined') && (o.argument.c) && (o.argument.id) && (o.responseText.length > 0)) {
			  o.argument.obj.display( o.responseText );
			}
		},
		tabLoadingFailure: function(o){ // ojo, todos los valores que se pasan a esta función vienen sin el ambito del objeto, es una función de clase...
			if ((o.responseText != 'undefined') && (o.argument.c) && (o.argument.id) && (o.responseText.length > 0)) {
			  o.argument.obj.display( o.responseText );
			}
		},
	    // 
	    load:function ( el ) {
		  this.selected = $E.generateId (el);
		  var l = this.getLink(el);
		  if (!(YAHOO.tms.tabs.cache[this.selected]) && (l)) {
		    $CMS.Common.safeInnerHTML( this.context, this.loading );
		    // cargando el contenido dinamico segun la url de cada tab...
		    var url = $CMS.Common.url_completion ( l.href, 'tpl=tpls/ajax' );
		    var callback =
		    {
			  success:this.tabLoadingSuccess,
			  failure:this.tabLoadingFailure,
			  argument: { c:this.context, id: this.selected, obj:this }
		    };
		    var request = $C.asyncRequest('GET', url, callback);
		  } else {
		    $CMS.Common.safeInnerHTML ( this.context, YAHOO.tms.tabs.cache[this.selected] );
			if (this.initConfig.onContentChange)
			  this.initConfig.onContentChange.call();		
		  }
	    },
		/**
		* Returns a string representation of the object.
		* @type string
		*/ 
		toString: function() {
			return "Caridy´s Multipanel Objects " + this.area.id;
		}	
	}
	
	
	
	
	
	
	
	
	
	/**
	* @class
	* Tabs Menu implementation...
	* @param {Element}	el	        The element representing the MenuBar
	* @param {object}	userConfig	The configuration object literal containing the configuration that should be set for this Overlay.
	* @constructor
	*/
	YAHOO.CMS.widget.MultiTabs = function(p_oElement, p_oConfig) {
	    this.init(p_oElement, p_oConfig);
	};
	
	YAHOO.CMS.widget.MultiTabs.prototype = {	
		
	    area      : null, // div element that represent the dynamic area...
	    list      : null, // ul element...
		context   : null, // div element that represent the sliding area (ajax-nail-content)
	 	opened    : true,
		ready     : false,
		initConfig: null,
		selected  : null,
		autohide: false,
		
		inative_class    	: 'inactive',
		inative_opacity 	: '0.4',
		available_opacity   : '1',
		active_class    	: 'current',
		active_opacity  	: '1',
		discard_opacity  	: '0.6',
		
	    // 
	    init:function (el, userConfig) {
		  this.cache = YAHOO.tms.tabs.cache;
		  this.area = el;  
		  this.list = userConfig.list || this.list;  
		  this.autohide = userConfig.autohide || this.autohide;  
		  this.context = userConfig.context || this.context;  
			
		  if (
				((typeof this.area == 'object') || (this.area = $( this.area ))) &&
			    ((typeof this.list == 'object') || (this.list = $( this.list ))) && (this.list.tagName == "UL") &&
				((typeof this.context == 'object') || (this.context = $( this.context )))
			 ) {
		    this.ready = true;
	        this.initConfig = userConfig;
		    // this.close ();
	        var obj = this;
			$E.addListener ( this.area, 'mouseout', this.close, obj, true );
			$E.addListener ( this.area, 'mouseover', this.open, obj, true );
			
			var el = this.list;
			for (var i = 0; i < this.list.childNodes.length; i++)
			  if (this.list.childNodes[i].tagName == "LI")
			    $E.addListener ( this.list.childNodes[i], 'mouseover', this.trigger, obj, true );
		  }
		},    
	
	
	    // disable the tab, and the tab can´t be selected anymore...
	    disable:function ( el ) {
		  if ((typeof el == 'object') || (el = $( el ))) {
			if (el.parentNode && (el.parentNode.tagName == "UL") && (el.tagName == "LI")) {
			  $D.addClass(el, this.inative_class);
			  $D.setStyle(el, 'opacity', this.inative_opacity);
			}
		  }
		},
	    // set available the tab for selection...
	    available:function ( el ) {
		  if ((typeof el == 'object') || (el = $( el ))) {
			if (el.parentNode && (el.parentNode.tagName == "UL") && (el.tagName == "LI")) {
			  $D.removeClass(el, this.inative_class);
			  $D.setStyle(el, 'opacity', this.available_opacity);
			}
		  }
		},
	    // set a tab has active and selected...
	    active: function ( el ) {
		  if ((typeof el == 'object') || (el = $( el ))) {
			if (el.parentNode && (el.parentNode.tagName == "UL") && (el.tagName == "LI")) {
			  $D.addClass(el, this.active_class);
		      $D.setStyle(el, 'opacity', this.active_opacity);
			}
		  }
		},
	
	    // this event reset the state of every tab in the list...
		reset:function (e) {
		  if (this.ready) {
			  var el = this.list;
			  for (var i = 0; i < el.childNodes.length; i++)
				if (el.childNodes[i].tagName == "LI") {
				  if ($D.hasClass(el.childNodes[i], this.active_class))
					$D.removeClass(el.childNodes[i], this.active_class);
				  if (!$D.hasClass(el.childNodes[i], this.inative_class))
					$D.setStyle(el.childNodes[i], 'opacity', this.available_opacity);
				}
		  }
		},
	    /**
		* Este metodo se encarga de abrir el panel que debe mostrar el contenido del tab seleccionado
		* @public
		* @param {object}  el  Referencia a un objecto que se mostrará dentro del panel que se debe abrir... se pasa la ref para calcular el alto de dicho objecto y proceder a transferir dicha dimensión al panel slice
		* @return void
		*/
	    open:function (e) {
	      if ((this.ready) && (!this.opened) && (!$B.virtualTarget(e, this.area))) {		
		  }
		  this.opened = true;
		},
	    // close the sliding area...
	    close:function (e) {
	      if ((this.ready) && (this.opened) && (!$B.virtualTarget(e, this.area))) {
			this.reset (e);
		  }
		  this.opened = false;
		},
		getLI: function (e) {
		  var t   = $E.getTarget ( e );  // target element
		  if (typeof t == 'object')
			  while((t.parentNode) && (typeof t.parentNode == 'object') &&  (t.parentNode.tagName != "BODY")) {
				if (t.parentNode.tagName == "LI")
				  return t.parentNode;
				t = t.parentNode;
			  }
		  return false;
		},
		getLink: function (el) {
		  if ((typeof el == 'object') || (el = $( el ))) {
			  var items = el.getElementsByTagName("a");
			  for (var i=0; i<items.length; i++)
			    if (!$CMS.Common.isEmpty(items[i].href))
				  return items[i];
		  }
		  return false;
		},	
	    trigger:function (e) {
		  var el = this.getLI(e);
		  if ((typeof el == 'object') || (el = $( el ))) {
			if (!$D.hasClass(el, this.active_class) && (!$D.hasClass(el, this.inative_class))) {
			  if (el.parentNode && (el.parentNode.tagName == "UL"))
				for (var i = 0; i < el.parentNode.childNodes.length; i++)
				  if (el.parentNode.childNodes[i].tagName == "LI") {
					if ($D.hasClass(el.parentNode.childNodes[i], this.active_class))
					  $D.removeClass(el.parentNode.childNodes[i], this.active_class);
					if (!$D.hasClass(el.parentNode.childNodes[i], this.inative_class))
					  $D.setStyle(el.parentNode.childNodes[i], 'opacity', this.discard_opacity);
				  }
			  this.active ( el );	  
			}
		  }        
	    },
		/**
		* Returns a string representation of the object.
		* @type string
		*/ 
		toString: function() {
			return "Caridy´s Multipanel Objects " + this.area.id;
		}	
	}
})();