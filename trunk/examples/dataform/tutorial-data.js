// Setup DataTable
var oColumnHeaders = [
    {key:"name", text:"Dog's Name", sortable: true, initial: "<Enter Dog's common name>", editor:"textbox", formClassName: "required", formTitle: "Dog's Name is required"},
    {key:"breed", text:"Dog's Breed", sortable: true, ieditor:"select", type:"select", selectOptions: ["German Shepherd", "Norwich Terrier", "Labrador Retriever", "Yorkshire Terrier", "Golden Retriever", "Greyhound", "English Bulldog"], formClassName: "required", formTitle: "Dog's Breed is required"},
    {key:"age", text:"Dog's Age (in Weeks)", sortable: true, itype:"number", editor:"textbox", formClassName: "validate-number", formTitle: "Enter Dog's Age in number of weeks"},
    {key:"adopted", text:"Adopted", sortable: true, itype:"checkbox", editor:"checkbox"}
];
var oColumnSet = new YAHOO.widget.ColumnSet(oColumnHeaders);

YAHOO.example.oPuppies = [
   {name:"Ashley",breed:"German Shepherd",age:12,adopted:0},
   {name:"Dirty Harry",breed:"Norwich Terrier",age:5,adopted:1},
   {name:"Emma",breed:"Labrador Retriever",age:9,adopted:0},
   {name:"Oscar",breed:"Yorkshire Terrier",age:6,adopted:1},
   {name:"Riley",breed:"Golden Retriever",age:6,adopted:0},
   {name:"Shannon",breed:"Greyhound",age:12,adopted:1},
   {name:"Washington",breed:"English Bulldog",age:8,adopted:0},
   {name:"Zoe",breed:"Labrador Retriever",age:3,adopted:1}
];

var oDataSource = new YAHOO.util.DataSource(YAHOO.example.oPuppies);
oDataSource.responseType = YAHOO.util.DataSource.TYPE_JSARRAY;
oDataSource.responseSchema = {
    fields: ["name","breed","age","adopted"]
};
