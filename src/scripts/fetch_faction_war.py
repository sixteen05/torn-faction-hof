import json
from torn_utils import (
    save_json_file,
    file_exists,
    ASSETS_DIR,
)
from data_providers import (
    fetch_faction_members,
    fetch_full_attacks,
    fetch_armory_news,
    fetch_ranked_war_news,
)
from data_parsers import (
    filter_armory_news,
    get_armory_open_ts,
    get_enemy_faction_details_from_war_news,
    get_ranked_war_id_from_war_news,
    increment_war_counters_per_user,
    is_war_announced_news,
    is_war_end_news,
    is_war_started_news,
    parse_full_attack,
    parse_item_use,
)
from data_parsers import get_war_report_filename
from data_parsers import get_war_report_filename
from torn_utils import get_safe_timestamp


def fetch_and_parse_attacks(
    from_ts, to_ts, target_faction_id, aggregated_counts=None, member_tag_map=None
):
    if member_tag_map is None:
        member_tag_map, _ = fetch_faction_members()
    attacks = fetch_full_attacks(from_ts, to_ts)
    print(f"Aggregating attacks for {len(attacks)} records...")
    if aggregated_counts is None:
        aggregated_counts = {}
    for i, each_attack in enumerate(attacks):
        parsed = parse_full_attack(each_attack, target_faction_id, member_tag_map)
        increment_war_counters_per_user(
            aggregated_counts, parsed["userId"], parsed["userTag"], parsed
        )
    print(f"Aggregated attack counts: {json.dumps(aggregated_counts)[:50]}...")
    print(f"Total members in output: {len(aggregated_counts)}")
    return aggregated_counts


def fetch_and_parse_armory(
    from_ts, to_ts, filter_condition, aggregated_counts=None, member_tag_map=None
):
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
            details = get_enemy_faction_details_from_war_news(each_war_update)
            war_entry = {
                **details,
                "armoryOpenTs": get_armory_open_ts(each_war_update),
                "warDeclaredTs": each_war_update["timestamp"],
            }
            wars.append(war_entry)
        elif is_war_started_news(each_war_update) and prev_war_details:
            prev_war_details["warStartTs"] = each_war_update["timestamp"]
        elif is_war_end_news(each_war_update) and prev_war_details:
            prev_war_details["warEndTs"] = each_war_update["timestamp"]
            prev_war_details["rankedWarId"] = get_ranked_war_id_from_war_news(
                each_war_update
            )

    # Add war report filename to each war entry
    for war in wars:
        ranked_war_id = war.get("rankedWarId")
        war_start = war.get("warStartTs")
        war_end = war.get("warEndTs")
        if ranked_war_id and war_start:
            war["warReportFile"] = get_war_report_filename(
                ranked_war_id, war_start, war_end
            )
        else:
            war["warReportFile"] = None

    print(f"Wars: {json.dumps(wars, indent=2)[:50]}...")
    return wars


def generate_war_dump(from_ts):
    member_tag_map, _ = fetch_faction_members()
    wars = fetch_and_parse_war_news(from_ts)

    save_json_file(wars, "wars.json")
    print(f"Saved wars.json in {ASSETS_DIR}")

    for war in wars:
        war_start = war.get("warStartTs")
        war_end = war.get("warEndTs")
        armory_open = war.get("armoryOpenTs")
        enemy_faction_id = war.get("enemyFactionId")
        ranked_war_id = war.get("rankedWarId")

        # Only require war_start, armory_open, enemy_faction_id, ranked_war_id
        if not (war_start and armory_open and enemy_faction_id and ranked_war_id):
            print(f"Skipping incomplete war: {war}")
            continue

        file_name = get_war_report_filename(ranked_war_id, war_start, war_end)
        if file_exists(file_name):
            print(f"[CACHE] Skipping {file_name}, already exists.")
            continue

        print(f"Fetch War: [{enemy_faction_id}]({ranked_war_id}):{war_start}-{war_end}")

        # Attacks: war_start to war_end (if war_end missing, use current time)
        attacks_to_ts = str(get_safe_timestamp(war_end))
        attack_counts = fetch_and_parse_attacks(
            str(war_start), attacks_to_ts, int(enemy_faction_id), {}, member_tag_map
        )

        # Armory: armory_open to war_end (if war_end missing, use current time)
        armory_to_ts = str(get_safe_timestamp(war_end))
        armory_counts = fetch_and_parse_armory(
            str(armory_open), armory_to_ts, filter_armory_news, {}, member_tag_map
        )
        save_json_file(
            {
                "attackCounts": attack_counts,
                "armoryCounts": armory_counts,
                "warStartTs": war_start,
                "warEndTs": war_end,
                "armoryOpenTs": armory_open,
                "rankedWarId": ranked_war_id,
            },
            file_name,
        )
        print(f"Saved {file_name} in {ASSETS_DIR}")


if __name__ == "__main__":
    from_ts = "1745838001"  # Example: 2024-04-01 00:00:01 UTC
    generate_war_dump(from_ts)
