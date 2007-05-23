MY.Contacts = function() {
    var oSelf = object(FlevBase);

    oSelf.COLUMN_HEADERS = [
        {key:"first_name", text:"First Name", sortable:true, resizeable:true, editor:"textbox", formClassName: "required", formTitle: "Enter employee's first name"},  
        {key:"last_name", text:"Last Name", sortable:true, resizeable:true, editor:"textbox", formClassName: "required", formTitle: "Enter employee's last name"},  
        {key:"extension", text:"Extension", sortable:true, resizeable:true, editor:"textbox", formClassName: "required", formTitle: "Enter extension or telephone number"},  
        {key:"username", text:"Username", sortable:true, resizeable:true, editor:"textbox", formClassName: "required", formTitle: "Enter employee's login name"},  
        {key:"hired", text:"Hire Date", sortable:true, resizeable:true, editor:"textbox", formClassName: "required", formTitle: "Enter hire date as MM/DD/YYYY"},  
        {key:"hours", text:"Hours", sortable:true, resizeable:true, editor:"textbox", formClassName: "required, validate-number", formTitle: "Enter hours scheduled per work week as a number"},  
    ];       

    oSelf.RESPONSE_SCHEMA = {
        fields: ["entry_key","last_name","first_name","extension","username","hired","hours","editor"]
    };            

    oSelf.CONFIGS = {
        caption: "Contact List", 
		summary: "List of matching contacts",
		paginator:true,
		paginatorOptions: {
			rowsPerPage: 2, 
			dropdownOptions: [2,20,200]
		},
		rowSingleSelect: true                
    };            
    
    oSelf.oColumnHeaders = oSelf.COLUMN_HEADERS;
    oSelf.oResponseSchema = oSelf.RESPONSE_SCHEMA;
    oSelf.oConfigs = oSelf.CONFIGS;
    oSelf.sItemName = "last_name";
    
    oSelf.LOCAL_DATA = { 
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
    
    return oSelf;
}	
	

YAHOO.augment(MY.Contacts, YAHOO.util.EventProvider);

