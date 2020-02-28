sap.ui.define([], function () {
  "use strict";

  return {

    getFirstDateMonth: function (sDate, iMonth) {

      if (!_.isString(sDate) || sDate.length === 0 || !_.isNumber(iMonth)) {
        return null;
      }

      var oMoment = moment(sDate);

      if (!oMoment.isValid()) {
        return null;
      }

      if (iMonth >= 0) {
        oMoment.add(iMonth, 'months');
      } else {
        oMoment.subtract(iMonth * -1, 'months');
      }

      return moment().set('year', oMoment.get('year')).set('month', oMoment.get('month')).set('date', 1).format('YYYYMMDD');

    }

  };
});