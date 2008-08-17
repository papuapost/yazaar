/*
 JS-FORM-CHECKER
 ===============
 $Id$
 Author: nilsandrey@gmail.com
YUI Integration: caridy@gmail.com
 
 Assumed Document Object Model described in:
 "Document Object Model (DOM) Level 2 Specification Version 1.0"
 (http://www.w3.org/TR/1999/CR-DOM-Level-2-19991210)
 Latest version: (http://www.w3.org/TR/DOM-Level-2)

 Successfully tested on:
  - Miscrosoft Internet Explorer 6
  - Mozilla Firefox 2.0
  - Opera 8.5
 All in platform Win32, Operating System Windows XP SP2.
 
 Description:
 ============
 Script to check values in a form based on regular expression objects. To validate a form call the function
 checkForm(Names, Exprs, EMsgs). MSG_INCORRECT_FORM is the message to show when the form is incorrect.
 The incorrect fields, based on regular expressions, will be signaled changing the border and background styles.
 The two parameters are arrays with the names and regular expressions correspondients to each field
 in the form. For each name in the array Names, will be a matching regular expression at the same position in the
 array RegExprs.
 An example of declaration is commented out below. Note that there are some regular expressions already defined for
 both required and not required fields.

 Use Example:
 ============
	<script type="text/javascript" src="validateform.js"></script>
	<script type="text/javascript">
		MSG_INCORRECT_FORM = "Error in form! Check signaled fields.";

		var Names = new Array();
		var Exprs = new Array(); 
		var EMsgs = new Array();

		Names[0] = "company_name";
		EMsgs[0] = "Error in company name"
		Exprs[0] = RE_Req_NoTags;

		Names[1] = "phone";
		EMsgs[1] = "Error in phone"
		Exprs[1] = "([\\d\\s\\(\\)\\+\\-])*"; // Phone number: ( ) + - 0 1 2 3 4 5 6 7 8 9 and whitespace chars

		Names[2] = "description";
		EMsgs[2] = "Error in description"
		Exprs[2] = RE_Req_NoTags;

		Names[3] = "email";
		EMsgs[3] = "Error in email"
		Exprs[3] = RE_NonReq_EmailAddress;

		Names[4] = "webpage";
		EMsgs[4] = "Error in webpage"
		Exprs[4] = RE_NonReq_WebURL;

		Names[5] = "address";
		EMsgs[5] = "Error in address"
		Exprs[5] = RE_NonReq_NoTags;

	</script>
	....
	<form ... onsubmit="return checkForm(Names, Exprs, EMsgs, MSG_INCORRECT_FORM)"...>
	...
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
	* @class
	* Helphint is an implementation of Overlay that behaves like an OS helphint, displaying when the user mouses over a particular element, and disappearing on mouse out.
	* @param {string}	el	The element ID representing the Helphint <em>OR</em>
	* @param {Element}	el	The element representing the Helphint
	* @param {object}	userConfig	The configuration object literal containing the configuration that should be set for this Overlay. See configuration documentation for more details.
	* @constructor
	*/
	YAHOO.CMS.widget.Form = function(el, userConfig) {
		YAHOO.CMS.widget.Form.superclass.constructor.call(this, el, userConfig);
	}


	/**
	* @class Tips
	* Tooltips manager object....
	* @constructor
	*/
	YAHOO.CMS.widget.Forms = function ( el, userConfig ) {		
		var obj = {};
	    // Behaviors
		var actions = {
			actionFormFieldFocus: function (layer, args) {
				  var el = $B.getAncestorByTagName( args[1].target, 'A' );
				  if (el && el.id && (el.id.indexOf('setfocus') === 0)) {
				  	// calculating the form field ID
				  	var field = $(el.id.slice (8, el.id.length));
					if (field) {
					  field.focus();
					}
				  }
			}
		};
	    var actionFormControl = function (layer, args) {
		  $B.processingAction (layer, args, actions);
	    };
		$B.bubble.navigate.subscribe(actionFormControl);	
			
	    // Private Stuff
		var _removeHighLighted = function (el) {
			$D.removeClass(el, 'highlighted');
		}
		var _addHighLighted = function (el) {
			_removeAllLighted(el);
			$D.addClass(el, 'highlighted');
		}
		var _removeErroLighted = function (el) {
			$D.removeClass(el, 'errorlighted');
		}
		var _addErrorLighted = function (el) {
			_removeAllLighted(el);
			$D.addClass(el, 'errorlighted');
		}
		var _removeAllLighted = function (el) {
			_removeErroLighted(el);
			_removeHighLighted(el);
		}

		var checkElement = function ( el, rules )
		{
		    var result = '', i;
		    for (i=0; i<rules.length; i++) {
			  if (rules[i].name && (rules[i].name == el.name)) {
		        // If found checks for matching...
	            var RExpr   = new RegExp(rules[i].expression);
	            var Str     = new String(el.value);
	            var matches = Str.match(RExpr);
	            if (matches === null)
	            {
	            	_addErrorLighted(el);
	            	result += rules[i].message+"\n";
	            }
	            else
	            {
	            	_removeAllLighted(el);
	            }
			  }
		    }
		    return result;
		};
		var wordCount = function ( str )
		{
		    var RES     = "[^<>\\s]+(\\s)+|[^<>\\s]+$";
		    var RExpr   = new RegExp(RES, "gim");
		    var Str     = new String(str);
		    var matches = Str.match(RExpr);
		    if (matches != null)
		        return matches.length;
		    else
		        return 0;
		};
		// Public Vars
		obj.RE_Req_DecimalNumber    = "\\d+(\\.\\d+){0,1}";
		obj.RE_NonReq_DecimalNumber = "(\\d+(\\.\\d+){0,1}){0,1}";
		
		obj.RE_Required             = ".+";
		
		obj.RE_Req_EmailAddress     = "^[\\w-]+(\\.[\\w-]+)*@[\\w-]+(\\.[\\w-]+)*$";
		obj.RE_NonReq_EmailAddress  = "^([\\w-]+(\\.[\\w-]+)*@[\\w-]+(\\.[\\w-]+)*){0,1}$";
		
		obj.RE_Req_WebURL           = "^(http|ftp|https|ghoper)://[\\w-]+(\\.[\\w-]+)*(:\\d+){0,1}(/\\S*)*$";
		obj.RE_NonReq_WebURL        = "^((http|ftp|https|ghoper)://[\\w-]+(\\.[\\w-]+)*(:\\d+){0,1}(/\\S*)*){0,1}$";
		
		obj.RE_Req_NoTags           = "^([^<>])+$";
		obj.RE_NonReq_NoTags        = "^([^<>])*$";
		 
		// Public Methods		
		obj.toString = function () {
			return 'Caridy´s Form Manager';
		};
		obj.checkForm = function ( el, rules, header )
		{
		  var result = '', i,
			  allFields = [];
		  if (el && ((typeof el == 'object') || (el = $( el )))) {
			allFields.merge(el.getElementsByTagName('input'));
			allFields.merge(el.getElementsByTagName('textarea'));
			for (i=0; i<allFields.length; i++) {
		      result += checkElement(allFields[i], rules);
			}
		    if (result) {
				result = header+"\n"+result;
		    }
		  }	
		  return result;
		};
		obj.addRules = function ( obj, rules ) {
		  if (arguments.length > 0) {
			for (i=1; i<arguments.length; i++) {
				arguments[0].push ( arguments[i] );
			}
			return arguments[0];
		  }	
		  return false;
		};
		obj.init = function(el, userConfig) {
		  if (el && ((typeof el == 'object') || (el = $( el )))) {
		    // defining the lowercase fields
			$E.addListener($D.getElementsByClassName("autoStr2Lower",'input', el), "change",
			  function (e) {
				var el = $E.getTarget(e);
				if (el && el.value) {
					el.value = el.value.toLowerCase();
				}
			  } 
		    );
			var allFields = [];
			allFields.merge($D.getElementsByClassName("actionHighLighting",'input', el));
			allFields.merge($D.getElementsByClassName("actionHighLighting",'textarea', el));
			allFields.merge($D.getElementsByClassName("actionHighLighting",'select', el));
			$E.addListener(allFields, "focus",
			  function (e) {
				var el = $E.getTarget(e);
				if (el) {
					_addHighLighted (el);
				}
			  } 
		    );
			$E.addListener(allFields, "blur",
			  function (e) {
				var el = $E.getTarget(e);
				if (el) {
					_removeHighLighted (el);
				}
			  } 
		    );
		  }	
		};
		return obj;
	}();
	
})();