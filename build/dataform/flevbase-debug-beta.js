/*
Copyright (c) 2007, Husted dot Com, Inc. All rights reserved.
Portions Copyright (c) 2007, Yahoo! Inc. All rights reserved.
Code licensed under the BSD License:
http://developer.yahoo.net/yui/license.txt
*/
/**
 * @overview 
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
 * convenience of a full-featured edit form.
 * 
 * @see <a href="DataFormWalkThrough">http://code.google.com/p/yazaar/wiki/DataFormWalkThrough</a>
 * @module yazaar.dataform
 * @requires yahoo, dom, event, datasource
 * @title DataForm Widget
 * @alpha
 */

/**
 * Pseudo constructor.
 * <p />
 * Creates a base FLEV widget that must be configured
 * by a "power constructor" before use.
 * <p />
 * The properties to be configured are oColumnHeaders, oResponseSchema, 
 * oConfigs, sDataFind, sDataList, sDataView, sDataForm, sTabView, sListForm, sItemName.
 * The client application must also provide a dataset for the load 
 * method. 
 * 
 * @constructor
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
         * Array of object literals that define the DataTable configuration.
         * Must be configured.
         */
        oConfigs: null,
        
        /**
         * DOM ID for the DataList container (div).
         * Must be configured.
         */
        sDataList: null,
        
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
        oDataFind: null,

        /**
         * Instance created by this object.
         */
        oDataList: null, 

        /**
         * Instance created by this object.
         */
        oDataForm: null,

        /**
         * Instance created by this object.
         */
        oDataView: null,
        
        /**
         * Relative index of DataFind
         */
         nDataFind: 0,
         
        /**
         * Relative index of DataList
         */
         nDataList: 1,
         
        /**
         * Relative index of DataView
         */
         nDataView: 2,
         
        /**
         * Relative index of DataEdit
         */
         nDataEdit: 3,
                 
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
            var oConfigs = oSelf.oConfigs; 
            var sDataFind = oSelf.sDataFind;
            var sDataList = oSelf.sDataList;
            var sDataView = oSelf.sDataView;
            var sDataForm = oSelf.sDataForm;
            var sTabView = oSelf.sTabView;
            // to be defined
            var oColumnSet, oDataSource, oDataFind, oDataList, oDataView, oDataForm, oFormConfigs,oTabView;
            
            oColumnSet = new YAHOO.widget.ColumnSet(oColumnHeaders);
            oDataSource = new YAHOO.util.DataSource(oData.result);
                oDataSource.responseType = YAHOO.util.DataSource.TYPE_JSARRAY;            
                oDataSource.responseSchema = oResponseSchema;
            oDataList = new YAHOO.dpu.widget.DataTable(sDataList, oColumnSet, oDataSource, oConfigs);
            
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
            oFormConfigs = {oDataList: oDataList};
            oDataForm = new YAHOO.yazaar.widget.DataForm(sDataForm, oColumnSet, oDataSource, oFormConfigs);
            oDataList.subscribe("dataReturnEvent",oSelf.initFilter,oSelf);    
            
            // Setup tabview
            oTabView = new YAHOO.widget.TabView(sTabView);

            // Goto to DataEdit
            var onRecordSelectEvent = function () {
              oDataForm.populateForm();
              oTabView.set('activeIndex', 3); // TODO: nDataEdit - Change to nDataView?
            };
            oDataList.subscribe("recordSelectEvent", onRecordSelectEvent);

            // Goto DataList
            var onRecordActionEvent = function () {
              oTabView.set('activeIndex', 2); // TODO: nDataList - List or View? 
            };
            oDataForm.subscribe("updateEvent", onRecordActionEvent);
            oDataForm.subscribe("cancelEvent", onRecordActionEvent);            

            // Prompt before changing tabs
            var onBeforeActiveTabChange = function(e) {
              if (!oDataForm.isActive) return true;              
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
                oDataForm.isActive = (3==oTabView.get('activeIndex')); // TODO: nDataEdit
            };
            oTabView.on('activeTabChange', onActiveTabChange);     
            YAHOO.util.Event.onAvailable(sDataFind, function(){oSelf.initFilter(null,oSelf)}); 
            
            // Retain references
            oSelf.oColumnSet = oColumnSet; 
            oSelf.oDataSource = oDataSource; 
            oSelf.oFormConfigs = oFormConfigs;
            oSelf.oDataList = oDataList; 
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
            var oAutoComp = new YAHOO.dpu.widget.RowFilter(sInput,sMatch,oSelf.oDataList,oSelf.fnFilter);
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
