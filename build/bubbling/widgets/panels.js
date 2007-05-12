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
	  $E = YAHOO.util.Event,
	  $D = YAHOO.util.Dom,
	  $C = YAHOO.util.Connect,
	  $ =  YAHOO.util.Dom.get;

  /**
  * @class LiquidPanel
  * Liquid Panel is an implementation of a Multi Panel Class States.
  * @param {Element}	el	        The element representing the Panel
  * @param {object}	userConfig	The configuration object literal containing the configuration that should be set for this Overlay.
  * @constructor
  */
  YAHOO.CMS.widget.LiquidPanel = function(aElement, userConfig) {
    this.init(aElement, userConfig);
  };

  YAHOO.CMS.widget.LiquidPanel.prototype = {

    element: null, // div element that represent the dynamic area (liquid of fixed)...
	ready: false,
	state: null,
	initConfig: null,
	cookie_handle: null,
	handle: null,
	
    // classes
	classes: ['open', 'close'],
	defaultClass: null,
	anim: null,

    // init...
    init:function (el, userConfig) {
      userConfig = userConfig || {};
      userConfig.element = userConfig.element || el || null;

	  // required values
	  this.element      = userConfig.element || el || null;
	  this.classes      = userConfig.classes || this.classes || [];
	  this.defaultClass = userConfig.defaultClass || this.classes[0] || null;
	  this.handle       = userConfig.handle  || null;

	  if (
			((typeof this.element == 'object') || (this.element = $( this.element ))) &&
			((typeof this.classes == 'array') || (typeof this.classes == 'object'))
		 ) {
	    this.ready = true;
	    this.anim = null;
        this.initConfig = userConfig;
		this.cookie_handle = $E.generateId (this.element) + '-liquidpanel';
		var that = this;
		if (this.handle || (this.handle = $D.getElementsByClassName('control','a',this.element)))
	 	  $E.addListener ( this.handle, 'click', this.takeaction, that, true );
		this.reset ( userConfig.discardCookie );
	  }
	},
	takeaction:function ( e ) {
	  this.next ();
	  $E.stopPropagation( e );
	  $B.eventGarbage(e);
	  return false;
	},
    /**
	* ---
	* @public
	* @param {bool}    discardCookie  True if we want to reset the ClassName without get or save the cookie value
	* @return void
	*/
	reset:function ( discardCookie ) {
	  if (this.ready) {
	  	// getting the information from the cookies... if not, then use a default class for this panel...
		if (!discardCookie)
	  	  this.status = $CMS.Common.getCookie ( this.cookie_handle ) || this.defaultClass;
	  	this.set ( discardCookie );
	  }
	},
    /**
	* ---
	* @public
	* @return {string}    Current ClassName
	*/
    get:function () {
  	  this.status;
	},
    /**
	* ---
	* @public
	* @param {bool}    d  True if we want to change de ClassName without save the cookie value
	* @return void
	*/
    set:function ( discardCookie ) {
	  if ((this.ready) && (this.status)) {
	  	for (var i=0; i<this.classes.length; i++)
	  	 if (this.status != this.classes[i]) {
	  	    $D.replaceClass(this.element, this.classes[i], this.status);
			$B.onRepaint ();
		 }
	  	// saving the value into the cookies
	  	if (!discardCookie)
	  	  $CMS.Common.setCookie( this.cookie_handle, this.status );
	  }
	},
    /**
	* ---
	* @public
	* @param {string}  c  ClassName to set-up the panel
	* @return void
	*/
    setClassWithoutSave:function ( c ) {
      this.setClass ( c, true );
	},
    /**
	* ---
	* @public
	* @param {string}  c  ClassName to set-up the panel
	* @param {bool}    d  True if we want to change de ClassName without save the cookie value
	* @return void
	*/
    setClass:function ( c, d ) {
      if (this.ready) {
		 for (var i=0; i<this.classes.length; i++)
	  	    if (c == this.classes[i]) {
			    this.status = c;
			    this.set ( d );
			}
	  }
	},
    /**
	* ---
	* @public
	* @param {string}  c  ClassName to set-up the panel
	* @param {bool}    d  True if we want to change de ClassName without save the cookie value
	* @return void
	*/
    Opening:function ( c, d ) {
      if (this.ready) {
		 for (var i=0; i<this.classes.length; i++)
	  	    if (c == this.classes[i]) {
			    this.status = 'open';
			    this.set ( d );
			}
	  }
	},
    /**
	* ---
	* @public
	* @param {string}  c  ClassName to set-up the panel
	* @param {bool}    d  True if we want to change de ClassName without save the cookie value
	* @return void
	*/
    Closing:function ( c, d ) {
      if (this.ready) {
	    this.status = 'close';
	    this.set ( d );
	  }
	},
    /**
	* ---
	* @public
	* @param {bool}    d  True if we want to change de ClassName without save the cookie value
	* @return void
	*/
    next:function ( d ) {
	  if (this.ready) {
	  	var n = 0;
	  	for (var i=0; i<this.classes.length; i++)
	  	  if (this.status == this.classes[i])
	  	    n = i+1;
	  	if (this.classes.length == n) n = 0;
	    this.status = this.classes[n];
	    this.set ( d );
	  }
	},
    /**
	* ---
	* @public
	* @param {bool}    d  True if we want to change de ClassName without save the cookie value
	* @return void
	*/
    setDefault:function ( d ) {
	  if (this.ready) {
	    this.status = this.defaultClass;
	    this.set ( d );
	  }
	},
	/**
	* Returns a string representation of the object.
	* @type string
	*/
	toString: function() {
		return "Caridy´s Liquid Panel " + this.element.id;
	}
  };


  // ******************************
  // * slide panel class
  // ******************************
  YAHOO.CMS.widget.SlidePanel = function(aElement, userConfig) {
    this.initSlide(aElement, userConfig);
  };
  YAHOO.extend ( YAHOO.CMS.widget.SlidePanel, YAHOO.CMS.widget.LiquidPanel );
  YAHOO.CMS.widget.SlidePanel.prototype.area = null;
  YAHOO.CMS.widget.SlidePanel.prototype.overflow = 'visible';
  YAHOO.CMS.widget.SlidePanel.prototype.anim = null;

  YAHOO.CMS.widget.SlidePanel.prototype.initSlide = function (el, userConfig) {
    this.init (el, userConfig);
    if (this.ready) {
  	  this.ready = false;
  	  var a = $D.getElementsByClassName('slide','div',this.element);
  	  if (a.length > 0) {
	    this.ready  = true;
	    this.area = a[0];
	    this.animate();
	    this.set();
	  }
    }
  };
  YAHOO.CMS.widget.SlidePanel.prototype.storeOverflow = function () {
    if ((this.ready) && (this.status != 'open')) {
  	  this.overflow = $D.getStyle(this.area, 'overflow') || this.overflow;
    }	
    $D.setStyle(this.area, 'overflow', 'hidden');
  }
  YAHOO.CMS.widget.SlidePanel.prototype.restoreOverflow = function () {
    if ((this.ready) && (this.overflow) && (this.status == 'open')) {
  	  $D.setStyle(this.area, 'overflow', this.overflow);
  	  $D.setStyle(this.area, 'height', 'auto');
    }
  };
  YAHOO.CMS.widget.SlidePanel.prototype.animate = function () {
    if ((this.ready) && (this.status)) {
	  this.storeOverflow();
  	  h = (this.status=='open'?this.area.scrollHeight:0);
	  if ((this.anim) && (this.anim.isAnimated())) { this.anim.stop(); }
	  var that = this;
	  this.anim = new $Y.Anim(this.area, { height: { to: h } }, 1.5, YAHOO.util.Easing.easeOutStrong);
	  this.anim.onComplete.subscribe( function(e) { that.restoreOverflow(); $B.onRepaint (e); });
	  this.anim.animate();
    }
  };
  YAHOO.CMS.widget.SlidePanel.prototype.next = function ( d ) {
    if (this.ready) {
  	  var n = 0;
  	  for (var i=0; i<this.classes.length; i++)
  	    if (this.status == this.classes[i])
  	      n = i+1;
  	  if (this.classes.length == n) n = 0;
      this.status = this.classes[n];
      this.animate ();
      this.set(d);
    }
  }

  // ******************************
  // * expand panel class
  // ******************************
  YAHOO.CMS.widget.ExpandPanel = function(p_oElement, p_oConfig) {
	arguments.callee.superclass.constructor.apply ( this, arguments );
  };
  YAHOO.extend ( YAHOO.CMS.widget.ExpandPanel, YAHOO.CMS.widget.SlidePanel );
  YAHOO.CMS.widget.ExpandPanel.prototype.restoreOverflow = function () {
    if ((this.ready) && (this.overflow) && (this.status == 'open')) {
  	  $D.setStyle(this.area, 'overflow', this.overflow);
  	  $D.setStyle(this.area, 'width', 'auto');
    }
  };
  YAHOO.CMS.widget.ExpandPanel.prototype.animate = function () {
    if ((this.ready) && (this.status)) {
	  this.storeOverflow();
  	  var w = (this.status=='open'?this.area.scrollWidth:0); 
	  if ((this.anim) && (this.amin.isAnimated())) { this.anim.stop(); }
	  var that = this;
	  this.anim = new $Y.Anim(this.area, { width: { to: w } }, 1.5, $Y.Easing.easeOutStrong);
	  this.anim.onComplete.subscribe( function(e) { that.restoreOverflow(); $B.onRepaint (e); });
	  this.anim.animate();
    }
  };




  /**
  * @class ScrollablePanel      Use this class for management the scroll for a panel with overflow: scroll or auto... 
  * @param {Element}	el	    The element representing the Panel
  * @param {object}	userConfig	The configuration object literal containing the configuration that should be set for this Scrollable Panel.
  * @constructor
  */
  YAHOO.CMS.widget.ScrollablePanel = function(aElement, userConfig) {
     this.init(aElement, userConfig);
  };

  YAHOO.CMS.widget.ScrollablePanel.prototype = {
    element: null, // div element that represent the dynamic area...
	ready: true,
	onProcess: false,
	auto: false,
	
	timer: 1,  /* every 1 segs */
	step: 5,   /* 5px */
	seconds: 30,
	anim: null,
	cache: [0, 0],

	initConfig: null,
	
    // init...
    init:function (el, userConfig) {
	  userConfig = userConfig || {};
      userConfig.element = userConfig.element || el || null;
	  this.element = userConfig.element || el || null;
	  if (userConfig.seconds)
		this.seconds = Math.abs(userConfig.seconds);
	  if ((typeof this.element == 'object') || (this.element = $( this.element ))) {
	    this.ready = true;
        this.initConfig = userConfig;
		this.reset ();
		this.anim = new YAHOO.util.Scroll(this.element, {}, this.timer);
		var that = this;
		this.anim.onComplete.subscribe( function (e) { that.recursion(); $B.onRepaint (e); } );
		this.cache = this.anim.getAttribute('scroll');
	  }
	},
	isReady: function () {
	  if (this.ready && (typeof this.element == 'object'))
	    return true;
	  else 
	    return false;
	},
	animate: function () {
	  if (this.ready) {
		if (this.onProcess)
		  this.stop();
		if (this.timer && this.step)
    	  this.start ();
	  }
	},
	setAttributes: function (userConfig) {
	  this.auto = userConfig.auto || this.auto;
	  this.timer = userConfig.timer || this.timer;
	  this.step = userConfig.step || this.step;
	},
	reset:function (e) {
	  if (this.ready){
	  	this.setAttributes (this.initConfig);
	  }
	},
	setAnimAttr: function(){
		this.cache = this.anim.getAttribute('scroll');
		this.anim.attributes = {scroll: { to: [0, $CMS.Common.px2int(this.cache[1]) + this.step] }};
	},
	start:function (){
		if (!this.onProcess) {
		  if (this.initConfig.onStart)
		    this.initConfig.onStart.call();
		  this.setAnimAttr();
		  this.onProcess = true;
		  this.anim.animate();
		}
	},
	recursion:function (){
		if (this.ready && this.auto && this.onProcess) {
			var t = this.anim.getAttribute('scroll');
			if (t[1] == this.cache[1]) {
			  this.stop();
			} else {
			  this.setAnimAttr();
              this.anim.animate();
			}
        }
	}, 
	stop:function (){
		if (this.ready && this.onProcess) {
			this.onProcess = false;
		    if (this.initConfig.onStop)
		      this.initConfig.onStop.call();
			$B.onRepaint ();
		}
	},
	/**
	* Returns a string representation of the object.
	* @type string
	*/
	toString: function() {
		return "Caridy´s Scrollable Panel " + this.element.id;
	}
  };	  




  /*
  Copyright (c) 2007, Caridy Patiño (caridy@gmail.com). All rights reserved.
  Code licensed under the BSD License:
  http://developer.yahoo.net/yui/license.txt
  Version 0.1
  */
  /**
  * @class
  * Information Panel, invasive publicity control...
  * @param {Element}	el	    The element representing the Panel
  * @param {object}	userConfig	The configuration object literal containing the configuration that should be set for this Overlay.
  * @constructor
  */
  YAHOO.CMS.widget.InfoPanel = function(p_oElement, p_oConfig) {
    this.init(p_oElement, p_oConfig);
  };

  YAHOO.CMS.widget.InfoPanel.prototype = {
	
    area    : null, // div element that represent the dynamic area...
	context : null, // div element that represent the sliding area (ajax-infopanel-content)
	opened  : false,
	ready   : false,
	webpart	: null,
	handle  : null,
	onresize: null,
	
	timer   : null,
	timerProcId: null,
	seconds: 30,

	initConfig: null,
	cookie_handle: 'infopanelstatus',
	hash: 0,
	opacity: null,
	
    // init...
    init:function (el, userConfig) {
	  // required values
	  this.area  = el;  
	  this.webpart  = userConfig.webpart || this.webpart;  
	  this.context  = userConfig.context || this.context;  
	  this.handle  = userConfig.handle || this.handle;  

	  // another values
	  if ((userConfig.timer) && ((typeof userConfig.timer == 'object') || (userConfig.timer = $( userConfig.timer ))))
		this.timer  = userConfig.timer;  
	  this.opacity  = userConfig.opacity || this.opacity;  
	  this.onresize  = userConfig.onresize || this.onresize;  
	  if (userConfig.seconds)
		this.seconds = Math.abs(userConfig.seconds);

	  if (
			((typeof this.area == 'object') || (this.area = $( this.area ))) &&
			((typeof this.handle == 'object') || (this.handle = $( this.handle ))) &&
			((typeof this.context == 'object') || (this.context = $( this.context )))
		 ) {
	    this.ready = true;
        this.initConfig = userConfig;
		this.cookie_handle = $E.generateId (this.area) + '-infopanel';
		this.reset ();
	  }
	},    
    // inicializa el contados
	counter:function () {
	  if ((this.ready) && (this.opened) && (this.timer)) {
		  $CMS.Common.safeInnerHTML ( this.timer, this.seconds.toString() );
		  if (this.seconds) {
			this.seconds--;
			var o = this;
			window.clearTimeout(this.timerProcId);
			if (this.seconds > 0)
			  this.timerProcId = setTimeout(function() {
										      o.counter();
										    }, 1000);			
			else  
			  this.timerProcId = setTimeout(function() {
										      o.close();
										    }, 1000);			
		  }
	  }
	},


    // this event reset the state of the panel...
	reset:function (e) {
	  if ((this.ready) && (!this.opened)) {
		// setting the close event...
		var obj = this;
		$E.addListener ( this.handle, 'click', obj.close, obj, true );
		this.load();
	  }
	},

    /**
	* Este metodo se encarga de abrir el panel que debe mostrar el contenido correspondiente
	* @public
	* @param {object}  el  Referencia a un objecto que se mostrará dentro del panel que se debe abrir... se pasa la ref para calcular el alto de dicho objecto y proceder a transferir dicha dimensión al panel slice
	* @return void
	*/
    open:function (e) {
	  if ((this.ready) && (!this.opened)) {
		$CMS.Common.sliding ( this.area, null, this.onresize );
		if (this.opacity)
		  $D.setStyle(this.area, 'opacity', this.opacity);
		$B.onRepaint (e);
	  }
	  this.opened = true;
	},
    // close the sliding area...
    close:function (e) {
	  if ((this.ready) && (this.opened)) {
		$CMS.Common.setCookie (this.cookie_handle, this.hash);
		$CMS.Common.sliding ( this.area, 0, this.onresize );
		$B.onRepaint (e);
	  }
	  if (e)
	    $B.eventGarbage(e);
	  this.opened = false;
	},
	// class function...
	contentLoadingSuccess: function(o){ // ojo, todos los valores que se pasan a esta función vienen sin el ambito del objeto, es una función de clase...
		if ((o.responseText != 'undefined') && (o.argument.c) && (typeof o.argument.obj == 'object')) {
	      var cookie_control = $CMS.Common.getCookie (o.argument.obj.cookie_handle);
		  o.argument.obj.hash = CRC32.getCRC(o.responseText, 0, o.responseText.length);
		  if (o.argument.obj.initConfig.force)
			$CMS.Common.setCookie (o.argument.obj.cookie_handle, 0);
		  var cookie_control = $CMS.Common.getCookie (o.argument.obj.cookie_handle);
		  if ((o.argument.obj.hash != 0) && (!cookie_control || (cookie_control != o.argument.obj.hash))) {
		    $CMS.Common.safeInnerHTML ( o.argument.c, o.responseText );
			o.argument.obj.open();
	        o.argument.obj.counter ();
		  }
		  else {
		    o.argument.obj.close ();
		  }
		}
	},
	// class function...
	contentLoadingFailure: function(o){ // ojo, todos los valores que se pasan a esta función vienen sin el ambito del objeto, es una función de clase...
		if ((o.argument.c) && (typeof o.argument.obj == 'object'))
		  o.argument.obj.close ();
	},
    // 
    load:function ( el ) {
	  var url = '/ajax.php?lang='+ TMS_CURRENT_LANG +'&webpart=' + this.webpart;
	  // cargando el contenido dinamico segun la url de cada tab...
	  var callback =
	    {
		  success:this.contentLoadingSuccess,
		  failure:this.contentLoadingFailure,
		  argument: { c:this.context, obj:this }
	    };
	  var request = $C.asyncRequest('GET', url, callback);
    },
	/**
	* Returns a string representation of the object.
	* @type string
	*/ 
	toString: function() {
		return "Caridy´s Information Panel " + this.area.id;
	}	
  }



  /**
  * @class ResizePanel          Use this class extended from Yahoo Panel with resize control... 
  * @param {Element}	el	    The element representing the Panel
  * @param {object}	userConfig	The configuration object literal containing the configuration that should be set for this object.
  * @constructor
  */
  // BEGIN RESIZEPANEL SUBCLASS //
  YAHOO.widget.ResizePanel = function(el, userConfig) {
		if (arguments.length > 0) {
			YAHOO.widget.ResizePanel.superclass.constructor.call(this, el, userConfig);
		}
  };

  YAHOO.extend(YAHOO.widget.ResizePanel, YAHOO.widget.Panel);
  YAHOO.widget.ResizePanel.CSS_PANEL_RESIZE = "resizepanel";
  YAHOO.widget.ResizePanel.CSS_RESIZE_HANDLE = "resizehandle";

  YAHOO.widget.ResizePanel.prototype.init = function(el, userConfig) {
		YAHOO.widget.ResizePanel.superclass.init.call(this, el);
		this.beforeInitEvent.fire(YAHOO.widget.ResizePanel);
		$D.addClass(this.innerElement, YAHOO.widget.ResizePanel.CSS_PANEL_RESIZE);
		this.resizeHandle = document.createElement("DIV");
		this.resizeHandle.id = this.id + "_r";
		this.resizeHandle.className = YAHOO.widget.ResizePanel.CSS_RESIZE_HANDLE;
        this.beforeShowEvent.subscribe(function() {
            this.body.style.overflow = "auto";
        }, this, true);

        this.beforeHideEvent.subscribe(function() {
            /*
                 Set the CSS "overflow" property to "hidden" before
                 hiding the panel to prevent the scrollbars from 
                 bleeding through on Firefox for OS X.
            */
            this.body.style.overflow = "hidden";
        
        }, this, true);

		this.beforeRenderEvent.subscribe(function() {
            /*
                 Set the CSS "overflow" property to "hidden" by
                 default to prevent the scrollbars from bleeding
                 through on Firefox for OS X.
            */
            this.body.style.overflow = "hidden";
            if (! this.footer) {
                this.setFooter("");
            }
        }, this, true);

		this.renderEvent.subscribe(function() {
			var me = this;
			me.innerElement.appendChild(me.resizeHandle);
			this.ddResize = new YAHOO.util.DragDrop(this.resizeHandle.id, this.id);
			this.ddResize.setHandleElId(this.resizeHandle.id);
			var headerHeight = me.header.offsetHeight;

			this.ddResize.onMouseDown = function(e) {
				this.startWidth = me.innerElement.offsetWidth;
				this.startHeight = me.innerElement.offsetHeight;
				me.cfg.setProperty("width", this.startWidth + "px");
				me.cfg.setProperty("height", this.startHeight + "px");
				this.startPos = [YAHOO.util.Event.getPageX(e),
								 YAHOO.util.Event.getPageY(e)];
				me.innerElement.style.overflow = "hidden";
				me.body.style.overflow = "auto";
			}
			
			this.ddResize.onDrag = function(e) {
				var newPos = [YAHOO.util.Event.getPageX(e),
							  YAHOO.util.Event.getPageY(e)];
				
				var offsetX = newPos[0] - this.startPos[0];
				var offsetY = newPos[1] - this.startPos[1];
				var newWidth = Math.max(this.startWidth + offsetX, 10);
				var newHeight = Math.max(this.startHeight + offsetY, 10);
				me.cfg.setProperty("width", newWidth + "px");
				me.cfg.setProperty("height", newHeight + "px");

				var bodyHeight = (newHeight - 5 - me.footer.offsetHeight - me.header.offsetHeight - 3);
				if (bodyHeight < 0) {
					bodyHeight = 0;
				}
				me.body.style.height =  bodyHeight + "px";
				var innerHeight = me.innerElement.offsetHeight;
				var innerWidth = me.innerElement.offsetWidth;
				if (innerHeight < headerHeight) {
					me.innerElement.style.height = headerHeight + "px";
				}
				if (innerWidth < 20) {
					me.innerElement.style.width = "20px";
				}
			}

		}, this, true);
		if (userConfig) {
			this.cfg.applyConfig(userConfig, true);
		}
		this.initEvent.fire(YAHOO.widget.ResizePanel);
  };

  YAHOO.widget.ResizePanel.prototype.toString = function() {
		return "ResizePanel " + this.id;
  };
  // END RESIZEPANEL SUBCLASS //
})();