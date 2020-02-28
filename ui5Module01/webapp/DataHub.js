sap.ui.define([
  "sap/ui/base/Object",
  "sap/ui/model/json/JSONModel"
], function (Object, JSONModel) {
  "use strict";

  return Object.extend('mta0010.ui5Module01.model.common.DataHub',{

    /**
     * 공통변수
     * manifest : manifest 설정정보
     * device : device 모델
     * i18n : i18n 리소스 번들
     */
    manifest : null,
    device : null,
    i18n : null,
    router: null,
    nameSpace: "mta0010.ui5Module01",

    /**
     * OData모델객체
     */
     f4Vendor : null,
     f4Purdoc : null,
     f4Matdoc : null,
     f4SupInv : null,
     f4Product : null,
     f4PayTerm : null,
     purchaseHistory : null,
     apiSupplierInvoice : null,

    /**
     * Main뷰 모델
     */
    mainData : null,
    mainView : null

  });
});