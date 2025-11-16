import json
from collections import Counter

input_path = "board_network_2024.json"
output_path = "board_network_2024_no_isolates.json"

with open(input_path, "r", encoding="utf-8") as f:
    data = json.load(f)

nodes = data["nodes"]
links = data["links"]

# 1) compute degree of each node (how many edges touch it)
deg = Counter()
for link in links:
    deg[link["source"]] += 1
    deg[link["target"]] += 1

connected_ids = set(deg.keys())

# 2) keep only non-isolated nodes
filtered_nodes = [n for n in nodes if n["id"] in connected_ids]

# 3) (optional but safe) keep only links whose endpoints still exist
filtered_links = [
    l for l in links
    if l["source"] in connected_ids and l["target"] in connected_ids
]

# 4) write new JSON
with open(output_path, "w", encoding="utf-8") as f:
    json.dump(
        {"nodes": filtered_nodes, "links": filtered_links},
        f,
        ensure_ascii=False,
        indent=2,
    )

print("Original nodes:", len(nodes))
print("After removing isolates:", len(filtered_nodes))
print("Links:", len(filtered_links))
