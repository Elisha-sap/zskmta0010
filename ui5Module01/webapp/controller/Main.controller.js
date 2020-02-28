sap.ui.define([
    "mta0010/ui5Module01/controller/common/BaseController",
    "sap/m/MessageToast",
    "sap/ui/table/library",
    "sap/ui/core/message/Message"
], function (BaseController, MessageToast, library, Message) {
    "use strict";

    return BaseController.extend("mta0010.ui5Module01.controller.Main", {

        /* =========================================================== */
        /* 라이프사이클 메서드 */
        /* =========================================================== */
        onInit: function () {

            // 전역변수
            this._h = this.getDataHub();

            // 모델생성
            this._h.mainData = this.createJSONModel();
            this._h.mainView = this.createJSONModel();

            this._h.mainData.setData({
                ResultData: [],
                SupplierData: [],
            });

            var SelectionMode = library.SelectionMode;
            var aSelectionModes = [];
            jQuery.each(SelectionMode, function (k, v) {
                if (k != SelectionMode.Multi) {
                    aSelectionModes.push({key: k, text: v});
                }
            });

            this._h.mainView.setData({
                busy: false,
                PostingDate: {
                    fromDate: moment(new Date()).startOf('month').toDate(),
                    toDate: new Date()
                },
                PostingType: [{
                    PostingTypeKey: "PT01",
                    PostingTypeName: "Posting invoice per supplier"
                }, {
                    PostingTypeKey: "PT02",
                    PostingTypeName: "Posting invoice per purchase"
                }],
                PostingTypeKey: "PT01",
                InvoiceStatus: [{
                    InvoiceStatusKey: "IS01",
                    InvoiceStatusName: "All"
                }, {
                    InvoiceStatusKey: "IS02",
                    InvoiceStatusName: "Posted"
                }, {
                    InvoiceStatusKey: "IS03",
                    InvoiceStatusName: "Not Posted"
                }],
                InvoiceStatusKey: "IS01",
                f4VendorSelected: [],
                f4POSelected: [],
                f4MatDocSelected: [],
                f4SuplierInvSelected: [],
                f4schProdSelected: [],
                InvoiceForm: {
                    "Company": "1710",
                    "TotalGrossAmount": 0,
                    "TotalGRAmount": 0,
                    "TotalTaxAmount": 0,
                    "Currency": "USD",
                    "InvoicingDate": new Date(),
                    "PostingDate": new Date(),
                    "InvoicingParty": {},
                    "PaymentTerm": {},
                    "Reference": "",
                    "Text": "",
                    "TaxCode": "I0",
                    "TaxJurisdiction": "7700000000"
                },
                TableData: {
                    Total: 0,
                    CountSelected: 0,
                    isDetail: false
                },
                TableConfig: {
                    limit: 20,
                    showHeaderSelector: true,
                    selectionModes: aSelectionModes
                },
                EnableCreateButton: false
            });

            // 모델등록
            this.getView().setModel(this._h.mainData, 'mainData');
            this.getView().setModel(this._h.mainView, 'mainView');

            // 이벤트등록
            this.getRouter().getRoute('main').attachPatternMatched(this.onPatternMatched, this);

            // 화면설정
            this.getView().addStyleClass(this.getOwnerComponent().getContentDensityClass());

            //F4데이터 설정
            this.fcSetF4Data();

            //Message Model
            var oMessageManager = sap.ui.getCore().getMessageManager();
            this.getView().setModel(oMessageManager.getMessageModel(), "message");
            oMessageManager.registerObject(this.getView(), true);

            this._h.apiSupplierInvoice.refreshSecurityToken();
        },

        /**
         * 리소스를 삭제한다
         */
        onExit: function () {
            this.clearMessageManager();
        },

        /* ========================================================== */
        /* 이벤트핸들러
        /* =========================================================== */
        onPatternMatched: function (oEvent) {

        },

        /**
         * F4 팝업화면을 출력한다.
         * f4File : 도움말 팝업 Fragment 파일명
         * f4Name : 도움말 명
         * 위의 두 정보는 이벤트 발생시키는 컨트롤에 커스텀 정보로 설정되어 있어야 한다
         */
        onF4: function (oEvent) {

            this.sF4File = this.getCustomData(oEvent, 'f4File');
            this.sF4Name = this.getCustomData(oEvent, 'f4Name');
            this.oF4Control = oEvent.getSource();

            if (!this.fragments[this.sF4Name]) {
                var sFragmentName = this._h.nameSpace + ".view.f4." + this.sF4File;
                this.fragments[this.sF4Name] = sap.ui.xmlfragment(sFragmentName, this);
                this.getView().addDependent(this.fragments[this.sF4Name]);
            }

            this.fragments[this.sF4Name].open();
        },

        onF4Exec: function (oEvent) {

            // 검색필드
            var aSearchFieldVendor = ['Supplier', 'SupplierName'];
            var aSearchFieldPurDoc = ['PurchaseOrder', 'PurchasingGroup', 'Supplier', 'CreatedByUser'];
            var aSearchFieldMatDoc = ['MaterialDocument', 'CreatedByUser', 'MaterialDocumentHeaderText'];
            var aSearchFieldSupInv = ['SupplierInvoice', 'InvoicingParty', 'SupplierInvoiceIDByInvcgPar'];
            var aSearchFieldMat = ['Product', 'ProductName', 'ProductType'];
            var aSearchFieldPayTer = ['CustomerPaymentTerms', 'CustomerPaymentTermsName']

            // 검색버튼
            if (oEvent.sId === 'search') {

                var oItemsBinding = null;
                var sSearchValue = '';
                var oFilter = null;

                switch (this.sF4Name) {
                    case 'Vendor':
                        oItemsBinding = oEvent.getParameters().itemsBinding;
                        sSearchValue = oEvent.getParameter('value');
                        oFilter = this.makeFilter(aSearchFieldVendor, this.OP.CONTAINS, sSearchValue, false);
                        oItemsBinding.filter(oFilter);
                        break;
                    case 'PurchaseOrder':
                        oItemsBinding = oEvent.getParameters().itemsBinding;
                        sSearchValue = oEvent.getParameter('value');
                        oFilter = this.makeFilter(aSearchFieldPurDoc, this.OP.CONTAINS, sSearchValue, false);
                        oItemsBinding.filter(oFilter);
                        break;
                    case 'MaterialDocument':
                        oItemsBinding = oEvent.getParameters().itemsBinding;
                        sSearchValue = oEvent.getParameter('value');
                        oFilter = this.makeFilter(aSearchFieldMatDoc, this.OP.CONTAINS, sSearchValue, false);
                        oItemsBinding.filter(oFilter);
                        break;
                    case 'SupplierInvoice':
                        oItemsBinding = oEvent.getParameters().itemsBinding;
                        sSearchValue = oEvent.getParameter('value');
                        oFilter = this.makeFilter(aSearchFieldSupInv, this.OP.CONTAINS, sSearchValue, false);
                        oItemsBinding.filter(oFilter);
                        break;
                    case 'Product':
                        oItemsBinding = oEvent.getParameters().itemsBinding;
                        sSearchValue = oEvent.getParameter('value');
                        oFilter = this.makeFilter(aSearchFieldMat, this.OP.CONTAINS, sSearchValue, false);
                        oItemsBinding.filter(oFilter);
                        break;
                    case 'VendorSingle':
                        oItemsBinding = oEvent.getParameters().itemsBinding;
                        sSearchValue = oEvent.getParameter('value');
                        oFilter = this.makeFilter(aSearchFieldVendor, this.OP.CONTAINS, sSearchValue, false);
                        oItemsBinding.filter(oFilter);
                        break;
                    case 'PaymentTerm':
                        oItemsBinding = oEvent.getParameters().itemsBinding;
                        sSearchValue = oEvent.getParameter('value');
                        oFilter = this.makeFilter(aSearchFieldPayTer, this.OP.CONTAINS, sSearchValue, false);
                        oItemsBinding.filter(oFilter);
                        break;
                }
            }

            // 실시간검색
            if (oEvent.sId === 'liveChange') {
                switch (this.sF4Name) {
                    case 'Vendor':
                        oItemsBinding = oEvent.getParameters().itemsBinding;
                        sSearchValue = oEvent.getParameter('value');
                        oFilter = this.makeFilter(aSearchFieldVendor, this.OP.CONTAINS, sSearchValue, false);
                        oItemsBinding.filter(oFilter);
                        break;
                    case 'PurchaseOrder':
                        oItemsBinding = oEvent.getParameters().itemsBinding;
                        sSearchValue = oEvent.getParameter('value');
                        oFilter = this.makeFilter(aSearchFieldPurDoc, this.OP.CONTAINS, sSearchValue, false);
                        oItemsBinding.filter(oFilter);
                        break;
                    case 'MaterialDocument':
                        oItemsBinding = oEvent.getParameters().itemsBinding;
                        sSearchValue = oEvent.getParameter('value');
                        oFilter = this.makeFilter(aSearchFieldMatDoc, this.OP.CONTAINS, sSearchValue, false);
                        oItemsBinding.filter(oFilter);
                        break;
                    case 'SupplierInvoice':
                        oItemsBinding = oEvent.getParameters().itemsBinding;
                        sSearchValue = oEvent.getParameter('value');
                        oFilter = this.makeFilter(aSearchFieldSupInv, this.OP.CONTAINS, sSearchValue, false);
                        oItemsBinding.filter(oFilter);
                        break;
                    case 'Product':
                        oItemsBinding = oEvent.getParameters().itemsBinding;
                        sSearchValue = oEvent.getParameter('value');
                        oFilter = this.makeFilter(aSearchFieldMat, this.OP.CONTAINS, sSearchValue, false);
                        oItemsBinding.filter(oFilter);
                        break;
                }
            }

            // 확인버튼
            if (oEvent.sId === 'confirm') {
                switch (this.sF4Name) {
                    case 'Vendor':
                        var aVendors = _.map(oEvent.getParameters().selectedItems, function (oVendor) {
                            return {
                                Supplier: oVendor.getBindingContext('mainData').getObject().Supplier,
                                SupplierName: oVendor.getBindingContext('mainData').getObject().SupplierName
                            };
                        });
                        this._h.mainView.setProperty('/f4VendorSelected', aVendors);
                        break;
                    case 'PurchaseOrder':
                        var aPurchaseOrders = _.map(oEvent.getParameters().selectedItems, function (oPurchaseOrder) {
                            return {
                                PurchaseOrder: oPurchaseOrder.getBindingContext('f4Purdoc').getObject().PurchaseOrder
                            };
                        });
                        this._h.mainView.setProperty('/f4POSelected', aPurchaseOrders);
                        break;
                    case 'MaterialDocument':
                        var aMaterialDocuments = _.map(oEvent.getParameters().selectedItems, function (oMaterialDocument) {
                            return {
                                MaterialDocument: oMaterialDocument.getBindingContext('f4Matdoc').getObject().MaterialDocument
                            };
                        });
                        this._h.mainView.setProperty('/f4MatDocSelected', aMaterialDocuments);
                        break;
                    case 'SupplierInvoice':
                        var aSupplierInvoices = _.map(oEvent.getParameters().selectedItems, function (oSupplierInvoice) {
                            return {
                                SupplierInvoice: oSupplierInvoice.getBindingContext('f4SupInv').getObject().SupplierInvoice,
                                DocumentDate: oSupplierInvoice.getBindingContext('f4SupInv').getObject().DocumentDate,
                                SupplierInvoiceIDByInvcgPar: oSupplierInvoice.getBindingContext('f4SupInv').getObject().SupplierInvoiceIDByInvcgPar
                            };
                        });
                        this._h.mainView.setProperty('/f4SuplierInvSelected', aSupplierInvoices);
                        break;
                    case 'Product':
                        var aProducts = _.map(oEvent.getParameters().selectedItems, function (oProduct) {
                            return {
                                Product: oProduct.getBindingContext('f4Product').getObject().Product,
                                ProductName: oProduct.getBindingContext('f4Product').getObject().ProductName,
                                ProductType: oProduct.getBindingContext('f4Product').getObject().ProductType
                            };
                        });
                        this._h.mainView.setProperty('/f4schProdSelected', aProducts);
                        break;
                    case 'VendorSingle':
                        var aVendorsSingle = _.map(oEvent.getParameters().selectedItems, function (oVendor) {
                            return {
                                Supplier: oVendor.getBindingContext('f4Vendor').getObject().Supplier,
                                SupplierName: oVendor.getBindingContext('f4Vendor').getObject().SupplierName
                            };
                        });
                        if (aVendorsSingle && aVendorsSingle.length > 0) {
                            this._h.mainView.setProperty('/InvoiceForm/InvoicingParty', aVendorsSingle[0]);
                        }
                        break;
                    case 'PaymentTerm':
                        var aPaymentTerm = _.map(oEvent.getParameters().selectedItems, function (oPaymentTerm) {
                            return {
                                CustomerPaymentTerms: oPaymentTerm.getBindingContext('f4PayTerm').getObject().CustomerPaymentTerms,
                                CustomerPaymentTermsName: oPaymentTerm.getBindingContext('f4PayTerm').getObject().CustomerPaymentTermsName
                            };
                        });
                        if (aPaymentTerm && aPaymentTerm.length > 0) {
                            this._h.mainView.setProperty('/InvoiceForm/PaymentTerm', aPaymentTerm[0]);
                        }
                        break;
                }
                oEvent.getSource().getBinding('items').filter([]);
            }

            // 취소버튼
            if (oEvent.sId === 'cancel') {
                oEvent.getSource().getBinding('items').filter([]);
            }
        },

        /**
         * 이벤트처리 함수. 모든 이벤트는 여기를 통해서 처리가 된다
         * @param oEvent
         */
        onPAI: function (oEvent) {

            var sCode = this.getCustomData(oEvent, 'fcCode');

            switch (sCode) {
                case 'fcShowDetail':
                    this.fcShowDetail(oEvent);
                    break;
                case 'fcShowSummary':
                    this.fcShowSummary(oEvent);
                    break;
                case 'fcSearch':
                    this.fcSearch(oEvent);
                    break;
                case 'fcCreate':
                    this.fcCreate(oEvent);
                    break;
                case 'fcSelectionChange':
                    this.fcSelectionChange(oEvent);
            }
        },

        // Table Column 표시 감추기
        fcShowDetail: function (oEvent) {
            this._h.mainView.setProperty('/TableData/isDetail', true);
        },

        fcShowSummary: function (oEvent) {
            this._h.mainView.setProperty('/TableData/isDetail', false);
        },

        fcSelectionChange: function (oEvent) {

            var self = this;

            var oPlugin = oEvent.getSource();
            var bLimitReached = oEvent.getParameters().limitReached;
            var iIndices = oPlugin.getSelectedIndices();
            var sMessage = "";

            if (iIndices.length > 0) {
                sMessage = this.getI18nText('msgInfo__003', [iIndices.length]);

                if (bLimitReached) {
                    sMessage = this.getI18nText('msgErr__009', [oPlugin.getLimit()]);
                }
            } else {
                sMessage = this.getI18nText('msgInfo__004');
            }

            // 선택된 항목이 이미 인보이스가 있는 경우 선택을 취소한다
            var sPath = '';
            var aAllSelectedRows = oPlugin.getSelectedIndices();
            var aSelectedRows = oEvent.getParameters().rowIndices;

            var iFindIndex = _.findIndex(aSelectedRows, function (iRow) {
                var iSelRow = _.findIndex(aAllSelectedRows, function (iRowCmp) {
                    return iRowCmp === iRow;
                });

                if (iSelRow >= 0) {
                    sPath = '/ResultData/' + iRow;
                    return self._h.mainData.getProperty(sPath).PurchasingHistoryDocument_IV !== '';
                } else {
                    return false;
                }
            });

            if (iFindIndex >= 0) {
                var aResultRows = _.reduce(aAllSelectedRows, function (aRows, iRow) {
                    var iDelRow = _.findIndex(aSelectedRows, function (iRowCmp) {
                        return iRowCmp === iRow;
                    });

                    if (iDelRow >= 0) {
                        return aRows;
                    } else {
                        return _.concat(aRows, iRow);
                    }
                }, []);

                this.showMessage(this.MSGTYPE.ERROR, 'dPopupMessage__001', 'msgErr__010');
                oPlugin.clearSelection();

                _.forEach(aResultRows, function (iResultRow) {
                    oPlugin.addSelectionInterval(iResultRow, iResultRow);
                });

                if (aResultRows.length > 0) {
                    this._h.mainView.setProperty('/EnableCreateButton', true);
                } else {
                    this._h.mainView.setProperty('/EnableCreateButton', false);
                }

                this.summarySelectedRows(aResultRows);
            } else {

                if (aAllSelectedRows.length > 0) {
                    this._h.mainView.setProperty('/EnableCreateButton', true);
                } else {
                    this._h.mainView.setProperty('/EnableCreateButton', false);
                }

                this.summarySelectedRows(aAllSelectedRows);
                this._h.mainView.setProperty('/TableData/CountSelected', aAllSelectedRows.length);
                MessageToast.show(sMessage);
            }
        },

        summarySelectedRows: function (aSelectedRows) {

            var self = this;
            var fGrossAmount = 0;
            var fNetAmount = 0;
            var fTaxAmount = 0;

            if (!aSelectedRows || !aSelectedRows.length) {
                this._h.mainView.setProperty('/InvoiceForm/TotalGrossAmount', currency(0).value);
                this._h.mainView.setProperty('/InvoiceForm/TotalGRAmount', currency(0).value);
                this._h.mainView.setProperty('/InvoiceForm/TotalTaxAmount', currency(0).value);
                return;
            }

            _.forEach(aSelectedRows, function (iRowNumber) {
                var sPath = '/ResultData/' + iRowNumber;
                fGrossAmount = currency(fGrossAmount).add(self._h.mainData.getProperty(sPath).PurchaseOrderAmount).value;
                fNetAmount = fGrossAmount;
                fTaxAmount = currency(fTaxAmount).value;
            });

            this._h.mainView.setProperty('/InvoiceForm/TotalGrossAmount', fGrossAmount);
            this._h.mainView.setProperty('/InvoiceForm/TotalGRAmount', fNetAmount);
            this._h.mainView.setProperty('/InvoiceForm/TotalTaxAmount', fTaxAmount);
        },

        // Multi Input 값 변경처리
        fcChangeToken: function (oEvent) {

            var sCode = this.getCustomData(oEvent, 'f4File');
            var aRemovedTokens = oEvent.getParameter('removedTokens');
            var iIndex = 0;

            if (sCode == 'F4Vendor') {
                var aVendor = this._h.mainView.getProperty('/f4VendorSelected');
                _.remove(aVendor, function (oItem) {
                    iIndex = _.findIndex(aRemovedTokens, function (oRemovedToken) {
                        return oItem.Supplier === oRemovedToken.getKey();
                    });
                    return iIndex >= 0 ? true : false;
                });
                this._h.mainView.setProperty('/f4VendorSelected', aVendor);
            }

            if (sCode == 'F4PurchaseOrder') {
                var aPurchaseOrder = this._h.mainView.getProperty('/f4POSelected');
                _.remove(aPurchaseOrder, function (oItem) {
                    iIndex = _.findIndex(aRemovedTokens, function (oRemovedToken) {
                        return oItem.PurchaseOrder === oRemovedToken.getKey();
                    });
                    return iIndex >= 0 ? true : false;
                });
                this._h.mainView.setProperty('/f4POSelected', aPurchaseOrder);
            }

            if (sCode == 'F4MaterialDocument') {
                var aMaterialDocument = this._h.mainView.getProperty('/f4MatDocSelected');
                _.remove(aMaterialDocument, function (oItem) {
                    iIndex = _.findIndex(aRemovedTokens, function (oRemovedToken) {
                        return oItem.MaterialDocument === oRemovedToken.getKey();
                    });
                    return iIndex >= 0 ? true : false;
                });
                this._h.mainView.setProperty('/f4MatDocSelected', aMaterialDocument);
            }

            if (sCode == 'F4SupplierInvoice') {
                var aSupplierInvoice = this._h.mainView.getProperty('/f4SuplierInvSelected');
                _.remove(aSupplierInvoice, function (oItem) {
                    iIndex = _.findIndex(aRemovedTokens, function (oRemovedToken) {
                        return oItem.SupplierInvoice === oRemovedToken.getKey();
                    });
                    return iIndex >= 0 ? true : false;
                });
                this._h.mainView.setProperty('/f4SuplierInvSelected', aSupplierInvoice);
            }

            if (sCode == 'F4Product') {
                var aProduct = this._h.mainView.getProperty('/f4schProdSelected');
                _.remove(aProduct, function (oItem) {
                    iIndex = _.findIndex(aRemovedTokens, function (oRemovedToken) {
                        return oItem.Product === oRemovedToken.getKey();
                    });
                    return iIndex >= 0 ? true : false;
                });
                this._h.mainView.setProperty('/f4schProdSelected', aProduct);
            }

        },

        // F4데이터 설정
        fcSetF4Data: function () {
            var self = this;

            //odata호출
            var oModel = this._h.f4Vendor;
            var sPath = "/YY1_C_Supplier_VH";
            self.setBusy(self._h.mainView, true);
            this.call_odata_query(oModel, sPath, {})
                .then(function (oResult) {
                    self._h.mainData.setProperty('/SupplierData', oResult.results);
                }).catch(function (oError) {
                self.callPromiseErrorPopup(oError);
            }).done(function () {
                self.setBusy(self._h.mainView, false);
            });
        },

        // Message Manager 메시지 지우기
        clearMessageManager: function () {
            sap.ui.getCore().getMessageManager().removeAllMessages();
        },

        // 검색
        fcSearch: function (oEvent) {

            var self = this;
            var aSelectedIndex = this.getSelectedTableIndex();

            if (aSelectedIndex.length) {
                this.callPopupConfirm('msgWarn__007', 'warning', 'WARNING')
                    .then(function (sAction) {
                        if (sAction === 'OK') {
                            self.fcSearchConfirm(oEvent);
                        }
                    })
                    .catch((function (oError) {
                        console.log(oErrot);
                    }));
            } else {
                this.fcSearchConfirm(oEvent);
            }
        },

        fcSearchConfirm: function (oEvent) {

            // 사용자가 작업중인 항목이 있는 경우에 해당 작업을 취소하고 검색할 건지 물어본다

            var self = this;
            var sPostingDateFrom = this._h.mainView.getProperty('/PostingDate/fromDate');
            var sPostingDateTo = this._h.mainView.getProperty('/PostingDate/toDate');
            var aVendorList = this._h.mainView.getProperty('/f4VendorSelected');
            var aPOList = this._h.mainView.getProperty('/f4POSelected');
            var aMatDocList = this._h.mainView.getProperty('/f4MatDocSelected');
            var aSuplierInvList = this._h.mainView.getProperty('/f4SuplierInvSelected');
            var aProdList = this._h.mainView.getProperty('/f4schProdSelected');

            // Create Button 비활성화
            this._h.mainView.setProperty('/EnableCreateButton', false);

            // 메세지 제거
            this.clearMessageManager();

            //유효성 체크
            var bError = false;
            var daterange = this.getView().byId("postingDate");
            if (daterange.getValue() == "") {
                daterange.setValueState("Error");
                daterange.setValueStateText("값을 입력하세요");
                bError = true;
            } else {
                daterange.setValueState("None");
            }
            var comboBox1 = this.getView().byId("postingType");
            if (comboBox1.getValue() == "") {
                comboBox1.setValueState("Error");
                comboBox1.setValueStateText("값을 입력하세요");
                bError = true;
            } else {
                comboBox1.setValueState("None");
            }
            var comboBox2 = this.getView().byId("documentStatus");
            if (comboBox2.getValue() == "") {
                comboBox2.setValueState("Error");
                comboBox2.setValueStateText("값을 입력하세요");
                bError = true;
            } else {
                comboBox2.setValueState("None");
            }
            if (bError) {
                this.showMessage(this.MSGTYPE.ERROR, 'Error', this.getI18nText('msgErr__001'));
                return;
            }

            //초기화
            this._h.mainData.setProperty('/ResultData', []);

            //Filter설정
            var aFilter = [];
            aFilter.push(this.makeFilter(['PostingDate'], this.OP.GE, sPostingDateFrom, false));
            aFilter.push(this.makeFilter(['PostingDate'], this.OP.LE, sPostingDateTo, false));

            if (aVendorList && aVendorList.length > 0) {
                var aSubFilters = [];
                _.forEach(aVendorList, function (item) {
                    aSubFilters.push(self.makeFilter(['Supplier'], self.OP.EQ, item.Supplier, false));
                });
                aFilter.push(this.makeFilterObj(aSubFilters, false));
            }

            if (aPOList && aPOList.length > 0) {
                var aSubFilters = [];
                _.forEach(aPOList, function (item) {
                    aSubFilters.push(self.makeFilter(['PurchaseOrder'], self.OP.EQ, item.PurchaseOrder, false));
                });
                aFilter.push(this.makeFilterObj(aSubFilters, false));
            }

            if (aProdList && aProdList.length > 0) {
                var aSubFilters = [];
                _.forEach(aProdList, function (item) {
                    aSubFilters.push(self.makeFilter(['Material'], self.OP.EQ, item.Product, false));
                });
                aFilter.push(this.makeFilterObj(aSubFilters, false));
            }

            //Sorter설정
            var aSorter = [];

            //odata호출
            var oModel = this._h.purchaseHistory;
            var sPath = "/YY1_C_POHistoryForIV";
            self.setBusy(self._h.mainView, true);
            this.call_odata_query(oModel, sPath, {}, aFilter, aSorter)
                .then(function (oResult) {

                    // GR건만 있는 항목을 골라서 기본정보 생성
                    var aBasicData = _.filter(oResult.results, {PurchasingHistoryDocumentType: "1"});

                    // PO의 GR을 참조문서로 가지는 INVOICE 항목을 가져온다
                    var aAddedInvoice = _.map(aBasicData, function (oBasicData) {

                        oBasicData.PurchasingHistoryDocumentYear_GR = oBasicData.PurchasingHistoryDocumentYear;
                        oBasicData.PurchasingHistoryDocument_GR = oBasicData.PurchasingHistoryDocument;
                        oBasicData.PurchasingHistoryDocumentItem_GR = oBasicData.PurchasingHistoryDocumentItem;
                        oBasicData.PostingDate_GR = oBasicData.PostingDate;
                        oBasicData.PurchasingHistoryDocumentYear_IV = '';
                        oBasicData.PurchasingHistoryDocument_IV = '';
                        oBasicData.PurchasingHistoryDocumentItem_IV = '';
                        oBasicData.PostingDate_IV = null;

                        if (oBasicData.Supplier && oBasicData.Supplier.length > 0) {
                            var oSupplier = _.find(self._h.mainData.getProperty('/SupplierData'), {Supplier: oBasicData.Supplier});
                            oBasicData.SupplierName = oSupplier.SupplierName;
                        } else {
                            oBasicData.SupplierName = '';
                        }

                        if (oBasicData.InvoicingParty && oBasicData.InvoicingParty.length > 0) {
                            var oSupplier = _.find(self._h.mainData.getProperty('/SupplierData'), {Supplier: oBasicData.InvoicingParty});
                            oBasicData.InvoicingPartyName = oSupplier.SupplierName;
                        } else {
                            oBasicData.InvoicingPartyName = '';
                        }

                        var aInvoiceData = _.filter(oResult.results, {
                            PurchasingHistoryDocumentType: "2",
                            ReferenceDocumentFiscalYear: oBasicData.PurchasingHistoryDocumentYear,
                            ReferenceDocument: oBasicData.PurchasingHistoryDocument,
                            ReferenceDocumentItem: oBasicData.PurchasingHistoryDocumentItem
                        });

                        oBasicData.invoices = aInvoiceData;
                        return oBasicData;
                    });

                    var aResultData = [];
                    _.forEach(aAddedInvoice, function (oItem) {

                        if (oItem.invoices.length === 0) {
                            oItem.PurchasingHistoryDocumentYear_IV = '';
                            oItem.PurchasingHistoryDocument_IV = '';
                            oItem.PurchasingHistoryDocumentItem_IV = '';
                            oItem.DocumentDate_IV = null;
                            oItem.PostingDate_IV = null;
                            oItem.TaxCode = '';
                            oItem.TaxJurisdiction = '';
                            aResultData = _.concat(aResultData, oItem);
                        } else {
                            _.forEach(oItem.invoices, function (oInvoice) {
                                oItem.PurchasingHistoryDocumentYear_IV = oInvoice.PurchasingHistoryDocumentYear;
                                oItem.PurchasingHistoryDocument_IV = oInvoice.PurchasingHistoryDocument;
                                oItem.PurchasingHistoryDocumentItem_IV = oInvoice.PurchasingHistoryDocumentItem;
                                oItem.DocumentDate_IV = oInvoice.DocumentDate;
                                oItem.PostingDate_IV = oInvoice.PostingDate;
                                oItem.TaxCode = 'I0';
                                oItem.TaxJurisdiction = '7700000000';
                                aResultData = _.concat(aResultData, oItem);
                            });
                        }
                    });

                    // Filter - Invoice Status
                    var sInvoiceStatusKey = self._h.mainView.getProperty('/InvoiceStatusKey');

                    switch (sInvoiceStatusKey) {
                        case 'IS01': //All
                            break;
                        case 'IS02': //Posted
                            aResultData = _.filter(aResultData, function (oResultData) {
                                return oResultData.PurchasingHistoryDocument_IV !== '';
                            });
                            break;
                        case 'IS03': //Not Posted
                            aResultData = _.filter(aResultData, function (oResultData) {
                                return oResultData.PurchasingHistoryDocument_IV === '';
                            });
                            break;
                    }

                    // Filter - Material Document
                    if (aMatDocList && aMatDocList.length) {
                        aResultData = _.reduce(aResultData, function (aReducedData, oResultData) {
                            var iIndex = _.findIndex(aMatDocList, function (oMatDocData) {
                                return oResultData.PurchasingHistoryDocument_GR === oMatDocData.MaterialDocument;
                            });

                            if (iIndex >= 0) {
                                return _.concat(aReducedData, oResultData);
                            } else {
                                return aReducedData;
                            }
                        }, []);
                    }

                    // Filter - Supplier Invoice
                    if (aSuplierInvList && aSuplierInvList.length) {
                        aResultData = _.reduce(aResultData, function (aReducedData, oResultData) {
                            var iIndex = _.findIndex(aSuplierInvList, function (oSuplierInvList) {
                                return oResultData.PurchasingHistoryDocument_IV === oSuplierInvList.SupplierInvoice;
                            });

                            if (iIndex >= 0) {
                                return _.concat(aReducedData, oResultData);
                            } else {
                                return aReducedData;
                            }
                        }, []);
                    }

                    self._h.mainData.setProperty('/ResultData', aResultData);
                    self._h.mainView.setProperty('/TableData/Total', aResultData.length);
                }).catch(function (oError) {
                self.callPromiseErrorPopup(oError);
            }).done(function () {
                self.setBusy(self._h.mainView, false);
                self.setDefaultInvoiceForm();
                self.initTableSelection();
                if (oEvent) {
                    MessageToast.show("총 " + self._h.mainView.getProperty('/TableData/Total') + " 개가 선택되었습니다.");
                } else {
                    self.showMessageToast('msgSuss__012', '15rem', []);
                }
            });
        },

        // Invoice Form 초기화
        setDefaultInvoiceForm: function () {

            this._h.mainView.setProperty('/InvoiceForm', {
                "Company": "1710",
                "TotalGrossAmount": 0,
                "TotalGRAmount": 0,
                "TotalTaxAmount": 0,
                "Currency": "USD",
                "InvoicingDate": new Date(),
                "PostingDate": new Date(),
                "InvoicingParty": {},
                "PaymentTerm": {},
                "Reference": "",
                "Text": "",
                "TaxCode": "I0",
                "TaxJurisdiction": "7700000000"
            });
        },

        initTableSelection: function () {

            var aPlugins = this.getControl('SIVReqtable').getPlugins();

            _.forEach(aPlugins, function (oPlugin) {
                switch (oPlugin.getMetadata().getName()) {
                    case 'sap.ui.table.plugins.MultiSelectionPlugin':
                        oPlugin.clearSelection();
                        break;
                    default:
                }
            });
        },

        getSelectedTableIndex() {

            var aSelectedIndices = [];
            var aPlugins = this.getControl('SIVReqtable').getPlugins();

            _.forEach(aPlugins, function (oPlugin) {
                switch (oPlugin.getMetadata().getName()) {
                    case 'sap.ui.table.plugins.MultiSelectionPlugin':
                        aSelectedIndices = oPlugin.getSelectedIndices();
                        break;
                    default:
                }
            });

            return aSelectedIndices;
        },

        // Create I/V
        fcCreate: function (oEvent) {
            //초기화
            var self = this;
            var sPostingTypeKey = this._h.mainView.getProperty('/PostingTypeKey');
            var oInvoiceForm = this._h.mainView.getProperty('/InvoiceForm');
            var bError = false;

            // Message 초기화
            this.clearMessageManager();

            //아이템선택정보 가져오기
            var aSelectedIndices = this.getSelectedTableIndex();

            // 선택된 항목이 하나도 없는 경우 오류
            if (!aSelectedIndices.length) {
                this.showMessage(this.MSGTYPE.ERROR, 'dPopupMessage__002', 'msgErr__011');
                return;
            }

            //헤더정보체크
            if (_.isNull(oInvoiceForm.InvoicingDate)) {
                bError = true;
                var oMessage = new Message({
                    message: this.getI18nText('msgErr__012'),
                    type: 'Error',
                    target: "/InvoiceForm/InvoicingDate",
                    processor: this.getView().getModel('mainView')
                });
                sap.ui.getCore().getMessageManager().addMessages(oMessage);
            }

            if (_.isNull(oInvoiceForm.PostingDate)) {
                bError = true;
                oMessage = new Message({
                    message: this.getI18nText('msgErr__013'),
                    type: 'Error',
                    target: "/InvoiceForm/PostingDate",
                    processor: this.getView().getModel('mainView')
                });
                sap.ui.getCore().getMessageManager().addMessages(oMessage);
            }

            if (sPostingTypeKey === 'PT01' && !oInvoiceForm.PaymentTerm.CustomerPaymentTerms) {
                bError = true;
                oMessage = new Message({
                    message: this.getI18nText('msgErr__014'),
                    type: 'Error',
                    target: "/InvoiceForm/PaymentTerm/CustomerPaymentTermsName",
                    processor: this.getView().getModel('mainView')
                });
                sap.ui.getCore().getMessageManager().addMessages(oMessage);
            }

            if (bError) {
                this.showMessage(this.MSGTYPE.ERROR, 'dPopupMessage__002', 'msgErr__015');
                return;
            }

            this.callPopupConfirm('msgInfo__005', 'information', 'INFORMATION')
                .then(function (sAction) {
                    if (sAction === 'OK') {
                        // OData Call
                        if (sPostingTypeKey === 'PT01') {
                            self.callOdataCreateInvoice01();
                        } else {
                            self.callOdataCreateInvoice02();
                        }
                    }
                })
                .catch((function (oError) {
                    console.log(oErrot);
                }));
        },

        callOdataCreateInvoice01: function () {

            var self = this;

            // Posting Invoice Per supplier
            // 선택된 항목을 같은 공급자를 기준으로 인보이스를 생성하는 호출을 수행한다
            var aSelectedList = this.getSelectedTableData();

            // 선택된 항목의 공급자를 중복항목이 없이 가져온다
            var oSupplierInvoice = _.reduce(aSelectedList, function (oSummary, oSelectedItem) {

                (oSummary[oSelectedItem.Supplier] || (oSummary[oSelectedItem.Supplier] = [])).push(oSelectedItem);
                return oSummary;
            }, {});

            // 여러개 호출
            var aPromises = [];

            _.forEach(oSupplierInvoice, function (aInvoiceList, sSupplier) {
                aPromises.push(self.call_odata_create(self._h.apiSupplierInvoice, '/A_SupplierInvoice', self.makeDataSupplierInvoice(sSupplier, aInvoiceList)));
            });

            this.setBusy(self._h.mainView, true);
            Q.allSettled(aPromises)
                .then(function (results) {
                    var bError = false;
                    _.forEach(results, function(oResult) {
                        if (oResult.state === "fulfilled") {
                            // 성공
                        } else {
                            bError = true;
                        }
                    });

                    if (!bError) {
                        self.fcSearchConfirm();
                    } else {
                        self.showMessage(self.MSGTYPE.ERROR, 'dPopupMessage__002', 'msgErr__016');
                    }
                })
                .catch(function (oError) {
                    console.log(oError);
                })
                .done(function () {
                    self.setBusy(self._h.mainView, false);
                });
        },

        makeDataSupplierInvoice: function (sSupplier, aInvoiceList) {

            var self = this;
            var oInvoiceForm = this._h.mainView.getProperty('/InvoiceForm');
            var oHeader = {};
            var aItems = [];
            var oTax = {};

            // 헤더 정보
            oHeader.CompanyCode = oInvoiceForm.Company;
            oHeader.DocumentDate = oInvoiceForm.InvoicingDate;
            oHeader.PostingDate = oInvoiceForm.PostingDate;
            oHeader.SupplierInvoiceIDByInvcgParty = oInvoiceForm.Reference;
            oHeader.InvoicingParty = sSupplier;
            oHeader.DocumentCurrency = oInvoiceForm.Currency;
            oHeader.InvoiceGrossAmount = _.toString(_.reduce(aInvoiceList, function (sSummary, oItem) {
                return currency(oItem.PurchaseOrderAmount).add(sSummary).value;
            }, "0"));
            oHeader.UnplannedDeliveryCost = "0.00";
            oHeader.DocumentHeaderText = oInvoiceForm.Text;
            oHeader.ManualCashDiscount = "0.00";
            oHeader.PaymentTerms = oInvoiceForm.PaymentTerm.CustomerPaymentTerms;
            oHeader.DueCalculationBaseDate = oInvoiceForm.PostingDate;
            oHeader.CashDiscount1Percent = "0.000";
            oHeader.CashDiscount1Days = "0";
            oHeader.CashDiscount2Percent = "0.000";
            oHeader.CashDiscount2Days = "0";
            oHeader.NetPaymentDays = "0";
            oHeader.PaymentBlockingReason = "";
            oHeader.AccountingDocumentType = "RE";
            oHeader.BPBankAccountInternalID = "";
            oHeader.SupplierInvoiceStatus = "B";
            oHeader.IndirectQuotedExchangeRate = "0.00000";
            oHeader.DirectQuotedExchangeRate = "0.00000";
            oHeader.StateCentralBankPaymentReason = "";
            oHeader.SupplyingCountry = "";
            oHeader.PaymentMethod = "T";
            oHeader.PaymentMethodSupplement = "";
            oHeader.PaymentReference = "";
            oHeader.InvoiceReference = "";
            oHeader.InvoiceReferenceFiscalYear = "0000";
            oHeader.FixedCashDiscount = "";
            oHeader.UnplannedDeliveryCostTaxCode = "";
            oHeader.UnplndDelivCostTaxJurisdiction = "";
            oHeader.AssignmentReference = "";
            oHeader.SupplierPostingLineItemText = "";
            oHeader.TaxIsCalculatedAutomatically = false;
            oHeader.BusinessPlace = "";
            oHeader.BusinessSectionCode = "";
            oHeader.BusinessArea = "";
            oHeader.SupplierInvoiceIsCreditMemo = "";
            oHeader.PaytSlipWthRefSubscriber = "";
            oHeader.PaytSlipWthRefCheckDigit = "";
            oHeader.PaytSlipWthRefReference = "";
            oHeader.InvoiceReceiptDate = oInvoiceForm.PostingDate;
            oHeader.DeliveryOfGoodsReportingCntry = "";
            oHeader.SupplierVATRegistration = "";
            oHeader.IsEUTriangularDeal = false;
            oHeader.SuplrInvcDebitCrdtCodeDelivery = "S";
            oHeader.SuplrInvcDebitCrdtCodeReturns = "H";

            // 아이템 정보
            var iSeq = 0;
            aItems = _.map(aInvoiceList, function (oItem) {
                var oItemConv = {};

                iSeq = iSeq + 1;

                oItemConv.SupplierInvoiceItem = _.toString(iSeq);
                oItemConv.PurchaseOrder = oItem.PurchaseOrder;
                oItemConv.PurchaseOrderItem = oItem.PurchaseOrderItem;
                oItemConv.Plant = oItem.Plant;
                oItemConv.ReferenceDocument = oItem.PurchasingHistoryDocument_GR;
                oItemConv.ReferenceDocumentFiscalYear = oItem.PurchasingHistoryDocumentYear_GR;
                oItemConv.ReferenceDocumentItem = oItem.PurchasingHistoryDocumentItem_GR;
                oItemConv.IsSubsequentDebitCredit = "";
                oItemConv.TaxCode = oInvoiceForm.TaxCode;
                oItemConv.TaxJurisdiction = oInvoiceForm.TaxJurisdiction;
                oItemConv.DocumentCurrency = oInvoiceForm.Currency;
                oItemConv.SupplierInvoiceItemAmount = oItem.PurchaseOrderAmount;
                oItemConv.PurchaseOrderQuantityUnit = oItem.PurchaseOrderQuantityUnit;
                oItemConv.QuantityInPurchaseOrderUnit = oItem.Quantity;
                oItemConv.PurchaseOrderPriceUnit = oItem.PurchaseOrderQuantityUnit;
                oItemConv.QtyInPurchaseOrderPriceUnit = oItem.Quantity;
                oItemConv.SuplrInvcDeliveryCostCndnType = "";
                oItemConv.SuplrInvcDeliveryCostCndnStep = "0";
                oItemConv.SuplrInvcDeliveryCostCndnCount = "0";
                oItemConv.SupplierInvoiceItemText = "";
                oItemConv.FreightSupplier = "";
                oItemConv.IsNotCashDiscountLiable = false;

                return oItemConv;
            });

            // Tax 정보
            oTax.TaxCode = oInvoiceForm.TaxCode;
            oTax.DocumentCurrency = oInvoiceForm.Currency;
            oTax.TaxAmount = _.toString(oInvoiceForm.TotalTaxAmount);
            oTax.TaxBaseAmountInTransCrcy = _.toString(oInvoiceForm.TotalGRAmount);
            oTax.TaxJurisdiction = oInvoiceForm.TaxJurisdiction;

            oHeader.to_SuplrInvcItemPurOrdRef = {};
            oHeader.to_SuplrInvcItemPurOrdRef.results = aItems;
            oHeader.to_SupplierInvoiceTax = {};
            oHeader.to_SupplierInvoiceTax.results = [oTax];
            return oHeader;
        },

        makeDataPOInvoice : function (sPO, aInvoiceList) {

            var self = this;
            var oInvoiceForm = this._h.mainView.getProperty('/InvoiceForm');
            var oHeader = {};
            var aItems = [];
            var oTax = {};

            // 헤더 정보
            oHeader.CompanyCode = oInvoiceForm.Company;
            oHeader.DocumentDate = oInvoiceForm.InvoicingDate;
            oHeader.PostingDate = oInvoiceForm.PostingDate;
            oHeader.SupplierInvoiceIDByInvcgParty = oInvoiceForm.Reference;
            oHeader.InvoicingParty = "";
            oHeader.DocumentCurrency = oInvoiceForm.Currency;
            oHeader.InvoiceGrossAmount = _.toString(_.reduce(aInvoiceList, function (sSummary, oItem) {
                return currency(oItem.PurchaseOrderAmount).add(sSummary).value;
            }, "0"));
            oHeader.UnplannedDeliveryCost = "0.00";
            oHeader.DocumentHeaderText = oInvoiceForm.Text;
            oHeader.ManualCashDiscount = "0.00";
            oHeader.PaymentTerms = oInvoiceForm.PaymentTerm.CustomerPaymentTerms;
            oHeader.DueCalculationBaseDate = oInvoiceForm.PostingDate;
            oHeader.CashDiscount1Percent = "0.000";
            oHeader.CashDiscount1Days = "0";
            oHeader.CashDiscount2Percent = "0.000";
            oHeader.CashDiscount2Days = "0";
            oHeader.NetPaymentDays = "0";
            oHeader.PaymentBlockingReason = "";
            oHeader.AccountingDocumentType = "RE";
            oHeader.BPBankAccountInternalID = "";
            oHeader.SupplierInvoiceStatus = "B";
            oHeader.IndirectQuotedExchangeRate = "0.00000";
            oHeader.DirectQuotedExchangeRate = "0.00000";
            oHeader.StateCentralBankPaymentReason = "";
            oHeader.SupplyingCountry = "";
            oHeader.PaymentMethod = "T";
            oHeader.PaymentMethodSupplement = "";
            oHeader.PaymentReference = "";
            oHeader.InvoiceReference = "";
            oHeader.InvoiceReferenceFiscalYear = "0000";
            oHeader.FixedCashDiscount = "";
            oHeader.UnplannedDeliveryCostTaxCode = "";
            oHeader.UnplndDelivCostTaxJurisdiction = "";
            oHeader.AssignmentReference = "";
            oHeader.SupplierPostingLineItemText = "";
            oHeader.TaxIsCalculatedAutomatically = false;
            oHeader.BusinessPlace = "";
            oHeader.BusinessSectionCode = "";
            oHeader.BusinessArea = "";
            oHeader.SupplierInvoiceIsCreditMemo = "";
            oHeader.PaytSlipWthRefSubscriber = "";
            oHeader.PaytSlipWthRefCheckDigit = "";
            oHeader.PaytSlipWthRefReference = "";
            oHeader.InvoiceReceiptDate = oInvoiceForm.PostingDate;
            oHeader.DeliveryOfGoodsReportingCntry = "";
            oHeader.SupplierVATRegistration = "";
            oHeader.IsEUTriangularDeal = false;
            oHeader.SuplrInvcDebitCrdtCodeDelivery = "S";
            oHeader.SuplrInvcDebitCrdtCodeReturns = "H";

            // 아이템 정보
            aItems = _.map(aInvoiceList, function (oItem) {
                var oItemConv = {};

                oItemConv.SupplierInvoiceItem = oItem.PurchaseOrderItem;
                oItemConv.PurchaseOrder = oItem.PurchaseOrder;
                oItemConv.PurchaseOrderItem = oItem.PurchaseOrderItem;
                oItemConv.Plant = oItem.Plant;
                oItemConv.ReferenceDocument = oItem.PurchasingHistoryDocument_GR;
                oItemConv.ReferenceDocumentFiscalYear = oItem.PurchasingHistoryDocumentYear_GR;
                oItemConv.ReferenceDocumentItem = oItem.PurchasingHistoryDocumentItem_GR;
                oItemConv.IsSubsequentDebitCredit = "";
                oItemConv.TaxCode = oInvoiceForm.TaxCode;
                oItemConv.TaxJurisdiction = oInvoiceForm.TaxJurisdiction;
                oItemConv.DocumentCurrency = oInvoiceForm.Currency;
                oItemConv.SupplierInvoiceItemAmount = oItem.PurchaseOrderAmount;
                oItemConv.PurchaseOrderQuantityUnit = oItem.PurchaseOrderQuantityUnit;
                oItemConv.QuantityInPurchaseOrderUnit = oItem.Quantity;
                oItemConv.PurchaseOrderPriceUnit = oItem.PurchaseOrderQuantityUnit;
                oItemConv.QtyInPurchaseOrderPriceUnit = oItem.Quantity;
                oItemConv.SuplrInvcDeliveryCostCndnType = "";
                oItemConv.SuplrInvcDeliveryCostCndnStep = "0";
                oItemConv.SuplrInvcDeliveryCostCndnCount = "0";
                oItemConv.SupplierInvoiceItemText = "";
                oItemConv.FreightSupplier = "";
                oItemConv.IsNotCashDiscountLiable = false;

                return oItemConv;
            });

            // Tax 정보
            oTax.TaxCode = oInvoiceForm.TaxCode;
            oTax.DocumentCurrency = oInvoiceForm.Currency;
            oTax.TaxAmount = _.toString(oInvoiceForm.TotalTaxAmount);
            oTax.TaxBaseAmountInTransCrcy = oInvoiceForm.TotalGRAmount;
            oTax.TaxJurisdiction = oInvoiceForm.TaxJurisdiction;

            oHeader.to_SuplrInvcItemPurOrdRef = {};
            oHeader.to_SuplrInvcItemPurOrdRef.results = aItems;
            oHeader.to_SupplierInvoiceTax = {};
            oHeader.to_SupplierInvoiceTax.results = [oTax];
            return oHeader;
        },

        getSelectedTableData: function () {

            var self = this;

            var aSelectedIndex = this.getSelectedTableIndex();

            if (!aSelectedIndex.length) return;

            return _.map(aSelectedIndex, function (iIndex) {
                var sPath = '/ResultData/' + iIndex;
                return self._h.mainData.getProperty(sPath)
            });
        },

        callOdataCreateInvoice02: function () {
            // Posting Invoice Per Purchase Order
            // 선택된 항목을 같은 구매오더 기준으로 인보이스를 생성하는 호출을 수행한다
            var self = this;

            // Posting Invoice Per supplier
            // 선택된 항목을 같은 공급자를 기준으로 인보이스를 생성하는 호출을 수행한다
            var aSelectedList = this.getSelectedTableData();

            // 선택된 항목의 PO를 중복항목이 없이 가져온다
            var oPOInvoice = _.reduce(aSelectedList, function (oSummary, oSelectedItem) {

                (oSummary[oSelectedItem.PurchaseOrder] || (oSummary[oSelectedItem.PurchaseOrder] = [])).push(oSelectedItem);
                return oSummary;
            }, {});

            // 여러개 호출
            var aPromises = [];

            _.forEach(oPOInvoice, function (aInvoiceList, sPO) {
                aPromises.push(self.call_odata_create(self._h.apiSupplierInvoice, '/A_SupplierInvoice', self.makeDataPOInvoice(sPO, aInvoiceList)));
            });

            this.setBusy(self._h.mainView, true);
            Q.allSettled(aPromises)
                .then(function (results) {
                    var bError = false;
                    _.forEach(results, function(oResult) {
                        if (oResult.state === "fulfilled") {
                            // 성공
                        } else {
                            bError = true;
                        }
                    });

                    if (!bError) {
                        self.fcSearchConfirm();
                    } else {
                        self.showMessage(self.MSGTYPE.ERROR, 'dPopupMessage__002', 'msgErr__016');
                    }
                })
                .catch(function (oError) {
                    console.log(oError);
                })
                .done(function () {
                    self.setBusy(self._h.mainView, false);
                });
        },

        onMessagePopoverPress: function (oEvent) {
            if (!this.fragments['Messages']) {
                var sFragmentName = this._h.nameSpace + ".view.fragments." + 'Messages';
                this.fragments['Messages'] = sap.ui.xmlfragment(sFragmentName, this);
                this.getView().addDependent(this.fragments['Messages']);
            }
            this.fragments['Messages'].openBy(oEvent.getSource());
        },

        getManagerMessages: function () {
            return sap.ui.getCore().getMessageManager().getMessageModel().getData();
        }
    });
});