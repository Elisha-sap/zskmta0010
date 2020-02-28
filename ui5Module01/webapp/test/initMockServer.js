sap.ui.define([
    "../localService/mockserver_YY1_C_SUPPLIER_VH_CDS",
    "../localService/mockserver_YY1_C_PURCHASEORDER_VH_CDS",
    "../localService/mockserver_YY1_C_MATERIALDOCUMENT_VH_CDS",
    "../localService/mockserver_YY1_C_SUPPLIERINVOICE_VH_CDS",
    "../localService/mockserver_YY1_C_PRODUCT_VH_CDS",
    "../localService/mockserver_YY1_C_PAYMENTTERM_VH_CDS",
    "../localService/mockserver_YY1_C_POHISTORYFORIV_CDS",
    "../localService/mockserver_API_SUPPLIERINVOICE_PROCESS_SRV",
], function (mockserver_YY1_C_SUPPLIER_VH_CDS,
             mockserver_YY1_C_PURCHASEORDER_VH_CDS,
             mockserver_YY1_C_MATERIALDOCUMENT_VH_CDS,
             mockserver_YY1_C_SUPPLIERINVOICE_VH_CDS,
             mockserver_YY1_C_PRODUCT_VH_CDS,
             mockserver_YY1_C_PAYMENTTERM_VH_CDS,
             mockserver_YY1_C_POHISTORYFORIV_CDS,
             mockserver_API_SUPPLIERINVOICE_PROCESS_SRV) {
    "use strict";

    // initialize the mock server
    mockserver_YY1_C_SUPPLIER_VH_CDS.init();
    mockserver_YY1_C_PURCHASEORDER_VH_CDS.init();
    mockserver_YY1_C_MATERIALDOCUMENT_VH_CDS.init();
    mockserver_YY1_C_SUPPLIERINVOICE_VH_CDS.init();
    mockserver_YY1_C_PRODUCT_VH_CDS.init();
    mockserver_YY1_C_PAYMENTTERM_VH_CDS.init();
    mockserver_YY1_C_POHISTORYFORIV_CDS.init();
    mockserver_API_SUPPLIERINVOICE_PROCESS_SRV.init();

    // initialize the embedded component on the HTML page
    sap.ui.require(["sap/ui/core/ComponentSupport"]);
});