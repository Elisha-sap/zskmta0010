sap.ui.define([
    "sap/ui/core/util/MockServer",
    "sap/base/util/UriParameters"
], function (MockServer, UriParameters) {
    "use strict";

    return {
        init: function () {
            // create
            var oMockServer = new MockServer({
                rootUri: "/sap/opu/odata/sap/API_SUPPLIERINVOICE_PROCESS_SRV/"
            });

            var oUriParameters = new UriParameters(window.location.href);

            // configure mock server with a delay
            MockServer.config({
                autoRespond: true,
                autoRespondAfter: oUriParameters.get("serverDelay") || 500
            });

            // simulate
            var sPath = "../localService";
            oMockServer.simulate(sPath + "/metadata_API_SUPPLIERINVOICE_PROCESS_SRV.xml", sPath + "/mockdata");

            // start
            oMockServer.start();
        }
    };

});