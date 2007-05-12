/*
* JavaScript Bubbling Library (c) MIT License 2007
* http://bubbling.comarq.com/eng/licence
* Free Support: http://bubbling.comarq.com/
* V 2.2.0
*/
(function() {
  var $Y = YAHOO.util,
  	  $L = YAHOO.lang,
	  $E = YAHOO.util.Event,
	  $D = YAHOO.util.Dom,
	  $C = YAHOO.util.Connect,
	  $B = YAHOO.CMS.Bubble,
	  $  = YAHOO.util.Dom.get;
	  
  /**
   * Provides helper methods for DOM elements.
   * @namespace YAHOO.util
   * @class Dom
   */
  YAHOO.CMS.Common = function (){
    return {
		object: function (o) {
		  function F() {};
		  F.prototype = o;
		  return new F();
		}, 
    	/**
		* Este método muestra el contenido de una url externa dentro de un div...
		* @public
		* @param {string} content_id    ID que identifica al DIV donde se debe mandar a cargar el contenido resultado de la navegación de url
		* @param {string} url           URI de navegación
		* @return boolean
		*/
		ajaxLoadContent: function ( content, url, aHandleSuccess, aHandleFailure ) {
		  if ($L.isObject (content) || (content = $( content ))) {
			  var callback =
			  {
				success:aHandleSuccess,
				failure:aHandleFailure,
				argument: { c:content }
			  };
			  var request = $C.asyncRequest('GET', url, callback);
		  }
		  return false;
		},
		/**
		* Este método muestra el contenido de una url externa dentro de un div...
		* @public
		* @param {Object} el    ID que identifica al Elemento donde se debe mandar a cargar el contenido
		* @param {string} c     Content que debe ser colocado como hijo...
		* @return boolean
		*/
		safeInnerHTML: function ( el, c ) {
		  if (el && ((typeof el == 'object') || (el = $( el )))) {
		  	while (el.childNodes.length > 0) {
				$E.purgeElement ( el.childNodes[0], true );
				el.removeChild(el.childNodes[0]);
			}
			try { el.innerHTML = c; } catch (e) {}	
		  }
		},
		/**
		* Execute the script tabs inside the element reference
		* @public
		* @param {object} Element Reference    
		* @param {object} valor por defecto    
		* @return integer
		*/
		executeble: function (content) {
		  if (content && (typeof content == 'object') || (content = $( content ))) {
			  if (!content.getElementsByTagName) return;
			  var items = new Array(), localscripts = '', self = this;
			  items.merge( content.getElementsByTagName("script") );
			  
			  for (var i=0; i<items.length; i++)
			    localscripts += items[i].innerHTML;
				
			  if (localscripts != '') {
				  try{
					// initialize a new anonymous container for our script, dont make it part of this widgets scope chain
					// instead send in a variable that points to this widget, usefull to connect events to onLoad, onUnLoad etc..
					this.scriptScope = null;
					this.scriptScope = new (new Function('_container_', localscripts+'; return this;'))(self);
				  } catch(e) {
					if (YAHOO.log)
					  YAHOO.log('Javascript Execution Error for ' + content); 
					return false;
				  }
			  }
		  }	  
		  return true;	
		},
		executionSpool: '',
		/**
		* Prepare the content of the response for displaying propose without script tabs and send this striptabs to the execution spool
		* @public
		* @param {string} content - XHTML code with scripts tabs inside---    
		* @return {string}
		*/
		prepareResponse: function (s) {
			// cut out all script tags, push them into scripts array
			var m = true, remoteScripts = Array(), localscripts = "", attr = false, self = this;
			while(m){
				m = false;
				s = s.replace(/<script([^>]*)>([\s\S]*?)<\/script>/i,
				  function (str,p1,p2,offset,s) {
					if(p1){
					  attr = p1.match(/src=(['"]?)([^"']*)\1/i);
					  if(attr)
						remoteScripts.push(attr[2]);
					}
					localscripts += p2;
					m = true;
				    return ""; 
			      } 
				);
			}
			this.executionSpool += localscripts;
			try{
			  // initialize a new anonymous container for our script, dont make it part of this widgets scope chain
			  // instead send in a variable that points to this widget, usefull to connect events to onLoad, onUnLoad etc..
			  this.scriptScope = null;
			  this.scriptScope = new (new Function('_container_', localscripts+'; return this;'))(self);
			}catch(e){
		  	  alert("Error running scripts from content:\n"+e);
			}
			
			// here we need to add the content of the remotes scripts to the spool stack: {caridy} Pending...
			// remoteScripts : array of urls
			
			return s;
		},
		/**
		* Execute the content of the spool
		* @public
		* @return boolean 
		*/
		dispatchResponse: function () {
		  var self = this, result = true;
		  if (this.executionSpool && (this.executionSpool != '')) {
			try{
			  // initialize a new anonymous container for our script, dont make it part of this widgets scope chain
			  // instead send in a variable that points to this widget, usefull to connect events to onLoad, onUnLoad etc..
			  this.scriptScope = null;
			  this.scriptScope = new (new Function('_container_', this.executionSpool+'; return this;'))(self);
			}catch(e){
		  	  alert("Error running scripts from content:\n"+e);
			  result = false;
			}
		  }	
		  this.executionSpool = '';
		  return result;
		},
		/**
		* Este método asegura que las variables esten definidas
		* @public
		* @param {object} variable    
		* @param {object} valor por defecto    
		* @return integer
		*/
		asset: function ( v, d ) {
		  if (v == 'undefined')
		    var v = d;
		  else if (((v == null) || (v == '')) && (d)) 
		    v = d;
		  return v;
		},
		isEmpty: function ( v ) {
		  if ((v == 'undefined') || (v == null) || (v == ''))
		    return true;
		  return false;
		},
		assetbool: function ( v, d ) {
		  if (typeof v == 'boolean')
		    return v;
		  else if (v && (typeof v == 'string') && ((v == 'true') || (v == 'false')))
		    return eval( v );
		  else if (typeof d == 'boolean')
		    return d;
		  else
		    return null;
		},
		assetObj: function ( o, d ) {
		  if (o && ((typeof o == 'object') || (o = $( o ))))
			return o;
		  else if (d && ((typeof d == 'object') || (d = $( d ))))
			return d;
		  return false;
		},
		assetOffset: function ( o, a ) {
		  if (o = this.assetObj(o)) {
			var elementRegion = $D.getRegion(o);
			var w = (elementRegion.right - elementRegion.left), h = (elementRegion.bottom - elementRegion.top);
			if (a == 'width')
			  return w;
			else if (a == 'height') 
			  return h;
		  }
		  return 0;
		},
		/**
		* Este método elimina el px de las dimensiones...
		* @public
		* @param {string} dimension    ej. (102px) y esta funcion devuelve el numero 102
		* @return integer
		*/
		px2int: function ( d ) {
		  d = new String ( d );
		  if (d.indexOf ( 'px' ) > -1) d = d.replace ( 'px', '' );
		  return parseInt(d, 10);
		},
		/**
		* Este método hace un parsing de una url, completa sus parametros sobrescribiendo parametros que se pasan como m a la funcion
		* @public
		* @param {string} url URI de navegación
		* @param {string} m   MoreParams representa una cadena de parametros con el siguiente formato ( param1=value1&param2=value2 )
		* @return string
		*/
		url_completion: function ( url, m ) {
		  var anch = '';
		  var p    = '';
		  var params = '';
		  var moreparams = new String(m);
		  var query = new Array();
		  // separando la url en sus 3 partes (url, parametros, anchor)
		  if (url.indexOf('#') > -1) {
			 anch = url.substring ( url.indexOf('#'), url.length );
			 url  = url.substring ( 0, url.indexOf('#') );
		  }
		  if (url.indexOf('?') > -1) {
			 params = url.substring ( url.indexOf('?')+1, url.length );
			 url   = url.substring ( 0, url.indexOf('?') );
		  }
		  // sustituyendo el separados de parametros para que no de problema con ajax
		  while (params.indexOf ( '&amp;' ) > -1)
		    params = params.replace ( '&amp;', '&' );
		  while (moreparams.indexOf ( '&amp;' ) > -1)
		    moreparams = query.replace ( '&amp;', '&' );
		
		  // este bloque verifica que no se repitan los parametro en la url de resultado
		  // tener en cuenta que los moraparams tienen prioridad sobre los parametros que ya venian en la url
		  query = query.concat ( params.split ('&'), moreparams.split ('&') );
		  var tmp = new String('');
		  var par = new Array ();
		  var s   = new String();
		  query = query.reverse();
		  for (var i=0; i<query.length; i++) {
			s = new String (query[i]);
			par = s.split ('='); // array( param, value )
			if (tmp.indexOf ('{'+par[0]+'}') > -1)
			  query[i] = null;
			else
		      tmp += '{'+par[0]+'}';
		  }
		  // una vez eliminados los parametros que estaban repetidos se procede a construir la url.
		  for (var i=0; i<query.length; i++) {
		    if (query[i] != null)
			  if (p == '') p += '?'+query[i]; else p += '&'+query[i]; 
		  }
		  return url + p + anch;
		},
		/**
		* Este metodo hace un fadeOut, luego sustituye el contendio actual del elemento por el nuevo contenido y hace un fadeIn
		* @public
		* @param {object}   el    			Referencia al objeto que vamos a aplicarle el pase magico
		* @param {string}   text  			Nuevo contenido para el innerHTML del objeto
		* @param {function} onCompleteFade	Function que se ejecutará al finalizar la animación...
		* @return void
		*/
		applyTeletransportation: function ( s, t ) {
		  if ((t || (t = $(t))) && (s || (s = $(s)))) {
		  	this.safeInnerHTML ( t, s.innerHTML );
		  	this.safeInnerHTML ( s, '' );
		  }
		},
		/**
		* Este metodo hace un fadeOut, luego sustituye el contendio actual del elemento por el nuevo contenido y hace un fadeIn
		* @public
		* @param {object}   el    			Referencia al objeto que vamos a aplicarle el pase magico
		* @param {string}   text  			Nuevo contenido para el innerHTML del objeto
		* @param {function} onCompleteFade	Function que se ejecutará al finalizar la animación...
		* @return void
		*/
		applyMagicFade: function ( el, userconfig ) {
		  var myAnim = null;
		  var that = this;
		  var magicFadeSwitchContent = function() {
			that.safeInnerHTML ( el, userconfig.text );
			if(userconfig.onContentChange)
			  userconfig.onContentChange.call();
			if (!$E.isIE) {
			  myAnim = new $Y.Anim(el, { opacity: { to: 1 } }, 1, $Y.Easing.easeOut);
			  if(userconfig.onComplete)
			    myAnim.onComplete.subscribe(userconfig.onComplete);
			  myAnim.animate();
			}
			else {
			  if(userconfig.onComplete)
			    userconfig.onComplete.call();
			} 
		  }
		  try {
		    if (!$E.isIE) {
		      myAnim = new $Y.Anim(el, { opacity: { to: 0 } }, 1, $Y.Easing.easeIn);
		      myAnim.onComplete.subscribe(magicFadeSwitchContent);
		      myAnim.animate();
		    }
		    else {
		      magicFadeSwitchContent.call();
		    }
		  }
		  catch (e) {
			try { 
		  	  this.safeInnerHTML ( el, userconfig.text );
			  if(userconfig.onContentChange)
			    userconfig.onContentChange.call();
			  if(userconfig.onComplete)
			    userconfig.onComplete.call();
			} catch (e) {}
		  }
		},
		/**
		* Este método muestra el contenido de una url externa dentro de un div...
		* @public
		* @param {string} t    title, el título del dialogo...
		* @param {string} b    body, el contenido del dialogo... ;-)
		* @param {string} w    width, el ancho del dialogo
		* @param {string} d    dragable, si es o no dragable
		* @param {boolean} r   resizeble, si es o no
		* @return boolean
		*/
		displayDialog: function ( t, b, w, d, r ) {
			t = asset ( t, '' );
			b = asset ( b, '' );
			w = asset ( w, '' ); /* 50em */
			d = assetbool ( d, false );
			r = assetbool ( r, true );
			var dialogClass = YAHOO.widget.SimpleDialog;
			var handleCancel = function() {
				this.hide();
			}
			var handleOK = function() {
				this.hide();
			}
			try {YAHOO.tms.simpledialog.dlg.hide();} catch (e) {}
			if (r) dialogClass = YAHOO.widget.ResizePanel;
			YAHOO.tms.simpledialog.dlg = new dialogClass("dlg", 
			 							  { width:w,  
			 							    fixedcenter: true, 
			 							    constraintoviewport: true, 
			 							    underlay:"shadow", 
			 							    close:true, 
			 							    visible:false, 
			 							    draggable:d,
											iframe: true
			 							    } 
			 							   );
			YAHOO.tms.simpledialog.dlg.setHeader( t );
			YAHOO.tms.simpledialog.dlg.setBody( b );
			YAHOO.tms.simpledialog.dlg.cfg.queueProperty("buttons", [ { text:"Close", handler:handleCancel } ]);
		
		    var listeners = new YAHOO.util.KeyListener(document, { keys : 27 }, {fn:handleCancel ,scope:YAHOO.tms.simpledialog.dlg, correctScope:true} );
			YAHOO.tms.simpledialog.dlg.cfg.queueProperty("keylisteners", listeners);
		
			YAHOO.tms.simpledialog.dlg.render(document.body);
			YAHOO.tms.simpledialog.dlg.show();
			return true;
		},
		/**
		* Display a Loading Message
		* @public
		* @param {boolean} m           True if this dialog is modal
		* @return boolean
		*/
		loading: function () {
			var render = function (c) {
 			    var h = new YAHOO.widget.Panel("wait",
									 { 
									  width:c.width,
									  fixedcenter:c.fixed,
									  underlay:"shadow",
									  close:true,
									  visible:false,
									  draggable: c.draggable,
									  modal: c.modal,
									  effect:{effect:YAHOO.widget.ContainerEffect.FADE, duration:0.2}
									 });
			    var loading_msg = "Loading, please wait...";
				if (TMS_LOADING_MESSAGE && (TMS_LOADING_MESSAGE != ''))
				  loading_msg = TMS_LOADING_MESSAGE;
				h.setHeader( loading_msg );  // {caridy} este mensaje tiene que ser multilenguaje
				h.setBody("<img src='" + TMS_THEMEPATH + "images/loading.gif' />");
				h.render(document.body);
				return h;
			};
			return {
				handle: null,
				show: function() {
					if (!this.handle) 
					  this.init();
					this.handle.show();
				},
				hide: function() {
					this.handle.hide();
				},
				init: function( userConfig ) {
					var c = userConfig || {};
					c.modal = c.modal || false;
					c.width = c.width || "240px";
					c.fixed = c.fixed || true;
					c.draggable = c.draggable || true;
					this.handle = render ( c );
				}
			};
		}(),

		/**
		* Store reference in a memory cache
		* @public
		* @return void
		*/
		values: function () {
			return {
				items: [],
				hold: function( ref ) {
					this.items.push( ref );
					return this.items.length - 1;
				},
				get: function( ref ) {
					if (ref)
					  return this.items[ref]; 
				},
				release: function( ref ) {
					ref = parseInt ( ref, 10 );
					if (this.items.length > ref) 
					  delete this.items[ref];
					ref = null;
				},
				reset: function() {
					if (this.items.length > 0)
					  $D.batch (this.items, this.release, this, true);
				}
			};
		}(),
		/**
		* Este metodo se encarga de cargar las imagenes necesarias durante la ejecución para eliminar los saltos incomodos...
		* @public
		* @return void
		*/
		preloadImages: function () { //v1.0b
		  if(document.images){ 
		    var a=arguments; 
			for(var i=0; i<a.length; i++) { 
		      var d = new Image; d.src=a[i];
		      YAHOO.CMS.Common.values.hold( d );
			}
		  }
		},
		/* toggle an element's display */
		toggle: function (obj) {
			var el = document.getElementById(obj);
			if ( el.style.display != 'none' ) {
				el.style.display = 'none';
			}
			else {
				el.style.display = '';
			}
		},
		/* insert an element after a particular node */
		insertAfter: function (parent, node, referenceNode) {
			parent.insertBefore(node, referenceNode.nextSibling);
		},
		/* get, set, and delete cookies */
		getCookie: function ( name ) {
			var start = document.cookie.indexOf( name + "=" );
			var len = start + name.length + 1;
			if ( ( !start ) && ( name != document.cookie.substring( 0, name.length ) ) ) {
				return null;
			}
			if ( start == -1 ) return null;
			var end = document.cookie.indexOf( ";", len );
			if ( end == -1 ) end = document.cookie.length;
			return unescape( document.cookie.substring( len, end ) );
		},
		setCookie: function ( name, value, expires, path, domain, secure ) {
			var today = new Date();
			today.setTime( today.getTime() );
			if ( expires ) {
				expires = expires * 1000 * 60 * 60 * 24;
			}
			var expires_date = new Date( today.getTime() + (expires) );
			document.cookie = name+"="+escape( value ) +
				( ( expires ) ? ";expires="+expires_date.toGMTString() : "" ) + //expires.toGMTString()
				( ( path ) ? ";path=" + path : "" ) +
				( ( domain ) ? ";domain=" + domain : "" ) +
				( ( secure ) ? ";secure" : "" );
		},
		deleteCookie: function ( name, path, domain ) {
			if ( getCookie( name ) ) document.cookie = name + "=" +
					( ( path ) ? ";path=" + path : "") +
					( ( domain ) ? ";domain=" + domain : "" ) +
					";expires=Thu, 01-Jan-1970 00:00:01 GMT";
		},
		anim: {},
		sliding: function( el, h, onCompleteSlide ) {
		  var f = null, 
		      s = null;
		  if (el && ((typeof el == 'object') || (el = $( el )))) {
			  var overf = $D.getStyle(el, 'overflow') || 'visible';
			  $D.setStyle(el, 'overflow', 'hidden');
			  s = el.scrollHeight;
			  if (h && (h = parseInt(h, 10)) && (h > 0)) {
			  	// opening....	
			  }
			  else if (this.assetOffset(el, 'height') == 0) {
				h = el.scrollHeight;
			  	f = function () {
						$D.setStyle(el, 'overflow', overf);
  	  					$D.setStyle(el, 'height', 'auto');
				    };
			  }
			  else {
			    h = 0;
			  }
			  var id = $E.generateId(el)+'sliding';
			  if (id && (this.anim.hasOwnProperty(id))) {
			  	if (this.anim[id].isAnimated()) { 
				  this.anim[id].stop(); 
				}
			  }
			  this.anim[id] = new $Y.Anim(el, { height: { to: h } }, 1.5, YAHOO.util.Easing.easeOutStrong);
			  if (onCompleteSlide) {
				  this.anim[id].onComplete.subscribe( onCompleteSlide );
			  }
			  if (f) {
				  this.anim[id].onComplete.subscribe( f );
			  }
			  this.anim[id].onComplete.subscribe( YAHOO.CMS.Bubble.onRepaint, YAHOO.CMS.Bubble, true );
	  		  this.anim[id].animate();
		  }
		  return s;
		},
		expanding: function( el, w, onCompleteExpand ) {
		  var f = null, 
		      s = null;
		  if (el && ((typeof el == 'object') || (el = $( el )))) {
			  var overf = $D.getStyle(el, 'overflow') || 'visible';
			  $D.setStyle(el, 'overflow', 'hidden');
			  s = el.scrollWidth;
			  if (w && (w = parseInt(w, 10)) && (w > 0)) {
			  	// opening....	
			  }
			  else if (this.assetOffset(el, 'width') == 0) {
				w = el.scrollWidth;
			  	f = function (e) {
						$D.setStyle(el, 'overflow', overf);
  	  					$D.setStyle(el, 'width', 'auto');
				    };
			  }
			  else {
			    w = 0;
			  }
			  var id = $E.generateId(el)+'expading';
			  if (id && (this.anim.hasOwnProperty(id))) {
			  	if (this.anim[id].isAnimated()) { 
				  this.anim[id].stop(); 
				}
			  }
			  this.anim[id] = new $Y.Anim(el, { width: { to: w } }, 1.5, YAHOO.util.Easing.easeOutStrong);
			  if (onCompleteExpand) {
				  this.anim[id].onComplete.subscribe( onCompleteExpand );
			  }
			  if (f) {
				  this.anim[id].onComplete.subscribe( f );
			  }
			  this.anim[id].onComplete.subscribe( YAHOO.CMS.Bubble.onRepaint, YAHOO.CMS.Bubble, true );
	  		  this.anim[id].animate();
		  }
		  return s;
		}		
    };
  }();

  var $CMS = YAHOO.CMS.Common;
  /**
  * @behavior - Gallery Links
  */
  $B.addDefaultAction ('navAjaxGallery', 
		function(layer, args) {
			var content = document.createElement("span");
			content.innerHTML = "&nbsp;";
			var success = function(o){
										if((o.responseText != 'undefined') && (o.argument.c)){
										  // aqui utilizo el magicFade para intercambiar contenidos, pero además le mando la funcion que debe 
										  // ejecutarse inmediatamente despues de la conclusión de la animación, para garantizar que nada falle...
										  $CMS.displayDialog( o.argument.c, o.responseText, '50em', true );
										  var myGallery = new YAHOO.widget.Gallery('gallery', { container:'yuigallery' } );
										}
									};
			var failure = function(o){};
	  	    var el = $B.getAncestorByTagName( args[1].target, 'A' );
			if (el && el.getAttribute) {
		      $CMS.ajaxLoadContent ( content,  $CMS.url_completion ( el.href, 'tpl=tpls/ajax&page=pages/object-gallery' ), success, failure);
			}
		}
	);

  /**
  * @behavior - Pagination Links
  */
  $B.addDefaultAction ('navAjaxPagination', 
		function (layer, args) {
			$CMS.loading.show ();
			var success = function(o){
							if((o.responseText != 'undefined') && (o.argument.c)){
							  // aqui utilizo el magicFade para intercambiar contenidos, pero además le mando la funcion que debe 
							  // ejecutarse inmediatamente despues de la conclusión de la animación, para garantizar que nada falle...
							  $CMS.applyMagicFade ( o.argument.c, 
							     { 
							     	text:o.responseText, 
							     	onComplete: function() {
							     					$CMS.loading.hide();
							     					document.location = '#tms-pagination';
							     			     } 
							     }
							  );
							}
						  };
			var failure = function(o){ $CMS.loading.hide();};
	  	    var el = $B.getAncestorByTagName( args[1].target, 'A' );
	  	    var owner = $B.getAncestorByClassName( args[1].target, 'yui-cms-pager' ) || $('tms-pagination');
			if ($L.isObject (owner) && $L.isObject(el)) {
			  $CMS.ajaxLoadContent ($E.generateId(owner), $CMS.url_completion ( el.href, 'tpl=tpls/ajax' ), success, failure);
			}
		}
	);
  
  /**
  * @class Translator
  * Translator plugin for language management...
  * @param {Element}	el	        The element representing the MenuBar
  * @param {object}	userConfig	The configuration object literal containing the configuration that should be set for this Overlay.
  * @constructor
  */
  YAHOO.CMS.Translator = function( el, userConfig ) {
    var json = function (that) {
    };
    var load = function (that,url) {
	  // cargando un modulo de lenguaje...
	  var callback =
	    {
		  success:loadingSuccess,
		  failure:loadingFailure,
		  argument: { obj:that }
	    };
	  var request = $C.asyncRequest('GET', this.URL, callback);
    };
    var loadingSuccess = function (o) { // ojo, todos los valores que se pasan a esta función vienen sin el ambito del objeto, es una función de clase...
		if ((o.responseText != 'undefined') && (o.argument.c) && (typeof o.argument.obj == 'object')) {
			o.argument.obj.save( o.responseText );
			o.argument.obj.syncFinish();
			if (o.responseText.length > 0)
			  o.argument.obj.display();
		}
    };	    
    var loadingFailure = function (o) {
		if (typeof o.argument.obj == 'object') {
			o.argument.obj.syncFinish();
		}
		return handleFailure (o);
    };
	return {
		language: new Array(),
		ready: false,
	    init:function (el, userConfig) {
		  userConfig = userConfig || {};
	      userConfig.element = userConfig.element || el || null;
		  this.URL = userConfig.URL || null;
		  this.language = {};

		  // another values
		  if (!YAHOO.CMS.isEmpty(userConfig.seconds))
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
			this.URL = url_completion ( this.URL, 'tpl=tpls/ajax&page=pages/ajax-category&mode=' + this.mode );
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
		t: function() {},
		get: function() {},
		set: function(root) {
		    this.root = root || this.root; 
		    // ----------------------------------------------------------------------------------
		    // Create the context menu for each element with class iqual at 'cms_rss_menu'
		    // ----------------------------------------------------------------------------------
			this.items = $D.batch ($D.getElementsByClassName('cms_bookmark_menu','a',this.root), initContextMenu, this, true);
		},
		reset: function () {
		  if (this.ready) {
		  	$D.batch (this.items, function ( el ) {el.destroy();});
			this.items = null;
		  }
		  this.ready = false;
		}
	};
  }();
})();


String.prototype.trim = function () {
    return this.replace(
        /^\s*(\S*(\s+\S+)*)\s*$/, "$1"); 
};

String.prototype.supplant = function (o) { 
    return this.replace(/{([^{}]*)}/g, 
        function (a, b) {  
            var r = o[b];
            return typeof r === 'string' ? 
                r : a; 
        }
    ); 
}; 
String.prototype.ellipse = function(maxLength){
    if(this.length > maxLength){
        return this.substr(0, maxLength-3) + '...';
    }
    return this;
}
/* Array prototype, marge a new array to the current array */
Array.prototype.merge = function ( items ) {
	var i;
	for (i=0; i < items.length; i++)
      this.push(items[i]);
};
//]]>