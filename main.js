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
			url: "http://103.148.57.200:8080/geoserver/covid/wms",
			params: {
				LAYERS: "covid:HanhChinhHN",
				VERSION: "1.1.0",
			},
			serverType: "geoserver",
		}),
	});

	var building = new ol.layer.Image({
		extent: extent4326,
		source: new ol.source.ImageWMS({
			url: "http://103.148.57.200:8080/geoserver/covid/wms",
			params: {
				LAYERS: "covid:buildings",
				VERSION: "1.1.0",
			},
			serverType: "geoserver",
		}),
	});

	var hanoi_geo = new ol.layer.Vector({
		title: "added Layer",
		source: new ol.source.Vector({
			url: "./geojson/HaNoiG.geojson",
			format: new ol.format.GeoJSON(),
		}),
		style: function (feature) {
			style.getText().setText(feature.get("ADM2_VI"));
			return style;
		},
	});

	var vietnam_geo = new ol.layer.Vector({
		title: "added Layer",
		source: new ol.source.Vector({
			url: "./geojson/vietnam.geojson",
			format: new ol.format.GeoJSON(),
		}),
	});

	var building_geo = new ol.layer.Vector({
		title: "added Layer",
		source: new ol.source.Vector({
			url: "./geojson/buildings.geojson",
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
		layers: [vietnam_geo, quanhuyen, hanoi_geo, building_geo],
		view: new ol.View({
			projection: projection4326,
			center: [105.8138, 21.0],
			zoom: 8,
			maxZoom: 24,
		}),
	});

	// Hover chuột
	const style = new ol.style.Style({
		fill: new ol.style.Fill({
			color: "rgba(255, 255, 255, 0.6)",
		}),
		stroke: new ol.style.Stroke({
			color: "#000",
			width: 1,
		}),
		text: new ol.style.Text({
			font: "12px Calibri,sans-serif",
			fill: new ol.style.Fill({
				color: "#000",
			}),
			stroke: new ol.style.Stroke({
				color: "#fff",
				width: 3,
			}),
		}),
	});

	const highlightStyle = new ol.style.Style({
		stroke: new ol.style.Stroke({
			color: "#f00",
			width: 1,
		}),
		fill: new ol.style.Fill({
			color: "rgba(255,0,0,0.1)",
		}),
		text: new ol.style.Text({
			font: "12px Calibri,sans-serif",
			fill: new ol.style.Fill({
				color: "#000",
			}),
			stroke: new ol.style.Stroke({
				color: "#fff",
				width: 3,
			}),
		}),
	});

	let highlight;

	const displayFeatureInfo = function (pixel) {
		const feature = map.forEachFeatureAtPixel(pixel, function (feature) {
			return feature;
		});

		const info = document.getElementById("info2");
		if (feature) {
			info.innerHTML = "Địa điểm đang trỏ: " + feature.get("ADM2_VI");
		} else {
			info.innerHTML = "&nbsp;";
		}

		if (feature !== highlight) {
			if (highlight) {
				featureOverlay.getSource().removeFeature(highlight);
			}
			if (feature) {
				featureOverlay.getSource().addFeature(feature);
			}
			highlight = feature;
		}
	};

	const featureOverlay = new ol.layer.Vector({
		source: new ol.source.Vector(),
		map: map,
		style: function (feature) {
			highlightStyle.getText().setText(feature.get("ADM2_VI"));
			return highlightStyle;
		},
	});

	map.on("pointermove", function (evt) {
		if (evt.dragging) {
			return;
		}
		const pixel = map.getEventPixel(evt.originalEvent);
		displayFeatureInfo(pixel);
	});

	map.on("click", function (evt) {
		displayFeatureInfo(evt.pixel);
	});

	// Bật/tắt layer
	$("#chkNatural").change(function () {
		if ($("#chkNatural").is(":checked")) {
			natural.setVisible(true);
		} else {
			natural.setVisible(false);
		}
	});

	$("#chkQuanHuyen").change(function () {
		if ($("#chkQuanHuyen").is(":checked")) {
			quanhuyen.setVisible(true);
		} else {
			quanhuyen.setVisible(false);
		}
	});

	$("#chkvietnam").change(function () {
		if ($("#chkvietnam").is(":checked")) {
			vietnam_geo.setVisible(true);
		} else {
			vietnam_geo.setVisible(false);
		}
	});

	// Click hiện thông tin layer
	// INFO_FOMAT application/json -> respone dạng json
	// respone.text() -> respone
	// document ... -> console
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
					document.getElementById("info").innerHTML = data;
				})
				.catch(function (err) {
					console.log("Error: ", err);
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
					document.getElementById("info1").innerHTML =
						decode_utf8(data);
				})
				.catch(function (err) {
					console.log("Error: ", err);
				});
		}
	});
}

function decode_utf8(s) {
	return decodeURIComponent(escape(s));
}
