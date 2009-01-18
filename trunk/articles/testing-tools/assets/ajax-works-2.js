function ajaxWorksInit(elButton, elDiv) {
    var sUrl = "ajax-works-result.txt";
    
	<!-- (1) The callback function runs when the XHR returns. -->
    var callback = {
     success: function(o) {
        elDiv.innerHTML = o.responseText;
     },
     failure: function(o) {
        elDiv.innerHTML = "AJAX doesn't work! " + "Status is (" + o.status + ") " + o.statusText + ".";
     }
    }

	<!-- (2) The event handler hands off to the callback method. --> 
    var handleClick = function(e) {
        var transaction = YAHOO.util.Connect.asyncRequest("GET", sUrl, callback, null);
        this.removeListener(handleClick);
    };
    elButton.on('click', handleClick, elButton);
}
