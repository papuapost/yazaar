package action;

import java.util.List;
import java.util.ArrayList;
import java.util.Date;
import org.apache.struts2.config.ParentPackage;
import org.apache.struts2.config.Result;
import com.googlecode.jsonplugin.JSONResult;
import com.googlecode.jsonplugin.annotations.JSON;

@SuppressWarnings("unchecked")
@ParentPackage("my-default")
@Result(name="success", value="", type=JSONResult.class)
public class ContactLoadAction {
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

		@SuppressWarnings("deprecation")
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
