from collections import defaultdict
import re
from torn_utils import save_json_file, ASSETS_DIR
from data_providers import (
    fetch_faction_chains,
    fetch_faction_members,
    fetch_attacks_for_chain,
    fetch_armory_news,
)
from data_parsers import increment_chain_counters_per_user


def merge_attacks_and_armory(
    user_aggregate: dict, armory_usage: dict, member_tag_map: dict
) -> dict:
    merged = {}
    for user_id, data in user_aggregate.items():
        merged[user_id] = {
            "attacks": data,
            "userTag": member_tag_map.get(user_id, user_id),
            "armory": armory_usage.get(user_id, {}),
        }

    return merged


def fetch_armory_for_chain(chain_start, chain_end, armory_cache):
    # Fetch armory news for 3 days prior to chain_start up to chain_end
    three_days_prior = str(int(chain_start) - 3 * 24 * 60 * 60)
    cache_key = f"{three_days_prior}_{chain_end}"
    if cache_key in armory_cache:
        return armory_cache[cache_key]
    news = fetch_armory_news(three_days_prior, chain_end)
    # Aggregate Xanax usage per member
    armory_usage = {}
    for each_news in news:
        if "Xanax" in each_news.get("text", ""):
            match = re.search(r'XID=(\d+)">([^<]+)</a>', each_news.get("text", ""))
            if match:
                member_id = match.group(1)
                armory_usage[member_id] = armory_usage.get(member_id, 0) + 1
    armory_cache[cache_key] = armory_usage
    return armory_usage


def generate_chains_dump(from_ts):
    member_tag_map, _ = fetch_faction_members()
    chains = fetch_faction_chains(from_ts)

    armory_cache = {}
    chains_out = []
    for chain in chains:
        chain_id = chain.get("id", None)
        chain_start = chain.get("start", None)
        chain_end = chain.get("end", None)
        if not chain_id or not chain_start or not chain_end:
            print(f"Skipping invalid chain: {chain}")
            continue
        print(f"Processing chain {chain_id}: {chain_start}-{chain_end}")

        attacks = fetch_attacks_for_chain(chain_start, chain_end)

        user_aggregate, is_war_chain = increment_chain_counters_per_user(attacks)
        armory_usage = fetch_armory_for_chain(chain_start, chain_end, armory_cache)
        user_aggregate = merge_attacks_and_armory(
            user_aggregate, armory_usage, member_tag_map
        )

        chain_report = {
            "chainId": chain_id,
            "chainStart": chain_start,
            "chainEnd": chain_end,
            "isWarChain": is_war_chain,
            "memberIdList": list(user_aggregate.keys()),
            "memberActions": user_aggregate,
        }

        chain_file = f"chain-report-{chain_id}-{chain_start}-{chain_end}.json"
        save_json_file(chain_report, chain_file)
        print(f"Saved {chain_file} in {ASSETS_DIR}")

        chain["chainReportFile"] = chain_file
        chain["isWarChain"] = is_war_chain
        chains_out.append(chain)

    save_json_file(chains_out, "chains.json")
    print(f"Saved chains.json in {ASSETS_DIR}")


if __name__ == "__main__":
    from_ts = "1745838001"  # Example: 2024-04-01 00:00:01 UTC
    generate_chains_dump(from_ts)
