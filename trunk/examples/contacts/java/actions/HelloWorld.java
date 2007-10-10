package actions;
import com.opensymphony.xwork2.ActionSupport;

public class HelloWorld extends ActionSupport {
	public String getGreeting() {
		return getText("greeting");
	}
}
