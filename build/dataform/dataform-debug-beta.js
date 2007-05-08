/*
Copyright (c) 2007, Husted dot Com, Inc. All rights reserved.
Portions Copyright (c) 2007, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
*/
/**
 * The DataForm widget displays a data-entry form that utilizes a ColumnSet 
 * to describe the input controls and a DataSource to store new records and 
 * to populate fields from a prexisting record (if any). This widget raises 
 * events that bundle record data so that clients can update a remote 
 * persistant store, namely updateEvent, insertEvent, deleteEvent, resetEvent, 
 * and cancelEvent.
 * <p>
 * The DataForm can be used with an independant RecordSet, 
 * or it can share a RecordSet with a companion DataTable. 
 * <p>
 * This control is being created as the first step toward a 
 * Find/List/Edit/View (FLEV) composite control. This control uses the 
 * DataTable control as a starting point, adding and substracting code as needed.
 * <p>
 * The initial version builds the form from scratch. A later version may 
 * provide for progressive enhancement from existing markup, as does the 
 * DataTable control.
 * <p>
 * To make DataForm easier to use with CSS class-based validation 
 * (see jc21 in the Yazaar extras module), extra ColumnHeader 
 * properties are supported: <code>formClassName</code>,  
 * <code>formTitle</code>, <code>formMinLength</code>, and 
 * <code>formMaxLength</code>. These fields generate class, 
 * title, maxLength, and minlength attributes for input elements. 
 * MinLength is a custom attribute utilized by the jc21 validation 
 * module. To enabled inserting a new record with default values, 
 * the <code>formValue</code> property is provided.  
 * <p>
 * 
 * (TODO: Log events for bulk updates, perhaps after reconnecting?)
 * (TODO: Batch or bulk edit selected rows?)
 *
 * @overview
 * @see <a href="DataFormWalkThrough">http://code.google.com/p/yazaar/wiki/DataFormWalkThrough</a>
 * @module yazaar.dataform
 * @requires yahoo, dom, event, datasource
 * @title DataForm Widget
 * @alpha
 */

/****************************************************************************/
/****************************************************************************/
/****************************************************************************/

/**
 * Define yazaar.widget namespace. 
 * @global
 */
YAHOO.namespace("yazaar.widget");	

/////////////////////////////////////////////////////////////////////////////
//
// Constructor
//
/////////////////////////////////////////////////////////////////////////////

/**
 * Creates and configures a new DataForm instance.
 * <p>
 * To share a RecordSet with a DataTable, include a oDataTable property 
 * in the oConfigs, and pass its ColumnSet and DataSource through the 
 * signature. If a oDataTable property is not passed, then this object 
 * creates it's own RecordSet instance.
 *
 * @class
 * @event checkboxClickEvent
 * @param elContainer The element name or object to host the widget
 * @param oConfigs Property settings. May include oDataTable.
*/	
YAHOO.yazaar.widget.DataForm = function(elContainer,oColumnSet,oDataSource,oConfigs) {

    // identify
    var i;
    this._nIndex = YAHOO.yazaar.widget.DataForm._nCount;
    this._sName = "instance" + this._nIndex;
    this.id = "anvil-df"+this._nIndex;

    // configure
    if(typeof oConfigs == "object") {
        for(var sConfig in oConfigs) {
            this[sConfig] = oConfigs[sConfig];
        }
    }
	
    // validate DataSource
    if(oDataSource) {
        if(oDataSource instanceof YAHOO.util.DataSource) {
            this.dataSource = oDataSource;
        }
        else {
            YAHOO.log("Invalid DataSource", "warn", this.toString());			
        }
    }

    // validate ColumnSet
    if(oColumnSet && (oColumnSet instanceof YAHOO.widget.ColumnSet)) {
        this._oColumnSet = oColumnSet;
    }
    else {
        YAHOO.log("Could not instantiate DataForm due to an invalid ColumnSet", "error", this.toString());
        return;
    }
    
    // validate HTML Element
    elContainer = YAHOO.util.Dom.get(elContainer);
	var isContainer = elContainer && elContainer.tagName && (elContainer.tagName.toLowerCase() == "div"); 
    if (isContainer) {
        this._elContainer = elContainer;
		
    // adopt or create RecordSet
	var oDataTable = this.oDataTable;
	if (oDataTable) {
	   var isValid = (oDataTable instanceof YAHOO.widget.DataTable); 
       if (isValid) {
			this._oRecordSet = oDataTable.getRecordSet();
			YAHOO.log("DataTable RecordSet will be shared", "info", this.toString()); // debug						
		}
		else {
			YAHOO.log("Invalid DataTable -- RecordSet will not be shared", "warn", this.toString());			
		}
    }	
	if (this._oRecordSet==null) {
		this._oRecordSet = new YAHOO.widget.RecordSet();
		YAHOO.log("Creating new RecordSet", "info", this.toString()); // debug
	}

	// enhance markup
	
        // TODO: Peek in container child nodes to see if TABLE already exists
        
		// TODO: Progressively enhance an existing form from markup...

		        var elForm = null;

        // Create markup from scratch using the provided DataSource
        if(this.dataSource) {
                this._initForm();
				if (oDataTable) {
					// Already have data
					this.populateForm();	
				} else {
	                // Send out for data in an asynchronous request
					oDataSource.sendRequest(this.initialRequest, this.onDataReturnPopulateForm, this);
				} 
        }
        // Else there is no data
        else {
            this._initForm();
            this.showEmptyMessage();
        }
    }

    // Container element not found in document
    else {
        YAHOO.log("Could not instantiate DataForm due to an invalid container element", "error", this.toString());
        return;
    }

    // Set up event model
    elForm = this._elForm;
	
    /////////////////////////////////////////////////////////////////////////////
    //
    // TODO: DOM Events
    //
    /////////////////////////////////////////////////////////////////////////////
	
    //YAHOO.util.Event.addListener(elForm, "focus", this._onFocus, this);
    //YAHOO.util.Event.addListener(elForm, "blur", this._onBlur, this);
	YAHOO.util.Event.addListener(document, "keyup", this._onDocumentKeyup, this);	

    /////////////////////////////////////////////////////////////////////////////
    //
    // Custom Events
    //
    /////////////////////////////////////////////////////////////////////////////
	
    /**
     * Fired when a CHECKBOX element is clicked.
     *
     * @method
     * @param oArgs.event {HTMLEvent} The event object.
     * @param oArgs.target {HTMLElement} The CHECKBOX element.
     * @event checkboxClickEvent
     */
    this.checkboxClickEvent = this.createEvent("checkboxClickEvent");
    //this.checkboxClickEvent.subscribeEvent.subscribe(this._registerEvent,{type:"checkboxClickEvent"},this);

    /**
     * Fired when a RADIO element is clicked.
     *
     * @method
     * @param oArgs.event {HTMLEvent} The event object.
     * @param oArgs.target {HTMLElement} The RADIO element.
     * @event radioClickEvent
     */
    this.createEvent("checkboxClickEvent");
    	
    /**
     * Fired when DataForm instance is first initialized.
     *
     * @method
     * @event tableInitEvent
     */
    this.createEvent("tableInitEvent");

    /**
     * Fired when DataForm instance is focused.
     *
     * @method
     * @event tableFocusEvent
     */
    this.createEvent("tableFocusEvent");

    /**
     * Fired when data is returned from DataSource.
     *
     * @method
     * @param oArgs.request {String} Original request.
     * @param oArgs.response {Object} Response object.
     * @event dataReturnEvent
     */
    this.createEvent("dataReturnEvent");

    /**
     * Fired when a TD element is formatted.
     *
     * @method
     * @param oArgs.el {HTMLElement} Reference to the TD element.
     * @event cellFormatEvent
     */
    this.createEvent("cellFormatEvent");

    /**
     * Fired when DataForm is populated.
     *
     * @method
     * @param oArgs.oRecord {YAHOO.widget.Record} Record instance.
     * @event formPopulateEvent
     */
    this.createEvent("populateEvent");

    /**
     * Fired when Record is updated.
     *
     * @method
     * @param oArgs.oRecord {Object} Updated Record instance.
     * @param oArgs.oPrevRecord {Object} Prior record data. 
     * @param oArgs.isChanged {Boolean} Did any of the field values change? 
     * @event updateEvent
     */
    this.createEvent("updateEvent");
    
    /**
     * Fired when Record is inserted.
     *
     * @method
     * @param oArgs.oRecord {Object} Inserted Record instance.
     * @event insertEvent
     */
    this.createEvent("insertEvent");
    
    /**
     * Fired when a Record is deleted.
     *
     * @method
     * @param oArgs.oRecord {Object} Deleted Record instance.
     * @event deleteEvent
     */
    this.createEvent("deleteEvent");

    /**
     * Fired when editing is cancelled.
     *
     * @method
     * @param oArgs.oRecord {Object} Record instance.
     * @event cancelEvent
     */
    this.createEvent("cancelEvent");
    
    /**
     * Fired when editing form is reset.
     *
     * @method
     * @param oArgs.oRecord {Object} Record instance.
     * @event resetEvent
     */
    this.createEvent("resetEvent");

    YAHOO.yazaar.widget.DataForm._nCount++;
    YAHOO.log("DataForm initialized", "info", this.toString());	
    this.fireEvent("tableInitEvent");
	
}; // end Constructor

/**
 * @global
 * Instantiate EventProvider
 */
if(YAHOO.util.EventProvider) {
    YAHOO.augment(YAHOO.yazaar.widget.DataForm, YAHOO.util.EventProvider);
}
else {
    YAHOO.log("Missing dependency: YAHOO.util.EventProvider","error",this.toString());
}

/////////////////////////////////////////////////////////////////////////////
//
// Public constants
//
/////////////////////////////////////////////////////////////////////////////

/**
 * Class name assigned to container element within THEAD.
 *
 * @field
 * @static
 * @property CLASS_HEADCONTAINER
 * @type String
 * @final
 */
YAHOO.yazaar.widget.DataForm.CLASS_HEADCONTAINER = "anvil-df-headcontainer";

/**
 * Class name assigned to text displayed within THEAD.
 *
 * @field
 * @static
 * @property CLASS_HEADTEXT
 * @type String
 * @final
 * @default anvil-dt-headtext"
 */
YAHOO.yazaar.widget.DataForm.CLASS_HEADTEXT = "anvil-df-headtext";

/**
 * Class name assigned to TBODY element that holds buttons.
 *
 * @field
 * @property MENU_BODY
 * @type String
 * @static
 * @final
 * @default "anvil-dt-body"
 */
YAHOO.yazaar.widget.DataForm.MENU_BODY = "anvil-df-menu";

/**
 * Label for Submit button
 *
 * @field
 * @property MSG_SUBMIT
 * @type String
 * @static
 * @final
 * @default "SUBMIT"
 */
YAHOO.yazaar.widget.DataForm.MSG_SUBMIT = "SUBMIT";

/**
 * Label for Reset button
 *
 * @field
 * @property MSG_RESET
 * @type String
 * @static
 * @final
 * @default "RESET"
 */
YAHOO.yazaar.widget.DataForm.MSG_RESET = "RESET";

/**
 * Label for Cancel button
 *
 * @field 
 * @property MSG_CANCEL
 * @type String
 * @static
 * @final
 * @default "CANCEL"
 */
YAHOO.yazaar.widget.DataForm.MSG_CANCEL = "CANCEL";

/////////////////////////////////////////////////////////////////////////////
//
// Private member variables
//
/////////////////////////////////////////////////////////////////////////////

/**
 * An array of input elements in columnset order.
 *
 * @property fields
 * @type HTMLElement[]
 */
YAHOO.yazaar.widget.DataForm.prototype._aFields = null;

/**
 * Internal class variable to index multiple DataForm instances.
 *
 * @property _nCount
 * @type Number
 * @private
 */
YAHOO.yazaar.widget.DataForm._nCount = 0;

/**
 * Instance index.
 *
 * @property _nIndex
 * @type Number
 * @private
 */
YAHOO.yazaar.widget.DataForm.prototype._nIndex = null;

/**
 * Unique instance name.
 *
 * @property _sName
 * @type String
 * @private
 */
YAHOO.yazaar.widget.DataForm.prototype._sName = null;

// TODO: convert these to public members (Y!)

/**
 * Container element reference. Is null unless the TABLE is built from scratch into the
 * provided container.
 *
 * @property _elContainer
 * @type HTMLElement
 * @private
 */
YAHOO.yazaar.widget.DataForm.prototype._elContainer = null;

/**
 * FORM element reference.
 *
 * @property _elForm
 * @type HTMLElement
 * @private
 */
YAHOO.yazaar.widget.DataForm.prototype._elForm = null;

/**
 * TABLE element reference.
 *
 * @property _elTable
 * @type HTMLElement
 * @private
 */
YAHOO.yazaar.widget.DataForm.prototype._elTable = null;

/**
 * TBODY element reference.
 *
 * @property _elBody
 * @type HTMLElement
 * @private
 */
YAHOO.yazaar.widget.DataForm.prototype._elBody = null;

/**
 * Submit control reference.
 *
 * @property _elSubmit
 * @type HTMLElement
 * @private
 */
YAHOO.yazaar.widget.DataForm.prototype._elSubmit = null;

/**
 * Reset control reference.
 *
 * @property _elSubmit
 * @type HTMLElement
 * @private
 */
YAHOO.yazaar.widget.DataForm.prototype._elReset = null;

/**
 * Cancel control reference.
 *
 * @property _elSubmit
 * @type HTMLElement
 * @private
 */
YAHOO.yazaar.widget.DataForm.prototype._elCancel = null;

/**
 * ColumnSet instance.
 *
 * @property _oColumnSet
 * @type YAHOO.widget.ColumnSet
 * @private
 */
YAHOO.yazaar.widget.DataForm.prototype._oColumnSet = null;

/**
 * RecordSet instance.
 *
 * @property _oRecordSet
 * @type YAHOO.widget.RecordSet
 * @private
 */
YAHOO.yazaar.widget.DataForm.prototype._oRecordSet = null;

/**
 * Record instance most recently edited. 
 *
 * @property _oRecord
 * @type YAHOO.widget.Record
 * @private
 */
YAHOO.yazaar.widget.DataForm.prototype._oRecord = null;

/////////////////////////////////////////////////////////////////////////////
//
// Private methods
//
/////////////////////////////////////////////////////////////////////////////

/**
 * Creates HTML markup for FORM, TABLE, THEAD, TBODY.
 *
 * @method _initButton
 * @private
 */
YAHOO.yazaar.widget.DataForm.prototype._initButton = function(name,parent,id,s) {
	var el;
	try { 
		el = document.createElement("<input type='button' />"); // IE idiom
	}
	catch(err) { 
		el = document.createElement("input"); // w3c idiom
		el.setAttribute("type", "button"); 
	}
	el.setAttribute("name", name);
	el.setAttribute("id", id + "_" + s);
	el.setAttribute("value", s);
	el.setAttribute("alt", s);
	parent.appendChild(el);
	return el;	
}

/**
 * Creates HTML markup for FORM, TABLE, THEAD, TBODY.
 *
 * @method _initForm
 * @private
 */
YAHOO.yazaar.widget.DataForm.prototype._initForm = function() {
    // Clear the container
    this._elContainer.innerHTML = "";
	var id = this.id;

    // Create FORM
    var elForm = this._elContainer.appendChild(document.createElement("form"));
	var sForm_id = id + "-form" 
	elForm.id = sForm_id;
	
    // Create TABLE
	var elTable =  elForm.appendChild(document.createElement("table"));
    elTable.tabIndex = 0;

    // Create SUMMARY, if applicable
    if(this.summary) {
        elTable.summary = this.summary;
    }

    // Create CAPTION, if applicable
    if(this.caption) {
        this._elCaption = elTable.appendChild(document.createElement("caption"));
        this._elCaption.innerHTML = this.caption;
    }

    // Create THEAD
	this._elForm = elForm;
    this._elTable = elTable;
    this._initHead(elTable, sForm_id, this._oColumnSet);

    // Create TBODY for messages
    var elMsgBody = document.createElement("tbody");
    elMsgBody.tabIndex = -1;
	var elMsgRow = elMsgBody.appendChild(document.createElement("tr"));
    var elMsgCell = elMsgRow.appendChild(document.createElement("td"));
	var nColSpan = this._oColumnSet.tree.length+1;
	elMsgCell.colSpan =  nColSpan;
    this._elMsgBody = elTable.appendChild(elMsgBody);
	this._elBody = elBody;
    this._elMsgRow = elMsgRow;
    this._elMsgCell = elMsgCell;		
    this.showLoadingMessage();

    // Create TBODY for data-entry controls
	var elBody = elTable.appendChild(document.createElement("tbody"))
    elBody.tabIndex = -1;
    YAHOO.util.Dom.addClass(elBody,YAHOO.widget.DataTable.MENU_BODY);
	
	var initButton = this._initButton;
	var elMenuRow = elBody.appendChild(document.createElement("tr"));
    var elMenuCell = elMenuRow.appendChild(document.createElement("td"));
	elMenuCell.colSpan = nColSpan; 
	
	// Submit
	var elSubmit = initButton("elSubmit", elMenuCell, sForm_id, YAHOO.yazaar.widget.DataForm.MSG_SUBMIT);	
	YAHOO.util.Event.addListener(elSubmit, "click", this._onSubmit, this);
	
 	// Reset
	var elReset = initButton("elReset", elMenuCell, sForm_id, YAHOO.yazaar.widget.DataForm.MSG_RESET);
	YAHOO.util.Event.addListener(elReset, "click", this._onReset, this);

	// Cancel 
	var elCancel = initButton("elCancel", elMenuCell, sForm_id, YAHOO.yazaar.widget.DataForm.MSG_CANCEL);
	YAHOO.util.Event.addListener(elCancel, "click", this._onCancel, this);
     
	// Note elements for future reference
	this._elMenuRow = elMenuRow; 
	this._elSubmit = elSubmit;	
	this._elReset = elReset;
	this._elCancel = elCancel;
}
	 	
/**
 * Populates THEAD element with TH cells as defined by ColumnSet.
 *
 * @method _initHead
 * @private
 */
YAHOO.yazaar.widget.DataForm.prototype._initHead = function(elTable, sForm_id) {
    var i,oColumn;
    
    // Create THEAD
    var elHead = document.createElement("thead");
    elHead.tabIndex = -1;
	
    // Iterate through each row of Column headers...
	// TODO: Try with nested column headers
	// TODO: Can the loop be a method that invokes a call back method, 
	// so it can also be used by PopulateForm 
    var colTree = this._oColumnSet.tree;
	var aFields = new Array(colTree.length);
	var n = 0;
    for(i=0; i<colTree.length; i++) { 
        // ...and create THEAD cells
        for(var j=0; j<colTree[i].length; j++) {
	        var elHeadRow = elHead.appendChild(document.createElement("tr"));
    	    elHeadRow.id = this.id+"-hdrow"+i;
            oColumn = colTree[i][j];
            var elHeadCell = elHeadRow.appendChild(document.createElement("th"));
			var id = oColumn.getId()
            elHeadCell.id = id +"-label";
            this._initHeadCell(elHeadCell,oColumn,i,j);
            var elDataCell = elHeadRow.appendChild(document.createElement("td"));
			elDataCell.id = id + "-data";
			var elInput = elDataCell.appendChild(document.createElement("input"));
			elInput.name = oColumn.key;
			elInput.id = sForm_id + "_" + elInput.name;
			elInput.type = "text"; // TODO: change for columnEditor type			
		    if(oColumn.formMinLength) {
				elInput.minLength = oColumn.formMinLength;
    		}
		    if(oColumn.formMaxLength) {
				elInput.maxLength = oColumn.formMaxLength;
    		}
		    if(oColumn.formClassName) {
        		YAHOO.util.Dom.addClass(elInput,oColumn.formClassName);
    		}
		    if(oColumn.formTitle) {
				elInput.title = oColumn.formTitle;
    		}					
			aFields[n++] = elInput; 
		    YAHOO.util.Dom.addClass(elInput,YAHOO.widget.DataTable.CLASS_EDITABLE);
        }
    }

	this._aFields = aFields;
    this._elHead = elTable.appendChild(elHead);
    YAHOO.log("THEAD with " + this._oColumnSet.keys.length + " field labels and input controls created","info",this.toString());
	        
};

/**
 * Populates TH cell as defined by Column.
 *
 * @method _initHeadCell
 * @param elHeadCell {HTMLElement} TH cell element reference.
 * @param oColumn {YAHOO.widget.Column} Column object.
 * @param row {number} Row index.
 * @param col {number} Column index.
 * @private
 */
YAHOO.yazaar.widget.DataForm.prototype._initHeadCell = function(elHeadCell,oColumn,row,col) {
    // Clear out the cell of prior content
    // TODO: purgeListeners and other validation-related things (Y!)
    var index = this._nIndex;
    elHeadCell.columnIndex = col;
    if(oColumn.abbr) {
        elHeadCell.abbr = oColumn.abbr;
    }
    if(oColumn.width) {
        elHeadCell.style.width = oColumn.width;
    }
    if(oColumn.className) {
        YAHOO.util.Dom.addClass(elHeadCell,oColumn.className);
    }
	
    elHeadCell.innerHTML = "";

    var elHeadContainer = elHeadCell.appendChild(document.createElement("div"));
    elHeadContainer.id = this.id+"-hdrow"+row+"-container"+col;
    YAHOO.util.Dom.addClass(elHeadContainer,YAHOO.widget.DataTable.CLASS_HEADCONTAINER);
    var elHeadContent = elHeadContainer.appendChild(document.createElement("span"));
    elHeadContent.id = this.id+"-hdrow"+row+"-text"+col;
    YAHOO.util.Dom.addClass(elHeadContent,YAHOO.widget.DataTable.CLASS_HEADTEXT);

    elHeadCell.rowSpan = oColumn.getRowSpan();
    elHeadCell.colSpan = oColumn.getColSpan();

    var contentText = oColumn.text || oColumn.key || "";
    elHeadContent.innerHTML = contentText;
};

/**
 * Handles form cancel by raising a cancelEvent that bundles the 
 * original record values.
 * <p>
 * Raises cancelEvent. 
 * 
 * @method _onCancel
 * @param e {HTMLEvent} The click event.
 * @param oSelf {YAHOO.yazaar.widget.DataForm} DataForm instance.
 * @private
 */
YAHOO.yazaar.widget.DataForm.prototype._onCancel = function(e, oSelf) {	
    	var oRecord = oSelf._oRecord; // Restore this reference				
		oSelf.fireEvent("cancelEvent", {oRecord: oRecord});
		oSelf.logRecordEvent("cancelEvent", oRecord); // debug 
};

YAHOO.yazaar.widget.DataForm.prototype._onDocumentKeyup = function(e, oSelf) {
    if (!oSelf.isActive) return;
    // escape ?
    if (e.keyCode == 27)  {
    }
    // enter Saves active editor data
    if (e.keyCode == 13) {
		oSelf.update();	
    }
}

/**
 * Handles form reset event by invoking reset method.
 * 
 * @method _onReset
 * @param e {HTMLEvent} The click event.
 * @param oSelf {YAHOO.yazaar.widget.DataForm} DataForm instance.
 * @see reset
 * @private
 */
YAHOO.yazaar.widget.DataForm.prototype._onReset = function(e, oSelf) {
    oSelf.reset();
};

/**
 * Handles form submit.
 * <p>
 * Updates internal record from data is retrieved from input controls, 
 * and raises updateEvent with new and old record values and an "isChanged" 
 * boolean property, so that listeners can update external records.
 *
 * @method _onSubmit
 * @param e {HTMLEvent} The click event.
 * @param oSelf {YAHOO.yazaar.widget.DataForm} DataForm instance.
 * @private
 */
YAHOO.yazaar.widget.DataForm.prototype._onSubmit = function(e, oSelf) {	
	oSelf.update();	
};

/////////////////////////////////////////////////////////////////////////////
//
// Public member variables
//
/////////////////////////////////////////////////////////////////////////////

/**
 * True if the DataForm is active and receiving input. 
 *
 * @property isActive
 * @type Boolean
 */
YAHOO.yazaar.widget.DataForm.prototype.isActive = false;

/**
 * True if the DataForm is empty of data. False if DataForm is populated with
 * data from RecordSet.
 *
 * @property isEmpty
 * @type Boolean
 */
YAHOO.yazaar.widget.DataForm.prototype.isEmpty = false;

/**
 * DataTable instance.
 *
 * @property oDataTable
 * @type YAHOO.widget.DataTable
 * @optional
  */
 YAHOO.yazaar.widget.DataForm.prototype.oDataTable = null;
 
/////////////////////////////////////////////////////////////////////////////
//
// Public methods
//
/////////////////////////////////////////////////////////////////////////////

/**
 * Create and return a copy of the original record.
 */
YAHOO.yazaar.widget.DataForm.prototype.copyRecord = function() {
	var oRecord = this._oRecord;		
	var oCopy = {}; 		
	for (var prop in oRecord) {
		// TODO: Subclass fields only?
		oCopy[prop] = oRecord[prop]			
	}
	return oCopy;
}

/**
 * Overridable method gives implementers a hook to access data before
 * it gets added to RecordSet and rendered to the TBODY.
 *
 * @method doBeforeLoadData
 * @param sRequest {String} Original request.
 * @param oResponse {Object} Response object.
 * @return {Boolean} Return true to continue loading data into RecordSet and
 * updating DataForm with new Records, false to cancel.
 */
YAHOO.yazaar.widget.DataForm.prototype.doBeforeLoadData = function(sRequest, oResponse) {
    return true;
};

/**
 * Returns array of selected Record IDs.
 *
 * @method getSelectedRecordIds
 * @return {HTMLElement[]} Array of selected TR elements.
 */
YAHOO.yazaar.widget.DataForm.prototype.getSelectedRecordIds = function() {
    return this._aSelectedRecords || [];
};

/**
 * Obtain the value of form input controls into a copy of the original 
 * record, so that any record values not shown on the form are retained.
 *
 * @method harvestForm
 */
YAHOO.yazaar.widget.DataForm.prototype.harvestForm = function() {
	var oRecord = this.copyRecord();
	var aFields = this._aFields;
	var nFields = aFields.length;
	for (var i=0; i<nFields; i++) {
		var elInput = aFields[i];
		oRecord[elInput.name] = elInput.value;
	} 						
	return oRecord;	
}

/**
 * Hide any placeholder message row.
 *
 * @method hideTableMessages
 */
YAHOO.yazaar.widget.DataForm.prototype.hideTableMessages = function() {
    if(!this.isEmpty && !this.isLoading) {
        return;
    }

    this._elMsgBody.style.display = "none";

    this.isEmpty = false;
    this.isLoading = false;
};

/**
 * Compare values of a new record, or harvested form values, with the orignal 
 * record, and return true if any of the values differ.
 *  
 * @param {Object} oNewRecord Record for comparion or the form is harvested.
 */
YAHOO.yazaar.widget.DataForm.prototype.isRecordChanged = function(oNewRecord) {
	if (arguments.length==0) {
		oNewRecord = this.harvestForm();
	}
	var oPrevRecord = this._oRecord;
	var same = true;		
	for (var prop in oPrevRecord) {
		// TODO: Subclass fields only?
		same = same && (oPrevRecord[prop] == oNewRecord[prop]);			
	}
	return !same;
}

/**
 * Validate form data according to the CSS class names set on the input elements.
 * If validation fails, the element's title attribute is presented as an error messsage.
 * <p>
 * The attributes needed to control validation can be set through the ColumnHeader. 
 * The supported values for the <code>formClassName</code> attribute are:  
 * <ul>
 * <li>required (not blank)
 * <li>validate-number (a valid number)
 * <li>validate-digits (digits only, spaces allowed.)
 * <li>validate-alpha (letters only)
 * <li>validate-alphanum (only letters and numbers)
 * <li>validate-date (a valid date value)
 * <li>validate-email (a valid email address)
 * <li>validate-url (a valid URL)
 * <li>validate-date-au (a date formatted as; dd/mm/yyyy)
 * <li>validate-currency-dollar (a valid dollar value)
 * <li>validate-one-required (At least one checkbox/radio element must be selected in a group)
 * <li>validate-not-first (Selects only, must choose an option other than the first)
 * <li>validate-not-empty (Selects only, must choose an option with a value that is not empty)
 * <li>Also, you can specify this attribute for text, passwird and textarea elements:
 * <li>minlength="x" (where x is the minimum number of characters)
 * </ul>
 * <p>
 * This implementation depends on Jamie Curnow's validate script.
 */
YAHOO.yazaar.widget.DataForm.prototype.isInvalidInput = function() {
	var errs = new Array();
	var all_valid = true;	

	//access form elements
	//inputs
	var f_in = this._aFields; 	
	// TODO selects
	// var f_sl = elm.getElementsByTagName('select');
	// TODO textareas
	// var f_ta = elm.getElementsByTagName('textarea');
	
	//check inputs
	for (i=0;i<f_in.length;i++) {
		if (f_in[i].type.toLowerCase() != 'submit' && f_in[i].type.toLowerCase() != 'button' && f_in[i].type.toLowerCase() != 'hidden') {
			if (isVisible(f_in[i])) {
				
				var cname = ' '+f_in[i].className.replace(/^\s*|\s*$/g,'')+' ';
				cname = cname.toLowerCase();
				var inv = f_in[i].value.trim();
				var t = f_in[i].type.toLowerCase();
				var cext = '';
				if (t == 'text' || t == 'password') {
					//text box
					var valid = FIC_checkField(cname,f_in[i]);
				} else if(t == 'radio' || t == 'checkbox'){
					// radio or checkbox
					var valid = FIC_checkRadCbx(cname,f_in[i],f_in);
					cext = '-cr';
				} else {
					var valid = true;
				}
				
				if (valid) {
					removeClassName(f_in[i],'validation-failed'+cext);
					addClassName(f_in[i],'validation-passed'+cext);
				} else {
					removeClassName(f_in[i],'validation-passed'+cext);
					addClassName(f_in[i],'validation-failed'+cext);
					//try to get title
					if (f_in[i].getAttribute('title')){
						errs[errs.length] = f_in[i].getAttribute('title');
					}					
					all_valid = false;
				}
			}
		}
	} //end for i
	
	/**
	//check textareas
	for (i=0;i<f_ta.length;i++) {
		if (isVisible(f_ta[i])) {
			var cname = ' '+f_ta[i].className.replace(/^\s*|\s*$/g,'')+' ';
			cname = cname.toLowerCase();
			var valid = FIC_checkField(cname,f_ta[i]);
			
			if (valid) {
				removeClassName(f_ta[i],'validation-failed');
				addClassName(f_ta[i],'validation-passed');
			} else {
				removeClassName(f_ta[i],'validation-passed');
				addClassName(f_ta[i],'validation-failed');
				//try to get title
				if (f_ta[i].getAttribute('title')){
					errs[errs.length] = f_ta[i].getAttribute('title');
				}
				all_valid = false;
			}
		}
	} //end for i
	
	//check selects
	for (i=0;i<f_sl.length;i++) {
		if (isVisible(f_sl[i])) {
			var cname = ' '+f_sl[i].className.replace(/^\s*|\s*$/g,'')+' ';
			cname = cname.toLowerCase();
			var valid = FIC_checkSel(cname,f_sl[i]);
			if (valid) {
				removeClassName(f_sl[i],'validation-failed-sel');
				addClassName(f_sl[i],'validation-passed-sel');
			} else {
				removeClassName(f_sl[i],'validation-passed-sel');
				addClassName(f_sl[i],'validation-failed-sel');
				//try to get title
				if (f_sl[i].getAttribute('title')){
					errs[errs.length] = f_sl[i].getAttribute('title');
				}
				all_valid = false;
			}
		}
	} //end for i
	*/
	
	var isInvalid = !all_valid;
	if (isInvalid) {
		if (errs.length > 0){
			alert("We have found the following error(s):\n\n  * "+errs.join("\n  * ")+"\n\nPlease check the fields and try again");
		} else {
			alert('Some required values are not correct. Please check the items in red.');
		}
	}
	return isInvalid;
} // end isInvalidInput

/**
 * Log that an event is raised, including the record and old record data as JSON strings.
 * <p>
 * The method can accept one or both of the record parameters. 
 * Additional parameters are ignored.
 *
 * @method logRecordEvent
 * @param oRecord The current state of record under edit
 * @param oPrevRecord The prior state of record under edit
 * @debug
 */
YAHOO.yazaar.widget.DataForm.prototype.logRecordEvent = function(sEventName, oRecord, oPrevRecord) {
	var nArgs, sMessage, sRecord, sPrevRecord;
	nArgs = arguments.length;
	switch (nArgs) {
		case 0: 
			sMessage = "Event details not specified!";
			break;
		case 1:
			sMessage = sEventName;
			break;
		case 2: 
		    sRecord = (oRecord) ? oRecord.toJSONString() : "undefined";
			sMessage = sEventName + "{oRecord: " + sRecord + "}";
			break;
		default:
			// 3 args or more 
		    sRecord = (oRecord) ? oRecord.toJSONString() : "undefined";
			sPrevRecord = (oPrevRecord) ? oPrevRecord.toJSONString() : "undefined";
			sMessage = sEventName + "{oRecord: " + sRecord + ", " + "oPrevRecord: " + sPrevRecord + "}";
			break; 
	} 
	YAHOO.log(sMessage, "info", this.toString()); 
}

/**
 * Set the value of form input controls to the corresponding entry of the 
 * selected record.
 *
 * @method populateForm
 */
YAHOO.yazaar.widget.DataForm.prototype.populateForm = function() {	
    this.hideTableMessages();
	var oDataTable = this.oDataTable;
	var isShared = !!(oDataTable);
	var oRecordSet =  (isShared) ? oDataTable._oRecordSet : this._oRecordSet;
    var oSelectedRecords = 	(isShared) ? oDataTable.getSelectedRecordIds() : this.getSelectedRecordIds();
	var nLength = oSelectedRecords.length;
	// TODO: For YUI 2.2.4, confirm that single select only selects one row (1703840)
    var oRecord = (nLength > 0) ? oRecordSet.getRecord(oSelectedRecords[nLength-1]) : oRecordSet.getRecord(0);
    var oTree = this._oColumnSet.tree;
	var aFields = this._aFields; 	
	var n = 0;
	var elInput = aFields[0];
	// FIXME: Breaks in IE - elInput.focus();
	// If the Record is empty, there's nothing to populate
	if (oRecord) for(i=0; i<oTree.length; i++) { 
        for(var j=0; j<oTree[i].length; j++) { 	
    		var oColumn = oTree[i][j];
    		var sKey = oColumn.key;
    		elInput = aFields[n++];
    		elInput.value = oRecord[sKey];
		}
	}
	this._oRecord = oRecord;
    this.fireEvent("populateEvent", {newRecord:oRecord});	
	this.logRecordEvent("populateEvent", oRecord); // debug 
};

/**
 * Placeholder row to indicate table data is empty.
 *
 * @method showEmptyMessage
 */
YAHOO.yazaar.widget.DataForm.prototype.showEmptyMessage = function() {
    if(this.isEmpty) {
        return;
    }
    if(this.isLoading) {
        this.hideTableMessages();
    }

    this._elMsgBody.style.display = "";
    var elCell = this._elMsgCell;
    elCell.className = YAHOO.widget.DataTable.CLASS_EMPTY;
    elCell.innerHTML = YAHOO.widget.DataTable.MSG_EMPTY;
    this.isEmpty = true;
};

/**
 * Placeholder row to indicate table data is loading.
 *
 * @method showLoadingMessage
 */
YAHOO.yazaar.widget.DataForm.prototype.showLoadingMessage = function() {
    if(this.isLoading) {
        return;
    }
    if(this.isEmpty) {
        this.hideTableMessages();
    }

    this._elMsgBody.style.display = "";
    var elCell = this._elMsgCell;
    elCell.className = YAHOO.widget.DataTable.CLASS_LOADING;
    elCell.innerHTML = YAHOO.widget.DataTable.MSG_LOADING;
    this.isLoading = true;
};

/**
 * Public accessor to the unique name of the DataSource instance.
 *
 * @return {String} Unique name of the DataSource instance.
 */
YAHOO.yazaar.widget.DataForm.prototype.toString = function() {
    return "DataForm " + this._sName;
};

/**
 * Restoring the original values to the active record.
 * <p>
 * Repopulates Recordset, and raises resetEvent.
 * 
 * @method reset
 */
YAHOO.yazaar.widget.DataForm.prototype.reset = function() {
    var oRecord = this._oRecord; // Restore this reference				
	var aFields = this._aFields;
	var nFields = aFields.length;
	for (var i=0; i<nFields; i++) {
			// TODO: Subclass fields only?
		var elInput = aFields[i];
		elInput.value = oRecord[elInput.name];
	} 				
    this.fireEvent("resetEvent", {oRecord:oRecord});		
	this.logRecordEvent("resetEvent", oRecord); // debug
}

/**
 * Harvest data from form and raise UpdateEvent. 
 *
 * @method update
 */
YAHOO.yazaar.widget.DataForm.prototype.update = function() {

	if (this.isInvalidInput()) return;
	
	// Gather the usual suspects
	var oRecord = this._oRecord;
	var oPrevRecord = this.copyRecord();	
	var oNewRecord = this.harvestForm();			
	// Check to see if anything changed
	var isChanged = this.isRecordChanged(oNewRecord);
	if (isChanged) {
		for (var prop in oRecord) {
			oRecord[prop] = oNewRecord[prop]			
		}		 
	}
	// Raise updateEvent
	var context = {oRecord: oNewRecord, oPrevRecord: oPrevRecord, isChanged: isChanged};	
   	this.fireEvent("updateEvent", context);
	var sLog = (isChanged) ? "updateEvent" : "updateEvent (no change)"; 
	this.logRecordEvent(sLog, oNewRecord, oPrevRecord); // debug
	if (isChanged) {
		// Refresh the table	
		var oDataTable = this.oDataTable;
		if (oDataTable) {
			oDataTable.showPage(oDataTable.pageCurrent);	
		}		
	} 
};


/////////////////////////////////////////////////////////////////////////////
//
// Public Custom Event Handlers
//
/////////////////////////////////////////////////////////////////////////////

/**
 * Handles data return by populating form fields.
 *
 * @method onDataReturnPopulateForm
 * @param sRequest {String} Original request.
 * @param oResponse {Object} Response object.
 */
YAHOO.yazaar.widget.DataForm.prototype.onDataReturnPopulateForm = function(sRequest, oResponse) {
    this.fireEvent("dataReturnEvent", {request:sRequest,response:oResponse});
    
    var ok = this.doBeforeLoadData(sRequest, oResponse);
    if (ok) {
        // Update the RecordSet from the response
        var newRecords = this._oRecordSet.append(oResponse);
        if (newRecords) {
            // Update markup
            this.populateForm();
            YAHOO.log("Data returned for " + newRecords.length + " rows","info",this.toString());			
        }
    }
};

