sap.ui.define([
    "sap/ui/core/util/MockServer",
    "sap/base/util/UriParameters"
], function (MockServer, UriParameters) {
    "use strict";

    return {
        init: function () {
            // create
            var oMockServer = new MockServer({
                rootUri: "/sap/opu/odata/sap/YY1_C_PRODUCT_VH_CDS/"
            });

            var oUriParameters = new UriParameters(window.location.href);

            // configure mock server with a delay
            MockServer.config({
                autoRespond: true,
                autoRespondAfter: oUriParameters.get("serverDelay") || 500
            });

            // simulate
            var sPath = "../localService";
            oMockServer.simulate(sPath + "/metadata_YY1_C_PRODUCT_VH_CDS.xml", sPath + "/mockdata");

            // start
            oMockServer.start();
        }
    };

});