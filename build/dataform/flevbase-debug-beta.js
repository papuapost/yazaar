/**
Copyright (c) 2007, Husted dot Com, Inc. All rights reserved.
Portions Copyright (c) 2007, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
*/
/**
 * @overview
 * The FlevBase object combines a DataForm, DataTable, and TabView to create
 * a Find/List/Edit workflow. This object may be instantiated via a
 * "power constructor" so that it can be configured before use.
 * <p />
 * Once configured, the "sub" object will automatically display
 * the dataset on one tab and edit individual rows on another tab.
 * Editing features are derived from the columnset and supports
 * unobstrusive validation via "marker" CSS classes. (See DataForm
 * for more about the validation support.)
 * <p />
 * This object combines the ease of inline editing with the
 * convenience of a full-featured edit form.
 *
 * @see <a href="DataFormWalkThrough">http://code.google.com/p/yazaar/wiki/DataFormWalkThrough</a>
 * @module yazaar.flevbase
 * @requires yahoo, dom, event, datasource
 * @title FLEV Widget
 * @beta
 */

/**
 * Declares the yazaar namespace for use by Constructors.
 */
YAHOO.namespace("yazaar");

/////////////////////////////////////////////////////////////////////////////
//
// Constructor
//
/////////////////////////////////////////////////////////////////////////////

/**
 * Constructs a base FLEV widget with a default configuration.
 * Custom setings may be passed through the oConfig parameter.
 * <p />
 * The client application must provide a dataset for the onLoad
 * method, which may be a RPC result object, or another
 * object designed to resemble a RPC result object.
 * All property changes must be made before onLoad is called.
 * <p />
 * Properties that must be configured are oColumnHeaders and oResponseSchema.
 * Properties that may be configured oFindConfigs, oListConfigs, oEditConfigs, oViewConfigs, 
 * sDataFind, sDataList, sDataView, sDataEdit, sTabView, sListForm, sItemName.
 * Methods that may be configured are onInsert, onUpdate, onDelete, onCancel, and onReset.
 *
 * @constructor
 * @param oConfigs {object} (optional) Object literal of configuration values.
 */
YAHOO.yazaar.FlevBase = function(oConfigs) {

    // identify
    this._nIndex = YAHOO.yazaar.FlevBase._nCount;
    this._sName = "instance" + this._nIndex;
    this.id = "yazaar-fb"+this._nIndex;

    // configure
    if(oConfigs && (oConfigs.constructor == Object)) {
        for(var sConfig in oConfigs) {
            this[sConfig] = oConfigs[sConfig];
        }
    }
    
    /**
     * Fired when widget is loaded and ready to use. 
     *
     * @event loadEvent
     */
    this.loadEvent = this.createEvent("loadEvent");
    
    return this;
};

/**
 * Augments FlevBase constructor with event provider members.
 */
YAHOO.lang.augment(YAHOO.yazaar.FlevBase, YAHOO.util.EventProvider);


/////////////////////////////////////////////////////////////////////////////
//
// Private properties (class and member variables)
//
/////////////////////////////////////////////////////////////////////////////

/**
 * Internal class variable to index multiple FlevBaseinstances.
 *
 * @property _nCount
 * @type Number
 * @private
 * @static
 */
YAHOO.yazaar.FlevBase._nCount = 0;

/**
 * Unique instance name.
 *
 * @property _sName
 * @type String
 * @private
 */
YAHOO.yazaar.FlevBase.prototype._sName = null;

/**
 * Instance index.
 *
 * @property _nIndex
 * @type Number
 * @private
 */
YAHOO.yazaar.FlevBase.prototype._nIndex = null;

/////////////////////////////////////////////////////////////////////////////
//
// Public Properties (initialized to default values)
//
/////////////////////////////////////////////////////////////////////////////


/**
 * Initial message for DataList.
 */
YAHOO.yazaar.FlevBase.MSG_CRITERIA = "Submit criteria to list entries.";


/**
 * Relative menu index of DataFind (not necessarily INIT_FIND)
 */
YAHOO.yazaar.FlevBase.prototype.nDataFind = 0;

/**
 * Relative menu index of DataList (not necessarily INIT_LIST)
 */
YAHOO.yazaar.FlevBase.prototype.nDataList = 1;

/**
 * Relative menu index of DataView (not necessarily INIT_VIEW)
 */
YAHOO.yazaar.FlevBase.prototype.nDataView = 2;

/**
 * Relative menu index of DataEdit (not necessarily INIT_EDIT)
 */
YAHOO.yazaar.FlevBase.prototype.nDataEdit = 3;

/**
 * Edit form configuration instance created by onLoad method.
 */
YAHOO.yazaar.FlevBase.prototype.oFindConfigs = {};

/**
 * An Array of object literals that define the DataTable configuration.
 * If specified, must set rowSingleSelect to true.
 * [{paginator:true,
 * paginatorOptions: {rowsPerPage: 10, dropdownOptions: [10,100,1000]},
 * rowSingleSelect: true}]
 */
YAHOO.yazaar.FlevBase.prototype.oListConfigs = {
    paginator:true,
    paginatorOptions: {
      rowsPerPage: 10,
      dropdownOptions: [10,100,1000]
        },
        rowSingleSelect: true
};

/**
 * Edit form configuration instance created by onLoad method.
 */
YAHOO.yazaar.FlevBase.prototype.oEditConfigs = {};

/**
 * View form configuration instance created by onLoad method.
 */
YAHOO.yazaar.FlevBase.prototype.oViewConfigs = {};

/**
 * DOM ID for the DataFind container (div).
 * ["elDataFind"]
 */
YAHOO.yazaar.FlevBase.prototype.sDataFind = "elDataFind";

/**
 * DOM ID for the DataTable container (div).
 * ["elDataList"]
 */
YAHOO.yazaar.FlevBase.prototype.sDataList = "elDataList";

/**
 * DOM ID for the DataForm container (div).
 * ["elDataView"]
 */
YAHOO.yazaar.FlevBase.prototype.sDataView = "elDataView";

/**
 * DOM ID for the DataForm container (div).
 * ["elDataEdit"]
 */
YAHOO.yazaar.FlevBase.prototype.sDataEdit = "elDataEdit";

/**
 * DOM ID for the TabView container (div).
 * ["elTabView"]
 */
YAHOO.yazaar.FlevBase.prototype.sTabView = "elTabView";

/**
 * DOM ID for the autocomplete control (filters list entries).
 * [elListFilter]
 */
YAHOO.yazaar.FlevBase.prototype.sListFilter = "elListFilter";


/**
 * DOM ID for the List Form control (filters list entries).
 * [elListForm]
 */
YAHOO.yazaar.FlevBase.prototype.sListForm = "elListForm";

/////////////////////////////////////////////////////////////////////////////
//
// Public Properties (initialized to null)
//
/////////////////////////////////////////////////////////////////////////////

/**
 * Autocomplete filter instance created by onLoad method.
 */
YAHOO.yazaar.FlevBase.prototype.fnFilter = null;

/**
 * AutoComplete (RowFilter instance. 
 */
YAHOO.yazaar.FlevBase.prototype.oAutoComplete = null;

/**
 * ColumnSet instance created by onLoad method.
 */
YAHOO.yazaar.FlevBase.prototype.oColumnSet = null;

/**
 * Array of object literals that define header cells for the ColumnSet.
 * At a minimum, each object should contain a key and a text property.
 * Must be configured.
 */
YAHOO.yazaar.FlevBase.prototype.oColumnHeaders = null;

/**
 * DataEdit instance created by this object.
 */
YAHOO.yazaar.FlevBase.prototype.oDataEdit = null;

/**
 * DataFind widget instance created by onLoad method.
 */
YAHOO.yazaar.FlevBase.prototype.oDataFind = null;

/**
 * DataList widget instance created by onLoad method.
 */
YAHOO.yazaar.FlevBase.prototype.oDataList = null;

/**
 * DataSource instance created by onLoad method.
 */
YAHOO.yazaar.FlevBase.prototype.oDataSource = null;

/**
 * Instance created by onLoad method.
 */
YAHOO.yazaar.FlevBase.prototype.oDataView = null;

/**
 * Object literal that describes how data is formatted in the response.
 * Must be configured.
 */
YAHOO.yazaar.FlevBase.prototype.oResponseSchema = null;

/**
 * TabView instance created by this object.
 */
YAHOO.yazaar.FlevBase.prototype.oTabView = null;

/**
 * Initial autocomplete field name.
 * Must be configured.
 */
YAHOO.yazaar.FlevBase.prototype.sItemName = null;

/////////////////////////////////////////////////////////////////////////////
//
// Public Methods
//
/////////////////////////////////////////////////////////////////////////////

/**
 * Exits Edit and activates View. 
 * Override to activate a different display. 
 * @param oSelf (Object) Flev instance
 * @method doExitEdit
 */
YAHOO.yazaar.FlevBase.prototype.doExitEdit = function(oSelf) {
    if (!oSelf) oSelf = this;
    oSelf.oTabView.set('activeIndex', oSelf.nDataList);
};

/**
 * Exits List and activates Find.
 * Override to activate a different display. 
 * @param oSelf (Object) Flev instance
 * @method doExitList
 */
YAHOO.yazaar.FlevBase.prototype.doExitList = function(oSelf) {
    if (!oSelf) oSelf = this;
    oSelf.oTabView.set('activeIndex', oSelf.nDataFind); 
};

/**
 * Exits View and activates List.
 * @param oSelf (Object) Flev instance
 * Override to activate a different display. 
 * @method doExitView
 */
YAHOO.yazaar.FlevBase.prototype.doExitView = function(oSelf) {
    if (!oSelf) oSelf = this;
    oSelf.oTabView.set('activeIndex', oSelf.nDataList); 
};

/**
 * Activates Find.
 * @param oSelf (Object) Flev instance
 * @method doGotoEdit
 */
YAHOO.yazaar.FlevBase.prototype.doGotoFind = function(oSelf) {
    if (!oSelf) oSelf = this;
    oSelf.oTabView.getTab(oSelf.nDataFind).disabled = false;        
    oSelf.oTabView.set('activeIndex', oSelf.nDataFind); 
};

/**
 * Activates List.
 * @param oSelf (Object) Flev instance
 * @method doGotoList
 */
YAHOO.yazaar.FlevBase.prototype.doGotoList = function(oSelf) {
    if (!oSelf) oSelf = this;
    oSelf.oTabView.getTab(oSelf.nDataList).disabled = false;    
    oSelf.oTabView.set('activeIndex', oSelf.nDataList); 
};

/**
 * Activates Edit.
 * @param oSelf (Object) Flev instance
 * @method doGotoEdit
 */
YAHOO.yazaar.FlevBase.prototype.doGotoEdit = function(oSelf) {
    if (!oSelf) oSelf = this;
    oSelf.oTabView.getTab(oSelf.nDataEdit).disabled = false;        
    oSelf.oTabView.set('activeIndex', oSelf.nDataEdit); 
};

/**
 * Activates View.
 * @param oSelf (Object) Flev instance
 * @method doGotoView
 */
YAHOO.yazaar.FlevBase.prototype.doGotoView = function(oSelf) {
    if (!oSelf) oSelf = this;
    oSelf.oTabView.getTab(oSelf.nDataView).disabled = false;    
    oSelf.oTabView.set('activeIndex', oSelf.nDataView); 
};

YAHOO.yazaar.FlevBase.prototype.getSelectedRecord = function() {
    var dt = this.oDataList;
    var rs = dt.getRecordSet();
    var row = dt.getSelectedRecordIds();
    if (row.length===0) {
        dt.getRow(0); // No row was selected
        row = dt.getSelectedRecordIds();
    }
    var oRecord = rs.getRecord(row[row.length-1]); // ISSUE: Returns row selected on each page
    return oRecord;
};

/**
 * Creates DataTable and DataForm widgets, initializes objects with response data.
 * Intended for use at initial load only. 
 * @param {Object} oData Incoming data in RPC response format
 * @param {Object} oSelf Runtme reference to object instance
 * @method onLoadReturn
 */
YAHOO.yazaar.FlevBase.prototype.onLoadReturn = function(oData,oSelf) {
        // previously defined
        var oColumnHeaders = oSelf.oColumnHeaders;
        var oResponseSchema = oSelf.oResponseSchema;
        var oListConfigs = oSelf.oListConfigs;
        var sDataFind = oSelf.sDataFind;
        var sDataList = oSelf.sDataList;
        var sDataView = oSelf.sDataView;
        var sDataEdit = oSelf.sDataEdit;
        var sTabView = oSelf.sTabView;
        // to be defined
        var oColumnSet, oDataSource, oDataFind, oDataList, oDataView, oDataEdit, oTabView;

        // Setup DataList
        oColumnSet = new YAHOO.widget.ColumnSet(oColumnHeaders);
        oDataSource = new YAHOO.util.DataSource(oData.result);
            oDataSource.responseType = YAHOO.util.DataSource.TYPE_JSARRAY;
            oDataSource.responseSchema = oResponseSchema;
        oListConfigs.nInitMode = YAHOO.yazaar.DataForm.INIT_LIST;            
        oDataList = new YAHOO.dpu.widget.DataTable(sDataList, oColumnSet, oDataSource, oListConfigs);

        // Hack loading message        
        var elCell = oDataList._elMsgCell;
        elCell.innerHTML = YAHOO.yazaar.FlevBase.MSG_CRITERIA;
        
        // Enable DataTable Row Selection
        oDataList.subscribe("cellClickEvent",oDataList.onEventSelectRow);
        oDataList.select(oDataList.getRow(0));

        // Create our own event for selecting the record behind a row
        oDataList.createEvent("recordSelectEvent");

        // Raise our event when a row is selected
        var onRowClickEvent = function(oEvent,oFlev) {
            var oRecord = oFlev.getSelectedRecord();
            oFlev.oDataList.fireEvent("recordSelectEvent",{record:oRecord});
            YAHOO.log("Selected Record: " + oRecord.toJSONString());
        };
        oDataList.subscribe("cellClickEvent", onRowClickEvent,oSelf);
        // TODO: oDataList.subscribe("dataReturnEvent",oSelf.initFilter,oSelf);

        // On List select, populate form
        var onRecordSelectEvent = function () {
          oDataEdit.populateForm();
          // TODO: Clarify the meaning "no View" mode.
          if (oSelf.nDataView!=oSelf.nDataEdit) oDataView.populateForm(); 
          // oTabView.set('activeIndex', oSelf.nDataView); // Switch to view tab
        };
        oDataList.subscribe("recordSelectEvent", onRecordSelectEvent);
        
        // Setup DataView
        oSelf.oViewConfigs.oDataList = oDataList;
        oSelf.oViewConfigs.nInitMode = YAHOO.yazaar.DataForm.INIT_VIEW;
        oDataView = new YAHOO.yazaar.DataForm(sDataView, oColumnSet, oDataSource, oSelf.oViewConfigs);
        oDataView.subscribe("cancelEvent", oSelf.onExitView, oSelf);
        oDataView.subscribe("deleteEvent", oSelf.onDelete, oSelf);
        oDataView.subscribe("insertEvent", oSelf.onInsert, oSelf);
        oDataView.subscribe("updateEvent", oSelf.onUpdate, oSelf);
        oDataView.subscribe("insertFormEvent", oSelf.onInsertForm, oSelf);
        oDataView.subscribe("updateFormEvent", oSelf.onUpdateForm, oSelf);
        oDataView.subscribe("refreshEvent", oSelf.onRefresh, oSelf);
        
        // Setup DataEdit
        oSelf.oEditConfigs.oDataList = oDataList;
        oSelf.oEditConfigs.nInitMode = YAHOO.yazaar.DataForm.INIT_EDIT;
        oDataEdit = new YAHOO.yazaar.DataForm(sDataEdit, oColumnSet, oDataSource, oSelf.oEditConfigs);
        oDataEdit.subscribe("cancelEvent", oSelf.onExitEdit, oSelf);
        oDataEdit.subscribe("insertEvent", oSelf.onInsert, oSelf);
        oDataEdit.subscribe("updateEvent", oSelf.onUpdate, oSelf);

        // Setup DataFind
        oSelf.oFindConfigs.oDataList = oDataList;
        oSelf.oFindConfigs.nInitMode = YAHOO.yazaar.DataForm.INIT_FIND;
        oDataFind = new YAHOO.yazaar.DataForm(sDataFind, oColumnSet, oDataSource, oSelf.oFindConfigs);
        oDataFind.subscribe("criteriaEvent", oSelf.onCriteria, oSelf);
        oDataFind.doReset();

        // Setup TabView
        oTabView = new YAHOO.widget.TabView(sTabView);
            // FIXME: Disabling doesn't seem to work
            oTabView.getTab(oSelf.nDataFind).disabled = true;
            oTabView.getTab(oSelf.nDataList).disabled = true;
            oTabView.getTab(oSelf.nDataEdit).disabled = true;
            oTabView.getTab(oSelf.nDataView).disabled = true;

        // Prompt before changing tabs
        var onBeforeActiveTabChange = function(e) {
          if (!oDataEdit.isActive) return true;
          var isChanged = oDataEdit.isRecordChanged();
          if (isChanged) {
            var isExit = confirm("Exit form without saving?");
            if (isExit) {
                oDataEdit.doReset();
            }
            return isExit;
          } else {
            return true;
          }
        };
        oTabView.on('beforeActiveTabChange', onBeforeActiveTabChange);

        // Set flag when form is in view
        var onActiveTabChange = function(e) {
            oDataEdit.isActive = (oSelf.nDataEdit==oTabView.get('activeIndex')); 
        };
        oTabView.on('activeTabChange', onActiveTabChange);

        // TODO: YAHOO.util.Event.onAvailable(sDataFind, function(){oSelf.initFilter(null,oSelf);});

        // Retain references
        oSelf.oColumnSet = oColumnSet;
        oSelf.oDataSource = oDataSource;
        oSelf.oDataFind = oDataFind;
        oSelf.oDataList = oDataList;
        oSelf.oDataView = oDataView;
        oSelf.oDataEdit = oDataEdit;
        oSelf.oTabView = oTabView;
        oSelf.fireEvent("contentReady",oSelf);
        YAHOO.log("Data widget loaded", "info", this.toString());        
        
        oSelf.doGotoFind(oSelf);
        oSelf.fireEvent("loadEvent");                
    };

/**
 * Public accessor to the unique name of the widget instance.
 *
 * @method toString
 * @return {String} Unique name of the DataSource instance.
 */

YAHOO.yazaar.FlevBase.prototype.toString = function() {
    return "FlevBase " + this._sName;
};


/////////////////////////////////////////////////////////////////////////////
//
// Public Custom Event Handlers
//
/////////////////////////////////////////////////////////////////////////////

/**
 * Configures autocomplete filtering. Called in response to DataReturnEvent.
 * @param {Object} oData Datastream to filter or null to use DataSource
 * @param {Object} oSelf DataTable instance
 * @method initFilter
 */
YAHOO.yazaar.FlevBase.prototype.initFilter = function (oData,oSelf) {

    oSelf.oFilter = new YAHOO.widget.Overlay(oSelf.sListFilter);
    oSelf.oFilter.render();

    var list = null;
    if ((oData) && (oData.response)) {
        list = oData.response;
    } else {
        list = oSelf.oDataSource.liveData;
    }
    oSelf.fnFilter= new YAHOO.dpu.util.StringFilter(list,oSelf.sItemName);
    oSelf.fnFilter.maxCacheEntries = 0;
    var sInput = oSelf.sListForm + "_input";
    var sMatch = oSelf.sListForm + "_match";
    var oAutoComplete = new YAHOO.dpu.widget.RowFilter(sInput,sMatch,oSelf.oDataList,oSelf.fnFilter);
    var ua = navigator.userAgent.toLowerCase();
    if(ua.indexOf('msie') != -1 && ua.indexOf('opera') < 0) {
        oAutoComplete.useIFrame = true;
    }
    
    // Goto to DataList
    var onItemSelectEvent = function (sType,aArgs,oSelf) {
        oSelf.oTabView.set('activeIndex', oSelf.nDataList); 
    };
    oAutoComplete.itemSelectEvent.subscribe(onItemSelectEvent,oSelf); 

    oSelf.oAutoComplete = oAutoComplete;    
};

/**
 * Handles deleteEvent raised by View by confirm the operation and removing the record from the record set.
 * To persist changes, override this method, and delete the record from any related DataTable, 
 * or the DataForm (but not both).
 * @method onDelete
 */
YAHOO.yazaar.FlevBase.prototype.onDelete = function (oData,oSelf) {
    var isExit = confirm("Delete this record?");
    if (isExit) {
        oSelf.doExitView(oSelf); 
        var oRecord = oSelf.oDataEdit.getSelectedRecord();
        oSelf.oDataEdit.deleteRecord(oRecord.yuiRecordId);
        oSelf.oDataList.populateTable();
        oSelf.oDataList.showPage(oSelf.oDataList._paginator.currentPage);                        
    }   
};

/**
 * Handles a custom event by delegating to doExitEdit. 
 *
 * @method onExitEdit
 */
YAHOO.yazaar.FlevBase.prototype.onExitEdit = function (oData,oSelf) {
    oSelf.doExitEdit(oSelf);
};

/**
 * Handles a custom event by delegating to exitList. 
 *
 * @method onExitList
 */
YAHOO.yazaar.FlevBase.prototype.onExitList = function (oData,oSelf) {
    oSelf.doExitList(oSelf);
};

/**
 * Handles a custom event by delegating to exitView. 
 *
 * @method onExitView
 */
YAHOO.yazaar.FlevBase.prototype.onExitView = function (oData,oSelf) {
    oSelf.doExitView(oSelf);
};

/**
 * Change the autocomplete field.
 * Must be wired to an input control via an onChange handler.
 *
 * @method onFilterChange
 */
YAHOO.yazaar.FlevBase.prototype.onFilterChange = function () {
    var sItem = this.sListForm + "_item";
    var el = document.getElementById(sItem);
    var item = el.options[el.selectedIndex].value;
    this.fnFilter.schemaItem = item;
};

/**
 * Handles insertEvent raised by Edit by switching displays.
 * To persist changes, override or replace this method.
 *
 * @method onInsert
 */
YAHOO.yazaar.FlevBase.prototype.onInsert = function (oEvent,oSelf) {
    if (oSelf) oSelf.doExitEdit(oSelf);
};

/**
 * Handles insertFormEvent raised by View by switching displays.
 *
 * @method onInsertForm
 */
YAHOO.yazaar.FlevBase.prototype.onInsertForm = function (oEvent,oSelf) {    
    if (oSelf) {
        oSelf.oDataEdit.doInsertForm();
        oSelf.doGotoEdit(oSelf);
    }
};

/**
 * Handles updateEvent raised by Edit by switching displays.
 * To persist changes, override this method.
 *
 * @method onUpdate
 */
YAHOO.yazaar.FlevBase.prototype.onUpdate = function (oEvent,oSelf) {
    if (oSelf) oSelf.doExitEdit(oSelf);
};

/**
 * Handles updateFormEvent raised by View.
 *
 * @method onUpdateForm
 */
YAHOO.yazaar.FlevBase.prototype.onUpdateForm = function (oEvent,oSelf) {
    oSelf.oDataEdit.populateForm();
    oSelf.doGotoEdit(oSelf);
};

/**
 * Handles viewFormEvent raised by List.
 *
 * @method onViewForm
 */
YAHOO.yazaar.FlevBase.prototype.onViewForm = function (oEvent,oSelf) {
    oSelf.oDataView.populateForm(); 
    oSelf.doGotoView(oSelf);
};


/**
 * Provides a base event handler object. 
 */
YAHOO.yazaar.DataEvents = function() {
    return this;
};
YAHOO.lang.augment(YAHOO.yazaar.DataEvents, YAHOO.util.EventProvider);        

/**
 * Extends FlevBase with service methods 
 * for interacting with a remote database. 
 */
YAHOO.yazaar.DataService = function() {
    YAHOO.yazaar.DataService.superclass.constructor.call(this);    
    this.oEvents = new YAHOO.yazaar.DataEvents();
    this.setupEvents(this);
};
YAHOO.lang.extend(YAHOO.yazaar.DataService, YAHOO.yazaar.FlevBase);

YAHOO.yazaar.DataService.prototype.setupEvents = function(oSelf) {
    oSelf.createEventHandler("CriteriaReturnEvent", oSelf.onCriteriaReturn, oSelf);
    oSelf.createEventHandler("DeleteReturnEvent", oSelf.onDeleteReturn, oSelf);
    oSelf.createEventHandler("LoadReturnEvent", oSelf.onLoadReturn, oSelf);
    oSelf.createEventHandler("SaveReturnEvent", oSelf.onSaveReturn, oSelf);
    oSelf.createEventHandler("SessionReturnEvent", oSelf.onSessionReturn, oSelf);
};

YAHOO.yazaar.DataService.prototype.parseEventName = function(sEvent) {
        var last, i, trim, sHandler;
        i = sEvent.substring(0,1).toUpperCase();
        trim = sEvent.lastIndexOf("Event");
        last = (trim>0) ? trim : sEvent.length;
        sHandler = "on" + i + sEvent.substring(1,last);
        return sHandler;    
    };
    
    // Create event, add handler function to oEvents, and subscribe handler to event
YAHOO.yazaar.DataService.prototype.createEventHandler = function(sEvent, fnEvent, oTarget) {    
        var sHandler = this.parseEventName(sEvent);
        oTarget.oEvents.createEvent(sEvent); 
        oTarget.oEvents[sHandler] = function(oData) {
            // my.info(sEvent); // debug
            // my.loading(false);
            oTarget.oEvents.fireEvent(sEvent, oData);
        };
        oTarget.oEvents.subscribe(sEvent, fnEvent, oTarget);        
    };

YAHOO.yazaar.DataService.prototype.loading = function(isLoading) {
    // Override to provide functionality
};

YAHOO.yazaar.DataService.prototype.message = function(sMessage) {
    // Override to provide functionality
};

YAHOO.yazaar.DataService.prototype.oEvents = null;

YAHOO.yazaar.DataService.prototype.oListConfigs = {
    caption: "Entry List",
    summary: "List of matching entries",
    paginator:true,
        paginatorOptions: {
        rowsPerPage: 10,
        dropdownOptions: [10,100,1000],
        pageLinks: 5
    },
    rowSingleSelect: true
};

YAHOO.yazaar.DataService.prototype.oServices = null;

YAHOO.yazaar.DataService.prototype.onDelete = function (oData,oSelf) {
    var isExit = confirm("Delete this entry?");
    if (isExit) {
        oSelf.loading(true);
        oSelf.doExitView(oSelf); 
        var oValues = oSelf.oDataEdit.getSelectedRecord();
        oSelf.oServices.doDelete(oValues,oSelf.oEvents.onDeleteReturn).call(ANVIL.channel);
    }   
};

YAHOO.yazaar.DataService.prototype.onDeleteReturn = function(oData,oSelf) {
    var sIdentifier = oData.result.values.yuiRecordId;
    oSelf.oDataEdit.deleteRecord(sIdentifier);
    oSelf.oDataList.populateTable();
    oSelf.oDataList.showPage(oSelf.oDataList._paginator.currentPage);
    oSelf.oDataView.doInsertForm(); // clear form    
    oSelf.doExitView(oSelf);
    oSelf.loading(false);
    oSelf.message(oData.result.message);
};


YAHOO.yazaar.DataService.prototype.oCriteria = {};

/**
 * Handles criteriaEvent raised by Find by opening a data channel.
 *
 * @method onCriteria
 */
YAHOO.yazaar.DataService.prototype.onCriteria = function(oEvent,oSelf) { 
    var oValues = oEvent.oRecord;
    oSelf.loading(true);
    oSelf.oCriteria = oValues;
    oSelf.oServices.doList(oValues,oSelf.oEvents.onCriteriaReturn).call(ANVIL.channel);
};

YAHOO.yazaar.DataService.prototype.onCriteriaReturn = function(oData,oSelf) {
    var oValues = oData.result.values;    
    var oDataList = oSelf.oDataList;  
    // Refresh list                      
    var refreshedRecords = oDataList.getRecordSet().replace(oValues);
    oDataList.replaceRows(refreshedRecords);                         
    oDataList.showPage();
    oDataList.selectRow(oDataList.getFirstRow());
    // Refresh edit, view
    var sIdentifier = oValues.yuiRecordId;
    var oRecord = oSelf.oDataEdit._oRecordSet.getRecord(sIdentifier);
    if (oRecord) oSelf.oDataEdit.populateForm(oRecord); 
    oSelf.oDataEdit.doInsertForm(); // clear form
    oSelf.doGotoList(oSelf);
    oSelf.loading(false);
    oSelf.message(oData.result.message);    
};
        
YAHOO.yazaar.DataService.prototype.onInsert = function (oData,oSelf) {
    var oValues = oData.oRecord;
    oSelf.loading(true);
    oSelf.oServices.doSave(oValues,oSelf.oEvents.onSaveReturn).call(ANVIL.channel);
};

YAHOO.yazaar.DataService.prototype.onLoad = function(oData,oSelf) { 
    oSelf.loading(true);
    oSelf.oServices.doLoad(oData,oSelf.oEvents.onLoadReturn).call(ANVIL.channel);
};

YAHOO.yazaar.DataService.prototype.onSessionReturn = function(oData,oSelf) {
    ; // override to provide functionality
};

YAHOO.yazaar.DataService.prototype.onRefresh = function (oEvent,oSelf) {    
    oSelf.loading(true);
    oSelf.oServices.doList(oSelf.oCriteria,oSelf.oEvents.onCriteriaReturn).call(ANVIL.channel);
    oSelf.oServices.doLoad({},oSelf.oEvents.onSessionReturn).call(ANVIL.channel);
};

YAHOO.yazaar.DataService.prototype.onSaveReturn = function(oData,oSelf) {
    var oValues = oData.result.values;
    var sIdentifier = oValues.yuiRecordId;
    var oRecord = oSelf.oDataEdit._oRecordSet.getRecord(sIdentifier);
    // Update the local record with any values returned from server
    for (var prop in oValues) {
        oRecord[prop] = oValues[prop];
    }
    oSelf.oDataList.showPage(oSelf.oDataList._paginator.currentPage);                        
    oSelf.oDataEdit.populateForm(oRecord); 
    oSelf.oDataEdit.doInsertForm(); // clear form    
    oSelf.doExitEdit(oSelf);
    oSelf.loading(false);
    oSelf.message(oData.result.message);
};
        
YAHOO.yazaar.DataService.prototype.onUpdate = function (oData,oSelf) {
    var oValues = oData.oRecord;
    oSelf.loading(true);
    oSelf.oServices.doSave(oValues,oSelf.oEvents.onSaveReturn).call(ANVIL.channel);
};

// Configure standard DataMenu; subclass can call method from load method
YAHOO.yazaar.DataService.prototype.setupDataMenu = function(oDataMenu,oSelf) {
    oDataMenu.subscribe("cancelEvent", oSelf.onExitList, oSelf);
    oDataMenu.subscribe("deleteEvent", oSelf.onDelete, oSelf);
    oDataMenu.subscribe("insertFormEvent", oSelf.onInsertForm, oSelf);
    oDataMenu.subscribe("updateFormEvent", oSelf.onUpdateForm, oSelf);
    oDataMenu.subscribe("viewFormEvent", oSelf.onViewForm, oSelf);     
    oDataMenu.subscribe("refreshEvent", oSelf.onRefresh, oSelf);                   
    oSelf.oDataMenu = oDataMenu;
};

YAHOO.yazaar.DataService.prototype.setSessionOptions = function(options,oSelf) {       
    oSelf.oFindConfigs["oSession"] = options;
    oSelf.oViewConfigs["oSession"] = options;
    oSelf.oEditConfigs["oSession"] = options;
};