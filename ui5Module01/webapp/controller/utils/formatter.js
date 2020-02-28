sap.ui.define([], function () {
  "use strict";

  return {
    statusText: function (sStatus) {
      return sStatus;
    },

    formatUpperCase: function (sName) {
      return sName && sName.toUpperCase();
    },

    changeDateFormat: function (oDate) {

      if (!oDate) {
        return '';
      }

      return moment(oDate).format('YYYY-MM-DD');
    },

    formatActionIcon: function (sAction) {
      switch (sAction) {
        case 'delete':
          return "sap-icon://delete";
          break;
        default:
          return 'sap-icon://begin';
      }
    },

    getStatusIcon: function (sBelnr, sLifnr) {

      if (!_.isString(sLifnr) || sLifnr.length === 0) {
        return 'sap-icon://supplier'
      }

      if (_.isString(sBelnr) && sBelnr.length > 0) {
        return 'sap-icon://instance';
      } else {
        return 'sap-icon://begin';
      }

    },

    getStatusText: function (sBelnr, sLifnr) {

      if (!_.isString(sLifnr) || sLifnr.length === 0) {
        return this.getResourceBundle().getText('textNoLifnr');
      }

      if (_.isString(sBelnr) && sBelnr.length > 0) {
        return this.getResourceBundle().getText('textProcessed');
      } else {
        return this.getResourceBundle().getText('textNotProcessed');
      }

    },

    getStatusState: function (sBelnr, sLifnr) {

      if (!_.isString(sLifnr) || sLifnr.length === 0) {
        return 'Error';
      }

      if (_.isString(sBelnr) && sBelnr.length > 0) {
        return 'Success';
      } else {
        return 'Warning';
      }

    }

  };
});