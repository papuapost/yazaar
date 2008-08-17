/**
 * DataTable Picker by Matt J. Cormier
 * http://tech.groups.yahoo.com/group/ydn-javascript/message/13344
 */

YAHOO.namespace("mcormier");	

YAHOO.mcormier.Picker = function() {};

YAHOO.mcormier.Picker.prototype.moveRecord = function(tableToAddTo, tableToRemoveFrom ) {
	var selectedRecords = tableToRemoveFrom.getSelectedRecordIds();
    if (selectedRecords.length == 0 ) {
          // nothing selected
      return;
    }
	
	var aRecords = tableToRemoveFrom.getRecordSet().getRecords();
	for (var i = 0; i < aRecords.length; i++) {
       if (aRecords[i].yuiRecordId == selectedRecords[0]) {
           // convert a YAHOO.widget.Record to a simple object
           var castDown = new Object();
           for (var sKey in aRecords[i]) {
               castDown[sKey] = aRecords[i][sKey];
           }

           var addedRecord = tableToAddTo.getRecordSet().addRecord(castDown);
           tableToAddTo.addRow(addedRecord);

           tableToRemoveFrom.unselectAllRows();
           // assumes recordSet is in the same order as displayed
           tableToRemoveFrom.deleteRow(tableToRemoveFrom.getRow(i));
       }
   }
}
