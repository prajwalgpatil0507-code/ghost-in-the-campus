"""
Automated Unit and Integration Tests for Ghost in the Campus Backend
"""

import sys
import os
import unittest
import asyncio

# Ensure UTF-8 output on Windows console
if sys.platform == "win32":
    import io
    sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8", errors="replace")

# Ensure backend directory is in path
sys.path.insert(0, os.path.dirname(__file__))

from rag_service import kb_service
from ollama_client import ollama_client

class TestGhostCampusBackend(unittest.TestCase):
    def test_knowledge_base_loaded(self):
        meta = kb_service.get_metadata()
        self.assertTrue(meta.get("is_demo_data"), "Dataset should be flagged as demo data")
        self.assertIn("Specter", meta.get("campus_name"))

        buildings = kb_service.get_all_buildings()
        self.assertGreaterEqual(len(buildings), 5, "Should have at least 5 campus buildings")

        rooms = kb_service.get_all_rooms()
        self.assertGreaterEqual(len(rooms), 6, "Should have at least 6 rooms/labs")

        rules = kb_service.get_all_rules()
        self.assertGreaterEqual(len(rules), 4, "Should have campus rules")

        timetables = kb_service.get_all_timetables()
        self.assertGreaterEqual(len(timetables), 4, "Should have timetables")

    def test_search_turing_lab(self):
        hits = kb_service.search("Where is Turing Lab?")
        self.assertTrue(any("TAI-102" in h["content"] or "Turing" in h["title"] for h in hits),
                        "Search should retrieve Turing lab for 'Turing Lab'")

    def test_search_attendance_rule(self):
        hits = kb_service.search("What is the mandatory attendance percentage?")
        self.assertTrue(any("75%" in h["content"] for h in hits),
                        "Search should retrieve 75% attendance policy")

    def test_grounded_prompt_construction(self):
        prompt, hits = kb_service.build_grounded_prompt("Where is ST-101?")
        self.assertIn("Ada Lovelace", prompt)
        self.assertIn("VERIFIED CAMPUS KNOWLEDGE", prompt)
        self.assertIn("NEVER invent", prompt)

    def test_unknown_location_grounding(self):
        prompt, hits = kb_service.build_grounded_prompt("Where is the Secret Underground Flying Saucer Room 9999?")
        # Should not invent anything, prompt should carry strict guardrails
        self.assertIn("STRICT GROUNDING", prompt)

class TestAsyncOllamaIntegration(unittest.IsolatedAsyncioTestCase):
    async def test_ollama_health(self):
        health = await ollama_client.check_health()
        print("\nOllama Health check result:", health)
        self.assertIn(health["status"], ["online", "offline"])
        if health["status"] == "online":
            self.assertTrue(health["model_available"], "Model gemma4:e2b should be available on Ollama")

    async def test_ollama_grounded_chat(self):
        health = await ollama_client.check_health()
        if health["status"] != "online" or not health["model_available"]:
            self.skipTest("Ollama is not online or model is not ready")

        prompt, hits = kb_service.build_grounded_prompt("What is room ST-101 used for?")
        res = await ollama_client.chat(
            system_instruction=prompt,
            messages=[{"role": "user", "content": "What is room ST-101 used for?"}],
            temperature=0.1
        )
        print("\nOllama Chat Response:", res)
        self.assertTrue(res["success"])
        self.assertTrue(len(res["content"]) > 10)

if __name__ == "__main__":
    unittest.main()
