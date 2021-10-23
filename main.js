window.onload = init;

function init() {
	var extent4326 = [
		-124.91178131103516, -16.53435516357422, 110.1765365600586,
		67.11203002929688,
	];

	var projection4326 = new ol.proj.Projection({
		code: "EPSG:4326",
		extent: extent4326,
		units: "m",
	});

	var quanhuyen = new ol.layer.Image({
		extent: extent4326,
		source: new ol.source.ImageWMS({
			url: "http://localhost:8080/geoserver/test/wms",
			params: {
				LAYERS: "test:QuanHuyenHN",
				VERSION: "1.1.0",
			},
			serverType: "geoserver",
		}),
	});

	var natural = new ol.layer.Image({
		extent: extent4326,
		source: new ol.source.ImageWMS({
			url: "http://localhost:8080/geoserver/test/wms",
			params: {
				LAYERS: "test:natural",
				VERSION: "1.1.0",
			},
			serverType: "geoserver",
		}),
	});

	var building = new ol.layer.Image({
		extent: extent4326,
		source: new ol.source.ImageWMS({
			url: "http://localhost:8080/geoserver/test/wms",
			params: {
				LAYERS: "test:buildings",
				VERSION: "1.1.0",
			},
			serverType: "geoserver",
		}),
	});

	var geojson = new ol.layer.Vector({
		title: "added Layer",
		source: new ol.source.Vector({
			url: "HaNoiG.geojson",
			format: new ol.format.GeoJSON(),
		}),
	});

	var mousePositionControl = new ol.control.MousePosition({
		coordinateFormat: ol.coordinate.createStringXY(4),
		undefinedHTML: "&nbsp;",
	});

	var scaleLineControl = new ol.control.ScaleLine();

	var zoomslider = new ol.control.ZoomSlider();

	//Hien thi ban do
	var map = new ol.Map({
		target: "map",
		controls: ol.control
			.defaults()
			.extend([mousePositionControl, scaleLineControl, zoomslider]),
		layers: [quanhuyen,geojson,natural, building],
		view: new ol.View({
			projection: projection4326,
			center: [105.8138, 21.0],
			zoom: 8,
			maxZoom: 24,
		}),
	});

	$("#chkNatural").change(function () {
		if ($("#chkNatural").is(":checked")) {
			natural.setVisible(true);
		} else {
			natural.setVisible(false);
		}
	});

	$("#chkBuilding").change(function () {
		if ($("#chkBuilding").is(":checked")) {
			building.setVisible(true);
		} else {
			building.setVisible(false);
		}
	});

	$("#chkQuanHuyen").change(function () {
		if ($("#chkQuanHuyen").is(":checked")) {
			quanhuyen.setVisible(true);
		} else {
			quanhuyen.setVisible(false);
		}
	});

	// map.on("click", function (e) {
	// 	console.log(e.coordinate);
	// });

	map.on("singleclick", function (evt) {
		var view = map.getView();
		var viewResolution = view.getResolution();
		var url = quanhuyen
			.getSource()
			.getFeatureInfoUrl(evt["coordinate"], viewResolution, "EPSG:4326", {
				INFO_FORMAT: "text/html",
			});

		if (url) {
			fetch(url)
				.then(function (response) {
					return response.text();
				})
				.then((data) => {
					document.getElementById("info").innerHTML = decode_utf8(data);
				})
				.catch(function () {
					console.log("Error");
				});
		}
	});

	map.on("singleclick", function (evt) {
		var view = map.getView();
		var viewResolution = view.getResolution();
		var url = natural
			.getSource()
			.getFeatureInfoUrl(evt["coordinate"], viewResolution, "EPSG:4326", {
				INFO_FORMAT: "text/html",
			});

		if (url) {
			fetch(url)
				.then(function (response) {
					return response.text();
				})
				.then((data) => {
					document.getElementById("info1").innerHTML =
						decode_utf8(data);
				})
				.catch(function () {
					console.log("Error");
				});
		}
	});

	map.on("singleclick", function (evt) {
		var view = map.getView();
		var viewResolution = view.getResolution();
		var url = building
			.getSource()
			.getFeatureInfoUrl(evt["coordinate"], viewResolution, "EPSG:4326", {
				INFO_FORMAT: "text/html",
			});

		if (url) {
			fetch(url)
				.then(function (response) {
					return response.text();
				})
				.then((data) => {
					document.getElementById("info2").innerHTML =
						decode_utf8(data);
				})
				.catch(function () {
					console.log("Error");
				});
		}
	});

	let select = null; // ref to currently selected interaction

	// select interaction working on "singleclick"
	const selectSingleClick = new ol.interaction.Select();

	// select interaction working on "pointermove"
	const selectPointerMove = new ol.interaction.Select({
		condition: ol.events.condition.pointerMove,
	});

	const selectElement = document.getElementById("type");

	const changeInteraction = function () {
		if (select !== null) {
			map.removeInteraction(select);
		}
		const value = selectElement.value;
		if (value == "singleclick") {
			select = selectSingleClick;
		}else if (value == "pointermove") {
			select = selectPointerMove;
		} else {
			select = null;
		}
		if (select !== null) {
			map.addInteraction(select);
			select.on("select", function (e) {
				document.getElementById("status").innerHTML =
					"&nbsp;" +
					e.target.getFeatures().getLength() +
					" selected features (last operation selected " +
					e.selected.length +
					" and deselected " +
					e.deselected.length +
					" features)";
			});
		}
	};

	selectElement.onchange = changeInteraction;

}


function decode_utf8(s) {
	return decodeURIComponent(escape(s));
}