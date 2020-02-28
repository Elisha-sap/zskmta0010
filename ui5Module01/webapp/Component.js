sap.ui.define(
	['sap/ui/core/UIComponent', 'mta0010/ui5Module01/DataHub', 'sap/ui/model/json/JSONModel', 'sap/ui/Device'],
	function (UIComponent, DataHub, JSONModel, Device) {
		"use strict";

		var Component = UIComponent.extend("mta0010.ui5Module01.Component", {
			metadata: {
				manifest: "json"
			},

			init: function () {
				/** 공통라이브러리
				 * _        : lodash              : https://lodash.com/
				 * _p       : Partialjs           : https://marpple.github.io/partial.js/
				 * v        : Voca                : https://vocajs.com/
				 * R        : Ramda               : https://ramdajs.com/
				 * moment   : moment              : http://momentjs.com/
				 * Q        : Q                   : https://github.com/kriskowal/q
				 * validate : validate            : https://validatejs.org/
				 * XRegExp  : Regular Expression  : http://xregexp.com/
				 */

				// 데이터허브생성
				this._h = new DataHub();
				this._h.manifest = this.getManifest();
				this._h.device = this.makeDeviceModel();
				this._h.i18n = this.getModel('i18n');

				// 컴포넌트모델 설정
				this.setModel(this._h.device, 'device');

				// 컴포넌트초기화
				UIComponent.prototype.init.apply(this, arguments);

				// 라우터초기화
				this.getRouter()
					.getTargetHandler()
					.setCloseDialogs(false);
				this.getRouter().initialize();
				this._h.router = this.getRouter();

				// ★ OData모델 설정 (추가시 DataHub.js 파일도 수정)
				this._h.f4Vendor = this.getModel('f4Vendor');
				this._h.f4Purdoc = this.getModel('f4Purdoc');
				this._h.f4Matdoc = this.getModel('f4Matdoc');
				this._h.f4SupInv = this.getModel('f4SupInv');
				this._h.f4Product = this.getModel('f4Product');
				this._h.f4PayTerm = this.getModel('f4PayTerm');
				this._h.purchaseHistory = this.getModel('purchaseHistory');
				this._h.apiSupplierInvoice = this.getModel('apiSupplierInvoice');
			},

			destroy: function () {
				UIComponent.prototype.destroy.apply(this, arguments);
			},

			getContentDensityClass: function () {

				if (this._sContentDensityClass === undefined) {
					if (jQuery(document.body).hasClass("sapUiSizeCozy") || jQuery(document.body).hasClass("sapUiSizeCompact")) {
						this._sContentDensityClass = "";
					} else if (!this._h.device.getProperty('/').support.touch) {
						this._sContentDensityClass = "sapUiSizeCompact";
					} else {
						this._sContentDensityClass = "sapUiSizeCozy";
					}
				}

				return this._sContentDensityClass;
			},

			makeDeviceModel: function () {
				var oDeviceModel = new JSONModel(Device);
				oDeviceModel.setDefaultBindingMode("OneWay");
				return oDeviceModel;
			}
		});

		return Component;
	});