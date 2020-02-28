sap.ui.define([
	"mta0010/ui5Module01/controller/BaseController"
], function(BaseController) {
	"use strict";

	return BaseController.extend("mta0010.ui5Module01.NotFound", {
		onLinkPressed: function() {
			this.getRouter().navTo("");
		}
	});
});