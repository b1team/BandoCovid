window.onload = function () {
	get_districts();
};

let covid_data = [];
let total_data = {};

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
		layers: [vietnam_geo, quanhuyen, hanoi_geo],
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
			color: "rgba(255, 255, 255, 0.8)",
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

	// Fill mau theo so ca nhiem
	var extent = map.getView().calculateExtent(map.getSize());

	const blue_style = new ol.style.Style({
		stroke: new ol.style.Stroke({
			color: "#fff",
			width: 1,
		}),
		fill: new ol.style.Fill({
			color: "rgba(0,0,244,0.4)",
		}),
		text: new ol.style.Text({
			font: "12px Calibri,sans-serif",
			fill: new ol.style.Fill({
				color: "#fff",
			}),
			stroke: new ol.style.Stroke({
				color: "#000",
				width: 3,
			}),
		}),
	});

	const yellow_style = new ol.style.Style({
		stroke: new ol.style.Stroke({
			color: "#fff",
			width: 1,
		}),
		fill: new ol.style.Fill({
			color: "rgba(255,165,0,0.6)",
		}),
		text: new ol.style.Text({
			font: "12px Calibri,sans-serif",
			fill: new ol.style.Fill({
				color: "#fff",
			}),
			stroke: new ol.style.Stroke({
				color: "#000",
				width: 3,
			}),
		}),
	});

	const red_style = new ol.style.Style({
		stroke: new ol.style.Stroke({
			color: "#fff",
			width: 1,
		}),
		fill: new ol.style.Fill({
			color: "rgba(255,0,0,0.5)",
		}),
		text: new ol.style.Text({
			font: "12px Calibri,sans-serif",
			fill: new ol.style.Fill({
				color: "#fff",
			}),
			stroke: new ol.style.Stroke({
				color: "#000",
				width: 3,
			}),
		}),
	});

	let stop = 0;
	map.on("rendercomplete", function () {
		var features = hanoi_geo.getSource().getFeatures();
		if (stop === 1) return;

		if (covid_data.length === 30) {
			console.log(covid_data);
			for (var i in features) {
				var feature = features[i];
				if (
					ol.extent.containsExtent(
						extent,
						feature.getGeometry().getExtent()
					)
				) {
					for (const data of covid_data) {
						if (feature.get("ADM2_VI") === data.place) {
							if (data.totalPositive < 20) {
								feature.setStyle(blue_style);
								var clone = feature.getStyle().clone();
								feature.setStyle(clone);
								feature
									.getStyle()
									.getText()
									.setText(feature.get("ADM2_VI"));
							}
							if (data.totalPositive >= 20 && data.totalPositive <= 50) {
								feature.setStyle(yellow_style);
								var clone = feature.getStyle().clone();
								feature.setStyle(clone);
								feature
									.getStyle()
									.getText()
									.setText(feature.get("ADM2_VI"));
							} if (data.totalPositive > 50) {
								feature.setStyle(red_style);
								var clone = feature.getStyle().clone();
								feature.setStyle(clone);
								feature
									.getStyle()
									.getText()
									.setText(feature.get("ADM2_VI"));
							}
						}
					}
				}
			}
			stop = 1;
		}
	});

	map.on("click", function (evt) {
		displayFeatureInfo(evt.pixel);
	});

	// Bật/tắt layer
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
			hanoi_geo.setVisible(true);
		} else {
			quanhuyen.setVisible(false);
			hanoi_geo.setVisible(false);
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
	const container = document.getElementById('popup');
	const content = document.getElementById('popup-content');
	const closer = document.getElementById('popup-closer');
	var popup = new Popup();
	map.addOverlay(popup);
	map.on("singleclick", function (evt) {
		var view = map.getView();
		var viewResolution = view.getResolution();
		var url = quanhuyen
			.getSource()
			.getFeatureInfoUrl(evt["coordinate"], viewResolution, "EPSG:4326", {
				INFO_FORMAT: "application/json",
			});

		if (url) {
			fetch(url)
				.then(function (response) {
					return response.json();
				})
				.then((data) => {
					if (data.features.length === 0) return;
					var place = data.features[0].properties.adm2_vi;
					for (const data of covid_data) {
						if (place === data.place) {
							console.log(data);
							var totalPositive = data.totalPositive;
							var district = data.place;
							var f1 = data.summary.covidF1;
							var f2 = data.summary.covidF2;
							var totalPositiveDay = data.summary.totalPositiveDay;
							var totalCenter = data.summary.totalCenter;
							var totalDie = data.summary.totalDie;
							var totalCured = data.summary.totalCured;

							popup.show(evt.coordinate,
								'<div><ol><li>Quận/Huyện: ' + district + '</li>'
								+ '<li>F1: ' + f1 + '</li>'
								+ '<li>F2: ' + f2 + '</li>'
								+ '<li>Số ca nhiễm: ' + totalPositive + '</li>'
								+ '<li>Số ca nhiễm trong ngày: ' + totalPositiveDay + '</li>'
								+ '<li>Cách ly tập trung:' + totalCenter + '</li>'
								+ '<li>Số ca hồi phục:' + totalCured + '</li>'
								+ '<li>Số ca tử vong:' + totalDie + '</li>'
								+ '</ol></div>');
							var wards = data.wards;
							var ward;
							document.getElementById("ward-mapping").style.display = "block";

							var ward_form = document.getElementById('content');

							removeElements(document.querySelectorAll('.ward-form'));
							removeElements(document.querySelectorAll('td'));

							for (ward of wards) {
								var p = document.createElement("td");
								var p_totalCured = document.createElement("td");
								var p_totalDie = document.createElement("td");
								var p_f1 = document.createElement("td");
								var p_f2 = document.createElement("td");
								var p_ward = document.createElement("td");

								if (ward.totalPositive === null) {
									ward.totalPositive = 0;
								}
								if (ward.covidF1 === null) {
									ward.covidF1 = 0;
								}
								if (ward.covidF2 === null) {
									ward.covidF2 = 0;
								}
								if (ward.totalCured === null) {
									ward.totalCured = 0;
								}
								if (ward.totalDie === null) {
									ward.totalDie = 0;
								}

								p_ward.innerHTML = ward.wardTitle;
								p.innerHTML = ward.totalPositive;
								p_f1.innerHTML = ward.covidF1;
								p_f2.innerHTML = ward.covidF2;
								p_totalCured.innerHTML = ward.totalCured;
								p_totalDie.innerHTML = ward.totalDie;

								var tr = document.createElement("tr");

								ward_form.appendChild(tr);
								tr.appendChild(p_ward);
								tr.appendChild(p);
								tr.appendChild(p_f1);
								tr.appendChild(p_f2);
								tr.appendChild(p_totalCured);
								tr.appendChild(p_totalDie);
							}
							break;
						}
					}
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

// lay thong tin id, ten
function get_districts() {
	fetch('http://103.148.57.200:5000/districts')
		.then(function (response) {
			return response.json();
		})
		.then((data) => {
			total_data = data.districts.summary
			console.log(total_data);
			var positiveCase = total_data['Ca dương tính'];
			var f1Case = total_data.F1;
			var f2Case = total_data.F2;
			var isolatedCenterCase = total_data['Cách ly tập trung'];
			var isolateedHomeCase = total_data['Cách ly tại nhà']
			var curedCase = total_data['Đã hồi phục'];
			var positivePerDay = total_data['Trong ngày'];

			document.getElementById('positiveCaseHN').innerHTML = positiveCase;
			document.getElementById('f1CaseHN').innerHTML = f1Case;
			document.getElementById('f2CaseHN').innerHTML = f2Case;
			document.getElementById('isolatedHome').innerHTML = isolateedHomeCase;
			document.getElementById('isolatedCenter').innerHTML = isolatedCenterCase;
			document.getElementById('positivePerDay').innerHTML = positivePerDay;
			document.getElementById('curedCaseHN').innerHTML = curedCase;
			get_covid_all_location(data.districts);
			init();
		})
		.catch(function (err) {
			console.log("Error: ", err);
		});
}

//lay thong tin covid tat ca cac quan
function get_covid_all_location(districts) {
	for (let district of districts.districts) {
		fetch(`http://103.148.57.200:5000/districts/${district.id}`)
			.then(function (response) {
				return response.json();
			})
			.then((data) => {
				//muon lay thong tin gi sua summany, wards
				result = {
					place: district.title,
					totalPositive: data.summary.totalPositive,
					summary: data.summary,
					wards: data.wards,
				};
				covid_data.push(result);
			})
			.catch(function (err) {
				console.log("Error: ", err);
			});
	}
}

function openNav() {
	document.getElementById("mySidenav").style.width = "520px";
}


function closeNav() {
	document.getElementById("mySidenav").style.width = "0";
}

function removeElements(elements) {
	for (var i = 0; i < elements.length; i++) {
		elements[i].parentNode.removeChild(elements[i]);
	}
}