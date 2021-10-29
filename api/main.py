from typing import List
from flask import Flask, jsonify

import requests
from retry import retry

from api.config import ApiConfig

app = Flask(__name__)
app.config['JSON_AS_ASCII'] = False

@retry(tries=3, delay=2)
def get_districts(url: str, city_id: str):
	payload={'regionId': city_id}
	response = requests.request("POST", url, data=payload)

	data = response.json()
	districts = [
		{
			"summary": data.get("summary")
		}
	]
	for _, v in data["regionLocations"].items():
		districts.append({
			"id": v['id'],
			"title": v['title'],
			"region_type": v['regionType'],
		})
	return districts


def get_district_by_id(district_id: str, keys: List[str], url: str):
	payload={'regionId': district_id}

	response = requests.request("POST", url, data=payload)
	response_data = response.json()

	wards = response_data.get('items', {}).items()

	wards_info = []
	for _, ward_info in wards:
		data = {}
		for key in keys:
			data[key] = ward_info.get(key, None)
		wards_info.append(data)
	summary = response_data.get("summary", {})
	return dict(wards=wards_info, summary=summary)


@app.route("/districts/<district_id>")
def get_district(district_id):
	district = get_district_by_id(
		district_id, ApiConfig.district_fields, ApiConfig.api_url)
	return jsonify(district)

@app.route("/districts")
def get_districts_handler():
	districts = get_districts(url=ApiConfig.api_url, city_id=ApiConfig.city_id)
	return jsonify(districts=districts)


if __name__ == "__main__":
	app.run(debug=True)
