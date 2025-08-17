import argparse
import os
from datasets import load_dataset
import json

"""
Stream a large Hugging Face dataset and write it to disk in NDJSON shards.
This avoids holding the entire dataset in memory and works with streaming datasets like the_pile, c4, etc.

Example:
  python scripts/datasets/download_hf_sharded.py \
    --dataset eleutherai/the_pile --subset all --split train \
    --records-per-shard 10000 --output ./datasets/language/the-pile

Notes:
- This produces files like shard_000001.jsonl, shard_000002.jsonl, ...
- To "resume", it will detect the next shard index by scanning existing files.
- Use with caution: Full downloads can be hundreds of GB.
"""


def next_shard_index(output_dir: str) -> int:
    os.makedirs(output_dir, exist_ok=True)
    existing = [f for f in os.listdir(output_dir) if f.startswith('shard_') and f.endswith('.jsonl')]
    if not existing:
        return 1
    nums = []
    for f in existing:
        try:
            n = int(f.replace('shard_', '').replace('.jsonl', ''))
            nums.append(n)
        except Exception:
            pass
    return max(nums) + 1 if nums else 1


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument('--dataset', required=True, help='HF dataset name, e.g., eleutherai/the_pile')
    ap.add_argument('--subset', default=None, help='HF dataset subset/config name, e.g., en')
    ap.add_argument('--split', default='train', help='HF dataset split, e.g., train')
    ap.add_argument('--records-per-shard', type=int, default=10000)
    ap.add_argument('--output', required=True, help='Output directory for shards')
    ap.add_argument('--max-records', type=int, default=0, help='Optional limit to stop early (0 = no limit)')
    args = ap.parse_args()

    ds = load_dataset(args.dataset, args.subset, split=args.split, streaming=True)
    shard_idx = next_shard_index(args.output)
    count = 0
    written = 0

    def open_shard(i: int):
        return open(os.path.join(args.output, f'shard_{i:06d}.jsonl'), 'a', encoding='utf-8')

    f = open_shard(shard_idx)
    try:
        for ex in ds:
            f.write(json.dumps(ex, ensure_ascii=False) + '\n')
            written += 1
            count += 1
            if written >= args.records_per_shard:
                f.close()
                shard_idx += 1
                f = open_shard(shard_idx)
                written = 0
            if args.max_records and count >= args.max_records:
                break
    finally:
        f.close()

    print(f'Done. Total records written: {count}. Last shard index: {shard_idx}.')


if __name__ == '__main__':
    main()

