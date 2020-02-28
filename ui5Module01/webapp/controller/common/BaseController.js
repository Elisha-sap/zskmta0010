sap.ui.define(
  [
    'sap/ui/core/mvc/Controller',
    'sap/ui/core/routing/History',
    'sap/m/MessageToast',
    'sap/m/MessageBox',
    'sap/ui/model/Filter',
    'sap/ui/model/Sorter',
    'sap/ui/model/json/JSONModel',
    'mta0010/ui5Module01/controller/utils/formatter',
    'mta0010/ui5Module01/controller/utils/types',
    'mta0010/ui5Module01/controller/utils/grouper',
    'mta0010/ui5Module01/controller/utils/dateTime',
    'mta0010/ui5Module01/controller/utils/validator'
  ],
  function(
    Controller,
    History,
    MessageToast,
    MessageBox,
    Filter,
    Sorter,
    JSONModel,
    formatter,
    types,
    grouper,
    dateTime,
    validator
  ) {
    'use strict';

    return Controller.extend('mta0010.ui5Module01.controller.common.BaseController', {
      formatter: formatter,
      types: types,
      grouper: grouper,
      dateTime: dateTime,
      validator: validator,

      /***************************************************************
       * ■ 상수 - 경로
       ***************************************************************/
      PATH: {
        POPUP_FRAGMENT: '.view.popup.',
        F4_FRAGMENT: '.view.f4'
      },

      /***************************************************************
       * ■ 상수 - 필터
       ***************************************************************/
      OP: {
        ALL: sap.ui.model.FilterOperator.All,
        ANY: sap.ui.model.FilterOperator.Any,
        BT: sap.ui.model.FilterOperator.BT,
        CONTAINS: sap.ui.model.FilterOperator.Contains,
        ENDSWITH: sap.ui.model.FilterOperator.EndsWith,
        EQ: sap.ui.model.FilterOperator.EQ,
        GE: sap.ui.model.FilterOperator.GE,
        GT: sap.ui.model.FilterOperator.GT,
        LE: sap.ui.model.FilterOperator.LE,
        LT: sap.ui.model.FilterOperator.LT,
        NE: sap.ui.model.FilterOperator.NE,
        STARTSWITH: sap.ui.model.FilterOperator.StartsWith
      },

      /***************************************************************
       * ■ 상수 - 메세지박스
       ***************************************************************/
      // 유형
      MSGTYPE: {
        ALERT: 'alert',
        CONFIRM: 'confirm',
        ERROR: 'error',
        INFORMATION: 'information',
        SHOW: 'show',
        SUCCESS: 'success',
        WARNING: 'warning'
      },

      // 액션
      MSGBOXACTION: {
        ABORT: sap.m.MessageBox.Action.ABORT,
        CANCEL: sap.m.MessageBox.Action.CANCEL,
        CLOSE: sap.m.MessageBox.Action.CLOSE,
        DELETE: sap.m.MessageBox.Action.DELETE,
        IGNORE: sap.m.MessageBox.Action.IGNORE,
        NO: sap.m.MessageBox.Action.NO,
        OK: sap.m.MessageBox.Action.OK,
        RETRY: sap.m.MessageBox.Action.RETRY,
        YES: sap.m.MessageBox.Action.YES
      },

      // 아이콘
      MSGBOXICON: {
        ERROR: sap.m.MessageBox.Icon.ERROR,
        INFORMATION: sap.m.MessageBox.Icon.INFORMATION,
        NONE: sap.m.MessageBox.Icon.NONE,
        QUESTION: sap.m.MessageBox.Icon.QUESTION,
        SUCCESS: sap.m.MessageBox.Icon.SUCCESS,
        WARNING: sap.m.MessageBox.Icon.WARNING
      },

      /***************************************************************
       * ■ 컨트롤러 전역변수
       ***************************************************************/
      _h: null,
      fragments: [],
      sF4File: '',
      sF4Name: '',
      oF4Control: null,

      /***************************************************************
       * ■ 모델 생성
       ***************************************************************/
      createJSONModel: function() {
        return new JSONModel();
      },

      /***************************************************************
       * ■ 컴포넌트
       ***************************************************************/
      // 컴포넌트객체
      getComponent: function() {
        return this.getOwnerComponent();
      },

      /***************************************************************
       * ■ 라우터
       ***************************************************************/
      // 라우터객체
      getRouter: function() {
        return sap.ui.core.UIComponent.getRouterFor(this);
      },

      /***************************************************************
       * ■ 모델
       ***************************************************************/
      // 모델객체
      getModel: function(sName) {
        var oModel = this.getView().getModel(sName);

        if (oModel) {
          // 뷰모델
          return oModel;
        } else {
          // 컴포넌트모델
          return this.getComponent().getModel(sName);
        }
      },

      // 모델바인딩
      setModel: function(oModel, sName) {
        this.getView().setModel(oModel, sName);
      },

      // 리소스번들
      getResourceBundle: function() {
        return this.getOwnerComponent()
          .getModel('i18n')
          .getResourceBundle();
      },

      // i18n 검색
      getI18nText: function(sKey, aParams) {
        if (!aParams) {
          aParams = [];
        }

        return this.getResourceBundle().getText(sKey, aParams);
      },

      /***************************************************************
       * ■ 네비게이션
       ***************************************************************/
      // BACK
      myNavBack: function(sRoute, mData) {
        var oHistory = History.getInstance();
        var sPreviousHash = oHistory.getPreviousHash();

        if (sPreviousHash !== undefined) {
          window.history.go(-1);
        } else {
          var bReplace = true;
          this.getRouter().navTo(sRoute, mData, bReplace);
        }
      },

      /***************************************************************
       * ■ 데이터허브
       ***************************************************************/
      // 데이터허브
      getDataHub: function() {
        return this.getOwnerComponent()._h;
      },

      /***************************************************************
       * ■ manifest
       ***************************************************************/
      // 네임스페이스
      getNamespace: function() {
        return this.getDataHub().manifest['sap.app']['id'];
      },

      /***************************************************************
       * ■ 컨트롤
       ***************************************************************/
      getControl: function(sId) {
        return this.getView().byId(sId);
      },

      /***************************************************************
       * ■ 이벤트
       ***************************************************************/
      // XML 커스텀데이터
      getCustomData: function(oEvent, sKey) {
        var aCustomData = oEvent && oEvent.getSource() ? oEvent.getSource().getCustomData() : [];

        return _p.go(
          aCustomData,
          _p.find(function(oCustomData) {
            return oCustomData.getProperty('key') === sKey;
          }),
          function(oResult) {
            return oResult && oResult.getProperty('value');
          }
        );
      },

      /***************************************************************
       * ■ 메세지
       ***************************************************************/
      // 메세지 출력
      showMessage: function(sStatus, sI18nTitle, sI18nMessage) {
        var bCompact = !!this.getView()
          .$()
          .closest('.sapUiSizeCompact').length;
        var sTitle = this.getI18nText(sI18nTitle) || this.getI18nText('errorI18n');
        var sMessage = this.getI18nText(sI18nMessage) || this.getI18nText('errorRegisteredKey');

        var deferred = Q.defer();

        switch (sStatus) {
          case this.MSGTYPE.ALERT:
          case this.MSGTYPE.CONFIRM:
          case this.MSGTYPE.ERROR:
          case this.MSGTYPE.INFORMATION:
          case this.MSGTYPE.SHOW:
          case this.MSGTYPE.SUCCESS:
          case this.MSGTYPE.WARNING:
            MessageBox[sStatus](sMessage, {
              title: sTitle,
              onClose: function(oAction) {
                return deferred.resolve(oAction);
              },
              styleClass: bCompact ? 'sapUiSizeCompact' : ''
            });
            break;
          default:
            MessageBox[this.MSGTYPE.INFORMATION](sMessage, {
              title: sTitle,
              onClose: function(oAction) {
                return deferred.resolve(oAction);
              },
              styleClass: bCompact ? 'sapUiSizeCompact' : ''
            });
            break;
        }

        return deferred.promise;
      },

      // MessageToast
      showMessageToast: function(si18n, sWidth, aParams) {
        if (!sWidth) {
          sWidth = '15em';
        }

        if (!aParams) {
          aParams = [];
        }

        if (si18n) {
          MessageToast.show(this.getI18nText(si18n, aParams), {
            width: sWidth
          });
        } else {
          this.showMessage(this.MSGTYPE.ERROR, 'errorI18n', 'errorRegisteredKey');
        }
      },

      // Q 프라미스 에러 출력
      showPromiseError: function(oError) {
        // TO-DO : 에러메세지에서 해당 내용을 추출하여 메세지에 추가 필요
        this.showMessage('error', 'errorClientTitle', 'errorClient');
      },

      // Q 프라미스 에러를 화면에 출력
      callPromiseErrorPopup: function(oEvent) {
        var sErrorDetail = '';

        if (oEvent.statusCode === 500) {
          sErrorDetail = this.getI18nText('errorServer');
        } else {
          var oError = JSON.parse(oEvent.responseText);
          var oMainError = oError.error.message;
          var aErrorList = oError.error.innererror.errordetails;

          if (aErrorList && aErrorList.length > 0) {
            var sErrorType = _.last(aErrorList).code;
          }
          var sStatusCode = oEvent.statusCode;

          if (sErrorType === '/IWBEP/CX_MGW_BUSI_EXCEPTION') {
            this._sErrorText = this.getI18nText('errorTextBusi');
          } else {
            this._sErrorText = this.getI18nText('errorTextTech');
          }

          var aErrorListCreated = _.dropRight(aErrorList);
          sErrorDetail = this.getI18nText('errorTextHead') + '\n';

          if (_.isArray(aErrorListCreated) && aErrorListCreated.length === 0) {
            sErrorDetail = oMainError.value;
          } else {
            _.forEach(aErrorListCreated, function(oList) {
              sErrorDetail += '[' + oList.severity + '] ' + oList.message + '\n';
            });
          }
        }

        this.showServiceError(sErrorDetail);
      },

      // 서버오류메세지
      showServiceError: function(sDetails) {
        if (this._bMessageOpen) {
          return;
        }
        this._bMessageOpen = true;
        MessageBox.error(this._sErrorText, {
          id: 'serviceErrorMessageBox',
          details: sDetails,
          styleClass: this.getOwnerComponent().getContentDensityClass(),
          actions: [MessageBox.Action.CLOSE],
          onClose: function() {
            this._bMessageOpen = false;
          }.bind(this)
        });
      },

      // 확인팝업출력 - 프라미스 반환
      callPopupConfirm: function(sI18n, sType, sIcon) {
        var deferred = Q.defer();
        var sMessage = this.getI18nText(sI18n);

        if (!this.hasStringValue(sType)) {
          sType = 'success';
        }

        if (!this.hasStringValue(sIcon)) {
          sIcon = this.MSGBOXICON.NONE;
        }

        MessageBox[sType](sMessage, {
          icon: sIcon,
          actions: [this.MSGBOXACTION.YES, this.MSGBOXACTION.NO],
          onClose: function(oAction) {
            if (oAction === MessageBox.Action.YES) {
              deferred.resolve('OK');
            } else {
              deferred.resolve('NO');
            }
          }
        });

        return deferred.promise;
      },

      /***************************************************************
       * ■ 정합성체크
       ***************************************************************/
      // 문자열이 있는지 체크
      hasStringValue: function(sValue) {
        return _.isString(sValue) && !!sValue.length;
      },

      // 숫자값이 있는지 체크
      hasNumberValue: function(value) {
        if (!_.isNumber(parseFloat(value)) || _.isNaN(parseFloat(value)) || parseFloat(value) === 0) {
          return false;
        } else {
          return true;
        }
      },

      /***************************************************************
       * ■ 필터
       ***************************************************************/
      // 필터생성
      makeFilter: function(aFields, sOperator, vValue, bAnd) {
        if (!_p.isArray(aFields) || !aFields.length || _p.indexOf(_p.toArray(this.OP), sOperator) < 0) {
          return null;
        }

        return new Filter({
          filters: _p.map(aFields, function(sField) {
            return new Filter(sField, sOperator, vValue);
          }),
          and: !!bAnd
        });
      },

      // Aggregation 필터링
      setFilter: function(oControl, sAggregation, aFields, sValue, sOperator) {
        sOperator = _.isString(sOperator) && sOperator.length ? sOperator : this.OP.CONTAINS;

        var oFilter = this.makeFilter(aFields, sOperator, sValue, false);

        var aFilter = [];
        if (oFilter) {
          aFilter.push(oFilter);
        }
        oControl.getBinding(sAggregation).filter(aFilter);
      },

      // Aggregation 필터링 - 필터객체
      setFilterObj: function(oControl, sAggregation, aFilters, bAnd) {
        aFilters = _.isArray(aFilters) ? aFilters : [];

        if (bAnd) {
          var oFilter = new Filter(aFilters, true);
          oControl.getBinding(sAggregation).filter([oFilter]);
        } else {
          oControl.getBinding(sAggregation).filter(aFilters);
        }
      },

      // Aggregation 필터삭제
      clearFilter: function(oControl, sAggregation) {
        oControl.getBinding(sAggregation).filter([]);
      },

      // 필터생성 - 필터배열
      makeFilterObj: function(aFilterObj, bAnd) {
        return _p.isArray(aFilterObj) ? new Filter({ filters: aFilterObj, and: bAnd }) : null;
      },

      // 여러조건에 대한 필터 생성 (값은 문자열, 숫자, 날짜)
      // aSettings : field (필드명), op (연산자), from (값1), to (값2)
      makeMultiFilter: function(aSettings, bAnd) {
        var self = this;
        var aFilters = [];
        var oFilter = null;
        var aSummary = [];

        aFilters = _p.reduce(
          aSettings,
          function(memo01, oSetting) {
            aSummary = [];
            if (_p.isArray(oSetting.from)) {
              // 배열인 경우 처리
              aSummary = _p.reduce(
                oSetting.from,
                function(memo02, sValue) {
                  if (!_p.isUndefined(sValue) && !_p.isNull(sValue)) {
                    oFilter = null;

                    if (oSetting.blank) {
                      oFilter = self.makeFilter([oSetting.field], oSetting.op, sValue, false);
                    } else if (!oSetting.blank && sValue) {
                      oFilter = self.makeFilter([oSetting.field], oSetting.op, sValue, false);
                    }

                    if (oFilter) {
                      memo02.push(oFilter);
                    }

                    return memo02;
                  }
                },
                []
              );

              if (aSummary.length) {
                memo01.push(
                  new Filter({
                    filters: aSummary,
                    and: false
                  })
                );
              }
            } else {
              //배열이 아닌 단일값
              if (!_.isUndefined(oSetting.to) && !_.isNull(oSetting.to)) {
                memo01.push(new Filter(oSetting.field, oSetting.op, oSetting.from, oSetting.to));
              } else {
                if (!_.isUndefined(oSetting.from) && !_.isNull(oSetting.from)) {
                  if (_p.isString(oSetting.from)) {
                    if (oSetting.from.length) {
                      memo01.push(new Filter(oSetting.field, oSetting.op, oSetting.from));
                    } else if (oSetting.blank) {
                      memo01.push(new Filter(oSetting.field, oSetting.op, oSetting.from));
                    }
                  } else if (_p.isNumber(oSetting.from)) {
                    if (oSetting.from) {
                      memo01.push(new Filter(oSetting.field, oSetting.op, oSetting.from));
                    } else if (oSetting.blank) {
                      memo01.push(new Filter(oSetting.field, oSetting.op, oSetting.from));
                    }
                  } else if (_p.isDate(oSetting.from)) {
                    if (oSetting.from.getMilliseconds()) {
                      memo01.push(new Filter(oSetting.field, oSetting.op, oSetting.from));
                    } else if (oSetting.blank) {
                      memo01.push(new Filter(oSetting.field, oSetting.op, oSetting.from));
                    }
                  } else if (_p.is_boolean(oSetting.from)) {
                    memo01.push(new Filter(oSetting.field, oSetting.op, oSetting.from));
                  }
                }
              }
            }

            return memo01;
          },
          []
        );

        return new Filter({
          filters: aFilters,
          and: bAnd
        });
      },

      // 필터객체를 필터객체 배열로 만든다 - 필터가 없는 경우를 처리해 준다
      addFilterObjects: function(aFilters, oFilter) {
        aFilters = _p.isArray(aFilters) ? aFilters : [];

        if (_p.isObject(oFilter)) {
          aFilters.push(oFilter);
        }

        return aFilters;
      },

      /***************************************************************
       * ■ 정렬/그룹핑
       ***************************************************************/
      // 정렬객체
      makeSorter: function(sField, bDescending, bGrouping, fnComparator) {
        if (!_.isString(sField) || !sField.length) {
          return null;
        }

        bDescending = bDescending ? true : false;
        bGrouping = bGrouping ? true : false;

        return new Sorter(sField, bDescending, bGrouping, fnComparator);
      },

      // 정렬객체배열
      makeSorters: function(aSorterInfo) {
        var self = this;

        if (!_p.isArray(aSorterInfo) || !aSorterInfo.length) {
          return [];
        }

        return _p.map(aSorterInfo, function(oSorterInfo) {
          return self.makeSorter(
            oSorterInfo.field,
            oSorterInfo.descending,
            oSorterInfo.grouping,
            oSorterInfo.comparator
          );
        });
      },

      /***************************************************************
       * ■ 컨트롤 - DateRange
       * 포맷 : https://unicode.org/reports/tr35/tr35-dates.html#Date_Field_Symbol_Table
       ***************************************************************/
      // 날짜문자열
      getDRS_String: function(oDateRange, sFormat, bUTC) {
        if (!oDateRange) {
          return null;
        }

        if (!sFormat) {
          sFormat = 'yyyyMMdd';
        }

        if (!bUTC) {
          bUTC = false;
        }

        var oDateFormat = sap.ui.core.format.DateFormat.getDateInstance({
          pattern: sFormat
        });

        if (oDateRange.getDateValue()) {
          var sFdate = oDateFormat.format(oDateRange.getDateValue(), bUTC);
        }

        if (oDateRange.getSecondDateValue()) {
          var sTdate = oDateFormat.format(oDateRange.getSecondDateValue(), bUTC);
        }

        if (!sFdate || !sTdate) {
          return null;
        }

        return {
          FDATE: sFdate,
          TDATE: sTdate
        };
      },

      // Date객체
      getDRS_Date: function(oDateRange) {
        if (!oDateRange) {
          return null;
        }

        return {
          FDATE: oDateRange.getDateValue(),
          TDATE: oDateRange.getSecondDateValue()
        };
      },

      // 값초기화 - null 값으로 초기화 된다
      clearDRS: function(oDateRange) {
        if (oDateRange) {
          oDateRange.setValue(null);
        }
      },

      // DateRange에 값 설정 - yyyyMMdd
      setDateRange: function(oDateRange, sFdate, sTdate) {
        if (!oDateRange) {
          return null;
        }

        var oFdate = moment(sFdate);
        var oTdate = moment(sTdate);

        if (!oFdate.isValid() || !oTdate.isValid()) {
          return null;
        }

        oDateRange.setDateValue(oFdate.toDate());
        oDateRange.setSecondDateValue(oTdate.toDate());
      },

      /***************************************************************
       * ■ 컨트롤 - sap.m.List
       ***************************************************************/
      deleteListItem: function(aItems, sModel) {
        if (!_p.isArray(aItems) || !aItems.length) return -1;

        var aLists = _p.map(aItems, function(oItem) {
          oItem.setSelected(false);
          return _p.go(
            oItem.getBindingContext(sModel).getPath(),
            function(sPath) {
              return _p.mr(sPath, _.last(_.split(sPath, '/')));
            },
            function(sPath, sIndex) {
              return {
                model: v.substring(sPath, 0, sPath.length - sIndex.length - 1),
                index: _p.parseInt(sIndex)
              };
            }
          );
        });

        var sRootPath = aLists[0].model;
        var aModelData = this.getModel(sModel).getProperty(sRootPath);
        _p.each(_.reverse(_p.sortBy(aLists, 'index')), function(oList) {
          _p.removeByIndex(aModelData, oList.index);
        });

        this.getModel(sModel).setProperty(sRootPath, aModelData);
      },

      // 클릭한 아이템의 정보 - sap.m.Table
      getListItemContext: function(oEvent, sModelName) {
        var oContext = null;

        if (oEvent.getParameter('listItem')) {
          oContext = {
            oContext: oEvent.getParameter('listItem').getBindingContext(sModelName),
            sPath: oEvent
              .getParameter('listItem')
              .getBindingContext(sModelName)
              .getPath(),
            oData: oEvent
              .getParameter('listItem')
              .getBindingContext(sModelName)
              .getObject()
          };
        } else {
          oContext = {
            oContext: oEvent.getSource().getBindingContext(sModelName),
            sPath: oEvent
              .getSource()
              .getBindingContext(sModelName)
              .getPath(),
            oData: oEvent
              .getSource()
              .getBindingContext(sModelName)
              .getObject()
          };
        }

        return oContext;
      },

      // 아이템클릭시에 선택여부 변경 - sap.m.Table
      setListSelected: function(oEvent) {
        if (oEvent.getParameter('listItems')) {
          return;
        }

        var oItem = oEvent.getParameter('listItem');

        switch (oEvent.getSource().getMode()) {
          case 'MultiSelect':
            var bSelected = !oItem.getSelected();
            break;
          case 'None':
            return;
            break;
          case 'SingleSelect':
            var bSelected = true;
            break;
          case 'SingleSelectLeft':
            var bSelected = true;
            break;
          case 'SingleSelectMaster':
            var bSelected = true;
            break;
          default:
        }

        oEvent.getSource().setSelectedItem(oItem, bSelected);
      },

      // 선택된 아이템의 모델데이터 정보 - sap.m.Table/ListBase
      getTableSelectedItem: function(sId, sModelName) {
        var oTable = this.getControl(sId);

        var aItems = oTable.getSelectedItems();

        if (!_.isArray(aItems) || aItems.length !== 1) {
          return null;
        }

        var oItem = aItems[0];
        return _.cloneDeep(oItem.getBindingContext(sModelName).getObject());
      },

      // 선택된 아이템들의 모델데이터 정보 - sap.m.Table/ListBase
      getTableSelectedItems: function(sId, sModelName) {
        var oTable = this.getControl(sId);

        var aItems = oTable.getSelectedItems();

        if (!_.isArray(aItems) || aItems.length === 0) {
          return null;
        }
        var aData = [];

        _.forEach(aItems, function(oItem) {
          aData.push(_.cloneDeep(oItem.getBindingContext(sModelName).getObject()));
        });

        return aData;
      },
      
      getTableSelectedItems01: function(oTable, sModelName) {
      	
        var aItems = oTable.getSelectedItems();

        if (!_.isArray(aItems) || aItems.length === 0) {
          return null;
        }
        var aData = [];

        _.forEach(aItems, function(oItem) {
          aData.push(_.cloneDeep(oItem.getBindingContext(sModelName).getObject()));
        });

        return aData;
      }, 

      /***************************************************************
       * ■ 컨트롤 - sap.ui.table.Table
       ***************************************************************/
      getSelectedTableItem: function(oTable, oModel) {
        if (!oTable) return -1;

        var aSelectedindices = oTable.getSelectedIndices();

        if (!_.isArray(aSelectedindices) || aSelectedindices.length !== 1) {
          return null;
        }

        var aTableData = [];
        var aData = [];

        aTableData = oModel.getProperty(oTable.getBindingPath('rows'));

        return _.cloneDeep(aTableData[aSelectedindices[0]]);
      },

      getSelectedTableItems: function(oTable, oModel) {
        if (!oTable) return -1;

        var aSelectedindices = oTable.getSelectedIndices();

        if (!_.isArray(aSelectedindices) || aSelectedindices.length === 0) {
          return null;
        }

        var aTableData = [];
        var aData = [];

        aTableData = oModel.getProperty(oTable.getBindingPath('rows'));

        _.forEach(aSelectedindices, function(iIndex) {
          aData.push(_.cloneDeep(aTableData[iIndex]));
        });

        return aData;
      },

      getSelectedTableItemContexts: function(oTable) {
        if (!oTable) return undefined;

        var aSelectedIndex = oTable.getSelectedIndices();

        return _p.reduce(
          aSelectedIndex,
          function(memo, index) {
            memo.push(oTable.getContextByIndex(index));
            return memo;
          },
          []
        );
      },

      deleteTableItems: function(oTable, oModel) {
        if (!oTable) return -1;

        var aSelectedindices = oTable.getSelectedIndices();

        if (!_p.isArray(aSelectedindices) || !aSelectedindices.length) return null;

        var self = this;
        var sIndex = 0;
        var oRemainItem = [];

        var aLists = _p.map(aSelectedindices, function(iIndex) {
          return _p.go(
            oTable.getContextByIndex(iIndex).getPath(),
            function(sPath) {
              return _p.mr(sPath, _.last(_.split(sPath, '/')));
            },
            function(sPath, sIndex) {
              return {
                model: v.substring(sPath, 0, sPath.length - sIndex.length - 1),
                index: _p.parseInt(sIndex)
              };
            }
          );
        });

        var sRootPath = aLists[0].model;
        var aModelData = oModel.getProperty(sRootPath);
        _p.each(_.reverse(_p.sortBy(aLists, 'index')), function(oList) {
          _p.removeByIndex(aModelData, oList.index);
        });

        oModel.setProperty(sRootPath, aModelData);
        oTable.clearSelection();
      },

      /***************************************************************
       * ■ 추가
       ***************************************************************/
      getContextObject: function(oEvent, sModelName) {
        return oEvent
          .getSource()
          .getBindingContext(sModelName)
          .getObject();
      },

      /***************************************************************
       * ■ URL
       ***************************************************************/
      // 키값을 가지는 URL 생성
      makeUrlWithKey: function(sUrl, oKeys) {
        var sResult = sUrl;
        var iIndex = 0;

        sResult += '(';
        _.forEach(oKeys, function(sValue, sKey) {
          iIndex++;
          sResult = sResult + sKey + "='" + sValue + "',";
        });
        sResult = v.slice(sResult, 0, v.count(sResult) - 1);
        sResult += ')';

        return sResult;
      },

      /***************************************************************
       * ■ 데이터
       ***************************************************************/
      // 같은 속성에 대해서 값을 복사
      moveCorresponding: function(oFrom, oTo) {
        _.forIn(oTo, function(value, key) {
          if (!_.isUndefined(oFrom[key])) {
            oTo[key] = oFrom[key];
          }
        });
      },

      /***************************************************************
       * ■ 프레그먼트
       ***************************************************************/
      // 프레그먼트 팝업 open
      callPopupFragment: function(sFragmentName, oEvent) {
        var sFragmentFile = this.getNamespace() + this.PATH.POPUP_FRAGMENT + sFragmentName;

        if (!this.fragments[sFragmentName]) {
          this.fragments[sFragmentName] = sap.ui.xmlfragment(sFragmentFile, this);
        }

        this.getView().addDependent(this.fragments[sFragmentName]);
        jQuery.sap.syncStyleClass('sapUiSizeCompact', this.getView(), this.fragments[sFragmentName]);

        if (this.fragments[sFragmentName].getMetadata().getElementName() === 'sap.m.MessagePopover') {
          this.fragments[sFragmentName].openBy(oEvent.getSource());
        } else {
          this.fragments[sFragmentName].open();
        }
      },

      // 프레그먼트 팝업 close
      closePopupFragment: function(sFragmentName) {
        this.fragments[sFragmentName].close();
      },

      /***************************************************************
       * ■ 스크린
       ***************************************************************/
      //뷰모델의 BUSY 상태를 변경
      setBusy: function(oViewModel, bBusy) {
        oViewModel.setProperty('/busy', bBusy);
      },

      /***************************************************************
       * ■ OData 호출
       ***************************************************************/
      // Create : 단일생성 + Deep Insert
      call_odata_create: function(oModel, sUrl, oData) {
        if (!oModel || !this.hasStringValue(sUrl)) return null;

        oData = _.isObject(oData) ? oData : {};

        var deferred = Q.defer();

        oModel.create(sUrl, oData, {
          success: function(oData, oResponse) {
            oData.sUrl = sUrl;
            oData.oResponse = oResponse;
            deferred.resolve(oData);
          },
          error: function(oError) {
            oData.sUrl = sUrl;
            deferred.reject(oError);
          }
        });

        return deferred.promise;
      },

      // Read : 단일검색
      call_odata_read: function(oModel, sUrl, oKeys) {
        if (!oModel || !this.hasStringValue(sUrl)) return null;

        if (oKeys) {
          sUrl = this.makeUrlWithKey(sUrl, oKeys);
        }

        var deferred = Q.defer();

        oModel.read(sUrl, {
          success: function(oData, oResponse) {
            oData.sUrl = sUrl;
            oData.oResponse = oResponse;
            deferred.resolve(oData);
          },
          error: function(oError) {
            oError.sUrl = sUrl;
            deferred.reject(oError);
          }
        });

        return deferred.promise;
      },

      // Update : 단일변경
      call_odata_update: function(oModel, sUrl, oKeys, oData) {
        if (!oModel || !this.hasStringValue(sUrl)) return null;

        oData = _.isObject(oData) ? oData : {};

        if (oKeys) {
          sUrl = this.makeUrlWithKey(sUrl, oKeys);
        }

        var deferred = Q.defer();

        oModel.update(sUrl, oData, {
          success: function(oData, oResponse) {
            if (!oData) {
              oData = {};
            }
            oData.sUrl = sUrl;
            oData.oResponse = oResponse;
            deferred.resolve(oData);
          },
          error: function(oError) {
            oData.sUrl = sUrl;
            deferred.reject(oError);
          }
        });

        return deferred.promise;
      },

      // Delete : 단일삭제
      call_odata_delete: function(oModel, sUrl, oKeys) {
        if (!oModel || !this.hasStringValue(sUrl)) return null;

        if (oKeys) {
          sUrl = this.makeUrlWithKey(sUrl, oKeys);
        }

        var deferred = Q.defer();

        oModel.remove(sUrl, {
          success: function(oData, oResponse) {
            if (!oData) {
              oData = {};
            }
            oData.sUrl = sUrl;
            oData.oResponse = oResponse;
            deferred.resolve(oData);
          },
          error: function(oError) {
            oError.sUrl = sUrl;
            deferred.reject(oError);
          }
        });

        return deferred.promise;
      },

      // Query : 다중검색
      call_odata_query: function(oModel, sUrl, oParams, aFilters, aSorters) {
        if (!oModel || !this.hasStringValue(sUrl)) return null;

        aFilters = _p.isArray(aFilters) ? aFilters : [];
        aSorters = _p.isArray(aSorters) ? aSorters : [];
        oParams = _p.isObject(oParams) ? oParams : {};

        var deferred = Q.defer();

        oModel.read(sUrl, {
          success: function(oData, oResponse) {
            oData.sUrl = sUrl;
            oData.oResponse = oResponse;
            deferred.resolve(oData);
          },
          error: function(oError) {
            oError.sUrl = sUrl;
            deferred.reject(oError);
          },
          filters: aFilters,
          sorters: aSorters,
          urlParameters: oParams
        });

        return deferred.promise;
      },

      // Expand : Association 검색
      call_odata_expand: function(oModel, sUrl, oKeys, aAssociations) {
        if (!oModel || !this.hasStringValue(sUrl)) return null;

        if (_p.isObject(oKeys)) {
          sUrl = this.makeUrlWithKey(sUrl, oKeys);
        }

        if (_p.isArray(aAssociations) && aAssociations.length !== 0) {
          var sAssociation = _p.reduce(
            aAssociations,
            function(memo, oAssociation, index) {
              var sComma = index === 0 ? '' : ',';
              return memo + sComma + oAssociation;
            },
            ''
          );
        } else {
          return null;
        }

        var deferred = Q.defer();

        oModel.read(sUrl, {
          success: function(oData, oResponse) {
            oData.sUrl = sUrl;
            oData.oResponse = oResponse;
            deferred.resolve(oData);
          },
          error: function(oError) {
            oError.sUrl = sUrl;
            deferred.reject(oError);
          },
          urlParameters: {
            $expand: sAssociation
          }
        });

        return deferred.promise;
      },

      // Expands : Association 검색
      call_odata_expands: function(oModel, sUrl, oParams, aAssociations, aFilters, aSorters) {
        if (!oModel || !this.hasStringValue(sUrl)) return null;

        aFilters = _p.isArray(aFilters) ? aFilters : [];
        aSorters = _p.isArray(aSorters) ? aSorters : [];
        oParams = _p.isObject(oParams) ? oParams : {};

        if (_p.isArray(aAssociations) && aAssociations.length !== 0) {
          var sAssociation = _p.reduce(
            aAssociations,
            function(memo, oAssociation, index) {
              var sComma = index === 0 ? '' : ',';
              return memo + sComma + oAssociation;
            },
            ''
          );
          oParams['$expand'] = sAssociation;
        } else {
          return null;
        }

        var deferred = Q.defer();

        oModel.read(sUrl, {
          success: function(oData, oResponse) {
            oData.sUrl = sUrl;
            oData.oResponse = oResponse;
            deferred.resolve(oData);
          },
          error: function(oError) {
            oError.sUrl = sUrl;
            deferred.reject(oError);
          },
          filters: aFilters,
          sorters: aSorters,
          urlParameters: oParams
        });

        return deferred.promise;
      },

      call_odata_function: function(oModel, sUrl, oParams, bPost) {
        if (!oModel || !this.hasStringValue(sUrl)) return null;

        oParams = _p.isObject(oParams) ? oParams : {};

        var sMethod = bPost ? 'POST' : 'GET';

        var deferred = Q.defer();

        oModel.callFunction(sUrl, {
          method: sMethod,
          success: function(oData, oResponse) {
            oData.sUrl = sUrl;
            oData.oResponse = oResponse;
            deferred.resolve(oData);
          },
          error: function(oError) {
            oError.sUrl = sUrl;
            deferred.reject(oError);
          },
          urlParameters: oParams
        });

        return deferred.promise;
      },

      call_odata_read_stream: function(oModel, sUrl, oKeys) {
        if (!oModel || !this.hasStringValue(sUrl)) return null;

        if (oKeys) {
          sUrl = this.makeUrlWithKey(sUrl, oKeys);
        }

        sUrl = sUrl + '/$value';

        var deferred = Q.defer();

        oModel.read(sUrl, {
          success: function(oData, oResponse) {
            oData.sUrl = sUrl;
            oData.oResponse = oResponse;
            deferred.resolve(oData);
          },
          error: function(oError) {
            oError.sUrl = sUrl;
            deferred.reject(oError);
          }
        });

        return deferred.promise;
      }
    });
  }
);
