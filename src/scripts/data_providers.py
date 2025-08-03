from torn_utils import make_api_call, KEY, PAGE_SIZE
from typing import Dict, Any, List, Tuple


def fetch_faction_members() -> Tuple[Dict[str, str], Dict[str, dict]]:
    print(f"Fetching faction members")
    r = make_api_call(f"/v2/faction/members?key={KEY}&striptags=true")
    member_tag_map = {
        str(m["id"]): f"{m['name']} [{m['id']}]" for m in r.get("members", [])
    }
    member_obj_map = {str(m["id"]): m for m in r.get("members", [])}
    print(f"Total members fetched: {len(member_tag_map)}")
    return member_tag_map, member_obj_map


def fetch_full_attacks(from_ts: str, to_ts: str) -> List[Dict[str, Any]]:
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
        r = make_api_call(
            f"/v2/faction/news?striptags=false&limit={PAGE_SIZE}&sort=ASC&to={to_ts}&from={next_from}&cat=armoryAction&key={KEY}"
        )
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
        r = make_api_call(
            f"/v2/faction/news?striptags=false&limit=100&sort=ASC&from={next_from}&cat=rankedWar&key={KEY}"
        )
        page_news = r.get("news", [])
        print(f"Fetched {len(page_news)} war news")
        news.extend(page_news)
        if page_news:
            next_from = str(int(page_news[-1]["timestamp"]) + 1)
        else:
            break
    print(f"Total ranked war news fetched: {len(news)}")
    return news
