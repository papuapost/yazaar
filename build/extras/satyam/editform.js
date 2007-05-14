/**

https://sourceforge.net/tracker/index.php?func=detail&aid=1717216&group_id=165715&atid=836479

I wanted to have the ability to edit a full row of cells of a
DataTable and came up with the following methods:

The first, createEditForm takes as its arguments at least the name or
element which will contain the form.

The url argument, if exists, will be assigned to the form.action attribute.
If url is absent and the DataTable was filled via a JSON request, the url
will be taken from the DataSource.

The onSubmitCallback argument is a reference to a function that will be
called on the form onSubmit event. If missing, the form will be processed
as usual. A function to do a submit via Connection Manager is provided
(see later: postEditForm).

Finally the arguments argument has any arguments that the callback function
might require. When using the provided postEditForm method, they should be
the regular arguments to an asyncRequest with its success, failure, scope,
etc properties.

The function creates a form and fills it with label and input elements for
each column that has a 'editor:textbox','editor:textarea' or 'edit:true'
attribute. It uses the 'text' attribute for labels and the 'key' attribute
for field names.

The form is assigned a className 'yui-dt-edit-form' to allow formatting of
its contents via CSS.

Another method is provided to load the form with data (see below)

 * @param {Object} elContainer
 * @param {Object} url
 * @param {Object} onSubmitCallback
 * @param {Object} arguments
 */

YAHOO.widget.DataTable.prototype.createEditForm = function (elContainer,url,onSubmitCallback,arguments) {
	elContainer = YAHOO.util.Dom.get(elContainer);
	var elForm = document.createElement('form');
	YAHOO.util.Dom.addClass(elForm,'yui-dt-edit-form');
	this.recordEditForm = elForm;
	elContainer.appendChild(elForm);
	elForm.setAttribute('method','post');
	elForm.setAttribute('action',url || (this.dataSource.dataType == YAHOO.util.DataSource.TYPE_XHR)?this.dataSource.liveData:'');
	for (var i = 0;i<this._oColumnSet.keys.length;i++) {
	var oColumn = this._oColumnSet.keys[i];
	switch (oColumn.editor) {
		case 'textbox':
			var elLabel = document.createElement('label');
			elLabel.setAttribute('for',oColumn.key);
			elLabel.innerHTML = oColumn.text || oColumn.key;
			elForm.appendChild(elLabel);

			var elTextbox = document.createElement("input");
			elTextbox.setAttribute('name',oColumn.key);
			elForm.appendChild(elTextbox);
			break;
		case 'textarea':
			var elLabel = document.createElement('label');
			elLabel.setAttribute('for',oColumn.key);
			elLabel.innerHTML = oColumn.text || oColumn.key;
			elForm.appendChild(elLabel);

			var elTextArea = document.createElement("textarea");
			elTextArea.setAttribute('name',oColumn.key);
			elForm.appendChild(elTextArea);
			break;
		default:
			if (oColumn.edit) {
				YAHOO.widget.DataTypes.createFormField(elForm,oColumn);
			}
			break;
		}
	}
	var buttonSubmit = document.createElement('input');
	buttonSubmit.type='submit';
	buttonSubmit.value= arguments.submitButtonLabel || 'Ok';
	elForm.appendChild(buttonSubmit);
	if (onSubmitCallback) {

	YAHOO.util.Event.on(elForm,'submit',onSubmitCallback,arguments,this,true);
	}
};


/**

The postEditForm method submits the form via Connection Manager. 'this'
refers to the DataTable instance.

 * @param {Object} ev
 * @param {Object} arguments
 */
YAHOO.widget.DataTable.prototype.postEditForm = function(ev,arguments) {
	YAHOO.util.Event.stopEvent(ev);
	YAHOO.util.Connect.setForm(this.recordEditForm);
	YAHOO.util.Connect.asyncRequest('POST', this.recordEditForm.action,
	arguments);
	return false;
};

/**

This is how it is used. First you create the form (dt contains a DataTable
instance):

dt.createEditForm('formPanel',undefined,dt.postEditForm,{
success:function() {
alert('success')
},
failure:function() {
alert('failure')
}
});

In this case, I will put it in a panel, initially hidden, and since the
whole DataTable was loaded via Connection Manager, I will use the same
server URL. Finally, I use the provided postEditForm callback function and
provide it with the arguments required by asyncRequest. This is done only
once per page.

When I want to edit a record, I call:

dt.showEditForm(dt.getRecordSet()._records[0],{someExtraData:123});

In this case, I am calling it to edit the first record and provide the form
with someExtraData to put into the form.

Since I used postEditForm, whenever the user clicks Ok the form will be
submitted via ConnectionManager as a post and the reply will come by the
success callback function provided, in this case a couple of alerts.

In the above functions I provided both for the editor:textbox and
editor:textarea. For those wondering what YAHOO.widget.DataTypes is, see
my 'feature request' at:

https://sourceforge.net/tracker/?func=detail&atid=836479&aid=1684188&group_id=165715
 
 */

