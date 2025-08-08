import os
from dotenv import load_dotenv
import re
import requests
import time
import json
import base64
from typing import Dict, Any, List
from datetime import datetime, timedelta, timezone
import pytz

load_dotenv()
API_BASE = "https://api.torn.com"
KEY = os.getenv("TORN_FACTION_API_KEY", "<YOUR_TORN_API_KEY>")
CON_FACTION_ID = 48622
PAGE_SIZE = 1000
ASSETS_DIR = "public/"
ARMORY_FILE_NAME = "armoryNews.json"
ATTACKS_FILE_NAME = "attacks.json"
BONUS_HITS = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000]


# --- Generic Utils ---
def make_api_call(relative_url: str) -> Any:
    url = f"{API_BASE}{relative_url}"
    headers = {
        "accept": "application/json",
        "accept-language": "en-US,en;q=0.9",
        "referer": "https://www.torn.com/",
        "Authorization": f"ApiKey {KEY}",
    }
    while True:
        try:
            print(f"API GET: {url}")
            resp = requests.get(url, headers=headers)
            data = resp.json()
        except Exception as e:
            print(f"Error decoding JSON: {e}")
            print(f"Raw response: {resp.text}")
            raise

        if data.get("error", {}).get("code") == 5:
            print("Throttled, waiting for 10sec")
            time.sleep(10)
            continue
        elif data.get("error"):
            raise Exception(f"API Error: {json.dumps(data, indent=2)}")

        return data


def file_exists(file_name):
    file_path = os.path.join(ASSETS_DIR, file_name)
    return os.path.exists(file_path)


def get_safe_timestamp(ts):
    """Return ts if not None, else current unix time as int."""
    return int(ts) if ts else int(time.time())


def save_json_file(content, file_name):
    # Add IST datetime to content
    ist = pytz.timezone("Asia/Kolkata")
    now_utc = datetime.now(timezone.utc)
    now_ist = now_utc.astimezone(ist)
    ist_str = now_ist.strftime("%Y-%m-%d %H:%M:%S IST")
    if isinstance(content, dict):
        content["generatedAtIST"] = ist_str
    elif isinstance(content, list):
        # For list, add as a top-level dict
        content = {"generatedAtIST": ist_str, "data": content}
    with open(ASSETS_DIR + file_name, "w", encoding="utf-8") as f:
        json.dump(content, f, indent=2)
