/*
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
 * @alpha
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
 * The client application must provide a dataset for the load
 * method, which may be a RPC result object, or another
 * object designed to resemble a RPC result object.
 * All property changes must be made before load is called.
 * <p />
 * Properties that must be configured are oColumnHeaders and oResponseSchema.
 * Properties that may be configured oListConfigs, oViewConfigs, oEditConfigs, 
 * sDataFind, sDataList, sDataView, sDataEdit, sTabView, sListForm, sItemName.
 * Methods that may be configured are onInsert, onUpdate, onDelete, onCancel, and onReset.
 *
 * @constructor
 * @param oConfigs {object} (optional) Object literal of configuration values.
 */
YAHOO.yazaar.FlevBase = function(oConfigs) {
    // Validate and apply any configuration settings
    if(oConfigs && (oConfigs.constructor == Object)) {
        for(var sConfig in oConfigs) {
            this[sConfig] = oConfigs[sConfig];
        }
    }
    return this;
};

/**
 * Augments FlevBase constructor with event provider members.
 */
YAHOO.augment(YAHOO.yazaar.FlevBase, YAHOO.util.EventProvider);

/////////////////////////////////////////////////////////////////////////////
//
// Public Properties (initialized to default values)
//
/////////////////////////////////////////////////////////////////////////////

/**
 * Relative menu index of DataFind
 */
YAHOO.yazaar.FlevBase.prototype.nDataFind = 0;

/**
 * Relative menu index of DataList
 */
YAHOO.yazaar.FlevBase.prototype.nDataList = 1;

/**
 * Relative menu index of DataView
 */
YAHOO.yazaar.FlevBase.prototype.nDataView = 2;

/**
 * Relative menu index of DataEdit
 */
YAHOO.yazaar.FlevBase.prototype.nDataEdit = 3;

/**
 * Edit form configuration instance created by load method.
 */
YAHOO.yazaar.FlevBase.prototype.oEditConfigs = {};

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
 * View form configuration instance created by load method.
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
 * Autocomplete filter instance created by load method.
 */
YAHOO.yazaar.FlevBase.prototype.fnFilter = null;

/**
 * AutoComplete (RowFilter instance. 
 */
YAHOO.yazaar.FlevBase.prototype.oAutoComplete = null;

/**
 * ColumnSet instance created by load method.
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
 * DataFind widget instance created by load method.
 */
YAHOO.yazaar.FlevBase.prototype.oDataFind = null;

/**
 * DataList widget instance created by load method.
 */
YAHOO.yazaar.FlevBase.prototype.oDataList = null;

/**
 * DataSource instance created by load method.
 */
YAHOO.yazaar.FlevBase.prototype.oDataSource = null;

/**
 * Instance created by load method.
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
 * @method exitEdit
 */
YAHOO.yazaar.FlevBase.prototype.exitEdit = function(oSelf) {
    if (oSelf) oSelf.oTabView.set('activeIndex', oSelf.nDataList); 
};

/**
 * Exits View and activates List.
 * Override to activate a different display. 
 * @method exitView
 */
YAHOO.yazaar.FlevBase.prototype.exitView = function(oSelf) {
    if (oSelf) oSelf.oTabView.set('activeIndex', oSelf.nDataList); 
};

/**
 * Activates Edit.
 * @method gotoEdit
 */
YAHOO.yazaar.FlevBase.prototype.gotoEdit = function(oSelf) {
    if (oSelf) oSelf.oTabView.set('activeIndex', oSelf.nDataEdit); 
};

/**
 * Creates DataTable and DataForm widgets, initializes objects with response data.
 * Intended for use at initial load only. 
 * @param {Object} oData Incoming data in RPC response format
 * @param {Object} oSelf Runtme reference to object instance
 * @method load
 */
YAHOO.yazaar.FlevBase.prototype.load = function(oData,oSelf) {
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

        oColumnSet = new YAHOO.widget.ColumnSet(oColumnHeaders);
        oDataSource = new YAHOO.util.DataSource(oData.result);
            oDataSource.responseType = YAHOO.util.DataSource.TYPE_JSARRAY;
            oDataSource.responseSchema = oResponseSchema;
        oDataList = new YAHOO.dpu.widget.DataTable(sDataList, oColumnSet, oDataSource, oListConfigs);

        // Enable DataTable Row Selection
        oDataList.subscribe("cellClickEvent",oDataList.onEventSelectRow);
        oDataList.select(oDataList.getRow(0));

        // Create our own event for selecting the record behind a row
        oDataList.createEvent("recordSelectEvent");

        // Raise our event when a row is selected
        var onRowClickEvent = function(oArgs) {
            var dt = oDataList;
            var rs = dt.getRecordSet();
            var row = dt.getSelectedRecordIds();
            if (row.length===0) {
                dt.getRow(0); // No row was selected
                row = dt.getSelectedRecordIds();
            }
            var oRecord = rs.getRecord(row[row.length-1]); // ISSUE: Returns row selected on each page

          // Raise RecordSelectEvent with payload
          oDataList.fireEvent("recordSelectEvent",{record:oRecord});
          YAHOO.log("Selected Record: " + oRecord.toJSONString());
        };
        oDataList.subscribe("cellClickEvent", onRowClickEvent);
        oDataList.subscribe("dataReturnEvent",oSelf.initFilter,oSelf);

        // On List select, goto View. 
        var onRecordSelectEvent = function () {
          oDataView.populateForm();
          oDataEdit.populateForm();
          oTabView.set('activeIndex', oSelf.nDataView);
        };
        oDataList.subscribe("recordSelectEvent", onRecordSelectEvent);
        
        // Setup DataView
        oSelf.oViewConfigs.oDataList = oDataList;
        oSelf.oViewConfigs.isDisabled = true;
        oDataView = new YAHOO.yazaar.DataForm(sDataView, oColumnSet, oDataSource, oSelf.oViewConfigs);
        oDataView.subscribe("cancelEvent", oSelf.onExitView, oSelf);
        oDataView.subscribe("deleteEvent", oSelf.onDelete, oSelf);
        oDataView.subscribe("insertEvent", oSelf.onInsert, oSelf);
        oDataView.subscribe("updateEvent", oSelf.onUpdate, oSelf);
        oDataView.subscribe("insertFormEvent", oSelf.onInsertForm, oSelf);
        oDataView.subscribe("updateFormEvent", oSelf.onUpdateForm, oSelf);

        // Setup DataEdit
        oSelf.oEditConfigs.oDataList = oDataList;
        oDataEdit = new YAHOO.yazaar.DataForm(sDataEdit, oColumnSet, oDataSource, oSelf.oEditConfigs);
        oDataEdit.subscribe("cancelEvent", oSelf.onExitEdit, oSelf);
        oDataEdit.subscribe("updateEvent", oSelf.onUpdate, oSelf);

        // Setup TabView
        oTabView = new YAHOO.widget.TabView(sTabView);

        // Prompt before changing tabs
        var onBeforeActiveTabChange = function(e) {
          if (!oDataEdit.isActive) return true;
          var isChanged = oDataEdit.isRecordChanged();
          if (isChanged) {
            var isExit = confirm("Exit form without saving?");
            if (isExit) {
                oDataEdit.reset();
            }
            return isExit;
          } else {
            return true;
          }
        };
        oTabView.on('beforeActiveTabChange', onBeforeActiveTabChange);

        // Set flag when form is in view
        var onActiveTabChange = function(e) {
            oDataEdit.isActive = (oSelf.nDataEdit==oTabView.get('activeIndex')); // TODO: nDataEdit
        };
        oTabView.on('activeTabChange', onActiveTabChange);

        YAHOO.util.Event.onAvailable(sDataFind, function(){oSelf.initFilter(null,oSelf)});

        // Retain references
        oSelf.oColumnSet = oColumnSet;
        oSelf.oDataSource = oDataSource;
        oSelf.oDataList = oDataList;
        oSelf.oDataView = oDataView;
        oSelf.oDataEdit = oDataEdit;
        oSelf.oTabView = oTabView;
    };

/////////////////////////////////////////////////////////////////////////////
//
// Public Custom Event Handlers
//
/////////////////////////////////////////////////////////////////////////////

/**
 * Configures autocomplete filtering. Called in response to DataReturnEvent.
 * @param {Object} oData
 * @param {Object} oSelf
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
        oSelf.exitView(oSelf); 
        var oRecord = oSelf.oDataEdit.getSelectedRecord();
        oSelf.oDataEdit.deleteRecord(oRecord.yuiRecordId);
        oSelf.oDataList.populateTable();
        oSelf.oDataList.showPage(oSelf.oDataList.pageCurrent);
    }   
};

/**
 * Handles updateEvent raised by Edit by switching displays.
 * To persist changes, override this method.
 * @method onExitEdit
 */
YAHOO.yazaar.FlevBase.prototype.onExitEdit = function (oData,oSelf) {
    oSelf.exitEdit(oSelf);
};

/**
 * Handles updateEvent raised by Edit by switching displays..
 * To persist changes, override or replace this method.
 * @method onExitView
 */
YAHOO.yazaar.FlevBase.prototype.onExitView = function (oData,oSelf) {
    oSelf.exitView(oSelf);
};

/**
 * Change the autocomplete field.
 * Must be wired to an input control via an onChange handler.
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
 * @method onInsert
 */
YAHOO.yazaar.FlevBase.prototype.onInsert = function (oData,oSelf) {
    if (oSelf) oSelf.exitEdit(oSelf);
};

/**
 * Handles insertFormEvent raised by View by switching displays.
 * @method onInsertForm
 */
YAHOO.yazaar.FlevBase.prototype.onInsertForm = function (oData,oSelf) {    
    if (oSelf) {
        oSelf.oDataEdit.insertForm();
        oSelf.gotoEdit(oSelf);
    }
};

/**
 * Handles updateEvent raised by Edit by switching displays.
 * To persist changes, override this method.
 * @method onUpdate
 */
YAHOO.yazaar.FlevBase.prototype.onUpdate = function (oData,oSelf) {
    if (oSelf) oSelf.exitEdit(oSelf);
};

/**
 * Handles updateFormEvent raised by View.
 * @method onUpdateForm
 */
YAHOO.yazaar.FlevBase.prototype.onUpdateForm = function (oData,oSelf) {
    if (oSelf) oSelf.gotoEdit(oSelf);
};
