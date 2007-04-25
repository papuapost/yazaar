YAHOO.namespace("my");

YAHOO.my.oLogReader = new YAHOO.widget.LogReader("elLogReader");    

// Static data for low-level testing    
YAHOO.my.oLocalData = { 
    "result" : [['c5b6bbb1-66d6-49cb-9db6-743af6627828', 'Clinton', 'William', '555-743-7828', 'bubba', '08/19/1992', 37.5, '0'],
    ['7c424227-8e19-4fb5-b089-423cfca723e1', 'Roosevelt', 'Theodore', '555-743-8942', 'bull', '09/14/2002', 37.5, '0'],
    ['9320ea40-0c01-43e8-9cec-8fb9b3928c2c', 'Kennedy', 'John F.', '555-743-3928', 'fitz', '05/29/1987', 37.5, '0'],
    ['3b27c933-c1dc-4d85-9744-c7d9debae196', 'Pierce', 'Franklin', '555-743-7919', 'benji', '11/18/1984', 35, '0'],
    ['554ff9e7-a6f5-478a-b76b-a666f5c54e40', 'Jefferson', 'Thomas', '555-743-5440', 'monty', '07/04/1976', 37.5, '0']]
};

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

YAHOO.my.PhoneBook = function() {
    var phonebook = object(FlevBase);                   
    phonebook.oColumnHeaders = [
        {key:"first_name", text:"First Name", sortable:true, resizeable:true, editor:"textbox", formClassName: "required", formTitle: "Enter employee's first name"},  
        {key:"last_name", text:"Last Name", sortable:true, resizeable:true, editor:"textbox", formClassName: "required", formTitle: "Enter employee's last name"},  
        {key:"extension", text:"Extension", sortable:true, resizeable:true, editor:"textbox", formClassName: "required", formTitle: "Enter extension or telephone number"},  
        {key:"username", text:"Username", sortable:true, resizeable:true, editor:"textbox", formClassName: "required", formTitle: "Enter employee's login name"},  
        {key:"hired", text:"Hire Date", sortable:true, resizeable:true, editor:"textbox", formClassName: "required", formTitle: "Enter hire date as MM/DD/YYYY"},  
        {key:"hours", text:"Hours", sortable:true, resizeable:true, editor:"textbox", formClassName: "required, validate-number", formTitle: "Enter hours scheduled per work week as a number"},  
    ];       

    phonebook.oConfigs = {
        caption: "EntryList", 
        summary: "List of matching entries",
        paginator:true,
        paginatorOptions: {
            rowsPerPage: 2, 
            dropdownOptionsDropdown: [2,20,200]
        },
        rowSingleSelect: true                
    };            

    phonebook.oResponseSchema = {
        fields: ["entry_key","first_name","last_name","extension","username","hired","hours","editor"]
    };            

    phonebook.sName = "last_name";
    
    phonebook.sDataTable = "elDataTable";
    phonebook.sDataForm = "elDataForm";
    phonebook.sTabView = "elTabView";
    phonebook.sForm = "elForm";

    YAHOO.my.events.subscribe("entryList", phonebook.load, phonebook);    
    // Home.rpc.entryList(YAHOO.my.events.onEntryListReturn).call(ANVIL.channel); // live database
    YAHOO.my.events.onEntryListReturn(YAHOO.my.oLocalData); // static data

    return phonebook;
};
YAHOO.augment(YAHOO.my.PhoneBook, YAHOO.util.EventProvider);
YAHOO.my.phonebook = new YAHOO.my.PhoneBook();
