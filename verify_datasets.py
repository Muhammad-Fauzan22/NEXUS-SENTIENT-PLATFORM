#!/usr/bin/env python3
"""
NEXUS Platform Dataset Verification Script - Robust Version
Verifies all downloaded datasets across categories A, B, C, and D with
flexible matching and optional datasets handling.

Changes from previous version:
- Align expected dataset names with actual output paths from download scripts
- Treat presence as either a directory or a file (e.g., .zip) when applicable
- Allow flexible pattern matching (prefix/substring and hyphen/underscore variants)
- Mark very large/streaming datasets as optional (won't count as missing)
- Produce a richer JSON report including optional presence
"""

import json
import re
from pathlib import Path
from typing import Dict, List, Optional, Tuple

# Dataset categories and expected datasets
# Note: Some names updated to reflect the actual outputs of the download scripts.
DATASET_CATEGORIES: Dict[str, Dict] = {
    "A": {
        "name": "Psychometrics",
        "path": "./datasets/psychometric",
        "expected": [
            # Kaggle-based (directories)
            "big-five", "student-mental-health", "mbti-type", "dass-responses",
            "learning-factors", "riasec-test", "eq-dataset", "student-minds",
            "grit-mindset", "stress-factors", "loneliness", "procrastination",
            "student-engagement", "time-management", "social-connectedness",
            "interpersonal-competence", "leadership-style", "motivation-engagement",
            "social-support", "academic-motivation", "hexaco",
            # Direct downloads (zip files in script): verify as files too
            "self-esteem", "character-strengths", "cognitive-reflection",
            # GitHub clone
            "team-roles",
        ],
        "optional": [],
    },
    "B": {
        "name": "CV/Skills/Industry",
        "path": "./datasets/skills",
        "expected": [
            "job-descriptions", "so-survey-2023", "ds-jobs", "linkedin-jobs",
            "hr-analytics-job-change", "indeed-jobs", "tech-news", "github-repos",
            "enron-emails", "salary-prediction", "hf-resume-ner", "hf-techcrunch",
            # O*NET is downloaded as a zip file in the script
            "onet",
            # GitHub clones
            "skill-ner", "resume-parsing", "project-proposals", "performance-reviews",
        ],
        "optional": [],
    },
    "C": {
        "name": "Education/Academic/Career",
        "path": "./datasets/academic",
        "expected": [
            "student-performance", "coursera-courses", "arxiv", "ted-talks",
            "hf-academic-advising", "udemy-courses", "grades-prediction",
            "khan-academy", "admission-prediction", "student-dropout",
            "hf-summarization", "hf-resume-ner", "grad-admissions",
            "course-feedback", "platform-reviews", "study-hours",
            # GitHub clones and manual placeholders
            "project-proposals", "mentoring-logs", "alumni-trajectories",
            "syllabus-data", "mit-ocw", "openstax-textbooks",
            "professional-certifications", "conferences", "scholarships",
        ],
        "optional": [],
    },
    "D": {
        "name": "Language/Conversation/General Knowledge",
        "path": "./datasets/language",
        "expected": [
            # Saved via HF save_to_disk directories
            "squad", "anthropic-hh-rlhf", "dolly-15k", "openwebtext",
            "multi-news", "eli5", "bookcorpus", "codesearchnet",
            "cnn-dailymail", "lambada", "glue-mrpc", "wikitext",
            "daily-dialog", "commonsense-qa", "story-cloze", "code-alpaca",
            # Kaggle
            "reddit-comments", "quora-question-pairs",
            # Direct + unzip
            "movie-dialogs",
            # GitHub
            "awesome-lists",
            # Manual dir
            "gutenberg-books",
            # Names aligned to PS script outputs
            "wikipedia-full", "natural-questions-full",
        ],
        # Streaming-only dataset (not saved to disk in current script)
        "optional": ["the-pile"],
    },
}

# Known file extensions we consider as valid single-file dataset artifacts
FILE_EXTENSIONS = [".zip", ".7z", ".tar", ".tar.gz", ".tgz", ".jsonl", ".json"]


def _hyphen_underscore_variants(name: str) -> List[str]:
    if not name:
        return []
    variants = {name}
    variants.add(name.replace("-", "_"))
    variants.add(name.replace("_", "-"))
    return list(variants)


def _match_candidates(base: Path, expected: str) -> List[Path]:
    # Priority search order:
    # 1) Exact directory match
    # 2) Exact file with known extensions (e.g., expected.zip)
    # 3) Prefix match (dir or file): expected*, expected_* variants
    # 4) Substring match (dir or file): *expected*, *expected_* variants
    cands: List[Path] = []

    variants = _hyphen_underscore_variants(expected)

    # 1) Exact directory
    for v in variants:
        p = base / v
        if p.exists():
            cands.append(p)
    if cands:
        return cands

    # 2) Exact file with extension
    for v in variants:
        for ext in FILE_EXTENSIONS:
            p = base / f"{v}{ext}"
            if p.exists():
                cands.append(p)
    if cands:
        return cands

    # 3) Prefix match
    for v in variants:
        for child in base.iterdir() if base.exists() else []:
            name = child.name.lower()
            if name.startswith(v.lower()):
                cands.append(child)
    if cands:
        return cands

    # 4) Substring match
    for v in variants:
        for child in base.iterdir() if base.exists() else []:
            name = child.name.lower()
            if v.lower() in name:
                cands.append(child)
    return cands


def _is_file(p: Path) -> bool:
    return p.exists() and p.is_file()


def _is_dir(p: Path) -> bool:
    return p.exists() and p.is_dir()


def _bytes_to_mb(num_bytes: int) -> float:
    return round(num_bytes / (1024 * 1024), 2)


def _size_info(p: Path) -> Tuple[int, float]:
    if _is_dir(p):
        files = list(p.rglob("*"))
        file_count = sum(1 for f in files if f.is_file())
        size_mb = _bytes_to_mb(sum(f.stat().st_size for f in files if f.is_file()))
        return file_count, size_mb
    if _is_file(p):
        return 1, _bytes_to_mb(p.stat().st_size)
    return 0, 0.0


def verify_category(category_key: str) -> Optional[Dict]:
    category = DATASET_CATEGORIES[category_key]
    base_path = Path(category["path"]).resolve()

    print(f"\n📊 Verifying Category {category_key}: {category['name']}")
    print("=" * 50)

    if not base_path.exists():
        print(f"❌ Directory {base_path} does not exist")
        return {
            "category": category_key,
            "found": 0,
            "missing": len(category["expected"]),
            "optional_missing": len(category.get("optional", [])),
            "total": len(category["expected"]),
            "details": [],
        }

    found_datasets: List[Dict] = []
    missing_required: List[str] = []
    found_optional: List[Dict] = []
    missing_optional: List[str] = []

    # Build a fast lookup of existing names for user info
    existing_entries = {child.name for child in base_path.iterdir()}

    # Check required datasets
    for expected in category["expected"]:
        candidates = _match_candidates(base_path, expected)
        if candidates:
            # Pick the first (best-effort)
            target = candidates[0]
            file_count, size_mb = _size_info(target)
            found_datasets.append({
                "name": expected,
                "resolved_path": str(target.relative_to(base_path)),
                "files": file_count,
                "size_mb": size_mb,
                "type": "file" if _is_file(target) else "dir",
            })
        else:
            missing_required.append(expected)

    # Check optional datasets, if any
    for expected in category.get("optional", []):
        candidates = _match_candidates(base_path, expected)
        if candidates:
            target = candidates[0]
            file_count, size_mb = _size_info(target)
            found_optional.append({
                "name": expected,
                "resolved_path": str(target.relative_to(base_path)),
                "files": file_count,
                "size_mb": size_mb,
                "type": "file" if _is_file(target) else "dir",
            })
        else:
            missing_optional.append(expected)

    # Print report for this category
    print(f"✅ Found (required): {len(found_datasets)} datasets")
    for ds in found_datasets:
        print(f"   📁 {ds['name']}: {ds['files']} files, {ds['size_mb']} MB -> {ds['resolved_path']}")

    if found_optional:
        print(f"🛈 Found (optional): {len(found_optional)} datasets")
        for ds in found_optional:
            print(f"   📂 {ds['name']} (optional): {ds['files']} files, {ds['size_mb']} MB -> {ds['resolved_path']}")

    if missing_required:
        print(f"❌ Missing (required): {len(missing_required)} datasets")
        for name in missing_required:
            print(f"   • {name}")

    if missing_optional:
        print(f"⚠️ Missing (optional): {len(missing_optional)} datasets")
        for name in missing_optional:
            print(f"   • {name}")

    return {
        "category": category_key,
        "name": category["name"],
        "base_path": str(base_path),
        "found": len(found_datasets),
        "missing": len(missing_required),
        "optional_found": len(found_optional),
        "optional_missing": len(missing_optional),
        "total": len(category["expected"]),
        "details": {
            "found": found_datasets,
            "missing": missing_required,
            "optional_found": found_optional,
            "optional_missing": missing_optional,
        },
    }


def generate_report(results: List[Dict]) -> None:
    print("\n" + "=" * 60)
    print("📋 NEXUS Platform Dataset Verification Report")
    print("=" * 60)

    total_required_found = sum(r["found"] for r in results)
    total_required_expected = sum(r["total"] for r in results)
    total_optional_found = sum(r.get("optional_found", 0) for r in results)
    total_optional_missing = sum(r.get("optional_missing", 0) for r in results)

    for r in results:
        pct = (r["found"] / r["total"]) * 100 if r["total"] else 100.0
        print(
            f"Category {r['category']} ({r['name']}): "
            f"{r['found']}/{r['total']} required ({pct:.1f}%) | "
            f"optional found: {r.get('optional_found', 0)}"
        )

    print(
        f"\nTotal required: {total_required_found}/{total_required_expected} "
        f"datasets ({(total_required_found/total_required_expected)*100:.1f}%)"
    )
    print(
        f"Optional found: {total_optional_found} | Optional missing: {total_optional_missing}"
    )

    if total_required_found == total_required_expected:
        print("🎉 All required datasets are present!")
    else:
        print("⚠️ Some required datasets are missing. Run the download scripts again.")


def main() -> None:
    print("🔍 NEXUS Platform Dataset Verification")
    print("Checking all downloaded datasets across categories...")

    results: List[Dict] = []
    for category in ["A", "B", "C", "D"]:
        r = verify_category(category)
        if r:
            results.append(r)

    generate_report(results)

    # Save detailed report
    report_path = Path("./datasets_verification_report.json").resolve()
    with open(report_path, "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2)

    print(f"\n📄 Detailed report saved to: {report_path}")


if __name__ == "__main__":
    main()
