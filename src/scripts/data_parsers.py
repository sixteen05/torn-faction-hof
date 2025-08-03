import re
from torn_utils import CON_FACTION_ID


# --- Data Processing ---
def parse_full_attack(each_attack, target_faction_id, member_tag_map):
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


def get_enemy_faction_details_from_war_news(war_news):
    regex = re.compile(r"profile&ID=(\d*)")
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
    regex = re.compile(r"<a[^>]*>([^<]*)</a>")
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


# Unused
# def did_con_faction_win(war_news):
#     txt = war_news.get("text", "")
#     return (
#         "defeated" in txt
#         and "in a ranked war" in txt
#         and "congratulations" in txt.lower()
#     )


def get_ranked_war_id_from_war_news(war_news):
    match = re.search(r"&rankID=(\d*)", war_news.get("text", ""))
    if match:
        return match.group(1)
    return None


def get_armory_open_ts(war_news):
    # 2 days before war declared
    return war_news["timestamp"] - 2 * 24 * 60 * 60


def get_war_report_filename(ranked_war_id, war_start, war_end):
    war_end_safe = war_end if war_end else 0
    return f"war-report-{ranked_war_id}-{war_start}-{war_end_safe}.json"


def filter_armory_news(item):
    return ("Xanax" in item or "point" in item) and ("for their role as" not in item)


def parse_item_use(each_news):
    # Extract user id and name from HTML
    match = re.search(r'XID=(\d+)">([^<]+)</a>', each_news.get("text", ""))
    if not match:
        return None, None, None

    member_id = match.group(1)
    # The used item is after the closing </a>
    used_item = each_news.get("text", "").split("</a>", 1)[-1].strip()
    return member_id, used_item


def increment_war_counters_per_user(aggregated_counts, user_id, _type):
    action = _type["action"]
    war_status = _type["war_status"]
    result = _type["result"]
    if user_id not in aggregated_counts:
        aggregated_counts[user_id] = {
            "attacks": {"war": {}, "non-war": {}},
            "defends": {"war": {}, "non-war": {}},
        }
    if result not in aggregated_counts[user_id][action][war_status]:
        aggregated_counts[user_id][action][war_status][result] = 0
    aggregated_counts[user_id][action][war_status][result] += 1
