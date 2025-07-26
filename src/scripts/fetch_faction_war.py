import os
from dotenv import load_dotenv
import requests
import time
import json
import base64
from typing import Dict, Any, List

load_dotenv()
API_BASE = "https://api.torn.com"
KEY = os.getenv("TORN_FACTION_API_KEY", "<YOUR_TORN_API_KEY>")
CON_FACTION_ID = 48622
PAGE_SIZE = 1000
ASSETS_DIR = "src/assets/"
ARMORY_FILE_NAME = "armoryNews.json"
ATTACKS_FILE_NAME = "attacks.json"


# --- API Calls ---
def make_api_call(relative_url: str) -> Any:
    url = f"{API_BASE}{relative_url}"
    headers = {
        "accept": "application/json",
        "accept-language": "en-US,en;q=0.9",
        "referer": "https://www.torn.com/",
    }
    while True:
        print(f"API GET: {url}")
        resp = requests.get(url, headers=headers)
        try:
            data = resp.json()
        except Exception as e:
            print(f"Error decoding JSON: {e}")
            print(f"Raw response: {resp.text}")
            raise
        if data.get("error", {}).get("code") == 5:
            print("Throttled, waiting for 10sec")
            time.sleep(10)
            continue
        return data


def fetch_faction_members() -> Dict[str, str]:
    print(f"Fetching faction members")
    r = make_api_call(f"/v2/faction/members?key={KEY}&striptags=true")
    member_tag_map = {
        str(m["id"]): f"{m['name']} [{m['id']}]" for m in r.get("members", [])
    }
    print(f"Total members fetched: {len(member_tag_map)}")
    return member_tag_map


def fetch_attacks(from_ts: str, to_ts: str) -> List[Dict[str, Any]]:
    attacks = []
    next_from = from_ts
    while True:
        print(f"Fetching attacks from {next_from} to {to_ts}")
        r = make_api_call(
            f"/v2/faction/attacksfull?limit={PAGE_SIZE}&sort=ASC&from={next_from}&to={to_ts}&key={KEY}"
        )
        page_attacks = r.get("attacks", [])
        print(f"Fetched {len(page_attacks)} attacks")
        attacks.extend(page_attacks)
        if page_attacks:
            next_from = str(int(page_attacks[-1]["ended"]) + 1)
        else:
            break
    print(f"Total attacks fetched: {len(attacks)}")
    return attacks


def parse_attack(each_attack, target_faction_id, member_tag_map):
    attacker = each_attack.get("attacker") or {}
    defender = each_attack.get("defender") or {}
    result = each_attack.get("result", "").lower() or "unknown"
    attacker_faction_id = attacker.get("faction_id")
    defender_faction_id = defender.get("faction_id")
    is_war = bool(
        target_faction_id
        and (
            defender_faction_id == target_faction_id
            or attacker_faction_id == target_faction_id
        )
    )
    war_status = "war" if is_war else "non-war"
    # Determine action: attack or defend
    if defender_faction_id == CON_FACTION_ID:
        action = "defends"
        user_id = defender.get("id")
    else:
        action = "attacks"
        user_id = attacker.get("id")
    user_tag = (
        member_tag_map.get(str(user_id), str(user_id))
        if user_id is not None
        else "unknown"
    )

    if result == "unknown" or user_tag == "unknown":
        raise ValueError(f"Invalid attack data: {each_attack}")

    return {
        "userTag": user_tag,
        "action": action,
        "war_status": war_status,
        "result": result,
    }


def increment_count_for_user(aggregated_counts, user_tag, _type):
    action = _type["action"]
    war_status = _type["war_status"]
    result = _type["result"]
    if user_tag not in aggregated_counts:
        aggregated_counts[user_tag] = {
            "attacks": {"war": {}, "non-war": {}},
            "defends": {"war": {}, "non-war": {}},
        }
    if result not in aggregated_counts[user_tag][action][war_status]:
        aggregated_counts[user_tag][action][war_status][result] = 0
    aggregated_counts[user_tag][action][war_status][result] += 1


def save_json_file(content, file_name):
    with open(ASSETS_DIR + file_name, "w", encoding="utf-8") as f:
        json.dump(content, f, indent=2)


def fetch_and_parse_attacks(from_ts, to_ts, target_faction_id):
    member_tag_map = fetch_faction_members()
    attacks = fetch_attacks(from_ts, to_ts)
    print(f"Aggregating attacks for {len(attacks)} records...")
    aggregated_attacks = {}
    for i, each_attack in enumerate(attacks):
        parsed = parse_attack(each_attack, target_faction_id, member_tag_map)
        increment_count_for_user(aggregated_attacks, parsed["userTag"], parsed)
    print(f"Aggregated attack counts: {json.dumps(aggregated_attacks)[:500]}...")
    print(f"Total members in output: {len(aggregated_attacks)}")
    save_json_file(aggregated_attacks, ATTACKS_FILE_NAME)
    print(f"Saved {ATTACKS_FILE_NAME} in {ASSETS_DIR}")


# --- Example Usage ---
if __name__ == "__main__":
    # Dummy timestamps
    from_ts = "1752775200"
    to_ts = "1752886980"
    target_faction_id = 48927

    fetch_and_parse_attacks(from_ts, to_ts, target_faction_id)
    # fetchAndParseNews('1751932800', '1752278400', (item) => (item.includes('Xanax') || item.includes('point')) && !item.includes('for their role as'))
