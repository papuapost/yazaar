
/**
 * A reference to the form created by createEditForm.
 *
 * @property _rowEditForm
 * @type HTMLElement (form)
 * @private
 */
YAHOO.widget.DataTable.prototype._rowEditForm = undefined;

/**
 * A reference to the record being edited
 *
 * @property _rowEditRecord
 * @type YAHOO.widget.Record
 * @private
 */
YAHOO.widget.DataTable.prototype._rowEditRecord = undefined;

/**
 * Holds a copy of the original values before edit
 *
 * @property _oldEditRowValues
 * @type object
 * @private
 */
YAHOO.widget.DataTable.prototype._oldEditRowValues = {};


/**
 * Creates a form within the container given with all fields marked for edit.  
 * If an url is not provided it will try to take the one from the DataSource, if available
 * The submit button for the form will be labeled Ok unless the third argument is provided.
 *
 * @method createEditForm
 * @param elContainer {String || HTMLElement}  ID or HTML element which will contain the form
 * @param url {String} URL to submit the form to.
 * @param submitButtonLabel {String} Record ID or record index
 */
 
YAHOO.widget.DataTable.prototype.createEditForm = function(elContainer,url,submitButtonLabel) {
	elContainer = YAHOO.util.Dom.get(elContainer);
	var elForm = document.createElement('form');
	YAHOO.util.Dom.addClass(elForm,'yui-dt-edit-form');
	this._rowEditForm = elForm;
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
			
			if (navigator.appName == 'Microsoft Internet Explorer') {
				elForm.appendChild(document.createElement('<input name ="'  + oColumn.key + '">'));
			} else {
			    var elTextbox = document.createElement("input");
				elTextbox.setAttribute('name',oColumn.key);
				elForm.appendChild(elTextbox);
			}
			
			break;
		case 'textarea':
			var elLabel = document.createElement('label');
			elLabel.setAttribute('for',oColumn.key);
			elLabel.innerHTML = oColumn.text || oColumn.key;
			elForm.appendChild(elLabel);
			
			if (navigator.appName == 'Microsoft Internet Explorer') {
				elForm.appendChild(document.createElement('<TEXTAREA NAME="' + oColumn.key + '">'));
			} else {
				var elTextArea = document.createElement('textarea');
				elTextArea.setAttribute('name',oColumn.key);
				elForm.appendChild(elTextArea);
			}
			break;
		default:
			if (oColumn.edit) {
				oColumn._dataType.createFormField(elForm,oColumn);
			}
			break;
		}
	}
	var buttonSubmit = document.createElement('input');
	buttonSubmit.setAttribute('type','submit');
	buttonSubmit.setAttribute('value', submitButtonLabel || 'Ok');
	elForm.appendChild(buttonSubmit);
	
	YAHOO.util.Event.on(elForm,'submit',this._submitForm,this,true);
	this.createEvent('formValidateEvent');
	this.createEvent('formSubmitEvent');
};

/**
 * Fills the previous form with values from the given recordCreates a form within the container given with all fields marked for edit.  
 * If the second argument is given, it will create hidden input elements taking the property names and values from the object
 *
 * @method showEditForm
 * @param oRecord {YAHOO.widget.Record}  DataTable record to be edited
 * @param extra {Object} Object containing name:value pairs to be inserted into the form as hidden input elements
 */
 
YAHOO.widget.DataTable.prototype.showEditForm = function(oRecord,extra) {
	var elForm = this._rowEditForm,i,elHidden;
	this._rowEditRecord = oRecord;
	for (var i = 0; i < elForm.childNodes.length;i++) {
		var el = elForm.childNodes[i];
		if (el.nodeType === 1 && el.tagName.toUpperCase() === 'INPUT' && el.type === 'hidden') {
			elForm.removeChild(el);
		}
	}
			
		
	if (extra) {
		for (i in extra) {
			if (navigator.appName == 'Microsoft Internet Explorer') {
				elHidden = document.createElement('<input type="hidden" name ="'  + i + '">');
			} else {
				elHidden = document.createElement('input');
				elHidden.setAttribute('type','hidden');
				elHidden.setAttribute('name',i);
			}
			elHidden.setAttribute('value',extra[i]);
			elForm.appendChild(elHidden);
		}
	}
			
	
	for (i = 0;i<this._oColumnSet.keys.length;i++) {
		var oColumn = this._oColumnSet.keys[i];
		this._oldEditRowValues[oColumn.key] = oRecord[oColumn.key];
		switch (oColumn.editor) {
		case 'textbox':
			elForm[oColumn.key].setAttribute('value',oRecord[oColumn.key]);
			break;
		case 'textarea':
			elForm[oColumn.key].innerHTML = oRecord[oColumn.key];
			break;
		default:
			if (oColumn.edit) {
				oColumn._dataType.showFormField(elForm[oColumn.key],oRecord,oColumn);
			}
			break;
		}
	}
};

/**
 * Function called when the user submits the form
 * It will read the values from the form, fire cellValidateEvent for each field,
 * fire formValidateEvent for the whole form and if no error is found so far (for all validate, true means it does validate Ok)
 * it will update the DataTable and fire the event formSubmitEvent.  
 * If that event returns true, it means it is ok to allow the regular form submit
 * 
 * @method _submitForm
 * @param ev {Event object}
 */


YAHOO.widget.DataTable.prototype._submitForm = function (ev) {
	var elForm = this._rowEditForm;
	var cols = this._oColumnSet.keys;
	var oRecord = this._rowEditRecord;
	var newValues = {};
	var go = true;
	for (var i = 0;i < cols.length;i++) {
		var col = cols[i],field = elForm[col.key];
		if ((col.edit || col.editor) && field) {
			newValues[col.key] = col._dataType.getFormValue(field,col);
			if (col._dataType.validateForm(field,col)
				&& this.fireEvent("cellValidateEvent",{
					target:field,
					oldData:this._oldEditRowValues[col.key],
					oColumn:col,oRecord:oRecord
			})) {
				col._dataType.showFieldError(field,false);
			} else {
				col._dataType.showFieldError(field,true);
				go = false
			}
		}
	}
	
	if (go) {
		go = this.fireEvent('formValidateEvent',{
			form: elForm,
			oldData: this._oldEditRowValues,
			newData: newValues,
			oRecord: oRecord
		});
	}
	
	if (go) {
		for(var key in newValues) {
			oRecord[key] = newValues[key];
		}
		this.updateRow(oRecord,parseInt(oRecord.yuiRecordId.substr(9)));
		go = this.fireEvent('formSubmitEvent',{
			form: elForm,
			oldData: this._oldEditRowValues,
			newData: newValues,oRecord:oRecord
		});
	}
	if (go) {
		return true;
	}
	YAHOO.util.Event.stopEvent(ev);
	return false;
};

/**
* This function is provided as an option to submit the form via the XHR object.  
* It is mean to be used as the function to call on the formSubmitEvent.
* When doing so, it is necesary to povide the callback ofbject for the XHR reply:
* <code>dt.dataTable.subscribe('formSubmitEvent', dt.dataTable.postEditForm, asyncRequestCallback);</code>
 * 
 * @method postEditForm
 * @param ev {Event object}  (ignored)
 * @param callback {object} as per YAHOO.util.Connect.asyncRequest callback object
 */

			
YAHOO.widget.DataTable.prototype.postEditForm = function(ev,callback) {
	YAHOO.util.Connect.setForm(this._rowEditForm);   
	YAHOO.util.Connect.asyncRequest('POST', this._rowEditForm.action, callback);
	return false;
};