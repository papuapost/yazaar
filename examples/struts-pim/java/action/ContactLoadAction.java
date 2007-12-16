package action;

import java.util.List;
import java.util.ArrayList;
import java.util.Date;

import org.apache.struts2.config.ParentPackage;
import org.apache.struts2.config.Result;

import com.googlecode.jsonplugin.JSONResult;
import com.googlecode.jsonplugin.annotations.JSON;

@ParentPackage("my-default")
@Result(name="success", value="", type=JSONResult.class)
@SuppressWarnings("unchecked")
public class ContactLoadAction {

/*
MY.Contacts.prototype.LOCAL_DATA = {
    result : [
        {id: "c5b6bbb1-66d6-49cb-9db6-743af6627828", last_name: "Beeblebrox ", first_name: "Zaphod ", extension: "555-123-4565", username: "zaphie ", hired: "04/01/1978", hours: -1, editor: "1"},
        {id: "7c424227-8e19-4fb5-b089-423cfca723e1", last_name: "Yooden", first_name: "Vranx", extension: "555-123-4566", username: "conker", hired: "04/01/1978", hours: 37.5, editor: "1"},
        {id: "9320ea40-0c01-43e8-9cec-8fb9b3928c2c", last_name: "Halfrunt", first_name: "Gag", extension: "555-123-4567", username: "ziggy", hired: "04/01/1978", hours: 7, editor: "0"},
        {id: "3b27c933-c1dc-4d85-9744-c7d9debae196", last_name: "Android", first_name: "Marvin", extension: "555-123-4568", username: "blue", hired: "06/15/1978", hours: 161, editor: "1"},
        {id: "554ff9e7-a6f5-478a-b76b-a666f5c54e40", last_name: "McMillan", first_name: "Tricia", extension: "555-123-4569", username: "trillian", hired: "05/28/1978", hours: 37.5, editor:"0"}
    ]
};
 */

	private List contactLoad = new ArrayList();
    @JSON(name="result")
	public List getContactLoad() {

    	contactLoad.add(new Contact(
    			"c5b6bbb1-66d6-49cb-9db6-743af6627828",
    			"Beeblebrox",
    			"Zaphod ",
    			"555-123-4565",
    			"zaphie",
    			"04/01/1978",
    			"-1",
    			"1"
    	));

		return contactLoad;
	}

    public String execute() {
		return "success";
	}

	public class Contact {

		public Contact() {};

		public Contact(String id, String last_name, String first_name,
				String extension, String username, String hired, String hours, String editor)
		{
			setId(id);
			setLast_name(last_name);
			setFirst_name(first_name);
			setExtension(extension);
			setUsername(username);
			setHired(new Date(hired));
			setHours(new Double(hours));
			setEditor(editor);
		}

		private String id;
		public void setId(String value) {
			id = value;
		}
		public String getId() {
			return id;
		}

		private String last_name;
		public void setLast_name(String value) {
			last_name = value;
		}
		public String getLast_name() {
			return last_name;
		}

		private String first_name;
		public void setFirst_name(String value) {
			first_name = value;
		}
		public String getFirst_name() {
			return first_name;
		}

		private String extension;
		public void setExtension(String value) {
			extension = value;
		}
		public String getExtension() {
			return extension;
		}

		private String username;
		public void setUsername(String value) {
			username = value;
		}
		public String getUsername() {
			return username;
		}

		private Date hired;
		public void setHired(Date value) {
			hired = value;
		}
		public Date getHired() {
			return hired;
		}

		private Double hours;
		public void setHours(Double value) {
			hours = value;
		}
		public Double getHours() {
			return hours;
		}

		private String editor;
		public void setEditor(String value) {
			editor = value;
		}
		public String getEditor() {
			return editor;
		}

	}

}
