from typing import Dict, List

import requests
from bs4 import BeautifulSoup
from flask import Flask, jsonify
from flask_cors import CORS, cross_origin
from retry import retry

from api.config import ApiConfig

app = Flask(__name__)
cors = CORS(app)
app.config['CORS_HEADERS'] = 'Content-Type'
app.config['JSON_AS_ASCII'] = False


@retry(tries=3, delay=2)
def get_districts(url: str, city_id: str):
    payload = {'regionId': city_id}
    response = requests.request("POST", url, data=payload)

    data = response.json()
    summary = get_city_summary(ApiConfig.summary_url)
    districts = []
    for _, v in data["regionLocations"].items():
        districts.append({
            "id": v['id'],
            "title": v['title'],
            "region_type": v['regionType'],
        })
    return dict(summary=summary, districts=districts)


def get_district_by_id(district_id: str, keys: List[str], url: str):
    payload = {'regionId': district_id}

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


def get_city_summary(url: str) -> Dict:
    res = requests.get(url)
    soup = BeautifulSoup(res.text, "lxml")
    row = soup.find("div", {"class": "row"})
    summary = {}
    for i in row.find_all("div", {"class": "item-box-covid"}):
        title = i.find("div", {"class": "title-covid"}).text
        value = i.find("div", {"class": "val-covid"}).text
        summary.update({title: value})
    return summary


@app.route("/districts/<district_id>")
@cross_origin()
def get_district(district_id):
    district = get_district_by_id(
        district_id, ApiConfig.district_fields, ApiConfig.api_url)
    return jsonify(district)


@app.route("/districts")
@cross_origin()
def get_districts_handler():
    districts = get_districts(url=ApiConfig.api_url, city_id=ApiConfig.city_id)
    return jsonify(districts=districts)


if __name__ == "__main__":
    app.run(debug=True, host="0.0.0.0")
