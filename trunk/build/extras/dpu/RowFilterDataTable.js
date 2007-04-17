/*
 * Copyright (c) 2007, Yahoo! Inc. All rights reserved.
 * Code licensed under the BSD License:
 * http://developer.yahoo.net/yui/license.txt
 * version: 2.2.0
*/
/* Enhanced DataTable with row filtering and hideable columns 
 * Copyright (c) 2007, Victor Morales. All rights reserved.
 * Code licensed under the BSD License.
*/


YAHOO.namespace("dpu.widget");

YAHOO.dpu.widget.DataTable = function(elContainer , oColumnSet , oDataSource , oConfigs) {
        if (arguments.length > 0) {
			YAHOO.dpu.widget.DataTable.superclass.constructor.call(this, elContainer , oColumnSet , oDataSource , oConfigs);
		}
       this._initHideMenu(oColumnSet);
};
			
// Inherit from YAHOO.widget.DataTable
YAHOO.lang.extend(YAHOO.dpu.widget.DataTable, YAHOO.widget.DataTable);

YAHOO.dpu.widget.DataTable.prototype.doBeforeLoadData= function( sRequest , oResponse ) {
    this._defaultView=oResponse;  
    return true;
}

YAHOO.dpu.widget.DataTable.prototype._initHideMenu=function(oColumnSet) {
    var _hideCol=[]
        var keys= oColumnSet.keys;
        for (var i=0; i<keys.length;i++) {
            if(keys[i].hideable) {
                _hideCol.push({text:keys[i].key,checked:true, colNum:i})
            }
        }
        if (_hideCol.length>0)    {
          var oContextMenu = new YAHOO.widget.ContextMenu("hideMenu", { trigger: this.getHead()     } );
         
          // Define the items for the menu
          var aMenuItemData =_hideCol 
          var nMenuItems = aMenuItemData.length;
          var oMenuItem;
          for(var i=0; i<nMenuItems; i++) {
             var item= aMenuItemData[i]
             oMenuItem = oContextMenu.addItem(item);
             oMenuItem.clickEvent.subscribe(this.onhideMenuClick, [oMenuItem,item.colNum],this);
          }
          oContextMenu.render(document.body);
        }

};

YAHOO.dpu.widget.DataTable.prototype.onhideMenuClick=function(p_sType, p_aArgs, p_oMenuItem) {
        var oMenuItem= p_oMenuItem[0];
        var col_no=p_oMenuItem[1];
        var swap=! oMenuItem.cfg.getProperty("checked")
        oMenuItem.cfg.setProperty("checked", swap);
        var colstyle;
        if (!swap) { colstyle = 'none';      }
        else {       colstyle='';    }

       //Hide column header
        var headRow= this.getHead().getElementsByTagName('th')
        headRow[col_no].style.display=colstyle;

        var rows= this.getBody().getElementsByTagName('tr')
        
        // Hide column rows 
        for (var row=0; row<rows.length;row++) {
          var cels = rows[row].getElementsByTagName('td')
         cels[col_no].style.display=colstyle;
        }
};

YAHOO.dpu.widget.DataTable.prototype.isFiltered=false;

YAHOO.dpu.widget.DataTable.prototype.filterRows=function(filteredRows) {
    if(filteredRows == undefined) {
        this._oRecordSet.replace(this._defaultView);
        this.isFiltered=false;
        
    }
    else {
        var dataView=[];
        for (var i=0; i<filteredRows.length;i++) {
        	var r=filteredRows[i];
			var row= this._defaultView[r];
			var record= new YAHOO.widget.Record(row);
			dataView.push(record);
		}
        this._oRecordSet.replace(dataView);
        this.isFiltered=true;
    }
    
    this.paginateRows();
};   