
/**
Ok, it's done and posted at:

https://sourceforge.net/tracker/index.php?func=detail&aid=1717216&group_id=165715&atid=836479


So, this is how you would use it:

Assuming dt is a global reference to an existing DataTable instance,
first, once in the document, you create the form within a container, in this
case, with an id of 'editForm'.

 dt.createEditForm('editForm');

Then once for each record to be edited, you make the container visible and
call showEditFormgiving it the record to be edited (here, the first record).
Here, I am giving it an extra argument, an object with a property
idExtraInfo which will be converted to a hidden input element with name
idExtraInfo and value 123 and inserted into the form

 dt.showEditForm(dt.getRecordSet().getRecord(0),{idExtraInfo:123});

You may subscribe to any or all of the following events. They are all
triggered in succession by the submit event of the form.  If any of the
validate event fails (returns false) the rest will not be triggered.

This will be fired for each cell.  It will receive the input element (input,
textarea, select box), the original value, a reference to the column (for
whatever information you might need from it) and to the original record.  It
will trigger only for fields in the form, not for all of the ones on the
record, nor for the hidden fields.

 dt.subscribe('cellValidateEvent', function(args) {
  console.log('cellValidateEvent', args);
  return true;
 });


This one fires once for the whole form.  It receives a reference to the
form, the old data as an object of name:value  sets, the new data and the
original record.

 dt.subscribe('formValidateEvent', function(args) {
  console.log('formValidateEvent', args);
  return true;
 });

Finally, if everything validates, the formSubmitEvent fires.  If not
subscribed, the form will be submitted as forms usually do.  If subscribed
and returns true, it will also submit, if false, it cancels the submit (as
per normal DOM standards).   It receives the form, the old data, the new
data and the record, which is now updated with the new values (which should
also be reflected in the browser).

As a convenience, the postEditForm method is provided to make it simple to
submit the form via XHR.  You just set it as the callback function for the
event and add an extra argument with the callback object, as described for
the asyncRequest method.

 dt.subscribe('formSubmitEvent', dt.dataTable.postEditForm, {
  success:function() {
   console.log('success',this)
  },
  failure:function() {
   console.log('failure',this)
  }
 });


It still has all the references to DataTypes, which is what I use, but if
you don't use 'edit:true' in the column descriptions, it should not
complain, otherwise, let me know.

Satyam  */

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

YAHOO.widget.DataTable.prototype.createEditForm = function (elContainer,url,onSubmitCallback,args) {
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
	buttonSubmit.value= 'OK'; // args.submitButtonLabel || 'Ok'; // FIXME: "args has no properties"
	elForm.appendChild(buttonSubmit);
	if (onSubmitCallback) {	
		YAHOO.util.Event.on(elForm,'submit',onSubmitCallback,args,this,true);
	}
};


/**

Notice that the onSubmitCallback function is executed in the scope of the
DataTable instance.

The following function is called to fill the form with data.

The function takes a reference to a particular record which will be loaded
into the value of the input elements.

It takes a second argument, which is expected to be an object of name:value
pairs, which will be converted to <input type=hidden> elements. In each
call, prior hidden elements are removed.

 * @param {Object} oRecord
 * @param {Object} extra
 */
YAHOO.widget.DataTable.prototype.showEditForm = function(oRecord,extra) {
	var elForm = this.recordEditForm,i,elHidden;
	for (var i = 0; i < elForm.childNodes.length;i++) {
		var el = elForm.childNodes[i];
		if (el.nodeType === 1 && el.tagName.toUpperCase() === 'INPUT' && el.type === 'hidden') {
			elForm.removeChild(el);
		}
	}
	if (extra) {
		for (i in extra) {
			elHidden = document.createElement('input');
			elHidden.setAttribute('type','hidden');
			elHidden.setAttribute('name',i);
			elHidden.setAttribute('value',extra[i]);
			elForm.appendChild(elHidden);
		}
	}
	
	for (i = 0;i<this._oColumnSet.keys.length;i++) {
		var oColumn = this._oColumnSet.keys[i];
		switch (oColumn.editor) {
			case 'textbox':
				elForm[oColumn.key].setAttribute('value',oRecord[oColumn.key]);
				break;
			case 'textarea':
				elForm[oColumn.key].innerHTML = oRecord[oColumn.key];
				break;
			default:
				if (oColumn.edit) {
					YAHOO.widget.DataTypes.showFormField(elForm,oRecord,oColumn);
				}
				break;
		}
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
