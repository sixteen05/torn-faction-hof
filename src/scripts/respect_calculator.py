import json
from collections import defaultdict
from typing import List, Dict, Union

BONUS_HITS = [10, 25, 50, 100, 250, 500, 1000, 2500, 5000, 10000, 25000, 50000, 100000]


def read_yata_chain_report(
    file_path: str,
) -> Union[Dict[str, float], Dict[str, float], Dict[str, int], Dict[str, float]]:
    """
    Read the YATA chain report CSV file and return totals, averages, counts, and mods_avg.
    """
    totals = defaultdict(float)
    avg = defaultdict(float)
    count = defaultdict(int)
    mods_avg = defaultdict(float)

    with open(file_path, "r", encoding="utf-8") as file:
        for line in file:
            parts = line.strip().split("\t")
            if len(parts) < 13:
                continue

            player_id = parts[1].strip().split("[")[-1].split("]")[0]
            hits_count = int(parts[3].strip())
            mods_avg_value = float(parts[6].strip())
            flat_respect_avg = float(parts[7].strip())
            flat_respect_total = float(parts[8].strip())

            totals[player_id] = flat_respect_total
            avg[player_id] = flat_respect_avg
            count[player_id] = hits_count
            mods_avg[player_id] = mods_avg_value

    return dict(totals), dict(avg), dict(count), dict(mods_avg)


if __name__ == "__main__":
    # Example JSON with two attacks
    attacks_data = []
    with open("torn-attacks-1.json", "r", encoding="utf-8") as file:
        attacks_data = json.loads(file.read())

    print("\nRespect Totals for V3")
    totals, avg, count, mods_avg = calculate_respect_totals_v3(attacks_data)
    # for player, respect in totals.items():
    #     print(f"{player}: {respect:.2f} | {avg[player]:.2f} avg | {count[player]} attacks | {mods_avg[player]:.2f} mods_avg")

    yata_totals, yata_avg, yata_count, yata_mods_avg = read_yata_chain_report(
        "yata-chain-report-1.csv"
    )
    print("\nYATA Chain Report Comparison")
    for player in yata_totals:
        respect = yata_totals[player]
        avg_respect = yata_avg[player]
        count_attacks = yata_count[player]
        mods_avg_value = yata_mods_avg[player]
        if player not in totals:
            continue
        # Print only if they are not equal
        if (
            totals[player] != respect
            or avg[player] != avg_respect
            or count[player] != count_attacks
            or mods_avg[player] != mods_avg_value
        ):
            print(
                f"{player}: {respect:.2f} | {avg_respect:.2f} avg | {count_attacks} attacks | {mods_avg_value:.2f} mods_avg"
            )
            print(
                f"{player}: {totals[player]:.2f} | {avg[player]:.2f} avg | {count[player]} attacks | {mods_avg[player]:.2f} mods_avg\n"
            )
