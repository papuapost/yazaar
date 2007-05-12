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
	    $ =  $D.get;
	/**
	* @class
	* Gallery is an implementation of Images Gallery.
	* @param {string}	el	The element ID representing the Gallery <ul>Gallery</ul>
	* @param {Element}	el	The element representing the Gallery
	* @param {object}	userConfig	The configuration object literal containing the configuration that should be set for this Gallery. See configuration documentation for more details.
	* @constructor
	*/
	
	YAHOO.widget.Gallery = function(p_oElement, p_oConfig) {
	    this.init(p_oElement, p_oConfig);
	};
	
	YAHOO.widget.Gallery.prototype = {
	
		NEXT_BUTTON_IMAGE_ALT      : "Next",
		PREVIOUS_BUTTON_IMAGE_ALT  : "Previous",
		CSS_GALLERY    			   : "gallery",
		
		container     : null,
		aListElements : new Array(),
		aElement      : 0,
		hidedelay	  : 5000,
		hideProcId	  : null,
		autoplay	  : true,
		
		/**
		* The Gallery initialization method. This method is automatically called by the constructor. A GAllery is automatically rendered by the init method, and it also is set to be invisible by default, and constrained to viewport by default as well.
		* @param {string}	el	The element ID representing the Gallery <em>OR</em>
		* @param {Element}	el	The element representing the Gallery
		* @param {object}	userConfig	The configuration object literal containing the configuration that should be set for this Gallery. See configuration documentation for more details.
		*/
		init: function(el, userConfig) {
			this.container = userConfig.container;
			this.aListElements = [];
			if (typeof this.container == 'string') {
			    var el = $(this.container);
			    $D.addClass(el, this.CSS_GALLERY);
		
			    var none = function(e){ $B.eventGarbage(e); }
			    var items = el.getElementsByTagName("a");
			   for (var i=0; i<items.length; i++) {
				  $E.addListener ( items[i], 'click', none );
				  if (this.isImage(items[i].href)) {
				    var oImg = document.createElement("img");
					    oImg.src = items[i].href;
				    items[i].innerHTML = (i+1) + '. ' + items[i].title + '<br />';  
				    items[i].appendChild(oImg);
				    this.aListElements[this.aListElements.length] = $E.generateId (items[i]);
		  		    $D.setStyle($E.generateId (items[i]), 'display', 'none');
			        $D.setStyle(oImg, 'margin', '4px');
				  }
			    }
			  
			    var obj = this;
			  
				var that = this;
				var hplay = new YAHOO.widget.Button({ label:"&nbsp;", type:"link", href:"#", container:el });
				hplay.addListener("click", this.start, that, true );
				hplay.addClass ('cms-player-play');
				
				var hstop = new YAHOO.widget.Button({ label:"&nbsp;", type:"link", href:"#", container:el });
				hstop.addListener("click", this.stop, that, true );
				hstop.addClass ('cms-player-stop');
				
				//this.PREVIOUS_BUTTON_IMAGE_ALT;
				var hrw = new YAHOO.widget.Button({ label:"&nbsp;", type:"link", href:"#", container:el });
				hrw.addListener("click", this.onPrevious, that, true );
				hrw.addClass ('cms-player-rw');

			  	// paginado...
				for (var i=0; i<this.aListElements.length; i++) {
					  var oItem = document.createElement("a");
						  oItem.href = 'javascript:;';
					      oItem.innerHTML = (i+1);
					      oItem.rel = i;
					  //el.appendChild(oItem);
				      //$D.setStyle(oItem, 'margin', '4px');
					  //$E.addListener ( oItem, 'click', this.onTarget, obj, true );
					  
					var lab = ' ' + (i+1) + ' ';
					var bt = new YAHOO.widget.Button({ label:lab, type:"link", href:"#", container:el });
					bt.addListener("click", this.onTarget, that, true );
					  
				}
			  
				//this.NEXT_BUTTON_IMAGE_ALT;
				var hff = new YAHOO.widget.Button({ label:"&nbsp;", type:"link", href:"#", container:el });
				hff.addListener("click", this.onNext, that, true );
				hff.addClass ('cms-player-ff');

			}
		  this.onTarget();
		},
		
		// BEGIN BUILT-IN DOM EVENT HANDLERS //
		
		/**
		* The default event handler fired when the user mouses out of the context element.
		* @param {DOMEvent} e	The current DOM event
		* @param {object}	obj	The object argument
		*/
		onNext: function() {
			this.hide();
			this.aElement++;
			if (this.aElement >= this.aListElements.length)
			  this.aElement = 0;
			this.show();
			var o = this;
			window.clearTimeout(this.hideProcId);
			if (this.autoplay) {
				this.hideProcId = setTimeout(function() {
							o.onNext();
							}, this.hidedelay);
			}
		},
		/**
		* The default event handler fired when the user mouses out of the context element.
		* @param {DOMEvent} e	The current DOM event
		* @param {object}	obj	The object argument
		*/
		onPrevious: function() {
			this.hide();
			this.aElement--;
			if (this.aElement < 0)
			  this.aElement = this.aListElements.length - 1;
			this.show();
			var o = this;
			window.clearTimeout(this.hideProcId);
			if (this.autoplay) {
			  this.hideProcId = setTimeout(function() {
						o.onPrevious();
						}, this.hidedelay);
			}
		},
		
		/**
		* The default event handler fired when the user mouses out of the context element.
		* @param {DOMEvent} e	The current DOM event
		* @param {object}	obj	The object argument
		*/
		onTarget: function(e) {
			var i = 0;
			if (e) {
			  var elem = $E.getTarget (e); 
			  i = Math.abs( parseInt (elem.innerHTML.trim()) - 1);
			  if (i >= this.aListElements.length) i = 0;
			}
			this.hide();
			this.aElement = i;
			this.show();
			var o = this;
			window.clearTimeout(this.hideProcId);
			this.hideProcId = setTimeout(function() {
						o.onNext();
						}, this.hidedelay);
		},	
		
		// END BUILT-IN DOM EVENT HANDLERS //
		
		/**
		* Processes the showing event
		* @param {DOMEvent} e	The current DOM event
		* @return {int}	The process ID of the timeout function associated with doShow
		*/
		show: function() {
			$D.setStyle(this.aListElements[this.aElement], 'display', '');
		},
		
		/**
		* 
		*/
		hide: function() {
			$D.setStyle(this.aListElements[this.aElement], 'display', 'none');
		},

		stop: function(e) {
			this.autoplay = false;
			window.clearTimeout(this.hideProcId);
		},
		start: function(e) {
			this.autoplay = true;
			window.clearTimeout(this.hideProcId);
			this.onNext (e);
		},
		
		isImage: function() {
			return true;
		},
		
		/**
		* Returns a string representation of the object.
		* @type string
		*/ 
		toString: function() {
			return "Caridy´s Gallery Control" + this.id;
		}
	};
})();