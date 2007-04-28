YAHOO.namespace("my");

YAHOO.my.oLogReader = new YAHOO.widget.LogReader("elLogReader");    

YAHOO.my.setTitle = function(sElement, nIndex) {
	var sTitle;
	// sElement is for future use, just elTabview for now.
	switch(nIndex) {
		case 0: 
			sTitle = "List Entries";
			break;
		case 1:
			sTitle = "Edit Entries";
			break;
		default:
			sTitle = "";
			break;
	}
    var sTemplate = "{sTitle} - PhoneBook Example Application";
	document.title = sTemplate.supplant({sTitle: sTitle}); 
}
	
// Static data for low-level testing    
YAHOO.my.oLocalData = { 
    result : [
		{entry_key: 'c5b6bbb1-66d6-49cb-9db6-743af6627828', last_name: 'Beeblebrox ', first_name: 'Zaphod ', extension: '555-123-4565', username: 'zaphie ', hired: '04/01/1978', hours: -1, editor: '1'},
	    {entry_key: '7c424227-8e19-4fb5-b089-423cfca723e1', last_name: 'Yooden', first_name: 'Vranx', extension: '555-123-4566', username: 'conker', hired: '04/01/1978', hours: 37.5, editor: '1'},
	    {entry_key: '9320ea40-0c01-43e8-9cec-8fb9b3928c2c', last_name: 'Halfrunt', first_name: 'Gag', extension: '555-123-4567', username: 'ziggy', hired: '04/01/1978', hours: 7, editor: '0'},
		{entry_key: '3b27c933-c1dc-4d85-9744-c7d9debae196', last_name: 'Android', first_name: 'Marvin', extension: '555-123-4568', username: 'blue', hired: '06/15/1978', hours: 161, editor: '1'},
    	{entry_key: '554ff9e7-a6f5-478a-b76b-a666f5c54e40', last_name: 'McMillan', first_name: 'Tricia', extension: '555-123-4569', username: 'trillian', hired: '05/28/1978', hours: 37.5, editor:'0'},
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

YAHOO.my.events.onPhonebookLoaded = function(oData, oPhonebook) {
	var isLoaded = YAHOO.my.events.onPhonebookLoaded.isLoaded; 
	if (isLoaded) return;
	isLoaded = true;
	// Change title when tab changes
    var onActiveTabChange = function(e) {
		YAHOO.my.setTitle(oPhonebook.sTabView, oPhonebook.oTabView.get('activeIndex'));
	}
	oPhonebook.oTabView.on('activeTabChange', onActiveTabChange);     
}

YAHOO.my.events.onPhonebookLoaded.isLoaded = false;

YAHOO.my.Phonebook = function() {
    var oPhonebook = object(FlevBase);                   
    oPhonebook.oColumnHeaders = [
        {key:"first_name", text:"First Name", sortable:true, resizeable:true, editor:"textbox", formClassName: "required", formTitle: "Enter employee's first name"},  
        {key:"last_name", text:"Last Name", sortable:true, resizeable:true, editor:"textbox", formClassName: "required", formTitle: "Enter employee's last name"},  
        {key:"extension", text:"Extension", sortable:true, resizeable:true, editor:"textbox", formClassName: "required", formTitle: "Enter extension or telephone number"},  
        {key:"username", text:"Username", sortable:true, resizeable:true, editor:"textbox", formClassName: "required", formTitle: "Enter employee's login name"},  
        {key:"hired", text:"Hire Date", sortable:true, resizeable:true, editor:"textbox", formClassName: "required", formTitle: "Enter hire date as MM/DD/YYYY"},  
        {key:"hours", text:"Hours", sortable:true, resizeable:true, editor:"textbox", formClassName: "required, validate-number", formTitle: "Enter hours scheduled per work week as a number"},  
    ];       

    oPhonebook.oConfigs = {
        caption: "EntryList", 
        summary: "List of matching entries",
        paginator:true,
        paginatorOptions: {
            rowsPerPage: 2, 
            dropdownOptions: [2,20,200]
        },
        rowSingleSelect: true                
    };            

    oPhonebook.oResponseSchema = {
        fields: ["entry_key","last_name","first_name","extension","username","hired","hours","editor"]
    };            

    oPhonebook.sItemName = "last_name";
    
    oPhonebook.sDataTable = "elDataTable";
    oPhonebook.sDataForm = "elDataForm";
    oPhonebook.sTabView = "elTabView";
    oPhonebook.sForm = "elForm";

    YAHOO.my.events.subscribe("entryList", oPhonebook.load, oPhonebook);    
    // Home.rpc.entryList(YAHOO.my.events.onEntryListReturn).call(ANVIL.channel); // livedatabase
    YAHOO.my.events.subscribe("entryList", YAHOO.my.events.onPhonebookLoaded, oPhonebook);

    YAHOO.my.events.onEntryListReturn(YAHOO.my.oLocalData); // static data

    return oPhonebook;
};
YAHOO.augment(YAHOO.my.Phonebook, YAHOO.util.EventProvider);
YAHOO.my.oPhonebook = new YAHOO.my.Phonebook();
YAHOO.my.setTitle(YAHOO.my.oPhonebook.sTabView, 0);


