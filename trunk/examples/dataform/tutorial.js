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
}
oDataTable.subscribe("cellClickEvent", onRowClickEvent);

// Inject extended selectOptions
var oSession = {};
oSession ["breed_selectOptions"] = ["Cocker Spaniel","English Bulldog","German Shepherd","Golden Retriever","Greyhound","Labrador Retriever","Norwich Terrier","Poodle","Yorkshire Terrier"];

// Setup Context Menu
var onRowDelete = function(oArgs) {
    YAHOO.log("Deleted row index " +oArgs.rowIndex);
};
oDataTable.subscribe("rowDeleteEvent", onRowDelete);

var onContextMenuClick = function(p_sType, p_aArgs, p_oMenu) {
    var task = p_aArgs[1];
    if(task) {
        // Extract which row was context-clicked
        var row = this.contextEventTarget;
        while(row.tagName.toLowerCase() != "tr") {
            row = row.parentNode;
            if(row.tagName.toLowerCase == "body") {
                row = null;
                break;
            }
        }

        if(row) {
            switch(task.index) {
                case 0:     // Delete Item
                    YAHOO.log("Deleting item: " + row.cells[2].innerHTML);
                    oDataTable.deleteRow(row);
                    break;
            }
        }
    }
};

var oContextMenu = new YAHOO.widget.ContextMenu("oContextMenu", { trigger: oDataTable.getBody() } );
oContextMenu.addItem("Delete Item");
oContextMenu.render(document.body);
oContextMenu.clickEvent.subscribe(onContextMenuClick);

// Setup DataForm
var oConfigs = {oDataList: oDataTable, oSession: oSession};
var oDataForm = new YAHOO.yazaar.DataForm("elDataForm", oColumnSet, oDataSource, oConfigs);

// Setup Logger
var oLogReader = new YAHOO.widget.LogReader("elLogReader");
