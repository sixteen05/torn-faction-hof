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
        r = make_api_call(
            f"/v2/faction/attacksfull?limit={PAGE_SIZE}&sort=ASC&from={next_from}&to={to_ts}"
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


def fetch_attacks_for_chain(chain_start, chain_end):
    attacks = []
    next_from = chain_start
    while True:
        r = make_api_call(
            f"/v2/faction/attacks?limit={PAGE_SIZE}&sort=ASC&from={next_from}&to={chain_end}"
        )
        page_attacks = r.get("attacks", [])
        print(f"Fetched {len(page_attacks)} attacks")
        attacks.extend(page_attacks)
        if page_attacks:
            next_from = str(int(page_attacks[-1]["ended"]) + 1)
        else:
            break

    print(f"Fetched {len(attacks)} attacks for chain from {chain_start} to {chain_end}")
    return attacks


def fetch_armory_news(from_ts: str, to_ts: str) -> list:
    news = []
    next_from = from_ts
    while True:
        r = make_api_call(
            f"/v2/faction/news?striptags=false&limit={PAGE_SIZE}&sort=ASC&to={to_ts}&from={next_from}&cat=armoryAction"
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
            f"/v2/faction/news?striptags=false&limit=100&sort=ASC&from={next_from}&cat=rankedWar"
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


def fetch_faction_chains(from_ts: str) -> list:
    chains = []
    next_from = from_ts
    while True:
        print(f"Fetching faction chains from {next_from}")
        r = make_api_call(
            f"/v2/faction/chains?from={next_from}&sort=ASC&limit={PAGE_SIZE}"
        )
        page_chains = r.get("chains", [])
        print(f"Fetched {len(page_chains)} chains")
        for chain in page_chains:
            chains.append(
                {
                    "id": chain.get("id"),
                    "start": chain.get("start"),
                    "end": chain.get("end"),
                    "respect": chain.get("respect"),
                    "chain": chain.get("chain"),
                }
            )
        if page_chains:
            next_from = str(int(page_chains[-1]["end"]) + 1)
        else:
            break

    print(f"Total chains fetched: {len(chains)}")
    return chains
