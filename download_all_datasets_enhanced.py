#!/usr/bin/env python3
"""
NEXUS Platform Dataset Downloader - Elite Orchestrator
- Preflight checks (internet, Kaggle creds/CLI, disk space)
- Category execution with retry and timing
- Structured JSON report: datasets_download_report.json
- Accurate summary and exit codes (0 success, 1 partial failure, 2 preflight fatal)
"""

import os
import sys
import json
import time
import shutil
import platform
import subprocess
from datetime import datetime
from pathlib import Path
from urllib.request import urlopen

# Base directory for datasets
DATASETS_DIR = Path("./datasets")
DATASETS_DIR.mkdir(exist_ok=True)
REPORT_PATH = Path("./datasets_download_report.json").resolve()


def now_iso() -> str:
    return datetime.utcnow().strftime("%Y-%m-%dT%H:%M:%SZ")


def run_ps_command(cmd: str, cwd: str | None = None) -> dict:
    """Run PowerShell command and capture output, return rich result dict."""
    try:
        completed = subprocess.run(
            cmd,
            shell=True,
            cwd=cwd,
            capture_output=True,
            text=True,
        )
        return {
            "success": completed.returncode == 0,
            "returncode": completed.returncode,
            "stdout": completed.stdout,
            "stderr": completed.stderr,
        }
    except Exception as e:
        return {
            "success": False,
            "returncode": -1,
            "stdout": "",
            "stderr": f"Exception: {e}",
        }


def http_ping(url: str, timeout: float = 5.0) -> bool:
    try:
        with urlopen(url, timeout=timeout) as resp:
            code = getattr(resp, "status", 200)
            return 200 <= code < 400
    except Exception:
        return False


def check_internet() -> dict:
    urls = {
        "kaggle": "https://www.kaggle.com",
        "hf": "https://huggingface.co",
        "github": "https://github.com",
    }
    res = {name: http_ping(url) for name, url in urls.items()}
    res["any"] = any(res.values())
    print("\n🌐 Internet connectivity check:")
    for k, v in urls.items():
        print(f"   - {k.title():<10}: {'✅' if res[k] else '❌'}")
    if not res["any"]:
        print("   -> No internet access detected. Downloads will fail.")
    return res


def check_kaggle_credentials() -> dict:
    kcdir = os.getenv("KAGGLE_CONFIG_DIR")
    if kcdir:
        path = Path(kcdir) / "kaggle.json"
        exists = path.exists()
        print(f"🔑 Kaggle credentials (KAGGLE_CONFIG_DIR): {'✅' if exists else '❌'} -> {path}")
        return {"path": str(path), "exists": exists, "source": "KAGGLE_CONFIG_DIR"}
    home = Path(os.path.expanduser("~"))
    path = home / ".kaggle" / "kaggle.json"
    exists = path.exists()
    print(f"🔑 Kaggle credentials: {'✅' if exists else '❌'} -> {path}")
    if not exists:
        print("   Hint: Create from https://www.kaggle.com/settings/account and place kaggle.json accordingly.")
    return {"path": str(path), "exists": exists, "source": "default"}


def check_kaggle_cli() -> bool:
    try:
        result = subprocess.run(["kaggle", "--version"], capture_output=True, text=True)
        ok = result.returncode == 0
    except Exception:
        ok = False
    print(f"⚙️  Kaggle CLI: {'✅' if ok else '❌'} (install via: pip install kaggle)")
    return ok


def check_disk_space(path: Path) -> dict:
    usage = shutil.disk_usage(path)
    total_gb = round(usage.total / (1024**3), 1)
    used_gb = round(usage.used / (1024**3), 1)
    free_gb = round(usage.free / (1024**3), 1)
    print("💽 Disk space (datasets volume):")
    print(f"   - Total: {total_gb} GB | Used: {used_gb} GB | Free: {free_gb} GB")
    print("   - Suggested free space for Category D: ~100 GB")
    return {"total_gb": total_gb, "used_gb": used_gb, "free_gb": free_gb}


def preflight() -> dict:
    print("================================ PREFLIGHT ================================")
    net = check_internet()
    creds = check_kaggle_credentials()
    cli = check_kaggle_cli()
    disk = check_disk_space(DATASETS_DIR)
    print("=========================================================================")
    fatal = not net["any"]
    return {"internet": net, "kaggle_credentials": creds, "kaggle_cli": cli, "disk": disk, "fatal": fatal}


def run_category(ps1_path: str, label: str, max_retries: int = 1) -> dict:
    attempts = []
    started = time.time()
    start_at = now_iso()
    for attempt in range(1, max_retries + 2):  # first try + retries
        print(f"→ Running {label} (attempt {attempt})...")
        res = run_ps_command(f"powershell -NoProfile -ExecutionPolicy Bypass -File {ps1_path}")
        attempts.append({
            "attempt": attempt,
            "success": res["success"],
            "returncode": res["returncode"],
            "stdout_tail": res["stdout"].splitlines()[-5:] if res["stdout"] else [],
            "stderr_tail": res["stderr"].splitlines()[-5:] if res["stderr"] else [],
        })
        if res["success"]:
            break
        if attempt <= max_retries:
            print(f"   Retry scheduled for {label} (previous code={res['returncode']})")
            time.sleep(2)
    ended = time.time()
    end_at = now_iso()
    success = any(a["success"] for a in attempts)
    return {
        "label": label,
        "ps1": ps1_path,
        "success": success,
        "attempts": attempts,
        "started_at": start_at,
        "ended_at": end_at,
        "elapsed_seconds": round(ended - started, 2),
    }


def main() -> None:
    print("🚀 Starting NEXUS Platform Enhanced Dataset Download...")

    report = {
        "started_at": now_iso(),
        "system": {
            "platform": platform.platform(),
            "python": sys.version.split(" (", 1)[0],
            "cwd": str(Path.cwd()),
        },
        "preflight": {},
        "categories": [],
        "summary": {},
    }

    # Preflight checks
    pf = preflight()
    report["preflight"] = pf
    if pf.get("fatal"):
        report["finished_at"] = now_iso()
        report["exit_code"] = 2
        with open(REPORT_PATH, "w", encoding="utf-8") as f:
            json.dump(report, f, indent=2)
        print(f"❌ Preflight fatal. Report saved to: {REPORT_PATH}")
        sys.exit(2)

    categories = [
        {"key": "A", "emoji": "📊", "label": "Category A: Psychometrics", "ps1": "scripts/datasets/download_category_A.ps1"},
        {"key": "B", "emoji": "💼", "label": "Category B: CV/Jobs/Skills", "ps1": "scripts/datasets/download_category_B.ps1"},
        {"key": "C", "emoji": "🎓", "label": "Category C: Education/Academic/Content", "ps1": "scripts/datasets/download_category_C.ps1"},
        {"key": "D", "emoji": "🗣️", "label": "Category D: Language/Conversation/General Knowledge", "ps1": "scripts/datasets/download_category_D.ps1"},
    ]

    # Execute categories
    for cat in categories:
        print(f"\n{cat['emoji']} Downloading {cat['label']}...")
        cat_res = run_category(cat["ps1"], cat["label"], max_retries=1)
        cat_res["key"] = cat["key"]
        cat_res["emoji"] = cat["emoji"]
        report["categories"].append(cat_res)

    # Summary
    success_count = sum(1 for r in report["categories"] if r["success"])  
    fail_count = len(report["categories"]) - success_count

    print("\n================================ SUMMARY ================================")
    for r in report["categories"]:
        mark = "✅" if r["success"] else "❌"
        print(f"{mark} {r['key']} - {r['label']} ({r['elapsed_seconds']}s)")

    if fail_count == 0:
        print("\n✅ All categories completed successfully!")
        exit_code = 0
    else:
        print(f"\n⚠️ Some categories failed: {fail_count} failed, {success_count} succeeded.")
        print("   Check logs above and/or run verification for details.")
        exit_code = 1

    # Run verification and capture results for report
    verification = {}
    try:
        print("\n🔍 Running verification...")
        vres = subprocess.run(["python", "verify_datasets.py"], capture_output=True, text=True)
        verification["returncode"] = vres.returncode
        verification["stdout_tail"] = vres.stdout.splitlines()[-50:] if vres.stdout else []
        verification["stderr_tail"] = vres.stderr.splitlines()[-20:] if vres.stderr else []
        vpath = Path("./datasets_verification_report.json")
        if vpath.exists():
            with open(vpath, "r", encoding="utf-8") as f:
                verification["report"] = json.load(f)
        else:
            verification["report"] = None
    except Exception as e:
        verification["error"] = str(e)

    # Finalize report
    report["summary"] = {
        "required_categories": len(report["categories"]),
        "success_count": success_count,
        "fail_count": fail_count,
        "status": "success" if exit_code == 0 else "partial_failure",
    }
    report["finished_at"] = now_iso()
    report["exit_code"] = exit_code

    # Attach verification to report
    report["verification"] = verification

    with open(REPORT_PATH, "w", encoding="utf-8") as f:
        json.dump(report, f, indent=2)

    print("\n📁 Check ./datasets/ directory for downloaded files")
    print("ℹ️ Verification has been executed automatically. See datasets_verification_report.json")
    print(f"🧾 Detailed download report saved to: {REPORT_PATH}")

    sys.exit(exit_code)


if __name__ == "__main__":
    main()
