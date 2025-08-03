# Script to fetch Torn faction members' stats and dump them for Hall of Fame dashboard
# Usage: Set your API key and faction ID below, then run with: python fetch_faction_stats.py

import os
import requests
import json
import time
from datetime import datetime, timedelta

### FIXME: Migrate to use TornUtils and DataProviders

API_KEY = os.getenv("TORN_API_KEY", "<YOUR_TORN_API_KEY>")
FACTION_ID = os.getenv("TORN_FACTION_ID", "<YOUR_FACTION_ID>")
OUTPUT_PATH = os.path.abspath(
    os.path.join(os.path.dirname(__file__), "../../public/faction-member-hof-dump.json")
)

today = datetime.today()
year = today.year
month = today.month


def get_month_dates(year, month):
    dates = []
    date = datetime(year, month, 1)
    while date.month == month:
        dates.append(date)
        date += timedelta(days=1)
    return dates


def get_month_dates_before_today(year, month):
    dates = []
    date = datetime(year, month, 1)
    today_date = datetime.today().date()
    while date.month == month and date.date() < today_date:
        dates.append(date)
        date += timedelta(days=1)
    return dates


def fetch_faction_members():
    print(f"Fetching faction members for FACTION_ID={FACTION_ID}")
    url = f"https://api.torn.com/faction/{FACTION_ID}?selections=basic&key={API_KEY}"
    res = requests.get(url)
    if not res.ok:
        raise Exception("Failed to fetch faction members")
    data = res.json()
    if "error" in data:
        raise Exception(f"API Error: {data['error']}")
    members_dict = data.get("members", {})
    # Add user_id field to each member dict
    members = []
    for user_id, member in members_dict.items():
        member = dict(member)  # copy to avoid mutating original
        member["user_id"] = user_id
        members.append(member)
    print(f"Fetched {len(members)} faction members.")
    return members


# List of stat keys to extract from Torn v2 API (see https://www.torn.com/swagger/openapi.json)
STAT_KEYS = [
    "organizedcrimes",
    "alcoholused",
    "bloodwithdrawn",
    "jailed",
    "networth",
    # Add more stat keys here as needed
]

# Optional: UI-friendly names for each stat (for dashboard use)
STAT_LABELS = {
    "organizedcrimes": "Organized Crimes",
    "alcoholused": "Alcohol Used",
    "bloodwithdrawn": "Blood Withdrawn",
    "jailed": "Jailed",
    "networth": "Networth",
    # Add more mappings as needed
}


def fetch_player_stats(player_id, timestamp):
    stat_param = ",".join(STAT_KEYS)
    url = f"https://api.torn.com/v2/user/{player_id}/personalstats?stat={stat_param}&timestamp={timestamp}"
    headers = {"Authorization": f"ApiKey {API_KEY}"}
    while True:
        res = requests.get(url, headers=headers)
        if not res.ok:
            raise Exception(f"Failed to fetch stats for player {player_id}")
        player_json = res.json()
        if "error" in player_json:
            error = player_json["error"]
            if (isinstance(error, dict) and error.get("code") == 5) or (
                isinstance(error, int) and error == 5
            ):
                print(
                    "Too many requests (code 5). Waiting 60 seconds before retrying..."
                )
                time.sleep(60)
                continue
            raise Exception(f"API Error: {error}")
        return player_json


def extract_stats(player):
    stats_list = player.get("personalstats", [])
    stat_map = {
        stat["name"]: stat.get("value", 0) for stat in stats_list if "name" in stat
    }
    stats = {stat: stat_map.get(stat, 0) for stat in STAT_KEYS}
    return stats


def main():
    print(f"Starting script for year={year}, month={month}")
    members = fetch_faction_members()
    print(f"Total members fetched: {len(members)}")
    dates = get_month_dates_before_today(year, month)
    all_data = []

    for date in dates:
        print(f"Processing date: {date.strftime('%Y-%m-%d')}")
        stats = []
        timestamp = int(
            datetime(date.year, date.month, date.day, 23, 59, 59).timestamp()
        )
        for member in members:
            player = fetch_player_stats(member["user_id"], timestamp)
            stat = {"name": member["name"]}
            stat.update(extract_stats(player))
            stats.append(stat)
        all_data.append({"date": date.strftime("%Y-%m-%d"), "stats": stats})

    print(f"Writing output to {OUTPUT_PATH}")
    with open(OUTPUT_PATH, "w", encoding="utf-8") as f:
        json.dump(all_data, f, indent=2)
    print(f"Dumped stats to {OUTPUT_PATH}")


if __name__ == "__main__":
    try:
        main()
    except Exception as e:
        print(e)
        exit(1)
