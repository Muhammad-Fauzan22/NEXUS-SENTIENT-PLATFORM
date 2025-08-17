#!/usr/bin/env python3
"""
NEXUS Platform Dataset Verification Script
Verifies all downloaded datasets across categories A, B, C, and D
"""

import os
import json
from pathlib import Path

# Dataset categories and expected datasets
DATASET_CATEGORIES = {
    "A": {
        "name": "Psychometrics",
        "path": "./datasets/psychometric",
        "expected": [
            "big-five", "student-mental-health", "mbti-type", "dass-responses",
            "learning-factors", "riasec-test", "eq-dataset", "student-minds",
            "grit-mindset", "stress-factors", "loneliness", "procrastination",
            "student-engagement", "time-management", "social-connectedness",
            "interpersonal-competence", "leadership-style", "motivation-engagement",
            "social-support", "academic-motivation", "hexaco", "self-esteem",
            "character-strengths", "cognitive-reflection", "team-roles"
        ]
    },
    "B": {
        "name": "CV/Skills/Industry",
        "path": "./datasets/skills",
        "expected": [
            "job-descriptions", "so-survey-2023", "ds-jobs", "linkedin-jobs",
            "hr-analytics-job-change", "indeed-jobs", "tech-news", "github-repos",
            "enron-emails", "salary-prediction", "hf-resume-ner", "hf-techcrunch",
            "onet", "skill-ner", "resume-parsing", "project-proposals",
            "performance-reviews"
        ]
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
            "project-proposals", "mentoring-logs", "alumni-trajectories",
            "syllabus-data", "mit-ocw", "openstax-textbooks",
            "professional-certifications", "conferences", "scholarships"
        ]
    },
    "D": {
        "name": "Language/Conversation/General Knowledge",
        "path": "./datasets/language",
        "expected": [
            "squad", "anthropic-hh-rlhf", "dolly-15k", "openwebtext",
            "multi-news", "eli5", "bookcorpus", "codesearchnet",
            "cnn-dailymail", "lambada", "glue-mrpc", "wikitext",
            "daily-dialog", "commonsense-qa", "story-cloze", "code-alpaca",
            "reddit-comments", "quora-question-pairs", "movie-dialogs",
            "awesome-lists", "gutenberg-books", "the-pile", "wikipedia",
            "c4", "natural-questions"
        ]
    }
}

def verify_category(category_key):
    """Verify a specific category of datasets"""
    category = DATASET_CATEGORIES[category_key]
    path = Path(category["path"])
    
    print(f"\n📊 Verifying Category {category_key}: {category['name']}")
    print("=" * 50)
    
    if not path.exists():
        print(f"❌ Directory {path} does not exist")
        return
    
    found_datasets = []
    missing_datasets = []
    
    for expected in category["expected"]:
        expected_path = path / expected
        if expected_path.exists():
            # Count files in directory
            file_count = sum(1 for _ in expected_path.rglob('*') if _.is_file())
            size_mb = sum(f.stat().st_size for f in expected_path.rglob('*') if f.is_file()) / (1024*1024)
            
            found_datasets.append({
                "name": expected,
                "files": file_count,
                "size_mb": round(size_mb, 2)
            })
        else:
            missing_datasets.append(expected)
    
    print(f"✅ Found: {len(found_datasets)} datasets")
    for ds in found_datasets:
        print(f"   📁 {ds['name']}: {ds['files']} files, {ds['size_mb']} MB")
    
    if missing_datasets:
        print(f"❌ Missing: {len(missing_datasets)} datasets")
        for ds in missing_datasets:
            print(f"   📂 {ds}")
    
    return {
        "category": category_key,
        "found": len(found_datasets),
        "missing": len(missing_datasets),
        "total": len(category["expected"])
    }

def generate_report(results):
    """Generate a summary report"""
    print("\n" + "="*60)
    print("📋 NEXUS Platform Dataset Verification Report")
    print("="*60)
    
    total_found = sum(r["found"] for r in results)
    total_expected = sum(r["total"] for r in results)
    
    for result in results:
        percentage = (result["found"] / result["total"]) * 100
        print(f"Category {result['category']}: {result['found']}/{result['total']} ({percentage:.1f}%)")
    
    print(f"\nTotal: {total_found}/{total_expected} datasets ({(total_found/total_expected)*100:.1f}%)")
    
    if total_found == total_expected:
        print("🎉 All datasets are present!")
    else:
        print("⚠️ Some datasets are missing. Run the download scripts again.")

def main():
    print("🔍 NEXUS Platform Dataset Verification")
    print("Checking all downloaded datasets across categories...")
    
    results = []
    for category in ["A", "B", "C", "D"]:
        result = verify_category(category)
        if result:
            results.append(result)
    
    generate_report(results)
    
    # Save detailed report
    report_path = Path("./datasets_verification_report.json")
    with open(report_path, 'w') as f:
        json.dump(results, f, indent=2)
    
    print(f"\n📄 Detailed report saved to: {report_path}")

if __name__ == "__main__":
    main()
