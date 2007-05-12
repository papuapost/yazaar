/*
* JavaScript Bubbling Library (c) MIT License 2007
* http://bubbling.comarq.com/eng/licence
* Free Support: http://bubbling.comarq.com/
* V 2.2.0
*/
(function() {
	
    var $B = YAHOO.CMS.Bubble,
		$E = YAHOO.util.Event,
	    $D = YAHOO.util.Dom;

	/**
	* @singleton Selector - Use this object to management your menus...
	* Apply visual enhanced to an area 
	* @constructor
	*/
	YAHOO.CMS.plugin.Selector = function() {
		var obj = {},
			_areas = {},
			_listClass = 'yui-cms-selector',
			_itemClass = 'yui-cms-item',
			_selector = 'selected',
			_defConf   = { 
							persistent: false // true if you want to keep an item selected even when the mouse it´s out of the area 
						 };
		
		function reset (area, id) {
			var resetItem = function ( ref ) {
				$D.removeClass(ref, _selector);
			};
			var items = $D.getElementsByClassName(_itemClass,'*',area);
			if (items.length > 0) {
			  $D.batch (items, resetItem, obj, true);
			}
		};
	    var actionControlRollovers = function (layer, args) {
			var area = null, item = null;
			if (!args[1].decrepitate) {
			  if (area = $B.getAncestorByClassName( args[1].target, _listClass )) {
				for (c in _areas) {
					if ($D.hasClass(area, c)) { // match with a certain area
						if (!$D.hasClass(area, _selector)) {
							$D.addClass(area, _selector);
							if (!_areas[c].persistent) {
								$E.addListener ( area, 'mouseout',  function () { reset(area, c); }, obj, true );
							}
							reset (area, c);
						}
						if (item = $B.getAncestorByClassName( args[1].target, _itemClass )) {
							// is over an item...
							$D.addClass(item, _selector);
						}
					}
				}
			  }
		    }
	    };
		$B.bubble.rollover.subscribe(actionControlRollovers);
		
		// public vars
		// public methods
		/**
		* * add a new area to the stock
		* @public
		* @param {string} id   className
		* @return boolean
		*/
		obj.add = function ( id, conf ) {
			obj.remove(id);
			_areas[id] = conf || _defConf;
		};
		/**
		* * Remove an area from the stock...
		* @public
		* @param {object} id	className
		* @return void
		*/
		obj.remove = function ( id ) {
			if (id && (_areas[id])) {
				_areas[id] = null; // discarding the area...
			}
			_areas[id] = [];
		};
		return obj;
	}();
})();