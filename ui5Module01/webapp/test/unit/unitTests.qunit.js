/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"mta0010/ui5Module01/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});