using System;
using System.Collections.Generic;
using System.Text;
using NUnit.Framework;

namespace testing
{
    class TestNUnit
    {

        [TestFixture]
        public class SetupTest
        {

            bool logic = false;

            [SetUp]
            public void SetUp()
            {
                logic = true;
            }

            [Test]
            public void SetUpTest()
            {
                Assert.IsTrue(logic);
            }

        }
    
    }
}
