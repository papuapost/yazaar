/*
* JavaScript Bubbling Library (c) MIT License 2007
* http://bubbling.comarq.com/eng/licence
* Free Support: http://bubbling.comarq.com/
* V 2.2.0
*/
/**
* @class
* Tabs and Panels is an implementation of a Multipanel Menu, displaying when the user mouses over a particular element, and disappearing on mouse out.
* @param {Element}	el	        The element representing the MenuBar
* @param {object}	userConfig	The configuration object literal containing the configuration that should be set for this Overlay.
* @constructor
*/
(function() {
	
  var $CMS = YAHOO.CMS,
  	  $B = YAHOO.CMS.Bubble,
	  $E = YAHOO.util.Event,
	  $D = YAHOO.util.Dom,
	  $C = YAHOO.util.Connect,
	  $ =  YAHOO.util.Dom.get;

  YAHOO.CMS.widget.Player = function(aElement, userConfig) {
    this.init(aElement, userConfig);
  };

  YAHOO.CMS.widget.Player.prototype = {
    element: null, // div element that represent the dynamic area...
	context: null, // div element that represent the sensitive area for mouseover and mouseout
	categories: null,
	play: false,
	ready: true,
	repeating: false,
	actived: false,
	onProcess: false,	
	URL: null,
	mode: 'resume',
	info: null,
	
	handle: null,
	buttons: [],
	handleOverlay: null,
	handleExt: false,
	handleCSS: 'cms-player-handle',
	handleAutoHide: true,

	timer: null,
	timerProcId: null,
	seconds: 30,

	initConfig: null,
	loading: null,
	loadingCSS: 'loading',
	staticCSS: 'static',
	cache: [],
	selected: 0,
	cookie_handle: null,
	opacity: 0.8,
	animate: true,
	
	// events
	onContentChange: null,

    // init...
    init:function (el, userConfig) {
	  userConfig = userConfig || {};
      userConfig.element = userConfig.element || el || null;
	  this.URL = userConfig.URL || null;
	  this.mode = userConfig.mode || this.mode;
	  this.play = (userConfig.play?true:false);
	  this.repeating = (userConfig.repeating?true:false);

	  // required values
	  this.element = userConfig.element || el || null;
	  this.context = userConfig.context || this.element || null;
	  
	  // handle
	  this.handle = userConfig.handle  || null;
	  this.handleCSS = userConfig.handleCSS || this.handleCSS;
	  this.handleAutoHide = userConfig.handleAutoHide || this.handleAutoHide; 

	  // another values
	  this.opacity  = userConfig.opacity || this.opacity;
	  this.animate  = userConfig.animate || this.animate;
	  if (userConfig.seconds)
		this.seconds = Math.abs(userConfig.seconds);
	  if (
			((typeof this.element == 'object') || (this.element = $( this.element ))) &&
			((!this.handle) || (typeof this.handle == 'object') || (this.handle = $( this.handle ))) &&
			((typeof this.context == 'object') || (this.context = $( this.context )))
		 ) {
	    this.ready = true;
        this.initConfig = userConfig;
		this.cookie_handle = $E.generateId (this.element) + '-playerpanel';
        this.loading = this.element.innerHTML;
		this.URL = $CMS.Common.url_completion ( this.URL, 'tpl=tpls/ajax&page=pages/ajax-category&mode=' + this.mode );
		if (this.handle && typeof this.handle == 'object')
		  this.handleExt = true;
        var that = this;
		$E.addListener ( this.context, 'mouseover', this.active, that, true );
		$E.addListener ( this.context, 'mouseout',  this.inactive, that, true );
		// onStart Event....
		if (this.initConfig.onStart)
		  this.initConfig.onStart.call();
		// starting player action...
		this.reset ();
	  }
	},
	inactive: function (e) {
	  if ((this.ready) && (this.actived) && (!$B.virtualTarget(e, this.context))) {
		// hide controls
		if (this.handleAutoHide && this.handleOverlay)
		  this.handleOverlay.hide();
		this.actived = false;
	  }
	},
	active: function (e) {
	  if ((this.ready) && (!this.actived) && (!$B.virtualTarget(e, this.context))) {
		// show controls
		if (this.handleOverlay && this.handlePosition())
		    this.handleOverlay.show();
		this.actived = true;
	  }
	},
	handlePosition: function () {
	  if (this.handle && this.element && this.handleOverlay) {
		var handleRegion = $D.getRegion(this.handle);
		var elementRegion = $D.getRegion(this.element);
		this.handleOverlay.moveTo ( elementRegion.right - (handleRegion.right - handleRegion.left), elementRegion.bottom - (handleRegion.bottom - handleRegion.top) );
		// checking if as sufficient space to show the handle...
		if ((elementRegion.right - elementRegion.left <= 0) || (elementRegion.bottom - elementRegion.top <= 0))
		  return false;
		return true;
	  }
	  return false;
	},
    // this event reset the state of the panel...
	reset:function (e) {
	  if (this.ready){
	  	$CMS.Common.safeInnerHTML( this.element, this.loading );
		this.cache = [];
		this.selected = 0;
		this.load();
	  }
	},
    /**
	* Este metodo se encarga de abrir el panel que debe mostrar el contenido correspondiente
	* @public
	* @param {object}  el  Referencia a un objecto que se mostrará dentro del panel que se debe abrir... se pasa la ref para calcular el alto de dicho objecto y proceder a transferir dicha dimensión al panel slice
	* @return void
	*/
    next:function (e) {
	  if (!this.onProcess) {
	    if (this.URL) {
		  window.clearTimeout(this.timerProcId);
		  this.selected++;
		  if (this.selected >= this.cache.length)
		    this.load ();
		  else {
		    this.display();
		  }
		}
		else {
		  // onFinish Event....
		  if (this.initConfig.onFinish)
		    this.initConfig.onFinish.call();
		  // Verificando si esta activo el modo rotativo para el player...
		  if (this.repeating) { // only for repeating propose
			this.selected = 0;
			this.display();
		  }	
		}
	  }
	  $B.eventGarbage(e);
	},
    previous:function (e) {
		window.clearTimeout(this.timerProcId);
		if (this.selected == 0)
			this.selected = (this.repeating?this.cache.length-1:0);
		else	
		    this.selected--;
		this.display();
	    $B.eventGarbage(e);
	},
	trigger:function (){
		if (this.play) {
	 	  var o = this;
		  this.timerProcId = setTimeout(function() { o.next(); }, Math.abs(this.seconds)*1000);
		}		
	},
	resetHandle:function(){
		if (this.ready && !this.handleExt) {
		    var h = $D.getElementsByClassName(this.handleCSS,'div',this.element);
			if (h.length > 0) {
				this.handle = h[0];
				this.buttons = [];
				
				var that = this;
				var hplay = new YAHOO.widget.Button({ label:"&nbsp;", type:"link", href:"#", container:this.handle });
				hplay.addListener("click", this.start, that, true );
				hplay.addClass ('cms-player-play');
				hplay.setStyle ('opacity', this.opacity);
				this.buttons.push (hplay);
				
				var hstop = new YAHOO.widget.Button({ label:"&nbsp;", type:"link", href:"#", container:this.handle });
				hstop.addListener("click", this.stop, that, true );
				hstop.addClass ('cms-player-stop');
				hstop.setStyle ('opacity', this.opacity);
				this.buttons.push (hstop);
				
				var hff = new YAHOO.widget.Button({ label:"&nbsp;", type:"link", href:"#", container:this.handle });
				hff.addListener("click", this.next, that, true );
				hff.addClass ('cms-player-ff');
				hff.setStyle ('opacity', this.opacity);
				this.buttons.push (hff);
				
				var hrw = new YAHOO.widget.Button({ label:"&nbsp;", type:"link", href:"#", container:this.handle });
				hrw.addListener("click", this.previous, that, true );
				hrw.addClass ('cms-player-rw');
				hrw.setStyle ('opacity', this.opacity);
				this.buttons.push (hrw);
				var otherbuttons = $D.getElementsByClassName('cms-button','span',this.handle);
				if (otherbuttons.length > 0)
				  $D.batch ($D.getElementsByClassName('cms-button','span',this.handle), 
						  function( ref ) {
						  	var b = new YAHOO.widget.Button(ref, { type:"link" });
							b.setStyle ('opacity', this.opacity);
							that.buttons.push (b);
						 });

				// applying the corresponding information for pagination...
				if (this.info) {
				  var hint = 'Mostrando '+this.info.end()+' de '+this.info.total();
			 	}

				// Build overlay Controls based on markup
				this.handleOverlay = new YAHOO.widget.Overlay(this.handle, { visible:false } );
				this.handleOverlay.cfg.setProperty("context", this.element, false);
				this.handleOverlay.render();
				if ((this.actived || !this.handleAutoHide) && (this.handlePosition ()))
				  this.handleOverlay.show();
			}
		}
	},
	exec: function (){
	  var items = new Array(), localscripts = '', self = this; newURL = null; 
	  items.merge( this.element.getElementsByTagName("script") );
	  this.info = null;
	  this.URL = null;
	  for (var i=0; i<items.length; i++)
	    localscripts += items[i].innerHTML;		
	  localscripts = localscripts.replace( new RegExp( "\\n", "g" ), "" );
	  if (localscripts != '') {
		  try{
			eval ( localscripts );
			newURL = result.next();
			this.info = result;
		  } catch(e) {
		  	newURL = null;
		  }
		  if (newURL){
		    this.URL = $CMS.Common.url_completion(newURL, '');	
		  } else {
		   	this.stop();
		  }
	  }
	},
	display: function () {
	  if (this.ready) {
		var that = this;
		var onComplete = function () {
			that.exec ();
			that.resetHandle ();
			that.onProcess = false;
			that.trigger ();
			if (that.initConfig.onContentChange) {
				that.initConfig.onContentChange.call();
			}
			$B.onRepaint();			
		};
	  	if (this.animate) {
		  $CMS.Common.applyMagicFade ( this.element, 
							     { 
							     	text:this.cache[this.selected], 
							     	onComplete: onComplete
							     }
							  );
		}
		else {
		  $CMS.Common.safeInnerHTML ( this.element, this.cache[this.selected] );
		  onComplete ();
		}							  
	  }
	},
    save:function ( c ) {
	  if (this.ready && (c.length > 0)) {
	  	this.selected = this.cache.length;
		this.cache[this.selected] = c;
	  }
	},
	// class function...
	contentLoadingSuccess: function(o){ // ojo, todos los valores que se pasan a esta función vienen sin el ambito del objeto, es una función de clase...
		if ((o.responseText != 'undefined') && (o.argument.c) && (typeof o.argument.obj == 'object')) {
			o.argument.obj.save( o.responseText );
			o.argument.obj.syncFinish();
			if (o.responseText.length > 0)
			  o.argument.obj.display();
		}
	},
	// class function...
	contentLoadingFailure: function(o){ // ojo, todos los valores que se pasan a esta función vienen sin el ambito del objeto, es una función de clase...
		if (typeof o.argument.obj == 'object') {
			o.argument.obj.syncFinish();
		}
		return false;
	},
	//
	syncFinish: function(){
		if (this.ready && this.loadingCSS && this.staticCSS) {
			if  ($D.hasClass(this.element, this.loadingCSS))
		      $D.removeClass(this.element, this.loadingCSS);
			$D.addClass(this.element, this.staticCSS);
		}
	},
	syncStart: function(){
		if (this.ready && this.loadingCSS && this.staticCSS) {
			if ($D.hasClass(this.element, this.staticCSS))
		      $D.removeClass(this.element, this.staticCSS);
		  	$D.addClass(this.element, this.loadingCSS);
		}
	},
    //
    load:function () {
	  // cargando el contenido dinamico segun la url de cada tab...
	  var callback =
	    {
		  success:this.contentLoadingSuccess,
		  failure:this.contentLoadingFailure,
		  argument: { c:this.element, obj:this }
	    };
	  this.onProcess = true;
	  this.syncStart();
	  var request = $C.asyncRequest('GET', this.URL, callback);
    },
	start:function (e){
		if (!this.play) {
			this.play = true;
			this.next();
		}
	    $B.eventGarbage(e);
	},
	stop:function (e){
		if (this.play) {
			this.play = false;
			window.clearTimeout(this.timerProcId);
		}
	    $B.eventGarbage(e);
	},
	/**
	* Returns a string representation of the object.
	* @type string
	*/
	toString: function() {
		return "Caridy´s Player Widget " + this.element.id;
	}
  };
})();