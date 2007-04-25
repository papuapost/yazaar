var FlevBase = function() { 
    // return public members
    return {
        
        oColumnHeaders: null,         
        oConfigs: null, 
        oResponseSchema: null,
        sName: null, 
        sDataTable: null,
        sDataForm: null, 
        sTabView: null,
        sForm:null,
        
        oColumnSet: null,
        oDataSource: null,
        oDataTable: null, 
        oDataForm: null,
        oTabView: null,
        fnFilter: null,
        oFormConfigs: null,
        
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
                return (confirm("Exit form without saving?"));
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
             
        initFilter: function (oData,oSelf) {
            var list = null;
            if ((oData) && (oData.response)) {
                list = oData.response;
            } else {
                list = oSelf.oDataSource.liveData;
            };   
            oSelf.fnFilter= new YAHOO.dpu.util.StringFilter(list,oSelf.sName)
            oSelf.fnFilter.maxCacheEntries = 0;   
            var sInput = oSelf.sForm + "_input";
            var sMatch = oSelf.sForm + "_match";
            var oAutoComp = new YAHOO.dpu.widget.RowFilter(sInput,sMatch,oSelf.oDataTable,oSelf.fnFilter);
            var ua = navigator.userAgent.toLowerCase();
            if(ua.indexOf('msie') != -1 && ua.indexOf('opera') < 0) {
                oAutoComp.useIFrame = true;    
            }
        }, 
            
        onFilterChange: function () {
            var sItem = oSelf.sForm + "_item";
            var el = document.getElementById(sItem);
            var item = el.options[el.selectedIndex].value;
            oSelf.fnFilter.schemaItem = item; 
        }        
    }; // end return
}();

