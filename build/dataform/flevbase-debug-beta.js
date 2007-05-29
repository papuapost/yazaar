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
 * Properites that may be configured oListConfigs, sDataFind, sDataList, sDataView,
 * sDataEdit, sTabView, sListForm, sItemName.
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

/**
 * Array of object literals that define header cells for the ColumnSet.
 * At a minimum, each object should contain a key and a text property.
 * Must be configured.
 */
YAHOO.yazaar.FlevBase.prototype.oColumnHeaders = null;

/**
 * Object literal that describes how data is formatted in the response.
 * Must be configured.
 */
YAHOO.yazaar.FlevBase.prototype.oResponseSchema = null;

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

/**
 * Initial autocomplete field name.
 * Must be configured.
 */
YAHOO.yazaar.FlevBase.prototype.sItemName = null;

/**
 * ColumnSet instance created by load method.
 */
YAHOO.yazaar.FlevBase.prototype.oColumnSet = null;

/**
 * DataSource instance created by load method.
 */
YAHOO.yazaar.FlevBase.prototype.oDataSource = null;

/**
 * DataFind widget instance created by load method.
 */
YAHOO.yazaar.FlevBase.prototype.oDataFind = null;

/**
 * DataList widget instance created by load method.
 */
YAHOO.yazaar.FlevBase.prototype.oDataList = null;

/**
 * DataEdit instance created by this object.
 */
YAHOO.yazaar.FlevBase.prototype.oDataEdit = null;

/**
 * Instance created by load method.
 */
YAHOO.yazaar.FlevBase.prototype.oDataView = null;

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
 * TabView instance created by this object.
 */
YAHOO.yazaar.FlevBase.prototype.oTabView = null;

/**
 * Autocomplete filter instance created by load method.
 */
YAHOO.yazaar.FlevBase.prototype.fnFilter = null;

/**
 * AutoComplete (RowFilter instance. 
 */
YAHOO.yazaar.FlevBase.prototype.oAutoComplete = null;

/**
 * Form configuration instance created by load method.
 */
YAHOO.yazaar.FlevBase.prototype.oFormConfigs = {};

/**
 * Exits Edit and activates View.
 */
YAHOO.yazaar.FlevBase.prototype.exitEdit = function() {
    this.oTabView.set('activeIndex', this.nDataView); // TODO: List or View?
};

/**
 * Handles updateEvent raised by Edit.
 * To persist changes, override or replace this method.
 */
YAHOO.yazaar.FlevBase.prototype.onUpdate = function (oData,oSelf) {
    oSelf.exitEdit();
};

/**
 * Handles updateEvent raised by Edit.
 * To persist changes, override or replace this method.
 */
YAHOO.yazaar.FlevBase.prototype.onCancel = function (oData,oSelf) {
    oSelf.exitEdit();
};

/**
 * Create DataTable and DataForm widgets, initialize objects with response data.
 * Intended for use at initial load only. 
 * @param {Object} oData Incoming data in RPC response format
 * @param {Object} oSelf Runtme reference to object instance
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
        var oColumnSet, oDataSource, oDataFind, oDataList, oDataView, oDataEdit, oFormConfigs,oTabView;

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
          this.fireEvent("recordSelectEvent",{record:oRecord});
          YAHOO.log("Selected Record: " + oRecord.toJSONString());
        };
        oDataList.subscribe("cellClickEvent", onRowClickEvent);

        // Setup DataForm
        oSelf.oFormConfigs["oDataList"] = oDataList;
        oDataEdit = new YAHOO.yazaar.DataForm(sDataEdit, oColumnSet, oDataSource, oSelf.oFormConfigs);
        oDataList.subscribe("dataReturnEvent",oSelf.initFilter,oSelf);

        // Setup tabview
        oTabView = new YAHOO.widget.TabView(sTabView);

        // Goto to DataEdit
        var onRecordSelectEvent = function () {
          oDataEdit.populateForm();
          oTabView.set('activeIndex', oSelf.nDataEdit); // TODO: Change to nDataView?
        };
        oDataList.subscribe("recordSelectEvent", onRecordSelectEvent);

        oDataEdit.subscribe("updateEvent", oSelf.onUpdate, oSelf);
        oDataEdit.subscribe("cancelEvent", oSelf.onCancel, oSelf);

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
            oDataEdit.isActive = (3==oTabView.get('activeIndex')); // TODO: nDataEdit
        };
        oTabView.on('activeTabChange', onActiveTabChange);

        YAHOO.util.Event.onAvailable(sDataFind, function(){oSelf.initFilter(null,oSelf)});

        // Retain references
        oSelf.oColumnSet = oColumnSet;
        oSelf.oDataSource = oDataSource;
        oSelf.oFormConfigs = oFormConfigs;
        oSelf.oDataList = oDataList;
        oSelf.oDataEdit = oDataEdit;
        oSelf.oTabView = oTabView;
    };

/**
 * Setup autocomplete filtering. Called in response to DataReturnEvent.
 * @param {Object} oData
 * @param {Object} oSelf
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
        var oFlev = oSelf;
        var oTabView = oFlev.oTabView;
        oTabView.set('activeIndex', oSelf.nDataList); 
    };
    oAutoComplete.itemSelectEvent.subscribe(onItemSelectEvent,oSelf); 

    oSelf.oAutoComplete = oAutoComplete;    
};

/**
 * Change the autocomplete field.
 * Must be wired to an input control via an onChange handler.
 */
YAHOO.yazaar.FlevBase.prototype.onFilterChange = function () {
    var sItem = this.sListForm + "_item";
    var el = document.getElementById(sItem);
    var item = el.options[el.selectedIndex].value;
    this.fnFilter.schemaItem = item;
};
