// Setup DataTable
var oColumnHeaders = [
    {key:"name", text:"Dog's Name", formClassName: "required", formTitle: "Dog's Name is required"},
    {key:"breed", text:"Dog's Breed", formClassName: "required", formTitle: "Dog's Breed is required"},
    {key:"age", text:"Dog's Age (in Weeks)", type:"number", formClassName: "validate-number", formTitle: "Enter Dog's Age in number of weeks"}
];
var oColumnSet = new YAHOO.widget.ColumnSet(oColumnHeaders);

YAHOO.example.oPuppies = [
   {name:"Ashley",breed:"German Shepherd",age:12},
   {name:"Dirty Harry",breed:"Norwich Terrier",age:5},
   {name:"Emma",breed:"Labrador Retriever",age:9},
   {name:"Oscar",breed:"Yorkshire Terrier",age:6},
   {name:"Riley",breed:"Golden Retriever",age:6},
   {name:"Shannon",breed:"Greyhound",age:12},
   {name:"Washington",breed:"English Bulldog",age:8},
   {name:"Zoe",breed:"Labrador Retriever",age:3}
];

var oDataSource = new YAHOO.util.DataSource(YAHOO.example.oPuppies);
oDataSource.responseType = YAHOO.util.DataSource.TYPE_JSARRAY;
oDataSource.responseSchema = {
    fields: ["name","breed","age"]
};
