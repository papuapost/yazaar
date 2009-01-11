/**
 * Open a connection to the specified URL, which is
 * intended to provide an XML message.  The specified data
 * is sent to the server as parameters.  This is the same as
 * calling xmlOpen("POST", url, toSend, responseHandler).
 *
 * @param string url    The URL to connect to.
 * @param string toSend The data to send to the server; must be URL encoded.
 * @param function responseHandler The Javascript function handling server response.
 */
function xmlPost(url, toSend, responseHandler)
{
    xmlOpen("POST", url, toSend, responseHandler);
}

/**
 * Open a connection to the specified URL, which is
 * intended to provide an XML message.  No other data is
 * sent to the server.  This is the same as calling
 * xmlOpen("GET", url, null, responseHandler).
 *
 * @param string url    The URL to connect to.
 * @param function responseHandler The Javascript function handling server response.
 */
function xmlGet(url, responseHandler)
{
    xmlOpen("GET", url, null, responseHandler);
}

/**
 * Open a connection to the specified URL, which is
 * intended to respond with an XML message.
 * 
 * @param string method The connection method; either "GET" or "POST".
 * @param string url    The URL to connect to.
 * @param string toSend The data to send to the server; must be URL encoded.
 * @param function responseHandler The Javascript function handling server response.
 */
function xmlOpen(method, url, toSend, responseHandler)
{
    if (window.XMLHttpRequest)
    {
        // browser has native support for XMLHttpRequest object
        req = new XMLHttpRequest();
    }
    else if (window.ActiveXObject)
    {
        // try XMLHTTP ActiveX (Internet Explorer) version
        req = new ActiveXObject("Microsoft.XMLHTTP");
    }
    
    if(req)
    {
        req.onreadystatechange = responseHandler;
        req.open(method, url, true);
        req.setRequestHeader("content-type","application/x-www-form-urlencoded");
        req.send(toSend);
    }
    else
    {
        alert('Your browser does not seem to support XMLHttpRequest.');
    }
}

/**
 * Gets the first child node of <code>parent</code> with the
 * specified tag name.
 *
 * @param parent the parent XML DOM node to search
 * @param tagName the tag name of the child node to search for
 */
function getNode(parent, tagName)
{
    var i;
    var max = parent.childNodes.length;
    
    // Check each child node
    for(i = 0; i < max; i++)
    {
        if(parent.childNodes[i].tagName)
        {
            if(parent.childNodes[i].tagName.toUpperCase() == tagName.toUpperCase())
            {
                // We found a matching child node; return it.
                return parent.childNodes[i];
            }
        }
    }
    // One was not found; return null
    return null;
}

/**
 * Gets the first child node of <code>parent</code> with the
 * specified tag name and whose value of the 'key' attribute
 * is <code>key</code>.
 *
 * @param parent the parent XML DOM node to search
 * @param tagName the tag name of the child nodes to search in
 * @param key the value of the 'key' attribute to search on
 */
function getNodesWithKey(parent, tagName, key)
{
    var i;
    var cellNodes = parent.getElementsByTagName(tagName);
    var max = cellNodes.length;
    
    // Check each cell node for the specified value for
    // the 'key' attribute
    for(i = 0; i < max; i++)
    {
        if(cellNodes[i].getAttribute('key') == key)
        {
            // We found a matching cell node; return it.
            return cellNodes[i];
        }
    }
    // One was not found; return null
    return null;
}