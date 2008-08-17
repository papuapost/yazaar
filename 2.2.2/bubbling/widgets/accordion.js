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
  * @class Accordion
  * @param {Element}	el	        The element representing the MenuBar
  * @param {object}	userConfig	The configuration object literal containing the configuration.
  * @constructor
  */
  YAHOO.CMS.widget.Accordion = function(aElement, userConfig) {
    this.init(aElement, userConfig);
  };

  YAHOO.CMS.widget.Accordion.prototype = {

    element: null, // div element that represent the dynamic area...
	ready: true,
	
	initConfig: null,
	selected: null,
	childClass: 'child',
	slideClass: 'slide',
	controlClass: 'control',
	propagation: false, // stopPropagation during the click event

	timerProcId: null,
	seconds: 1.5,

    // init...
    init:function (el, userConfig) {
	  userConfig = userConfig || {};
      userConfig.element = userConfig.element || el || null;
	  this.childClass = userConfig.childClass || this.childClass;
	  this.slideClass = userConfig.slideClass || this.slideClass;
	  this.controlClass = userConfig.controlClass || this.controlClass;
	  this.propagation = userConfig.propagation || this.propagation;

	  // required values
	  this.element = userConfig.element || el || null;
	  
	  if ((typeof this.element == 'object') || (this.element = $( this.element ))) {
	    this.ready = true;
        this.initConfig = userConfig;
		// check if are a selected object and this object is a child object and has de correct class assigned
		if ((userConfig.selected) && ($D.isAncestor(this.element, userConfig.selected)) && ($D.hasClass(userConfig.selected, this.childClass)))
		  this.selected = $(userConfig.selected);
		// onStart Event....
		if (this.initConfig.onStart)
		  this.initConfig.onStart.call();
		// starting accordion action...
		this.reset ();
		var that = this;
		$E.addListener(this.element, "click", that.trigger, that, true);
		$E.addListener(this.element, "mouseover", that.startCounting, that, true);
		$E.addListener(this.element, "mouseout", that.resetCounting, that, true);
	  }
	},
	reset: function ()  {
	  if (this.ready) {
	  	  var that = this,
		      childs = $D.getElementsByClassName(this.childClass,'*',this.element);
		  if (childs.length > 0)
		    this.items = $D.batch (childs, function (element){ that.check(element); }, this, true);
	  }
	},
	check: function (el) {
	  var that = this, 
	      f = null,
		  slides = $D.getElementsByClassName(this.slideClass,'*',el);
	  $D.removeClass(el, 'open');	  
	  $D.removeClass(el, 'close');	  
      if (this.selected && (el == this.selected)) {
		  f = function (element){
			 	that.open ( element );
			 };
		  $D.addClass(el, 'open');
	  } else {
		  f = function (element){
			 	that.close ( element );
			 };
		  $D.addClass(el, 'close');
	  }
	  if (slides.length > 0)		 
	    $D.batch (slides, f, this, true);
	},
	close: function (el) {
	    $D.setStyle(el, 'overflow', 'hidden');
		var anim = new $Y.Anim(el, { height: { to: 0} }, 1.5, $Y.Easing.easeOutStrong);
		anim.onComplete.subscribe( $B.onRepaint, $B, true );
		anim.animate();
	},
	open: function (el) {
	    $D.setStyle(el, 'overflow', 'hidden');
		var anim = new $Y.Anim(el, { height: { to: el.scrollHeight } }, 1.5, $Y.Easing.easeOutStrong),
		    that = this;
		anim.onComplete.subscribe( function(e) {
		  	$D.setStyle(el, 'overflow', 'visible');
		  	$D.setStyle(el, 'height', 'auto');
		    $B.onRepaint(e);
	    });
		anim.animate();
	},
	resetCounting: function (e) {
		if (this.timerProcId) {
		  window.clearTimeout(this.timerProcId);
		}  
		this.timerProcId = null;
	},
	startCounting: function (ev) {
		this.resetCounting(ev);
		var that = this,
			t 	 = $E.getTarget(ev),
			p 	 = $B.getAncestorByClassName(t, this.childClass),
			func = function () {
				that.process(t); 
				that.timerProcId = null;
			};
		if (p !== this.selected) { // if this tab is not the current selected tab...
		  this.timerProcId = setTimeout(func, Math.abs(this.seconds)*1000);
		}
	},
	trigger:function (e){
		var t=$E.getTarget(e); // target 
	    if(this.ready){
		  if (this.process(t) && !this.propagation) {
			  $B.eventGarbage(e);
		  }
	    }
	},
	process:function (t){
		var p=null; // parent by classname
		if (($D.hasClass(t, this.controlClass)) && (p = $B.getAncestorByClassName(t, this.childClass))) {
		  	this.selected = (this.selected===p?null:p);
			if (this.timerProcId != null)
			  this.reset ();
			return true;
		}
		return false;
	},
	/**
	* Returns a string representation of the object.
	* @type string
	*/
	toString: function() {
		return "Caridy´s Accordion Control " + this.element.id;
	}
  };
})();