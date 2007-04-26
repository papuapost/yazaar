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

// Setup DataForm
var oConfigs = {oDataTable: oDataTable};
var oDataForm = new YAHOO.yazaar.widget.DataForm("elDataForm", oColumnSet, oDataSource, oConfigs);

// Setup Logger
var oLogReader = new YAHOO.widget.LogReader("elLogReader");