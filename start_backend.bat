@echo off
set PYTHONIOENCODING=utf-8
uvicorn backend.main:app --host 0.0.0.0 --port 8000 --reload
