using System;
using System.Text;
using System.Text.RegularExpressions;
using System.Threading;
using NUnit.Framework;
using Selenium;

namespace testing_apps
{
    [TestFixture]
    public class SeleniumTest
    {
        private ISelenium selenium;
        private StringBuilder verificationErrors;

        [SetUp]
        public void SetupTest()
        {
            selenium = new DefaultSelenium("localhost", 4444, "*chrome", "http://localhost:8080/");
            selenium.Start();
            verificationErrors = new StringBuilder();
        }

        [TearDown]
        public void TeardownTest()
        {
            try
            {
                selenium.Stop();
            }
            catch (Exception)
            {
                // Ignore errors if unable to close the browser
            }
            Assert.AreEqual("", verificationErrors.ToString());
        }

        [Test]
        public void TheNewTest()
        {
            selenium.Open("/index.html");
            Assert.AreEqual("Testing Apps ...", selenium.GetTitle());
            selenium.Click("link=Ajax Works");
            selenium.WaitForPageToLoad("30000");
            Assert.AreEqual("Simple Ajax Application", selenium.GetTitle());
            selenium.Click("hello-button");
            for (int second = 0; ; second++)
            {
                if (second >= 60) Assert.Fail("timeout");
                try
                {
                    if (selenium.IsAlertPresent()) break;
                }
                catch (Exception)
                { }
                Thread.Sleep(1000);
            }
            try
            {
                Assert.AreEqual("AJAX works! Status is (200) OK.", selenium.GetAlert());
            }
            catch (AssertionException e)
            {
                verificationErrors.Append(e.Message);
            }
            selenium.Open("/index.html");
            Assert.AreEqual("Testing Apps ...", selenium.GetTitle());
            selenium.Click("link=Ajax Works 2");
            selenium.WaitForPageToLoad("30000");
            Assert.AreEqual("Simple Ajax Application", selenium.GetTitle());
            selenium.Click("hello-button");
            for (int second = 0; ; second++)
            {
                if (second >= 60) Assert.Fail("timeout");
                try
                {
                    if (selenium.IsTextPresent("Say Hello World via Ajax!")) break;
                }
                catch (Exception)
                { }
                Thread.Sleep(1000);
            }
            selenium.Open("/index.html");
            Assert.AreEqual("Testing Apps ...", selenium.GetTitle());
        }
    }
}
