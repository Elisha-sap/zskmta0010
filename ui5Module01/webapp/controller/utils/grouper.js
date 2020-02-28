sap.ui.define([], function () {

    "use strict";
    return {
      groupUnitNumber: function (oResourceBundle) {
        return function (oContext) {
          var iPrice = oContext.getProperty("UnitNumber"),
            sKey,
            sText;

          if (iPrice <= 20) {
            sKey = "LE20";
            sText = oResourceBundle.getText("masterGroup1Header1");
          } else {
            sKey = "GT20";
            sText = oResourceBundle.getText("masterGroup1Header2");
          }

          return {
            key: sKey,
            text: sText
          };
        };
      },

      groupVendor: function (oContext) {

        var sKey = oContext.getObject().Supno;
        var sText = oContext.getObject().Zspcn +
          ' (' + oContext.getObject().Supno + ')' +
          ' / ' + oContext.getObject().Zspbt + ' (' +
          oContext.getObject().Zspit + ')' +
          ' / ' + oContext.getObject().Zspar;

        return {
          key: sKey,
          text: sText
        }
      }
    };
  }
);