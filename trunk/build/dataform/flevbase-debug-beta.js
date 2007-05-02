/*
Copyright (c) 2007, Husted dot Com, Inc. All rights reserved.
Portions Copyright (c) 2007, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
*/
/**
 * The FlevBase object combines a DataForm, DataView, and TabView to create 
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
 * convenience of a full-featured edint form.
 * 
 * @see DataForm, TabView, DataView
 * @module yazaar.dataform
 * @requires yahoo, dom, event, datasource, RowFilter, DataView, DataForm, Element, TabView, remedial, json
 * @title FLEV base widget
 * @alpha
*/
/**
 * Pseudo constructor.
 * <p />
 * Creates a base FLEV widget that must be configured
 * by a "power constructor" before use.
 * <p />
 * The properties to be configured are oColumnHeaders, oResponseSchema, 
 * sDataTable, oConfigs, sDataForm, sTabView, sListForm, sItemName.
 * The client application must also provide a dataset for the load 
 * method. 
 */
var FlevBase = function() { 
    // return public members
    return {
        
        /**
         * Array of object literals that define header cells for the ColumnSet. 
         * At a minimum, each object should contain a key and a text property.
         * Must be configured.
         */
        oColumnHeaders: null,
        
        /**
         * Description of how data is formatted in the response.
         * Must be configured.
         */         
        oResponseSchema: null,
        
        /**
         * DOM ID for the DataTable container (div).
         * Must be configured.
         */
        sDataTable: null,
        
        /**
         * Array of object literals that define the DataTable configuration.
         * Must be configured.
         */
        oConfigs: null,
        
        /**
         * DOM ID for the DataForm container (div).
         * Must be configured.
         */ 
        sDataForm: null,
        
        /**
         * DOM ID for the TabView container (div).
         * Must be configured.
         */ 
        sTabView: null,
        
        /**
         * DOM ID for the List Form control (filters list entries). 
         * Must be configured.
         */
        sListForm: null,
        
        /**
         * Initial autocomplete field name.
         * Must be configured.
         */
        sItemName: null, 
        
        /**
         * Instance created by this object.
         */
        oColumnSet: null,
        
        /**
         * Instance created by this object.
         */
        oDataSource: null,

        /**
         * Instance created by this object.
         */
        oDataTable: null, 

        /**
         * Instance created by this object.
         */
        oDataForm: null,

        /**
         * Instance created by this object.
         */
        oTabView: null,

        /**
         * Instance created by this object.
         */     
        fnFilter: null,
        
        /**
         * Instance created by this object.
         */     
        oFormConfigs: null,
        
        /**
         * Initialize object with response data. 
         * @param {Object} oData
         * @param {Object} oSelf
         */
        load: function(oData,oSelf) {
            // previously defined
            var oColumnHeaders = oSelf.oColumnHeaders;
            var oResponseSchema = oSelf.oResponseSchema;
            var sDataTable = oSelf.sDataTable;
            var oConfigs = oSelf.oConfigs; 
            var sDataForm = oSelf.sDataForm;
            var sTabView = oSelf.sTabView;
            // to be defined
            var oColumnSet, oDataSource, oDataTable, oFormConfigs, oDataForm, oTabView;
            
            oColumnSet = new YAHOO.widget.ColumnSet(oColumnHeaders);
            oDataSource = new YAHOO.util.DataSource(oData.result);
                oDataSource.responseType = YAHOO.util.DataSource.TYPE_JSARRAY;            
                oDataSource.responseSchema = oResponseSchema;
            oDataTable = new YAHOO.dpu.widget.DataTable(sDataTable, oColumnSet, oDataSource, oConfigs);
            
            // Enable DataTable Row Selection
            oDataTable.subscribe("cellClickEvent",oDataTable.onEventSelectRow);
            oDataTable.select(oDataTable.getRow(0));

            // Create our own event for selecting the record behind a row            
            oDataTable.createEvent("recordSelectEvent");

            // Raise our event when a row is selected
            var onRowClickEvent = function(oArgs) {
                var dt = oDataTable;
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
            oDataTable.subscribe("cellClickEvent", onRowClickEvent);

            // Setup DataForm
            oFormConfigs = {oDataTable: oDataTable};
            oDataForm = new YAHOO.yazaar.widget.DataForm(sDataForm, oColumnSet, oDataSource, oFormConfigs);
            oDataTable.subscribe("dataReturnEvent",oSelf.initFilter,oSelf);    
            
            // Setup tabview
            oTabView = new YAHOO.widget.TabView(sTabView);

            // Goto to DataForm
            var onRecordSelectEvent = function () {
              oDataForm.populateForm();
              oTabView.set('activeIndex', 1);
            };
            oDataTable.subscribe("recordSelectEvent", onRecordSelectEvent);

            // Goto DataTable
            var onRecordActionEvent = function () {
              oTabView.set('activeIndex', 0)
            };
            oDataForm.subscribe("updateEvent", onRecordActionEvent);
            oDataForm.subscribe("cancelEvent", onRecordActionEvent);            

            // Prompt before changing tabs
            var onBeforeActiveTabChange = function(e) {
              var isChanged = oDataForm.isRecordChanged();
              if (isChanged) {
                var isExit = confirm("Exit form without saving?");
                if (isExit) {
                    oDataForm.reset();
                }
                return isExit;
              } else {
                return true;
              }
            };
            oTabView.on('beforeActiveTabChange', onBeforeActiveTabChange);

            // Set flag when form is in view
            var onActiveTabChange = function(e) {
                oDataForm.isActive = (1==oTabView.get('activeIndex'));
            };
            oTabView.on('activeTabChange', onActiveTabChange);     
            YAHOO.util.Event.onAvailable(sDataTable, function(){oSelf.initFilter(null,oSelf)}); 
            
            // Retain references
            oSelf.oColumnSet = oColumnSet; 
            oSelf.oDataSource = oDataSource; 
            oSelf.oDataTable = oDataTable; 
            oSelf.oFormConfigs = oFormConfigs;
            oSelf.oDataForm = oDataForm;
            oSelf.oTabView = oTabView;
        },   

        /**
         * Setup autocomplete filtering. Called automatically.
         * @param {Object} oData
         * @param {Object} oSelf
         */             
        initFilter: function (oData,oSelf) {
            var list = null;
            if ((oData) && (oData.response)) {
                list = oData.response;
            } else {
                list = oSelf.oDataSource.liveData;
            };   
            oSelf.fnFilter= new YAHOO.dpu.util.StringFilter(list,oSelf.sItemName)
            oSelf.fnFilter.maxCacheEntries = 0;   
            var sInput = oSelf.sListForm + "_input";
            var sMatch = oSelf.sListForm + "_match";
            var oAutoComp = new YAHOO.dpu.widget.RowFilter(sInput,sMatch,oSelf.oDataTable,oSelf.fnFilter);
            var ua = navigator.userAgent.toLowerCase();
            if(ua.indexOf('msie') != -1 && ua.indexOf('opera') < 0) {
                oAutoComp.useIFrame = true;    
            }
        }, 

        /**
         * Change the autocomplete field. 
         * Must be wired to an input control via an onChange handler.
         */            
        onFilterChange: function () {
            var sItem = this.sListForm + "_item";
            var el = document.getElementById(sItem);
            var item = el.options[el.selectedIndex].value;
            this.fnFilter.schemaItem = item; 
        }        
    }; // end return
}();

