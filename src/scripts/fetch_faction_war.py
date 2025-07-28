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


# --- Generic Utils ---
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

def save_json_file(content, file_name):
    # Add IST datetime to content
    ist = pytz.timezone('Asia/Kolkata')
    now_utc = datetime.now(timezone.utc)
    now_ist = now_utc.astimezone(ist)
    ist_str = now_ist.strftime('%Y-%m-%d %H:%M:%S IST')
    if isinstance(content, dict):
        content["generatedAtIST"] = ist_str
    elif isinstance(content, list):
        # For list, add as a top-level dict
        content = {"generatedAtIST": ist_str, "data": content}
    with open(ASSETS_DIR + file_name, "w", encoding="utf-8") as f:
        json.dump(content, f, indent=2)


# --- API callers ---
def fetch_faction_members() -> (Dict[str, str], Dict[str, dict]):
    print(f"Fetching faction members")
    r = make_api_call(f"/v2/faction/members?key={KEY}&striptags=true")
    member_tag_map = {
        str(m["id"]): f"{m['name']} [{m['id']}]" for m in r.get("members", [])
    }
    member_obj_map = {str(m["id"]): m for m in r.get("members", [])}
    print(f"Total members fetched: {len(member_tag_map)}")
    return member_tag_map, member_obj_map

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

def fetch_armory_news(from_ts: str, to_ts: str) -> list:
    news = []
    next_from = from_ts
    while True:
        print(f"Fetching armory news from {next_from} to {to_ts}")
        r = make_api_call(f"/v2/faction/news?striptags=false&limit={PAGE_SIZE}&sort=ASC&to={to_ts}&from={next_from}&cat=armoryAction&key={KEY}")
        page_news = r.get("news", [])
        print(f"Fetched {len(page_news)} news")
        news.extend(page_news)
        if page_news:
            next_from = str(int(page_news[-1]["timestamp"]) + 1)
        else:
            break
    print(f"Total armory news fetched: {len(news)}")
    return news

def fetch_ranked_war_news(from_ts: str) -> list:
    news = []
    next_from = from_ts
    while True:
        print(f"Fetching ranked war news from {next_from}")
        r = make_api_call(f"/v2/faction/news?striptags=false&limit=100&sort=ASC&from={next_from}&cat=rankedWar&key={KEY}")
        page_news = r.get("news", [])
        print(f"Fetched {len(page_news)} war news")
        news.extend(page_news)
        if page_news:
            next_from = str(int(page_news[-1]["timestamp"]) + 1)
        else:
            break
    print(f"Total ranked war news fetched: {len(news)}")
    return news


# --- Data Processing ---
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

    if result == "unknown" or user_id is None:
        raise ValueError(f"Invalid attack data: {each_attack}")

    return {
        "userId": str(user_id),
        "userTag": user_tag,
        "action": action,
        "war_status": war_status,
        "result": result,
    }

def get_enemy_faction_details(war_news):
    regex = re.compile(r'profile&ID=(\d*)')
    matches = regex.findall(war_news.get("text", ""))
    if not matches:
        return {"enemyFactionId": None, "enemyFactionName": None}
    if matches[0] == str(CON_FACTION_ID) and len(matches) > 1:
        enemy_id = matches[1]
        name = get_enemy_faction_name(war_news, 1)
    else:
        enemy_id = matches[0]
        name = get_enemy_faction_name(war_news, 0)
    return {"enemyFactionId": enemy_id, "enemyFactionName": name}

def get_enemy_faction_name(war_news, at_index):
    regex = re.compile(r'<a[^>]*>([^<]*)</a>')
    matches = regex.findall(war_news.get("text", ""))
    if not matches:
        return None
    if at_index < len(matches):
        return matches[at_index]
    return None

def is_war_announced_news(war_news):
    return "will begin in" in war_news.get("text", "")

def is_war_started_news(war_news):
    return "has begun" in war_news.get("text", "")

def is_war_end_news(war_news):
    txt = war_news.get("text", "")
    return "defeated" in txt and "in a ranked war" in txt

def get_ranked_war_id(war_news):
    match = re.search(r'&rankID=(\d*)', war_news.get("text", ""))
    if match:
        return match.group(1)
    return None

def get_armory_open_ts(war_news):
    # 2 days before war declared
    return war_news["timestamp"] - 2 * 24 * 60 * 60

def parse_item_use(each_news):
    # Extract user id and name from HTML
    match = re.search(r'XID=(\d+)">([^<]+)</a>', each_news.get("text", ""))
    if not match:
        return None, None, None
    member_id = match.group(1)
    member_name = match.group(2)
    user_tag = f"{member_name} [{member_id}]"
    # The used item is after the closing </a>
    used_item = each_news.get("text", "").split("</a>", 1)[-1].strip()
    return member_id, user_tag, used_item

def increment_count_for_user(aggregated_counts, user_id, user_tag, _type):
    action = _type["action"]
    war_status = _type["war_status"]
    result = _type["result"]
    if user_id not in aggregated_counts:
        aggregated_counts[user_id] = {
            "userTag": user_tag,
            "attacks": {"war": {}, "non-war": {}},
            "defends": {"war": {}, "non-war": {}},
            "armory": {},
        }
    if result not in aggregated_counts[user_id][action][war_status]:
        aggregated_counts[user_id][action][war_status][result] = 0
    aggregated_counts[user_id][action][war_status][result] += 1

def fetch_and_parse_attacks(from_ts, to_ts, target_faction_id, aggregated_counts=None, member_tag_map=None):
    if member_tag_map is None:
        member_tag_map, _ = fetch_faction_members()
    attacks = fetch_attacks(from_ts, to_ts)
    print(f"Aggregating attacks for {len(attacks)} records...")
    if aggregated_counts is None:
        aggregated_counts = {}
    for i, each_attack in enumerate(attacks):
        parsed = parse_attack(each_attack, target_faction_id, member_tag_map)
        increment_count_for_user(aggregated_counts, parsed["userId"], parsed["userTag"], parsed)
    print(f"Aggregated attack counts: {json.dumps(aggregated_counts)[:500]}...")
    print(f"Total members in output: {len(aggregated_counts)}")
    return aggregated_counts

def fetch_and_parse_armory(from_ts, to_ts, filter_condition, aggregated_counts=None, member_tag_map=None):
    if member_tag_map is None:
        member_tag_map, _ = fetch_faction_members()
    news = fetch_armory_news(from_ts, to_ts)
    if aggregated_counts is None:
        aggregated_counts = {}
    for each_news in news:
        member_id, user_tag, used_item = parse_item_use(each_news)
        if not member_id or not used_item:
            continue
        if filter_condition(used_item):
            if member_id not in aggregated_counts:
                aggregated_counts[member_id] = {
                    "userTag": user_tag,
                    "attacks": {"war": {}, "non-war": {}},
                    "defends": {"war": {}, "non-war": {}},
                    "armory": {},
                }
            if used_item not in aggregated_counts[member_id]["armory"]:
                aggregated_counts[member_id]["armory"][used_item] = 0
            aggregated_counts[member_id]["armory"][used_item] += 1
    print(f"Aggregated armory usage: {json.dumps(aggregated_counts)[:500]}...")
    print(f"Total members in output: {len(aggregated_counts)}")
    return aggregated_counts

def fetch_and_parse_war_news(from_ts):
    war_news = fetch_ranked_war_news(from_ts)
    wars = []
    for each_war_update in war_news:
        prev_war_details = wars[-1] if wars else None
        if is_war_announced_news(each_war_update):
            details = get_enemy_faction_details(each_war_update)
            wars.append({
                **details,
                "armoryOpenTs": get_armory_open_ts(each_war_update),
                "warDeclaredTs": each_war_update["timestamp"]
            })
        elif is_war_started_news(each_war_update) and prev_war_details:
            prev_war_details["warStartTs"] = each_war_update["timestamp"]
        elif is_war_end_news(each_war_update) and prev_war_details:
            prev_war_details["warEndTs"] = each_war_update["timestamp"]
            prev_war_details["rankedWarId"] = get_ranked_war_id(each_war_update)
    print(f"Wars: {json.dumps(wars, indent=2)[:50]}...")
    save_json_file(wars, "wars.json")
    print(f"Saved wars.json in {ASSETS_DIR}")
    return wars

def fetch_and_parse_all(from_ts, filter_condition):
    member_tag_map, _ = fetch_faction_members()
    wars = fetch_and_parse_war_news(from_ts)
    # wars.json is already saved by fetch_and_parse_war_news
    for war in wars:
        war_start = war.get("warStartTs")
        war_end = war.get("warEndTs")
        armory_open = war.get("armoryOpenTs")
        enemy_faction_id = war.get("enemyFactionId")
        ranked_war_id = war.get("rankedWarId")
        if not (war_start and war_end and armory_open and enemy_faction_id and ranked_war_id):
            print(f"Skipping incomplete war: {war}")
            continue
        print(f"Processing war: {enemy_faction_id} {war_start} - {war_end} (rankedWarId={ranked_war_id})")
        # Attacks: war_start to war_end
        attack_counts = fetch_and_parse_attacks(str(war_start), str(war_end), int(enemy_faction_id), {}, member_tag_map)
        # Armory: armory_open to war_end
        armory_counts = fetch_and_parse_armory(str(armory_open), str(war_end), filter_condition, {}, member_tag_map)
        file_name = f"war-report-{ranked_war_id}.json"
        save_json_file({
            "attackCounts": attack_counts,
            "armoryCounts": armory_counts,
            "warStartTs": war_start,
            "warEndTs": war_end,
            "armoryOpenTs": armory_open,
            "rankedWarId": ranked_war_id,
        }, file_name)
        print(f"Saved {file_name} in {ASSETS_DIR}")


# --- Example Usage ---
if __name__ == "__main__":
    from_ts = "1745838001" # Example: 2024-04-01 00:00:01 UTC
    filter_condition = lambda item: ("Xanax" in item or "point" in item) and ("for their role as" not in item)
    fetch_and_parse_all(from_ts, filter_condition)
