package actions;
import com.opensymphony.xwork2.ActionSupport;

public class Greeting extends ActionSupport {
	public String getGreeting() {
		return getText("greeting");
	}
}
