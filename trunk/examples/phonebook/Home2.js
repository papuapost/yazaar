YAHOO.namespace("my");

YAHOO.my.sTemplate = "{sTitle} - PhoneBook Example Application";
// Static data for low-level testing    
YAHOO.my.oLocalData = { 
    result : [
		{entry_key: 'c5b6bbb1-66d6-49cb-9db6-743af6627828', last_name: 'Beeblebrox ', first_name: 'Zaphod ', extension: '555-123-4565', username: 'zaphie ', hired: '04/01/1978', hours: -1, editor: '1'},
	    {entry_key: '7c424227-8e19-4fb5-b089-423cfca723e1', last_name: 'Yooden', first_name: 'Vranx', extension: '555-123-4566', username: 'conker', hired: '04/01/1978', hours: 37.5, editor: '1'},
	    {entry_key: '9320ea40-0c01-43e8-9cec-8fb9b3928c2c', last_name: 'Halfrunt', first_name: 'Gag', extension: '555-123-4567', username: 'ziggy', hired: '04/01/1978', hours: 7, editor: '0'},
		{entry_key: '3b27c933-c1dc-4d85-9744-c7d9debae196', last_name: 'Android', first_name: 'Marvin', extension: '555-123-4568', username: 'blue', hired: '06/15/1978', hours: 161, editor: '1'},
    	{entry_key: '554ff9e7-a6f5-478a-b76b-a666f5c54e40', last_name: 'McMillan', first_name: 'Tricia', extension: '555-123-4569', username: 'trillian', hired: '05/28/1978', hours: 37.5, editor:'0'}
		]
	};
// 	{entry_key: 'a4065cc1-b59d-4d0d-8210-c3757e686e6c', last_name: 'Prefect', first_name: 'Ford', extension: '555-123-4570', username: 'peanut', hired: '07/26/1978', hours: 35, editor:'1'},
// 	{entry_key: '59a5c1da-9750-4b2c-8fcb-833bd16aca26', last_name: 'Dent', first_name: 'Arthur', extension: '555-123-4571', username: 'monk', hired: '07/26/1978', hours: 35, editor:'1'}


YAHOO.my.Events = function() {
    this.createEvent("entryList")
    return this;
}
YAHOO.augment(YAHOO.my.Events, YAHOO.util.EventProvider);
YAHOO.my.events = new YAHOO.my.Events();

YAHOO.my.events.onEntryListReturn = function(oData) {
    YAHOO.log("entryList Event");
    YAHOO.my.events.fireEvent("entryList", oData);	
}

YAHOO.my.Phonebook = function() {
    var oSelf = new YAHOO.yazaar.FlevBase();                   
    oSelf.oColumnHeaders = [
        {key:"first_name", text:"First Name", sortable:true, resizeable:true, editor:"textbox", formClassName: "required", formTitle: "Enter employee's first name"},  
        {key:"last_name", text:"Last Name", sortable:true, resizeable:true, editor:"textbox", formClassName: "required", formTitle: "Enter employee's last name"},  
        {key:"extension", text:"Extension", sortable:true, resizeable:true, editor:"textbox", formClassName: "required", formTitle: "Enter extension or telephone number"},  
        {key:"username", text:"Username", sortable:true, resizeable:true, editor:"textbox", formClassName: "required", formTitle: "Enter employee's login name"},  
        {key:"hired", text:"Hire Date", sortable:true, resizeable:true, editor:"textbox", formClassName: "required", formTitle: "Enter hire date as MM/DD/YYYY"},  
        {key:"hours", text:"Hours", sortable:true, resizeable:true, editor:"textbox", formClassName: "required, validate-number", formTitle: "Enter hours scheduled per work week as a number"}  
    ];       

    oSelf.oListConfigs = {
        caption: "EntryList", 
        summary: "List of matching entries",
        paginator:true,
        paginatorOptions: {
            rowsPerPage: 2, 
            dropdownOptions: [2,20,200]
        },
        rowSingleSelect: true                
    };            

    oSelf.oResponseSchema = {
        fields: ["entry_key","last_name","first_name","extension","username","hired","hours","editor"]
    };            

    oSelf.sItemName = "last_name";
    oSelf.sDataFind = "elList";
    oSelf.sTabView = "elPhonebook";
    oSelf.nDataList = 0;
    oSelf.nDataEdit = 1;
    oSelf.nDataView = 0;
    
    YAHOO.my.events.subscribe("entryList", oSelf.load, oSelf);    
    // Home.rpc.entryList(YAHOO.my.events.onEntryListReturn).call(ANVIL.channel); // livedatabase
    YAHOO.my.events.subscribe("entryList", YAHOO.my.events.onPhonebookLoaded, oSelf);

    YAHOO.my.events.onEntryListReturn(YAHOO.my.oLocalData); // static data

    return oSelf;
};
YAHOO.augment(YAHOO.my.Phonebook, YAHOO.util.EventProvider);

YAHOO.my.events.onPhonebookLoaded = function(oData, oSelf) {
	var isLoaded = YAHOO.my.events.onPhonebookLoaded.isLoaded; 
	if (isLoaded) return;
	isLoaded = true;
	
	oSelf.setTitle = function(nIndex) {
		var sTitle;
		switch(nIndex) {
			case 0: 
				sTitle = "List Entries";
				break;
			case 1: 
				sTitle = "Edit Entry";
				break;
			default:
				sTitle = "";
				break;
		}
		document.title = YAHOO.my.sTemplate.supplant({sTitle: sTitle}); 
	}
	 
    var onActiveTabChange = function(e) {
        var nIndex = oSelf.oTabView.get('activeIndex');
		oSelf.setTitle(nIndex);
	}
	oSelf.oTabView.on('activeTabChange', onActiveTabChange);     
}

YAHOO.my.events.onPhonebookLoaded.isLoaded = false;

YAHOO.my.oBody = {};

function newEl(sElement, elParent, sID, sClass) {
	var el = elParent.appendChild(document.createElement(sElement));
	el.id = sID;
	if (arguments.length>3) YAHOO.util.Dom.addClass(el,sClass);
	return el;
} 

function newDiv(elParent, sID, sClass) {
	return newEl("DIV", elParent, sID, sClass)
} 

function newForm(elParent, sID, sClass) {
	return newEl("FORM", elParent, sID, sClass)
} 

function newInputText(elParent, sID, sClass) {
	var el = newEl("INPUT", elParent, sID, sClass);
	// el.type = "text"; 
	return el;			
}

YAHOO.my.oBody.TabView = function() {

    var oTabView = new YAHOO.widget.TabView({id:'elBody'});
    oTabView.addTab( new YAHOO.widget.Tab({
        label: "Home",
        content: "<p><em>Under Construction!</em> Utlimately, PhoneBook will be a working phonebook application utilizing a variety of widgets with a simple service layer. Today, PhoneBook demonstrates combining Unobtrusive Validation, DataForm, DataView, and TabView into a Find/List/Edit workflow, using static data.</p>",
        active: true
    }));    
    oTabView.addTab( new YAHOO.widget.Tab({
        label: "PhoneBook",
        content: '<div id="elPhonebook">'
    }));    
    oTabView.addTab( new YAHOO.widget.Tab({
        label: "Logger",
        content: '<div id="elLogReader"></div>'
    }));

    YAHOO.util.Event.onContentReady("elBody", function() {
    oTabView.appendTo(this); // #elBody
	YAHOO.my.oLogReader = new YAHOO.widget.LogReader("elLogReader");
	// <div id="elList"><div id="elFilter" class="filter"><form id="elForm"><p style="font-weight:bold">Filter Entries by:<select id="elForm_item" onchange="YAHOO.my.oPhonebook.onFilterChange()"><option value="last_name" selected="selected">Last Name</option><option value="first_name">First Name</option><option value="username">Username</option></select></p>
	// <div class="filterForm"><p><input class="filterInput" id="elForm_input" /></p><div class="filterMatch" id="elForm_match"></div></div></form></div><div id="elDataTable" class="dpu-dt"></div></div><div id="elEdit"><div id="elDataForm"></div></div></div>
	var elPhonebook = document.getElementById("elPhonebook");
		// NavSet
		var elNavset = newDiv(elPhonebook,"elNavset","yui-navset");
			var elNav = newEl("UL",elNavset,"elNav","yui-nav");
			var elNav1 = newEl("LI",elNav,"elNav1");
			var elNav1Link = newEl("A",elNav1,"elNav1Link", "selected");
			elNav1Link.href = '#'; 
			elNav1Link.innerHTML = 'List';			
			var elNav2 = newEl("LI",elNav,"elNav2");
			var elNav2Link = newEl("A",elNav2,"elNav2Link");
			elNav2Link.href = '#'; 
			elNav2Link.innerHTML = 'Edit';
		// Content
		var elContent = newDiv(elNavset,"elContent","yui-content");
			var elList = newDiv(elContent,"elList");
				var elFilter = newDiv(elList,"elListFilter","filter"); 
					var elForm = newForm(elFilter,"elListForm");					
						var elP = elForm.appendChild(document.createElement("P"));
							elP.innerHTML = "Filter Entries by: &nbsp;";
						var elForm_item = newEl("SELECT",elP,"elListForm_item");
							elForm_item.options[0] = new Option("Last Name","last_name",true,true);
							elForm_item.options[1] = new Option("First Name","first_name",false,false);
							elForm_item.options[2] = new Option("UserName","username",false,false);
						elFilterForm = newEl("DIV",elP,"elFilterForm","filterForm");
							var elForm_input = newInputText(elFilterForm,"elListForm_input", "filterInput");
							var elForm_match = newDiv(elFilterForm,"elListForm_match","filterMatch");				
					var elDataTable = newDiv(elList,"elDataList", "dpu-dt");
			var elEdit = newDiv(elNavset,"elEdit");
				var elDataForm = newDiv(elEdit,"elDataEdit");
    });
	
	return oTabView;
};

YAHOO.my.oBody.setTitle = function(nIndex) {
	var sTitle;
	// sElement is for future use, just elTabview for now.
	switch(nIndex) {
		case 0: 
			sTitle = "Home";
			break;
		case 1: 
			sTitle = "PhoneBook";
			if (!YAHOO.my.oPhonebook) {
				YAHOO.my.oPhonebook = new YAHOO.my.Phonebook();
				var elForm_item = document.getElementById("elListForm_item");				
				elForm_item.onchange = YAHOO.my.oPhonebook.onFilterChange();
				var oTabView =YAHOO.my.oPhonebook.oTabView; 
				oTabView.set('activeIndex',0);
				var oTab = oTabView.getTab(0);
				oTab.active = true;
			}
			break;
		case 2: 
			sTitle = "Logger";
			break;
		default:
			sTitle = "";
			break;
	}
	document.title = YAHOO.my.sTemplate.supplant({sTitle: sTitle}); 
}

YAHOO.my.oBody.handleOnContentReady = function(oData, oSelf) {
	YAHOO.my.oBody.oTabView = new YAHOO.my.oBody.TabView();	
    var onActiveTabChange = function(e) {
        var nIndex = YAHOO.my.oBody.oTabView.get('activeIndex');
		YAHOO.my.oBody.setTitle(nIndex);
	}
	YAHOO.my.oBody.oTabView.on('activeTabChange', onActiveTabChange);     
	YAHOO.my.oBody.setTitle(0);
}

YAHOO.util.Event.onContentReady("elBody", YAHOO.my.oBody.handleOnContentReady, YAHOO.my);  

