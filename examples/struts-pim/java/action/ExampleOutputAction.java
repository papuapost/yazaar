package action;

import java.util.Map;
import java.util.HashMap;
import com.googlecode.jsonplugin.JSONResult;
import com.googlecode.jsonplugin.annotations.JSON;
import org.apache.struts2.config.ParentPackage;
import org.apache.struts2.config.Result;

@ParentPackage("json-default")
@Result(name="success", value="", type=JSONResult.class)
@SuppressWarnings("unchecked")
public class ExampleOutputAction {

    private String stringValue = "A string value";
    public String getStringValue() {
        return stringValue;
    }
    public void setStringValue(String value) {
        stringValue = value;
    }

    private int[] intArray = {10, 20};
    public int[] getIntArray() {
        return intArray;
    }
    public void setIntArray(int[] value) {
        intArray = value;
    }

	private Map map = new HashMap();
	public Map getMap() {
        return map;
    }
	public void setMap(Map value) {
        map = value;
    }

    private String nextRecord = "start a named record";
    @JSON(name="record")
    public String getNextRecord() {
        return nextRecord;
    }

    //'transient' fields are not serialized
    @SuppressWarnings("unused")
    private transient String stayHome;

    //fields without getter method are not serialized
    @SuppressWarnings("unused")
    private String noGetterForMe;

	public String execute() {
        map.put("Zaphod", "Just this guy, you know");
        map.put("Arthur", "Monkey-Boy");
        return "success";
    }
}
