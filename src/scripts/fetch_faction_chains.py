import json
from torn_utils import save_json_file, ASSETS_DIR
from data_providers import fetch_faction_chains


def generate_chains_dump(from_ts):
    chains = fetch_faction_chains(from_ts)
    save_json_file(chains, "chains.json")
    print(f"Saved chains.json in {ASSETS_DIR}")


if __name__ == "__main__":
    from_ts = "1745838001"  # Example: 2024-04-01 00:00:01 UTC
    generate_chains_dump(from_ts)
