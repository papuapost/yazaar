/** JavaScript Bubbling Library (c) MIT License 2007* http://bubbling.comarq.com/eng/licence* Free Support: http://bubbling.comarq.com/* V 2.2.0*/YAHOO.namespace("CMS");YAHOO.namespace("CMS.widget","CMS.behaviors","CMS.plugin");YAHOO.namespace("CMS.ext","CMS.example");(function(){var $Y=YAHOO.util,$E=YAHOO.util.Event,$D=YAHOO.util.Dom,$=YAHOO.util.Dom.get;YAHOO.CMS.Bubble=function(){var obj={},ua=navigator.userAgent.toLowerCase(),isOpera=(ua.indexOf('opera')>-1);var navRelExternal=function(layer,args){var el=obj.getAncestorByTagName(args[1].target,'A');if(!args[1].decrepitate&&el){var r=el.getAttribute("rel"),t=el.getAttribute("target");if((!t||(t==''))&&(r=='external')){el.setAttribute("target","blank");}}};var defaultActionsControl=function(layer,args){obj.processingAction(layer,args,obj.defaultActions);};obj.ready=false;obj.bubble={navigate:new $Y.CustomEvent('navigate'),property:new $Y.CustomEvent('property'),submit:new $Y.CustomEvent('submit'),repaint:new $Y.CustomEvent('repaint'),rollover:new $Y.CustomEvent('rollover'),rollout:new $Y.CustomEvent('rollout')};obj.onNavigate=function(e){var t=(e?$E.getTarget(e):null);this.bubble.navigate.fire(e,{action:'navigate',target:t,decrepitate:false});};obj.onProperty=function(e){var t=(e?$E.getTarget(e):null);this.bubble.property.fire(e,{action:'property',target:t,decrepitate:false});};obj.onRepaint=function(e){var t=(e?$E.getTarget(e):null);this.bubble.repaint.fire(e,{action:'repaint',target:t,decrepitate:false});};obj.onSubmit=function(e){var t=(e?$E.getTarget(e):null);this.bubble.submit.fire(e,{action:'repaint',target:t,decrepitate:false});};obj.onRollOver=function(e){var t=(e?$E.getTarget(e):null);this.bubble.rollover.fire(e,{action:'rollover',target:t,decrepitate:false});};obj.onRollOut=function(e){var t=(e?$E.getTarget(e):null);this.bubble.rollout.fire(e,{action:'rollout',target:t,decrepitate:false});};obj.eventGarbage=function(e){if(e)$E.stopEvent(e);return false;};obj.getAncestorByClassName=function(el,c){if(el&&((typeof el=='object')||(el=$(el)))&&c){while(el.parentNode){if($D.hasClass(el,c))return el;if(el.tagName=="BODY")return null;el=el.parentNode;}}return null;};obj.getAncestorByTagName=function(el,t){if(el&&((typeof el=='object')||(el=$(el)))&&t){while(el.parentNode){if(el.tagName==t)return el;if(el.tagName=="BODY")return null;el=el.parentNode;}}return null;};obj.getActionName=function(el,depot){depot=depot||{};if(el&&((typeof el=='object')||(el=$(el)))&&(el.getAttribute)){var r=el.getAttribute("rel");if(r&&((r.indexOf('nav')===0)||(r.indexOf('action')===0)||(r.indexOf('ajax')===0)))return r;else{for(c in depot){if((depot.hasOwnProperty(c))&&($D.hasClass(el,c))&&((c.indexOf('nav')===0)||(c.indexOf('action')===0)||(c.indexOf('ajax')===0)||(c.indexOf('button')===0))){return c;}}}}return null;};obj.getFirstChildByTagName=function(el,t){if(el&&((typeof el=='object')||(el=$(el)))&&t){var l=el.getElementsByTagName(t);if(l.length>0)return l[0];}return null;};obj.virtualTarget=function(e,el){if(el&&((typeof el=='object')||(el=$(el)))&&e){var t=$E.getRelatedTarget(e);if(t&&(typeof t=='object'))while((t.parentNode)&&(typeof t.parentNode=='object')&&(t.parentNode.tagName!="BODY")){if(t.parentNode==el)return true;t=t.parentNode;}}return false;};obj.buttons={};obj.dispatchButton=function(bt,userConfig){if(bt){if(userConfig){if(userConfig.action){bt.addClass(userConfig.action);}if(userConfig.className){bt.addClass(userConfig.className);}}this.buttons[bt.get('id')]=bt;}};obj.processingAction=function(layer,args,actions){if(!args[1].decrepitate){var act=this.getActionName(this.getAncestorByTagName(args[1].target,'A'),actions);if(act&&(actions.hasOwnProperty(act))){actions[act](layer,args);this.eventGarbage(args[0]);args[1].decrepitate=true;}else{var bt=this.getAncestorByClassName(args[1].target,'yuibutton');var act=this.getActionName(bt,actions);if(bt&&act&&(actions.hasOwnProperty(act))){args.button=this.buttons[$E.generateId(bt)];actions[act](layer,args);this.eventGarbage(args[0]);args[1].decrepitate=true;}}}};obj.defaultActions={};obj.addDefaultAction=function(n,f){if(n&&f&&(!this.defaultActions.hasOwnProperty(n))){this.defaultActions[n]=f;}};$E.addListener(window,"resize",obj.onRepaint,obj,true);$E.addListener(window,"submit",obj.onSubmit,obj,true);obj.bubble.navigate.subscribe(navRelExternal);obj.bubble.navigate.subscribe(defaultActionsControl);obj.init=function(){if(!this.ready){var el=document.body;$E.addListener(el,"click",obj.onNavigate,obj,true);$E.addListener(el,(isOpera?"mousedown":"contextmenu"),obj.onProperty,obj,true);if(isOpera){$E.addListener(el,"click",obj.onProperty,obj,true);}$E.addListener(el,"mouseover",obj.onRollOver,obj,true);$E.addListener(el,"mouseout",obj.onRollOut,obj,true);this.ready=true;}};$E.addListener(window,"load",obj.init,obj,true);return obj;}();})();