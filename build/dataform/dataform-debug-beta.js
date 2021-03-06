/*
Copyright (c) 2007, Husted dot Com, Inc. All rights reserved.
Portions Copyright (c) 2007, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
*/
/**
 * The DataForm widget displays a data-entry form that utilizes agf ColumnSet
 * to describe the input controls and a DataSource to store new records and
 * to populate fields from a prexisting record (if any). This widget raises
 * events that bundle record data so that clients can update a remote
 * persistant store, namely cancelEvent, deleteEvent, insertEvent, resetEvent,
 * and updateEvent, as well as insertFormEvent and updateFormEvent to 
 * signal the presentation of the corresponding data-entry forms.G
 * <p />
 * The DataForm can be used with an independant RecordSet,
 * or it can share a RecordSet with a companion DataTable.
 * <p />
 * This control is being created as part of a
 * Find/List/Edit/View (FLEV) composite control. This control uses the
 * DataTable control as a starting point, adding and substracting code as needed.el
 * <p />
 * The initial version builds the form from scratch. A later version may
 * provide for progressive enhancement from existing markup, as does the
 * DataTable control.
 * <p />
 * To make DataForm easier to use with CSS class-based validation
 * (see jc21 in the Yazaar extras module), extra ColumnHeader
 * properties are supported: <code>formClassName</code>,
 * <code>formTitle</code>, <code>formMinLength</code>, and
 * <code>formMaxLength</code>. These fields generate class,
 * title, maxLength, and minlength attributes for input elements.
 * MinLength is a custom attribute utilized by the jc21 validation
 * module. To enabled inserting a new record with default values,
 * the <code>formValue</code> property is provided.
 * <p />
 * The DataForm supports select and checkbox field types, based on experimental code
 * provided by the DataTable beta.
 * The entries for the select type may be provided in the ColumnSet for the field,
 * in a "selectOptions" property. The property is an array of the text values to
 * list in the control. If the text of the list represents a database entity that
 * uses a key, look the key up from the text on the server-side.
 * <p />
 * Both the column type and the selectOptions may be provided with a "form" prefix,
 * or without, to provided for desired degree of overlap with the DataTable settings.
 * <p />
 * A "oSession" property is provided so selectOptions can be retrieved independantly
 * of a hardcoded ColumnSet. The key format for the oSession property is
 * fieldname_selectOptions. The oSession property may be set via the oViewConfig object.
 *
 * (TODO: Log events for bulk updates, perhaps after reconnecting?) <br />
 * (TODO: Batch or bulk edit selected rows?)
 * @overview
 * @see <a href="DataFormWalkThrough">http://code.google.com/p/yazaar/wiki/DataFormWalkThrough</a>
 * @module yazaar.dataform
 * @requires yahoo, dom, event, datasource
 * @title DataForm Widget
 * @beta
 */

/****************************************************************************/
/****************************************************************************/
/****************************************************************************/

/**
 * Defines yazaar namespace.
 * @global yazaar
 */
YAHOO.namespace("yazaar");

/////////////////////////////////////////////////////////////////////////////
//
// Constructor
//
/////////////////////////////////////////////////////////////////////////////

/**
 * Creates and configures a new DataForm instance.
 * <p>
 * To share a RecordSet with a DataTable, include a oDataList property
 * in the oConfigs, and pass its ColumnSet and DataSource through the
 * signature. (Or pass a different ColumnSet, if desired.) If a
 * DataTable property is not passed as oDataList, then this object
 * creates it's own RecordSet instance.
 * @param oConfigs Property settings. May include oDataList.
 * @param oColumnSet {YAHOO.widget.ColumnSet} ColumnSet instance.
 * @param oDataSource {YAHOO.util.DataSource} DataSource instance.
*/
YAHOO.yazaar.DataForm = function(elContainer,oColumnSet,oDataSource,oConfigs) {

    // identify
    var i;
    this._nIndex = YAHOO.yazaar.DataForm._nCount;
    this._sName = "instance" + this._nIndex;
    this.id = "yazaar-df"+this._nIndex;

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
        var oDataList = this.oDataList;
        if (oDataList) {
           var isValid = (oDataList instanceof YAHOO.widget.DataTable);
             if (isValid) {
            this._oRecordSet = oDataList.getRecordSet();
            YAHOO.log("DataTable RecordSet will be shared", "info", this.toString()); // debug
          }
          else {
            YAHOO.log("Invalid DataTable -- RecordSet will not be shared", "error", this.toString());
            }
        }
        if (this._oRecordSet==null) {
          this._oRecordSet = new YAHOO.widget.RecordSet();
          YAHOO.log("Creating new RecordSet", "info", this.toString()); // debug
        }

        // enhance markup

        // TODO: Peek in container child nodes to see if TABLE already exists (Y!)

        // TODO: Progressively enhance an existing form from markup... (Y!)

        var elForm = null;

        /*
        // Create markup from scratch using the provided DataSource
        if(this.dataSource) {
            this._initForm();
            if (oDataList) {
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
        */
        this._initForm();
        // this.showEmptyMessage();        
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
    // TODO: DOM events (Y!)
    //
    /////////////////////////////////////////////////////////////////////////////

    //YAHOO.util.Event.addListener(elForm, "focus", this._onFocus, this);
    //YAHOO.util.Event.addListener(elForm, "blur", this._onBlur, this);

    /////////////////////////////////////////////////////////////////////////////
    //
    // Custom events
    //
    /////////////////////////////////////////////////////////////////////////////

    /**
     * Fired when a CHECKBOX element is clicked.
     *
     * @param oArgs.event {HTMLEvent} The event object.
     * @param oArgs.target {HTMLElement} The CHECKBOX element.
     * @event checkboxClickEvent
     */
    this.checkboxClickEvent = this.createEvent("checkboxClickEvent");
    //this.checkboxClickEvent.subscribeEvent.subscribe(this._registerEvent,{type:"checkboxClickEvent"},this);

    /**
     * Fired when a TD element is formatted.
     *
     * @param oArgs.el {HTMLElement} Reference to the TD element.
     * @event cellFormatEvent
     */
    this.createEvent("cellFormatEvent");

    /**
     * Fired when data is returned from DataSource.
     *
     * @param oArgs.request {String} Original request.
     * @param oArgs.response {Object} Response object.
     * @event dataReturnEvent
     */
    this.createEvent("dataReturnEvent");

    /**
     * Fired when DataForm instance is focused.
     *
     * @event formFocusEvent
     */
    this.createEvent("formFocusEvent");

    /**
     * Fired when DataView instance is first initialized.
     *
     * @event formInitEvent
     */
    this.createEvent("formInitEvent");

    /**
     * Fired when DataForm is populated.
     *
     * @param oArgs.oRecord {YAHOO.widget.Record} Record instance.
     * @event populateEvent
     */
    this.createEvent("populateEvent");   
    
    /**
     * Fired when a RADIO element is clicked.
     *
     * @param oArgs.event {HTMLEvent} The event object.
     * @param oArgs.target {HTMLElement} The RADIO element.
     * @event radioClickEvent
     */
    this.createEvent("radioClickEvent");

    /**
     * Fired when editing is cancelled.
     *
     * @param oArgs.oRecord {Object} Record instance.
     * @event cancelEvent
     */
    this.createEvent("cancelEvent");

    /**
     * Fired when a Record is deleted.
     *
     * @param oArgs.oRecord {Object} Deleted Record instance.
     * @event deleteEvent
     */
    this.createEvent("deleteEvent");

    /**
     * Fired when Record is inserted.
     *
     * @param oArgs.oRecord {Object} Inserted Record instance.
     * @event insertEvent
     */
    this.createEvent("insertEvent");

    /**
     * Fired when form to insert record is requested.
     *
     * @event insertFormEvent
     */
    this.createEvent("insertFormEvent");

    /**
     * Fired when RecordSet is to be refreshed.
     *
     * @param oArgs.oRecord {Object} Record instance.
     * @event refreshEvent
     */
    this.createEvent("refreshEvent");

    /**
     * Fired when editing form is reset.
     *
     * @param oArgs.oRecord {Object} Record instance.
     * @event resetEvent
     */
    this.createEvent("resetEvent");

    /**
     * Fired when search criteria are specified.
     *
     * @param oArgs.oRecord {Object} Record instance.
     * @event criteriaEvent
     */
    this.createEvent("criteriaEvent");

    /**
     * Fired when Record is updated.
     *
     * @param oArgs.oRecord {Object} Updated Record instance.
     * @param oArgs.oPrevRecord {Object} Prior record data.
     * @param oArgs.isChanged {Boolean} Did any of the field values change?
     * @event updateEvent
     */
    this.createEvent("updateEvent");

    /**
     * Fired when form to insert record is requested.
     *
     * @event updateFormEvent
     */
    this.createEvent("updateFormEvent");

    /**
     * Fired when form to view record is requested.
     *
     * @event viewFormEvent
     */
    this.createEvent("viewFormEvent");


    // end custom events    
    
    YAHOO.yazaar.DataForm._nCount++;
    YAHOO.log("DataForm initialized", "info", this.toString());
    this.fireEvent("tableInitEvent");

}; // end Constructor

/**
 * Instantiates EventProvider
 * @global YAHOO.util.EventProvider
 */
if(YAHOO.util.EventProvider) {
    YAHOO.augment(YAHOO.yazaar.DataForm, YAHOO.util.EventProvider);
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
 * @static
 * @field
 * @property CLASS_HEADCONTAINER
 * @type String
 * @final
 */
YAHOO.yazaar.DataForm.CLASS_HEADCONTAINER = "yazaar-df-headcontainer";

/**
 * Class name assigned to text displayed within THEAD.
 *
 * @static
 * @field
 * @property CLASS_HEADTEXT
 * @type String
 * @final
 * @default yazaar-dt-headtext"
 */
YAHOO.yazaar.DataForm.CLASS_HEADTEXT = "yazaar-df-headtext";

/**
 * Code to initialize default Find buttons.
 */
YAHOO.yazaar.DataForm.INIT_FIND = 0;

/**
 * Code to initialize default List buttons.
 */
YAHOO.yazaar.DataForm.INIT_LIST = 1;

/**
 * Code to initialize default edit buttons.
 */
YAHOO.yazaar.DataForm.INIT_EDIT = 2;

/**
 * Code to initialize default view buttons.
 */
YAHOO.yazaar.DataForm.INIT_VIEW = 3;

/**
 * Class name assigned to TBODY element that holds buttons.
 *
 * @static
 * @field
 * @property MENU_BODY
 * @type String
 * @final
 * @default "yazaar-dt-body"
 */
YAHOO.yazaar.DataForm.MENU_BODY = "yazaar-df-menu";


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
YAHOO.yazaar.DataForm.prototype._aFields = null;

/**
 * Internal class variable to index multiple DataForm instances.
 *
 * @property _nCount
 * @type Number
 * @private
 */
YAHOO.yazaar.DataForm._nCount = 0;

/**
 * Instance index.
 *
 * @property _nIndex
 * @type Number
 * @private
 */
YAHOO.yazaar.DataForm.prototype._nIndex = null;

/**
 * Unique instance name.
 *
 * @property _sName
 * @type String
 * @private
 */
YAHOO.yazaar.DataForm.prototype._sName = null;

// TODO: convert these to public members (Y!)

/**
 * Container element reference. Is null unless the TABLE is built from scratch into the
 * provided container.
 *
 * @property _elContainer
 * @type HTMLElement
 * @private
 */
YAHOO.yazaar.DataForm.prototype._elContainer = null;

/**
 * FORM element reference.
 *
 * @property _elForm
 * @type HTMLElement
 * @private
 */
YAHOO.yazaar.DataForm.prototype._elForm = null;

/**
 * TABLE element reference.
 *
 * @property _elTable
 * @type HTMLElement
 * @private
 */
YAHOO.yazaar.DataForm.prototype._elTable = null;

/**
 * TBODY element reference.
 *
 * @property _elBody
 * @type HTMLElement
 * @private
 */
YAHOO.yazaar.DataForm.prototype._elBody = null;

/**
 * ColumnSet instance.
 *
 * @property _oColumnSet
 * @type YAHOO.widget.ColumnSet
 * @private
 */
YAHOO.yazaar.DataForm.prototype._oColumnSet = null;

/**
 * RecordSet instance.
 *
 * @property _oRecordSet
 * @type YAHOO.widget.RecordSet
 * @private
 */
YAHOO.yazaar.DataForm.prototype._oRecordSet = null;

/**
 * Record instance most recently edited.
 *
 * @property _oRecord
 * @type YAHOO.widget.Record
 * @private
 */
YAHOO.yazaar.DataForm.prototype._oRecord = null;

/////////////////////////////////////////////////////////////////////////////
//
// Private methods
//
/////////////////////////////////////////////////////////////////////////////

/**
 * Creates HTML markup for FORM, TABLE, THEAD, TBODY.
 *
 * @private
 */
YAHOO.yazaar.DataForm.prototype._initForm = function() {
    // Clear the container
    this._elContainer.innerHTML = "";
    var id = this.id;

    // Create FORM
    var elForm = this._elContainer.appendChild(document.createElement("form"));
    var sForm_id = id + "-form";
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

    // Create THEAD with labels and controls
    this._elForm = elForm;
    this._elTable = elTable;
    this._initHead(elTable, sForm_id, this._oColumnSet);

    // Create TBODY for messages
    var nColSpan = this._oColumnSet.tree.length+1;
    var elMsgBody = document.createElement("tbody");
    elMsgBody.tabIndex = -1;
    var elMsgRow = elMsgBody.appendChild(document.createElement("tr"));
    var elMsgCell = elMsgRow.appendChild(document.createElement("td"));
    elMsgCell.colSpan = nColSpan;
    this._elMsgBody = elTable.appendChild(elMsgBody);
    this._elMsgRow = elMsgRow;
    this._elMsgCell = elMsgCell;
    // this.showLoadingMessage();

    // Create TBODY for data-entry controls
    var elBody = elTable.appendChild(document.createElement("tbody"));
    elBody.tabIndex = -1;
    YAHOO.util.Dom.addClass(elBody,YAHOO.widget.DataTable.MENU_BODY);
    var initButton = this._initButton;
    var elMenuRow = elBody.appendChild(document.createElement("tr"));
    var elMenuCell = elMenuRow.appendChild(document.createElement("td"));
    elMenuCell.colSpan = nColSpan;    
    this._elBody = elBody;
    this._elMenuRow = elMenuRow;    
    var oDataMenu = new YAHOO.yazaar.DataMenu(elMenuCell,sForm_id,this.nInitMode);
        oDataMenu.subscribe("cancelEvent", this.doCancel, this, true);
        oDataMenu.subscribe("deleteEvent", this.doDelete, this, true);
        oDataMenu.subscribe("submitEvent", this.doSubmit, this, true); // raises criteriaEvent, insertEvent, or updateEvent
        oDataMenu.subscribe("refreshEvent", this.doRefresh, this, true);
        oDataMenu.subscribe("resetEvent", this.doReset, this, true);
        oDataMenu.subscribe("insertFormEvent", this.doInsertForm, this, true);
        oDataMenu.subscribe("updateFormEvent", this.doUpdateForm, this, true); 
        oDataMenu.subscribe("viewFormEvent", this.doViewForm, this, true);     
    this.oDataMenu = oDataMenu;   
};

/**
 * Populates THEAD element with TH cells as defined by ColumnSet.
 *
 * @private
 */
YAHOO.yazaar.DataForm.prototype._initHead = function(elTable, sForm_id) {
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

            oColumn = colTree[i][j];
            var isSkip = this.isNotSearchable(oColumn);
            if (isSkip) continue;
            
            var elHeadRow = elHead.appendChild(document.createElement("tr"));
            elHeadRow.id = this.id+"-hdrow"+i;

            var elHeadCell = elHeadRow.appendChild(document.createElement("th"));
            var id = oColumn.getId();
            elHeadCell.id = id +"-label";
            this._initHeadCell(elHeadCell,oColumn,i,j);

            var elDataCell = elHeadRow.appendChild(document.createElement("td"));
            elDataCell.id = id + "-data";

            var elInput = this._initControl(elDataCell,oColumn,sForm_id);
            if (elInput) {
                aFields[n++] = elInput;
                YAHOO.util.Dom.addClass(elInput,YAHOO.widget.DataTable.CLASS_EDITABLE);
            }             
        }
    }

    this._aFields = aFields;
    this._elHead = elTable.appendChild(elHead);
    YAHOO.log("THEAD with " + this._oColumnSet.keys.length + " field labels and input controls created","info",this.toString());

};


/**
 * Creates data-entry controls based on field type, form* classes, 
 * and nMode property.
 *
 * @method _initControl
 */
YAHOO.yazaar.DataForm.prototype._initControl = function(elCell,oColumn,sForm_id) {
    var type = oColumn.formType || oColumn.type;
    var editor = oColumn.formEditor || oColumn.editor || "textbox";
    var isTextBox = (editor == "textbox");
    var markup = "";
    var classname = "";
    var elInput = null;
    var isDisabled = this.isDisabled(oColumn);
    var isSkip = this.isNotSearchable(oColumn);
    if (isSkip) return null;

    switch(type) {
        case "checkbox":
            elInput = this.checkbox(elCell,oColumn);
            classname = YAHOO.widget.DataTable.CLASS_CHECKBOX;
        break;
        case "currency":
            elInput = this.text(elCell,oColumn);
            classname = YAHOO.widget.DataTable.CLASS_CURRENCY;
        break;
        case "date":
            elInput = this.text(elCell,oColumn);
            classname = YAHOO.widget.DataTable.CLASS_DATE;
        break;
        case "email":
            elInput = this.text(elCell,oColumn);
            classname = YAHOO.widget.DataTable.CLASS_EMAIL;
        break;
        case "link":
            elInput = this.text(elCell,oColumn);
            classname = YAHOO.widget.DataTable.CLASS_LINK;
        break;
        case "number":
            elInput = this.text(elCell,oColumn);
            classname = YAHOO.widget.DataTable.CLASS_NUMBER;
        break;
        case "select":
            elInput = this.select(elCell,oColumn);
            classname = YAHOO.widget.DataTable.CLASS_SELECT;
        break;
       default:
            elInput = (isTextBox) ? this.text(elCell,oColumn) : this.textarea(elCell,oColumn);
            classname = YAHOO.widget.DataTable.CLASS_STRING;
        break;
    }

    elInput.name = oColumn.key;
    elInput.id = sForm_id + "_" + elInput.name;
    elInput.disabled = isDisabled;

    YAHOO.util.Dom.addClass(elCell, classname);
    if(oColumn.className) {
        YAHOO.util.Dom.addClass(elCell, this.className);
    }

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

    return elInput;

};

/** 
 * Creates checkbox control.
 *
 * @param elCell {DOM element} Cell to contain control.
 * @param oColumn {Column class} Column describing control.
 * @method checkbox
 */
YAHOO.yazaar.DataForm.prototype.checkbox = function(elCell,oColumn) {
    var el = document.createElement("input");
    el.setAttribute("type","checkbox");
    var elInput = elCell.appendChild(el);
    return elInput;
};

/** 
 * Creates select control.
 * 
 * The control will obtain options from the oSession object under  a key 
 * equal to the value of the columnSet key field plus the suffix "_selectOptions", 
 * from the columnSet "formSelectOptions" field, or from the standard columnSet 
 * "selectOptions" field. The formSelectOptions alternative lets us display 
 * the selected option as text in the list, but as a select box when editing. 
 * The oSession alternative makes it easier to obtain the list from a database call.
 * The options may be a simple list, or passed as a record with text and value fields. 
 * An alternate record format with value and key fields is also supported. 
 * When using either text/value or value/key, a "selectOptionsKey" value may also 
 * be set, to indicate another field that will contain the selected value 
 * (which would be different than the display value). If set through the oSsession, 
 * the suffix is "_selectOptionsKey". 
 *
 * @param elCell {DOM element} Cell to contain control.
 * @param oColumn {Column class} Column describing control.
 * @method select
 */
YAHOO.yazaar.DataForm.prototype.select = function(elCell,oColumn) {
    var elInput = elCell.appendChild(document.createElement("select"));
    var sKey = oColumn.key + "_selectOptions";
    var aOptions = this.oSession[sKey] || oColumn.formSelectOptions || oColumn.selectOptions || [];
    var nLength = aOptions.length;
    var sKey2 = sKey + "Key";
    var sOptionsKey = this.oSession[sKey2] || oColumn.formSelectOptionsKey || oColumn.selectOptionsKey || null;
    // Expando sOptionsKey (or set to null)
    elInput.sOptionsKey = sOptionsKey;
    if (nLength==0) return elInput;
    // FIXME: Need to swap Key/Value for Value/Text
    var type = "simple"; 
    if (!YAHOO.lang.isUndefined(aOptions[0].text)) type = "text-value";
    if (!YAHOO.lang.isUndefined(aOptions[0].key)) type = "value-key";
    var elOption;
    for (var n=0; n<nLength; n++) {
        elOption = document.createElement('option');
        switch(type) {
            case "text-value":
                elOption.text = aOptions[n].text;
                elOption.value = aOptions[n].value;
            break;
            case "value-key":
                elOption.text = aOptions[n].value;
                elOption.value = aOptions[n].key;
            break;
            default:
                elOption.text = aOptions[n];
                elOption.value = aOptions[n];
            break;
        }
        try {
            elInput.add(elOption,null);
        } catch(e) {
            elInput.add(elOption); // IE only
        }
    }
    return elInput;
};

/** 
 * Creates default text control.
 *
 * @param elCell {DOM element} Cell to contain control.
 * @param oColumn {Column class} Column describing control.
 * @method text
 */
YAHOO.yazaar.DataForm.prototype.text = function(elCell,oColumn) {
    var elInput = elCell.appendChild(document.createElement("input"));
    elInput.size = oColumn.formSize || oColumn.size || 60 ;
    var nMaxLength = oColumn.formMaxLength || oColumn.maxLength || 0; 
    if ((nMaxLength) > 0) elInput.maxLength = nMaxLength;
    elInput.type = "text";
    return elInput;
};

/** 
 * Creates textarea control.
 *
 * @param elCell {DOM element} Cell to contain control.
 * @param oColumn {Column class} Column describing control.
 * @method text
 */
YAHOO.yazaar.DataForm.prototype.textarea = function(elCell,oColumn) {
    var elInput = elCell.appendChild(document.createElement("textarea"));
    elInput.rows = oColumn.formRows || oColumn.textRows || 5 ;
    elInput.cols = oColumn.formCols || oColumn.textCols || 80 ;
    return elInput;
};


/*
YAHOO.widget.Column.formatSelect = function(elCell, oRecord, oColumn, oData) {
    var selectedValue = oData;
    var options = oColumn.selectOptions;

    var markup = "<select>";
    if(options) {
        for(var i=0; i<options.length; i++) {
            var option = options[i];
            markup += "<option value=\"" + option + "\"";
            if(selectedValue === option) {
                markup += " selected";
            }
            markup += ">" + option + "</option>";
        }
    }
    else {
        if(selectedValue) {
            markup += "<option value=\"" + selectedValue + "\" selected>" + selectedValue + "</option>";
        }
    }
    markup += "</select>";
    elCell.innerHTML = markup;
};
*/


/**
 * Populates TH cell as defined by Column.
 *
 * @param elHeadCell {HTMLElement} TH cell element reference.
 * @param oColumn {YAHOO.widget.Column} Column object.
 * @param row {number} Row index.
 * @param col {number} Column index.
 * @private
 */
YAHOO.yazaar.DataForm.prototype._initHeadCell = function(elHeadCell,oColumn,row,col) {
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
YAHOO.yazaar.DataForm.prototype.isActive = false;

/**
 * True if the DataForm is empty of data. False if DataForm is populated with
 * data from RecordSet.
 *
 * @property isEmpty
 * @type Boolean
 */
YAHOO.yazaar.DataForm.prototype.isEmpty = false;

/**
 * The initilization mode for this DataForm 
 * (INIT_FIND, INIT_LIST, INIT_EDIT, INIT_VIEW).
 * Should not be changed after initilization. 
 *
 * @property nInitMode
 * @type Numeric
 */
YAHOO.yazaar.DataForm.prototype.nInitMode = YAHOO.yazaar.DataForm.INIT_LIST;

/**
 * True if the DataForm is being used as a readonly view
 * with disabled input controls.
 *
 * @method isDisabled
 * @type Boolean
 */
YAHOO.yazaar.DataForm.prototype.isDisabled = function (oColumn) {
    var isDisabled;
    switch (this.nInitMode) {
        case YAHOO.yazaar.DataForm.INIT_VIEW: 
            isDisabled = true;
        break;
        case YAHOO.yazaar.DataForm.INIT_EDIT: 
            isDisabled = !(oColumn.editor); 
        break;
        default:
            isDisabled = false;
        break;
    }
    return isDisabled;
};

/**
 * True if the DataForm is being used as a readonly view
 * with disabled input controls.
 *
 * @method isDisabled
 * @type Boolean
 */
YAHOO.yazaar.DataForm.prototype.isFind = function () {
    return (this.nInitMode == YAHOO.yazaar.DataForm.INIT_FIND);
};


/**
 * True if this DataForm is a Find form, 
 * and the column is marked searchable.
 *
 * @param oColumn (object) Column object of ColumnSet to check
 * @method isNotSearchable
 * @type Boolean
 */
YAHOO.yazaar.DataForm.prototype.isNotSearchable = function (oColumn) {
    var isSearchable = (oColumn.searchable);
    return (this.isFind()) && (!isSearchable);
};


/**
 * DataTable instance.
 *
 * @property oDataList
 * @type YAHOO.widget.DataTable
 * @optional
  */
 YAHOO.yazaar.DataForm.prototype.oDataList = null;

/**
 * DataMenu instance.
 *
 * @property oDataMenu
 * @type YAHOO.yazaar.DataMenu
 * @optional
  */
 YAHOO.yazaar.DataForm.prototype.oDataMenu = null;

/**
 * Generic "state" object that can be used to store select lists obtained from
 * a database call, and other objects as convenient.
 * Select options can be stored here in the format oColumn.key + "_selectOptions".
 *
 * @property oSession
 * @type object
 * @optional
 */
YAHOO.yazaar.DataForm.prototype.oSession = {};

/////////////////////////////////////////////////////////////////////////////
//
// Public methods
//
/////////////////////////////////////////////////////////////////////////////

/**
 * Create and return a copy of the original record.
 * 
 * @method copyRecord
 */
YAHOO.yazaar.DataForm.prototype.copyRecord = function() {
  var oRecord = this._oRecord;
  var oCopy = {};
  for (var prop in oRecord) {
    // TODO: Subclass fields only?
    oCopy[prop] = oRecord[prop];
  }
  return oCopy;
};

/**
 * Deletes from the RecordSet a Record by its identifier. 
 * This method does not delete the record from any related DataTable. 
 * In that case, use the DataTable.delete
 * 
 * @method deleteRecord
 */
YAHOO.yazaar.DataForm.prototype.deleteRecord = function(sIdentifier) {
    var aRecords = this._oRecordSet._records;
    var isSuccess = false;
    if(YAHOO.lang.isNumber(sIdentifier)) {
        return oRecordSet[sIdentifier];
    }
    else if(YAHOO.lang.isString(sIdentifier)) {
        for(var i=0; i<aRecords.length; i++) {
            if(aRecords[i].yuiRecordId == sIdentifier) {
                // FIXME: Calling the RecordSet method didn't seem to work (?!), 
                // so we brought up the two essential lines of code
                // this._oRecordSet.deleteRecord[i]; 
                aRecords.splice(i, 1);
                aRecords._length = aRecords._length - 1;
                isSuccess = true;
            }
        }
    }
    return isSuccess;
};

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
YAHOO.yazaar.DataForm.prototype.doBeforeLoadData = function(sRequest, oResponse) {
    return true;
};

/**
 * Returns array of selected Record IDs.
 *
 * @return {HTMLElement[]} Array of selected TR elements.
 * @method getSelectedRecordIds
 */
YAHOO.yazaar.DataForm.prototype.getSelectedRecordIds = function() {
    return this._aSelectedRecords || [];
};

/**
 * Obtains the value of form input controls into a copy of the original
 * record, so that any record values not shown on the form are retained.
 * 
 * @method harvestForm
 */
YAHOO.yazaar.DataForm.prototype.harvestForm = function() {
    var oRecord = this.copyRecord();
    var aFields = this._aFields;
    var nFields = aFields.length;
    for (var i=0; i<nFields; i++) {
        var elInput = aFields[i];
        var name = elInput.name;
        var type = elInput.type;
        switch(type) {
            case "checkbox":
                oRecord[elInput.name] = (elInput.checked) ? 1 : 0;
            break;
            case "select-one": 
                var nSelected = elInput.selectedIndex;
                var isSelected = (nSelected>-1);
                if (isSelected) {
                    var sOptionsKey = elInput.sOptionsKey;
                    if (sOptionsKey) {
                        oRecord[sOptionsKey] = elInput.value;
                    }
                    var aOptions = elInput.options;
                    var oOption = aOptions[nSelected];
                    var sText = oOption.innerText;
                    oRecord[name] = sText;
                }
            break;
            default: 
              oRecord[name] = elInput.value;
            break;
        }
    }
    return oRecord;
};

/**
 * Hides any placeholder message row.
 * 
 * @method hideTableMessages
 */
YAHOO.yazaar.DataForm.prototype.hideTableMessages = function() {
    if(!this.isEmpty && !this.isLoading) {
        return;
    }

    this._elMsgBody.style.display = "none";

    this.isEmpty = false;
    this.isLoading = false;
};

/**
 * Compares values of a new record, or harvested form values, with the orignal
 * record, and returns true if any of the values differ.
 *
 * @param {Object} oNextRecord Record for comparion or the form is harvested.
 * @method isRecordChanged
 */
YAHOO.yazaar.DataForm.prototype.isRecordChanged = function(oNextRecord) {
    if (arguments.length==0) {
      oNextRecord = this.harvestForm();
    }
    var oPrevRecord = this._oRecord;
    var same = true;
    for (var prop in oPrevRecord) {
      // TODO: Subclass fields only?
      var prev = oPrevRecord[prop]; 
      var next = oNextRecord[prop]; 
      var okay = this.isDefined(prev) && this.isDefined(next);
      if (okay) 
        same = same && (prev == next); // allow type conversions
    }
    return !same;
};

YAHOO.yazaar.DataForm.prototype.isDefined = function(obj) {
    return typeof obj != 'undefined';
};

/**
 * Validates form data according to the CSS class names set on the input elements.
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
 * 
 * @method isInvalidInput
 */
YAHOO.yazaar.DataForm.prototype.isInvalidInput = function() {
    var errs = new Array();
    var all_valid = true;

    //access form elements
    //inputs
    var f_in = this._aFields;
    // TODO selects (Y!)
    // var f_sl = elm.getElementsByTagName('select');
    // TODO textareas (Y!)
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
                var valid = false;
                if (t == 'text' || t == 'password') {
                    //text box
                    valid = FIC_checkField(cname,f_in[i]);
                } else if(t == 'radio' || t == 'checkbox'){
                    // radio or checkbox
                    valid = FIC_checkRadCbx(cname,f_in[i],f_in);
                    cext = '-cr';
                } else {
                    valid = true;
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

    /*
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
}; // end isInvalidInput

/**
 * Logs that an event is raised, including the record and old record data as JSON strings.
 * <p>
 * The method can accept one or both of the record parameters.
 * Additional parameters are ignored.
 *
 * @param oRecord The current state of record under edit
 * @param oPrevRecord The prior state of record under edit
 * @debug
 * @method logRecordEvent
 */
YAHOO.yazaar.DataForm.prototype.logRecordEvent = function(sEventName, oRecord, oPrevRecord) {
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
};

/**
 * Returns the selected record from the shared or standalone RecordSet.
 * 
 * @method getSelectedRecord
 */
YAHOO.yazaar.DataForm.prototype.getSelectedRecord = function() {
    this.hideTableMessages();
    var oDataList = this.oDataList;
    var isShared = !!(oDataList);
    var oRecordSet =  (isShared) ? oDataList._oRecordSet : this._oRecordSet;
    var oSelectedRecords =  (isShared) ? oDataList.getSelectedRecordIds() : this.getSelectedRecordIds();
    var nLength = oSelectedRecords.length;
    // TODO: For YUI 2.3.0, confirm that single select only selects one row (1703840)
    var oRecord = (nLength > 0) ? oRecordSet.getRecord(oSelectedRecords[nLength-1]) : oRecordSet.getRecord(0);
    return oRecord;
};


/**
 * Extends the notion of "falsy" to include a "0" string value. 
 * @param oData The value to test for true or false
 */
YAHOO.yazaar.DataForm.isDataTrue = function(oData) {
    var isTrue = Boolean(oData);
    switch(oData) { 
        case "0": isTrue = false; break;
    }
    return isTrue;    
};

/** 
 * Represents TRUE and FALSE as YES or NO. 
 * This method utilizes the isDataTrue method! 
 * @param elCell {HTMLElement} Table cell element.
 * @param oRecord {YAHOO.widget.Record} Record instance.
 * @param oColumn {YAHOO.widget.Column} Column instance.
 * @param oData {Object} Data value for the cell, or null
 */
YAHOO.yazaar.DataForm.formatYesNo = function(elCell, oRecord, oColumn, oData) {
    elCell.innerHTML = (YAHOO.yazaar.DataForm.isDataTrue(oData)) ? "YES" : "NO" ;
};


/**
 * Sets the value of form input controls to the corresponding entry of the
 * selected record.
 *
 * @param oRecord The record to populate the form, or the selected record if omitted
 * @method populateForm
 */
YAHOO.yazaar.DataForm.prototype.populateForm = function(oRecord) {
    if (!oRecord) {
        oRecord = this.getSelectedRecord();
    }
    var oTree = this._oColumnSet.tree;
    var aFields = this._aFields;
    var n = 0;
    var elInput = aFields[0];
    // NOTE: Breaks in IE - elInput.focus();
    // If the Record is empty, there's nothing to populate
    if (oRecord) for(i=0; i<oTree.length; i++) {
        for(var j=0; j<oTree[i].length; j++) {
            var oColumn = oTree[i][j];
            var sKey = oColumn.key;
            elInput = aFields[n++];
            var type = elInput.type;
            switch(type) {
                case "checkbox":
                    elInput.checked = YAHOO.yazaar.DataForm.isDataTrue(oRecord[sKey]);
                break;
                case "select-one": 
                    var sOptionsKey = elInput.sOptionsKey;
                    var value = (sOptionsKey) ? oRecord[sOptionsKey] : oRecord[sKey];
                    elInput.value = value;
                break;
                default: 
                    elInput.value = oRecord[sKey];
                break;
            }
        }
    }
    this._oRecord = oRecord;
    this.fireEvent("populateEvent", {newRecord:oRecord});
    this.logRecordEvent("populateEvent", oRecord); // debug
};

/**
 * Placeholder row. Indicates table data is empty.
 * 
 * @method showEmptyMessage
 */
YAHOO.yazaar.DataForm.prototype.showEmptyMessage = function() {
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
 * Placeholder row. Indicates table data is loading.
 * 
 * @method showLoadingMessage
 */
YAHOO.yazaar.DataForm.prototype.showLoadingMessage = function() {
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
 * Public accessor. Provides unique name of the DataSource instance.
 *
 * @return {String} Unique name of the DataSource instance.
 * @method toString
 */
YAHOO.yazaar.DataForm.prototype.toString = function() {
    return "DataForm " + this._sName;
};


YAHOO.yazaar.DataForm.prototype._onRecord = function(e, oSelf, sEvent) {
    var oRecord = oSelf._oRecord;
    oSelf.fireEvent(sEvent, {oRecord: oRecord});
    oSelf.logRecordEvent(sEvent, oRecord); // debug
};

/** 
 * Raises cancelEvent. 
 *
 * @method doCancel
 */
YAHOO.yazaar.DataForm.prototype.doCancel = function() {
    this.fireEvent("cancelEvent", this);
    this.logRecordEvent("cancelEvent", {oRecord: this._oRecord}); // debug        
};

/** 
 * Raises deleteEvent. 
 *
 * @method doDelete
 */
YAHOO.yazaar.DataForm.prototype.doDelete = function() {
    this.fireEvent("deleteEvent", this);
    this.logRecordEvent("deleteEvent", {oRecord: this._oRecord}); // debug        
};

/**
 * Harvests data from form and raise insertEvent.
 *
 * @method doInsert
 */
YAHOO.yazaar.DataForm.prototype.doInsert = function() {

    if (this.isInvalidInput()) return;

    // Gather the data and insert the record
    var oFields = this.harvestForm();
    if (oFields.insertForm) delete(oFields.insertForm); // untag record    
    // TODO: Use current page position for insert position
    var oNewRecord = this._oRecordSet.addRecord(oFields,0); 

    this._oRecord = oNewRecord;

    // Raise insertEvent
    var context = {oRecord: oNewRecord};
    this.fireEvent("insertEvent", context);
    this.logRecordEvent("insertEvent", context); // debug
    
    // Refresh the table
    var oDataList = this.oDataList;
    if (oDataList) {
        // TODO: Restore the current sort (do we even want to?)
        oDataList.addRow(oNewRecord); 
        oDataList.showPage(oDataList.pageCurrent);
    }
};

/**
 * Sets the value of form input controls to the corresponding entry of the
 * selected record.
 *
 * @param oRecord The record to populate the form, or the selected record if omitted
 * @method doInsertForm
 */
YAHOO.yazaar.DataForm.prototype.doInsertForm = function(oValues) {
    var oFields = {};
    var oInitial = oValues || {};
    var oSet = this._oColumnSet;
    var aKeys = oSet.keys;
    var nLength = aKeys.length;
    var oColumn, sKey, sKey2, oRecord;
    for (i=0; i<nLength; i++) {
        oColumn = aKeys[i];
        sKey = oColumn.key;
        oFields[sKey] = oInitial[sKey] || oColumn.initial || "" ;
        sKey2 = oColumn.formSelectOptionsKey;
        if (sKey2) oFields[sKey2] = oInitial[sKey2];
    }
    oFields["insertForm"] = true; // tag record
    oRecord = new YAHOO.widget.Record(oFields);
    this.populateForm(oRecord);
    this.fireEvent("insertFormEvent", this);
    this.logRecordEvent("insertFormEvent", {oRecord: this._oRecord}); // debug
};

/**
 * Restores the original values to the active record, 
 * and raises resetEvent.
 * 
 * @method doReset
 */
YAHOO.yazaar.DataForm.prototype.doReset = function() {
    var oRecord = this._oRecord || {} ; // Restore this reference
    var aFields = this._aFields;
    var nFields = aFields.length;
    for (var i=0; i<nFields; i++) {
        // TODO: Subclass fields only?
        var elInput = aFields[i];
        elInput.value = oRecord[elInput.name] || "";
    }
    this.fireEvent("resetEvent", {oRecord:oRecord});
    this.logRecordEvent("resetEvent", oRecord); // debug    
};

/**
 * Raises refreshEvent. 
 *
 * @method doRefresh
 */
YAHOO.yazaar.DataForm.prototype.doRefresh = function() {
    this.fireEvent("refreshEvent", {oRecord:oRecord});
    this.logRecordEvent("refreshEvent", oRecord); // debug    
};

/**
 * Harvests data from form and raises criteriaEvent 
 * with record values to match. 
 * 
 * @method doCriteria
 */
YAHOO.yazaar.DataForm.prototype.doCriteria = function() {
    var oRecord = this.harvestForm();
    this.fireEvent("criteriaEvent", {oRecord:oRecord});
    this.logRecordEvent("criteriaEvent", oRecord); // debug    
};

/**
 * Delegates to select, insert, or update. 
 * 
 * @method doSubmit
 */
YAHOO.yazaar.DataForm.prototype.doSubmit = function() {
    if (this.isFind()) {
        return this.doCriteria();
    }
    else {
        var sIdentifier = this._oRecord.yuiRecordId;
        var oRecord = this._oRecordSet.getRecord(sIdentifier);
        var isInsertForm = !(oRecord) || (oRecord.insertForm);
        if (isInsertForm) {
            return this.doInsert();
        }
        else {
             return this.doUpdate();
        }
    }  
};

/**
 * Harvests data from form and raises updateEvent 
 * with new and old record values and an "isChanged"
 * boolean property
 *
 * @method doUpdate
 */
YAHOO.yazaar.DataForm.prototype.doUpdate = function() {

    if (this.isInvalidInput()) return;

    // Gather the usual suspects
    var oRecord = this._oRecord;
    var oPrevRecord = this.copyRecord();
    var oNewRecord = this.harvestForm();
    // Check to see if anything changed
    var isChanged = this.isRecordChanged(oNewRecord);
    if (isChanged) for (var prop in oRecord) {
        oRecord[prop] = oNewRecord[prop];
    }
    // Raise updateEvent
    var context = {oRecord: oNewRecord, oPrevRecord: oPrevRecord, isChanged: isChanged};
    this.fireEvent("updateEvent", context);
    var sLog = (isChanged) ? "updateEvent" : "updateEvent (no change)";
    this.logRecordEvent(sLog, oNewRecord, oPrevRecord); // debug
    if (isChanged) {
        // Refresh the table
        var oDataList = this.oDataList;
        if (oDataList) {
          oDataList.showPage(oDataList.pageCurrent);
        }
    }
};

/** 
 * Raises updateFormEvent (e.g. switch tabs).
 *
 * @method doUpdateForm
 */
YAHOO.yazaar.DataForm.prototype.doUpdateForm = function() {
    this.fireEvent("updateFormEvent", this);
    this.logRecordEvent("updateFormEvent", {oRecord: this._oRecord}); // debug        
};

/** 
 * Raises viewFormEvent (e.g. switch tabs).
 *
 * @method doViewForm
 */
YAHOO.yazaar.DataForm.prototype.doViewForm = function() {
    this.fireEvent("viewFormEvent", this);
    this.logRecordEvent("viewFormEvent", {oRecord: this._oRecord}); // debug        
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
YAHOO.yazaar.DataForm.prototype.onDataReturnPopulateForm = function(sRequest, oResponse) {
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

/////////////////////////////////////////////////////////////////////////////
//
// DataMenu
//
/////////////////////////////////////////////////////////////////////////////

/**
 * The DataMenu widget displays a strip of buttons linked to a RecordSet, 
 * which may be shared with a DataTable or a DataMenu. 
 * The buttons raise events with payloads that include data from the 
 * RecordSet as appropriate. 
 * This widget is designed to collaborate with a DataList or DataMenu. 
 * @overview
 * @module yazaar.datamenu
 * @requires yahoo, dom, event, datasource
 * @title DataMenu Widget
 * @beta
 */

/////////////////////////////////////////////////////////////////////////////
//
// Constructor
//
/////////////////////////////////////////////////////////////////////////////

/**
 * Creates and configures a new DataMenu instance by 
 * generating HTML markup for a standard set of buttons, 
 * depending whether presentation is "View" mode (or "Edit" mode).
 *
 * @param oConfigs Property settings. May include oDataList.
 * @param oColumnSet {YAHOO.widget.ColumnSet} ColumnSet instance.
 * @param oDataSource {YAHOO.util.DataSource} DataSource instance.
*/
YAHOO.yazaar.DataMenu = function(elContainer,sForm_id,nInitMode) {
   
    var initButton = this._initButton;
    var elRefresh,elView,elUpdate,elInsert,elDelete,elCancel,elSubmit,elReset;
    
    switch(nInitMode) {
        case YAHOO.yazaar.DataForm.INIT_FIND:
            this._elSubmit = this._initSubmit(elContainer, sForm_id);
            this._elReset = this._initReset(elContainer, sForm_id);
        break;
        case YAHOO.yazaar.DataForm.INIT_LIST:
            this._elView = this._initView(elContainer, sForm_id);
            this._elUpdate = this._initUpdate(elContainer, sForm_id);
            this._elInsert = this._initInsert(elContainer, sForm_id);
            this._elDelete = this._initDelete(elContainer, sForm_id);
            this._elRefresh = this._initRefresh(elContainer, sForm_id);
            this._elCancel = this._initCancel(elContainer, sForm_id);
        break;
        case YAHOO.yazaar.DataForm.INIT_EDIT:
            this._elSubmit = this._initSubmit(elContainer, sForm_id);
            this._elReset = this._initReset(elContainer, sForm_id);
            this._elCancel = this._initCancel(elContainer, sForm_id);
        break;
        case YAHOO.yazaar.DataForm.INIT_VIEW:
            this._elUpdate = this._initUpdate(elContainer, sForm_id);
            this._elInsert = this._initInsert(elContainer, sForm_id);
            this._elDelete = this._initDelete(elContainer, sForm_id);
            this._elRefresh = this._initRefresh(elContainer, sForm_id);
            this._elCancel = this._initCancel(elContainer, sForm_id);
        break;
        default: 
            this._elCancel = this._initCancel(elContainer, sForm_id);
        break;
    }
    
    /////////////////////////////////////////////////////////////////////////////
    //
    // Public custom events
    //
    /////////////////////////////////////////////////////////////////////////////
    
    /**
     * Fired when editing is to be cancelled.
     *
     * @param oArgs.oRecord {Object} Record instance.
     * @event cancelEvent
     */
    this.createEvent("cancelEvent");

    /**
     * Fired when a Record is to be deleted.
     *
     * @param oArgs.oRecord {Object} Deleted Record instance.
     * @event deleteEvent
     */
    this.createEvent("deleteEvent");

    /**
     * Fired when an insert data-entry form is to be presented.
     *
     * @event insertFormEvent
     */
    this.createEvent("insertFormEvent");

    /**
     * Fired when editing form is to be reset.
     *
     * @param oArgs.oRecord {Object} Record instance.
     * @event resetEvent
     */
    this.createEvent("resetEvent");

    /**
     * Fired when data backing the widget is to be refreshed.
     *
     * @param oArgs.oRecord {Object} Record instance.
     * @event refreshEvent
     */
    this.createEvent("refreshEvent");

    /**
     * Fired when Record is to be updated or inserted.
     *
     * @param oArgs.oRecord {Object} Updated Record instance.
     * @param oArgs.oPrevRecord {Object} Prior record data.
     * @param oArgs.isChanged {Boolean} Did any of the field values change?
     * @event updateEvent
     */
    this.createEvent("submitEvent");

    /**
     * Fired when an update data-entry form is to be presented.
     *
     * @event updateFormEvent
     */
    this.createEvent("updateFormEvent");
    
    /**
     * Fired when a view-only form is to be presented.
     *
     * @param oArgs.oRecord {Object} Record instance.
     * @event viewFormEvent
     */
    this.createEvent("viewFormEvent");

    

    // end custom events        
};

YAHOO.augment(YAHOO.yazaar.DataMenu, YAHOO.util.EventProvider);

/////////////////////////////////////////////////////////////////////////////
//
// Public constants
//
/////////////////////////////////////////////////////////////////////////////

/**
 * Label for Submit button
 *
 * @static
 * @field
 * @property MSG_SUBMIT
 * @type String
 * @final
 * @default "SUBMIT"
 */
YAHOO.yazaar.DataMenu.MSG_SUBMIT = "SUBMIT";

/**
 * Label for Reset button
 *
 * @static
 * @field
 * @property MSG_RESET
 * @type String
 * @final
 * @default "RESET"
 */
YAHOO.yazaar.DataMenu.MSG_RESET = "RESET";

/**
 * Label for Cancel button
 *
 * @static
 * @field
 * @property MSG_CANCEL
 * @type String
 * @final
 * @default "CANCEL"
 */
YAHOO.yazaar.DataMenu.MSG_CANCEL = "CANCEL";

/**
 * Label for Refresh button
 *
 * @static
 * @field
 * @property MSG_REFRESH
 * @type String
 * @final
 * @default "REFRESH"
 */
YAHOO.yazaar.DataMenu.MSG_REFRESH = "REFRESH";

/**
 * Label for View button
 *
 * @static
 * @field
 * @property MSG_VIEW
 * @type String
 * @final
 * @default "VIEW"
 */
YAHOO.yazaar.DataMenu.MSG_VIEW = "VIEW";

/**
 * Label for Update button
 *
 * @static
 * @field
 * @property MSG_UPDATE
 * @type String
 * @final
 * @default "EDIT"
 */
YAHOO.yazaar.DataMenu.MSG_UPDATE = "EDIT";

/**
 * Label for Insert button
 *
 * @static
 * @field
 * @property MSG_INSERT
 * @type String
 * @final
 * @default "ADD"
 */
YAHOO.yazaar.DataMenu.MSG_INSERT = "ADD";

/**
 * Label for Delete button
 *
 * @static
 * @field
 * @property MSG_DELETE
 * @type String
 * @final
 * @default "DELETE"
 */
YAHOO.yazaar.DataMenu.MSG_DELETE = "DELETE";


/////////////////////////////////////////////////////////////////////////////
//
// Private member variables (properties)
//
/////////////////////////////////////////////////////////////////////////////

/**
 * Cancel control reference.
 *
 * @property _elSubmit
 * @type HTMLElement
 * @private
 */
YAHOO.yazaar.DataMenu.prototype._elCancel = null;

/**
 * Delete control reference.
 *
 * @property _elDelete
 * @type HTMLElement
 * @private
 */
YAHOO.yazaar.DataMenu.prototype._elDelete = null;

/**
 * Insert control reference ("ADD").
 *
 * @property _elInsert
 * @type HTMLElement
 * @private
 */
YAHOO.yazaar.DataMenu.prototype._elInsert = null;

/**
 * Reset control reference.
 *
 * @property _elSubmit
 * @type HTMLElement
 * @private
 */
YAHOO.yazaar.DataMenu.prototype._elReset = null;

/**
 * Submit control reference.
 *
 * @property _elSubmit
 * @type HTMLElement
 * @private
 */
YAHOO.yazaar.DataMenu.prototype._elSubmit = null;

/**
 * Update control reference ("EDIT").
 *
 * @property _elUpdate
 * @type HTMLElement
 * @private
 */
YAHOO.yazaar.DataMenu.prototype._elUpdate = null;

/////////////////////////////////////////////////////////////////////////////
//
// Private custom event handlers
//
/////////////////////////////////////////////////////////////////////////////

/**
 * Raises a cancelEvent.
 *
 * @param e {HTMLEvent} The click event.
 * @param oSelf {YAHOO.yazaar.DataMenu} DataMenu instance.
 * @private
 */
YAHOO.yazaar.DataMenu.prototype._onCancel = function(e, oSelf) {
    oSelf.fireEvent("cancelEvent", e);
};

/**
 * Raises a deleteEvent.
 *
 * @param e {HTMLEvent} The click event.
 * @param oSelf {YAHOO.yazaar.DataMenu} DataMenu instance.
 * @private
 */
YAHOO.yazaar.DataMenu.prototype._onDelete = function(e, oSelf) {
    oSelf.fireEvent("deleteEvent", e);
};

/**
 * Raises a insertFormEvent.
 *
 * @param e {HTMLEvent} The click event.
 * @param oSelf {YAHOO.yazaar.DataMenu} DataMenu instance.
 * @private
 */
YAHOO.yazaar.DataMenu.prototype._onInsertForm = function(e, oSelf) {
    oSelf.fireEvent("insertFormEvent", e);
};

/**
 * Raises a resetEvent.
 *
 * @param e {HTMLEvent} The click event.
 * @param oSelf {YAHOO.yazaar.DataMenu} DataMenu instance.
 * @see reset
 * @private
 */
YAHOO.yazaar.DataMenu.prototype._onReset = function(e, oSelf) {
    oSelf.fireEvent("resetEvent", e);
};

/**
 * Raises a refreshEvent.
 *
 * @param e {HTMLEvent} The click event.
 * @param oSelf {YAHOO.yazaar.DataMenu} DataMenu instance.
 * @see reset
 * @private
 */
YAHOO.yazaar.DataMenu.prototype._onRefresh = function(e, oSelf) {
    oSelf.fireEvent("refreshEvent", e);
};

/**
 * Raises a submitEvent.
 *
 * @param e {HTMLEvent} The click event.
 * @param oSelf {YAHOO.yazaar.DataMenu} DataMenu instance.
 * @private
 */
YAHOO.yazaar.DataMenu.prototype._onSubmit = function(e, oSelf) {
    oSelf.fireEvent("submitEvent", e);
};

/** 
 * Raises a updateFormEvent.
 * 
 * @param e {HTMLEvent} The click event.
 * @param oSelf {YAHOO.yazaar.DataMenu} DataMenu instance.
 * @private
 */
YAHOO.yazaar.DataMenu.prototype._onUpdateForm = function(e, oSelf) {
    oSelf.fireEvent("updateFormEvent", e);
};

/** 
 * Raises a viewFormEvent.
 * 
 * @param e {HTMLEvent} The click event.
 * @param oSelf {YAHOO.yazaar.DataMenu} DataMenu instance.
 * @private
 */
YAHOO.yazaar.DataMenu.prototype._onViewForm = function(e, oSelf) {
    oSelf.fireEvent("viewFormEvent", e);
};

/////////////////////////////////////////////////////////////////////////////
//
// Private methods
//
/////////////////////////////////////////////////////////////////////////////

/**
 * Creates HTML markup for a BUTTON.
 *
 * @private
 * @param sName {string} Name attribute
 * @param elParent (element) Element enclosing button
 * @param sPrefix (string} Prefix for ID attribute
 * @param sValue (string} value and alt attributes, appended to sPrefix to create ID attribute
 */
YAHOO.yazaar.DataMenu.prototype._initButton = function(sName,elParent,sPrefix,sValue) {
  var el;
  try {
    el = document.createElement("<input type='button' />"); // IE idiom
  }
  catch(err) {
    el = document.createElement("input"); // w3c idiom
    el.setAttribute("type", "button");
  }
  el.setAttribute("name", sName);
  el.setAttribute("id", sPrefix + "_" + sValue );
  el.setAttribute("value", sValue);
  el.setAttribute("alt", sValue);
  elParent.appendChild(el);
  return el;
};

/**
 * Generate Cancel button and attach custom event listener. 
 *
 * @private
 * @param elContainer (element) The enclosing element
 * @param sForm_id (string) Prefix to use when assigning element ID
 */
YAHOO.yazaar.DataMenu.prototype._initCancel = function(elContainer,sForm_id) {
    var elCancel = this._initButton("elCancel", elContainer, sForm_id, YAHOO.yazaar.DataMenu.MSG_CANCEL);
    YAHOO.util.Event.addListener(elCancel, "click", this._onCancel, this);
    return elCancel;
};

/**
 * Generate Delete button and attach custom event listener. 
 *
 * @private
 * @param elContainer (element) The enclosing element
 * @param sForm_id (string) Prefix to use when assigning element ID
 */
YAHOO.yazaar.DataMenu.prototype._initDelete = function(elContainer,sForm_id) {
    var elDelete = this._initButton("elDelete", elContainer, sForm_id, YAHOO.yazaar.DataMenu.MSG_DELETE);
    YAHOO.util.Event.addListener(elDelete, "click", this._onDelete, this);
    return elDelete;
};

/**
 * Generate Insert button and attach custom event listener. 
 *
 * @private
 * @param elContainer (element) The enclosing element
 * @param sForm_id (string) Prefix to use when assigning element ID
 */
YAHOO.yazaar.DataMenu.prototype._initInsert = function(elContainer,sForm_id) {
    var elInsert = this._initButton("elInsert", elContainer, sForm_id, YAHOO.yazaar.DataMenu.MSG_INSERT);
    YAHOO.util.Event.addListener(elInsert, "click", this._onInsertForm, this);
    return elInsert;
};

/**
 * Generate Refresh button and attach custom event listener. 
 *
 * @private
 * @param elContainer (element) The enclosing element
 * @param sForm_id (string) Prefix to use when assigning element ID
 */
YAHOO.yazaar.DataMenu.prototype._initRefresh = function(elContainer,sForm_id) {
    var elRefresh = this._initButton("elRefresh", elContainer, sForm_id, YAHOO.yazaar.DataMenu.MSG_REFRESH);
    YAHOO.util.Event.addListener(elRefresh, "click", this._onRefresh, this);
    return elRefresh;
};

/**
 * Generate Reset button and attach custom event listener. 
 *
 * @private
 * @param elContainer (element) The enclosing element
 * @param sForm_id (string) Prefix to use when assigning element ID
 */
YAHOO.yazaar.DataMenu.prototype._initReset = function(elContainer,sForm_id) {
    var elReset = this._initButton("elReset", elContainer, sForm_id, YAHOO.yazaar.DataMenu.MSG_RESET);
    YAHOO.util.Event.addListener(elReset, "click", this._onReset, this);
    return elReset;
};

/**
 * Generate Submit button and attach custom event listener. 
 *
 * @private
 * @param elContainer (element) The enclosing element
 * @param sForm_id (string) Prefix to use when assigning element ID
 */
YAHOO.yazaar.DataMenu.prototype._initSubmit = function(elContainer,sForm_id) {
    var elSubmit = this._initButton("elSubmit", elContainer, sForm_id, YAHOO.yazaar.DataMenu.MSG_SUBMIT);
    YAHOO.util.Event.addListener(elSubmit, "click", this._onSubmit, this);
    return elSubmit;
};

/**
 * Generate Update button and attach custom event listener. 
 *
 * @private
 * @param elContainer (element) The enclosing element
 * @param sForm_id (string) Prefix to use when assigning element ID
 */
YAHOO.yazaar.DataMenu.prototype._initUpdate = function(elContainer,sForm_id) {
    var elUpdate = this._initButton("elUpdate", elContainer, sForm_id, YAHOO.yazaar.DataMenu.MSG_UPDATE);
    YAHOO.util.Event.addListener(elUpdate, "click", this._onUpdateForm, this);
    return elUpdate;
};

/**
 * Generate View button and attach custom event listener. 
 *
 * @private
 * @param elContainer (element) The enclosing element
 * @param sForm_id (string) Prefix to use when assigning element ID
 */
YAHOO.yazaar.DataMenu.prototype._initView = function(elContainer,sForm_id) {
    var elView = this._initButton("elView", elContainer, sForm_id, YAHOO.yazaar.DataMenu.MSG_VIEW);
    YAHOO.util.Event.addListener(elView, "click", this._onViewForm, this);
    return elView;
};

