from typing import DefaultDict
from environs import Env

env = Env()
env.read_env() 

DEAULT_KEYS = ['lastUpdateTime',
               'wardId',
               'wardTitle',
               'totalAfter14Day',
               'totalPositive',
               'covidF1',
               'covidF2',
               'covidF3',
               'covidF4',
               'waitForTest',
               'totalTested',
               'totalCured',
               'totalToday',
               'totalDie',
               'totalCenter',
               'totalHouse',
               'isLockdown',
               'updateTime', ]

class ApiConfig:
    api_url = env.str("API_URL", "")
    summary_url = env.str("SUMMARY_URL", "")
    city_id = env.str("CITY_ID", "")
    district_fields = env.list("DISTRICT_FIELDS", DEAULT_KEYS)
