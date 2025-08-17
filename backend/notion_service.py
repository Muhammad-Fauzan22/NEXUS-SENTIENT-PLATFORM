from __future__ import annotations
from typing import List, Optional, Dict, Any
from notion_client import Client
from .config import settings

class NotionService:
    def __init__(self) -> None:
        if not settings.NOTION_TOKEN:
            raise RuntimeError("NOTION_TOKEN not set.")
        self.client = Client(auth=settings.NOTION_TOKEN)
        self.db_projects = settings.NOTION_DB_PROJECTS_ID
        self.db_docs = settings.NOTION_DB_DOCS_ID
        if not self.db_projects or not self.db_docs:
            # Not all features require both, but for simplicity we expect both
            pass

    def find_open_projects(self) -> List[Dict[str, Any]]:
        if not self.db_projects:
            return []
        query = {
            "database_id": self.db_projects,
            "filter": {
                "property": "Status",
                "select": {"equals": "Open"}
            }
        }
        res = self.client.databases.query(**query)
        items = []
        for page in res.get("results", []):
            props = page.get("properties", {})
            name = props.get("Name", {}).get("title", [])
            title = "".join([t.get("plain_text", "") for t in name]) if name else ""
            status = props.get("Status", {}).get("select", {}).get("name", "")
            division = [x.get("name") for x in props.get("Divisi", {}).get("multi_select", [])]
            desc = props.get("Deskripsi", {}).get("rich_text", [])
            description = "".join([t.get("plain_text", "") for t in desc]) if desc else None
            apply_url = props.get("Link Pendaftaran", {}).get("url")
            items.append({
                "id": page.get("id"),
                "name": title,
                "status": status,
                "division": division,
                "description": description,
                "apply_url": apply_url,
            })
        return items

    def _get_block_text_recursive(self, block_id: str) -> str:
        texts: List[str] = []
        cursor = None
        while True:
            res = self.client.blocks.children.list(block_id=block_id, start_cursor=cursor)
            for blk in res.get("results", []):
                t = blk.get("type")
                rich = blk.get(t, {}).get("rich_text", [])
                if rich:
                    texts.append("".join([r.get("plain_text", "") for r in rich]))
                # recurse if has children
                if blk.get("has_children"):
                    texts.append(self._get_block_text_recursive(blk.get("id")))
            if not res.get("has_more"):
                break
            cursor = res.get("next_cursor")
        return "\n".join([x for x in texts if x])

    def get_document(self, doc_name: str) -> Optional[str]:
        if not self.db_docs:
            return None
        query = {
            "database_id": self.db_docs,
            "filter": {
                "property": "Name",
                "title": {"equals": doc_name}
            }
        }
        res = self.client.databases.query(**query)
        results = res.get("results", [])
        if not results:
            return None
        page = results[0]
        page_id = page.get("id")
        content = self._get_block_text_recursive(page_id)
        return content

    def get_document_by_id(self, page_id: str) -> Optional[str]:
        if not page_id:
            return None
        return self._get_block_text_recursive(page_id)

    def list_documents(self, category: Optional[str] = None, page_size: int = 100, include_content: bool = True) -> List[Dict[str, Any]]:
        if not self.db_docs:
            return []
        payload: Dict[str, Any] = {
            "database_id": self.db_docs,
            "page_size": page_size,
        }
        if category:
            payload["filter"] = {
                "property": "Kategori",
                "select": {"equals": category}
            }
        docs: List[Dict[str, Any]] = []
        cursor = None
        while True:
            if cursor:
                payload["start_cursor"] = cursor
            res = self.client.databases.query(**payload)
            for page in res.get("results", []):
                props = page.get("properties", {})
                name = props.get("Name", {}).get("title", [])
                title = "".join([t.get("plain_text", "") for t in name]) if name else "Untitled"
                page_id = page.get("id")
                last_edited_time = page.get("last_edited_time")
                item: Dict[str, Any] = {
                    "id": page_id,
                    "title": title,
                    "last_edited_time": last_edited_time,
                }
                if include_content:
                    item["content"] = self._get_block_text_recursive(page_id)
                docs.append(item)
            if not res.get("has_more"):
                break
            cursor = res.get("next_cursor")
        return docs
