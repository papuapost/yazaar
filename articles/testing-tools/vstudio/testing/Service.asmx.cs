using System;
using System.Data;
using System.Web;
using System.Collections;
using System.Web.Services;
using System.Web.Services.Protocols;
using System.ComponentModel;

namespace testing
{
    /// <summary>
    /// Summary description for Service
    /// </summary>
    [WebService(Namespace = "http://husted.com/")]
    [WebServiceBinding(ConformsTo = WsiProfiles.BasicProfile1_1)]
    [ToolboxItem(false)]
    public class Service : System.Web.Services.WebService
    {

        [WebMethod]
        public Notes Authenticate(String username, String password)
        {
            Notes notes = new Notes();
            notes.Add("Congratulations!");
            notes.Add("You successfully loaded this note from the server without refreshing the page!");

            return notes;
        }

        [WebMethod]
        public Data Contact(String name, String email, String phone)
        {

            Data data = new Data();

            data.Message = "success";
            data.Greeting = "Hello username";

            return data;

        }

    }

    public class Notes : ArrayList {}

    public class Data
    {
        public Data()
        { }

        private String _Message;
        public String Message
        {
            get { return _Message; }
            set { _Message = value; }
        }

        private String _Greeting;
        public String Greeting
        {
            get { return _Greeting; }
            set { _Greeting = value; }
        }
    }
}
