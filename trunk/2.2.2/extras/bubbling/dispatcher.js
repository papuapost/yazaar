/*
* Bubbling JavaScript Library (c) MIT License 2007
* http://bubbling.comarq.com/eng/licence
* Author: Caridy Patiño (caridy at gmail.com)
* Website: http://bubbling.comarq.com
* V 0.8
*/ 
(function() {
  var $C = YAHOO.util.Connect,
	  $E = YAHOO.util.Event,
	  $D = YAHOO.util.Dom,
	  $  = YAHOO.util.Dom.get;
	  
  /**
  * @class Dispatcher
  */
  YAHOO.util.Dispatcher = function () {
  	var obj = {},
		_threads = {};

	// private stuff
	/**
	* Dispatching the next node of the handle
	* @public
	* @param {Object} hd     		Thread's handle
	* @param {Object} userConfig    Used to pass the user configuration thru the chain of execution
	* @return boolean
	*/
	function dispatch( hd, userConfig ) {
	  if (obj.isAlive(hd)) {
	  	var node = _threads[hd].shift ();
	  	if (node.src) {
		  var callback =
		  {
			success: function (o) {
				if (o.responseText != 'undefined') {
					exec (hd, o.responseText, userConfig);
				}
			},
			failure:function (o) {
				dispatch( hd, userConfig );
			}
		  };
		  var request = $C.asyncRequest('GET', node.src, callback);
		}
		else {
			exec (hd, node.content, userConfig);
		}
	  } else {
	  	obj.kill(hd);
		// after the execution
		if (userConfig.after)
		  userConfig.after.call();
	  }
	};

	/**
	* Executing a javascript script segment
	* @public
	* @param {Object} hd     		Thread's handle
	* @param {string} c     		Content to execute
	* @param {Object} userConfig    User configuration (useful for future implementations)
	* @return boolean
	*/
	function exec( hd, c, userConfig ) {
	  if (c && (c != '')) {
		userConfig.scope = (userConfig.scope?userConfig.scope:window);
		try{
		  // initialize a new anonymous container for the script, dont make it part of this object scope chain
		  // instead send in a variable that points to this object, usefull to connect events to onLoad, onUnLoad etc..
		  this.scriptScope = null;
		  this.scriptScope = new (new Function('_container_', c+'; return this;'))(userConfig.scope);
		}catch(e){
	  	  alert("Error running scripts from content:\n"+e);
		}
	  }
	  dispatch( hd, userConfig );
	};

	/**
	* Display the content inside the element
	* @public
	* @param {Object} el    		Element reference
	* @param {string} c     		Content to display
	* @param {Object} userConfig    User configuration (useful for future implementations)
	* @return boolean
	*/
	function display( el, c, userConfig ) {
		userConfig.action = (userConfig.action?userConfig.action:'update');
		switch (userConfig.action)
		{
			case 'tabview':
				try { el.set('content', c); } catch (e) {return false;}
				break;
			case 'update':
				// purge the child elements and the events attached...
			  	while (el.childNodes.length > 0) {
				  $E.purgeElement ( el.childNodes[0], true );
				  el.removeChild(el.childNodes[0]);
				}
				c = el.innerHTML + c;
			default:
				// changing the content
				try { el.innerHTML = c; } catch (e) {return false;}
				break;
		} 		
		return true;
	};

	/**
	* Parse the string, remove the script tags, and create the execution thread...
	* @public
	* @param {Object} hd    		Element reference
	* @param {string} s     		String with the script tags inside...
	* @return string
	*/
    function parse( hd, s ) {
		// cut out all script tags, push them into thread
		var m = true, attr = false;
		while(m){
			m = false;
			s = s.replace(/<script([^>]*)>([\s\S]*?)<\/script>/i,
			  function (str,p1,p2,offset,s) {
				if(p1){
				  attr = p1.match(/src=(['"]?)([^"']*)\1/i);
				  if(attr) { // add a remote script to buffer
				    _threads[hd].push ({
						src: attr[2],
						content: ''
					});
				  }
				}
				// add a inline script to buffer
			    _threads[hd].push ({
					src: null,
					content: p2
				});
				m = true;
			    return ""; 
		      } 
			);
		}
		return s;
    };
	
	// public vars
	// public methods
	/**
	* * Fetching a remote file that will be processed thru this object...
	* @public
	* @param {object} el     		Element reference (DOM element where the remote content will be ) 
	* @param {object} file          Remote file that will be loaded using AJAX
	* @param {object} userConfig    Literal object with the user configuration vars
	* @return void
	*/
	obj.fetch = function( el, file, userConfig ){
	   if (file) {
		 userConfig = userConfig || {};
		 var callback = {
			success: function (o) {
				if (o.responseText != 'undefined') {
					obj.process( el, o.responseText, userConfig );
				}
			},
			failure:function (o) {
			}
		 };
		 // before the loading
		 if (userConfig.before) {
		   userConfig.before.call();
		   userConfig.before = null;
		 }
		 var request = $C.asyncRequest('GET', file, callback);
	   }		
	};
	/**
	* * Starting the process for a content...
	* @public
	* @param {object} el     		Element reference (DOM element where the content will be seated) 
	* @param {string} content       Content to be processed
	* @param {object} userConfig    Literal object with the user configuration vars
	* @return object  (return a reference to the thread handle...)
	*/
	obj.process = function( el, content, userConfig ){
		var hd = null;
		userConfig = userConfig || {};
		if (el && ((typeof el == 'object') || (el = $( el )))) {
			var hd = userConfig.guid  || $E.generateId (el); // by default, one thread by element, use the GUID to discard this rule...
			this.kill(hd); // kill the previous process for this handle...
			// before the process
			if (userConfig.before)
			  userConfig.before.call();
			// processing
			if (display(el, parse (hd, content), userConfig)) {
				dispatch (hd, userConfig); // starting the execution chain
			}
		}
		return hd;
	};
	
	
	/**
	* * Verify if the a process is still alive
	* @public
	* @param {object} handle   Process handle
	* @return boolean
	*/
	obj.isAlive = function ( hd ) {
		return (hd && (_threads[hd]) && (_threads[hd].length > 0));
	}; 
	/**
	* * Kill a process...
	* @public
	* @param {object} handle   Process handle
	* @return void
	*/
	obj.kill = function ( hd ) {
		if (this.isAlive (hd)) {
			_threads[hd] = null; // discarding the handle...
		}
		_threads[hd] = [];
	};
	/**
	* * TABVIEW: delegate the set content method...
	* @public
	* @param {object} tab		reference to the tab...
	* @param {object} tabview   reference to the tabview (not needed)...
	* @return void
	*/
	obj.delegate = function ( tab, tabview, userConfig ) {
		userConfig = userConfig || {};
		userConfig.action = 'tabview';
		tab.loadHandler.success = function(o) {
			obj.process( tab, o.responseText, userConfig );
		};
		if (tabview && (typeof tabview == 'object')) {
			tabview.addTab(tab);
		}
	};
	return obj;
  }();
})();
