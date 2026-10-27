"""
RAG and Grounding Service for Ghost in the Campus
Retrieves relevant campus data and constructs bounded prompts to prevent hallucination.
"""

import json
import os
import re
from typing import Dict, Any, List, Tuple

KB_PATH = os.path.join(os.path.dirname(__file__), "knowledge_base.json")

class KnowledgeBaseService:
    def __init__(self, kb_path: str = KB_PATH):
        self.kb_path = kb_path
        self.data: Dict[str, Any] = {}
        self.load()

    def load(self):
        with open(self.kb_path, "r", encoding="utf-8") as f:
            self.data = json.load(f)

    def get_metadata(self) -> Dict[str, Any]:
        return self.data.get("_metadata", {})

    def get_all_buildings(self) -> List[Dict[str, Any]]:
        return self.data.get("buildings", [])

    def get_all_rooms(self) -> List[Dict[str, Any]]:
        return self.data.get("rooms", [])

    def get_all_departments(self) -> List[Dict[str, Any]]:
        return self.data.get("departments", [])

    def get_all_timetables(self) -> List[Dict[str, Any]]:
        return self.data.get("timetables", [])

    def get_all_rules(self) -> List[Dict[str, Any]]:
        return self.data.get("campus_rules", [])

    def get_all_amenities(self) -> List[Dict[str, Any]]:
        return self.data.get("amenities", [])

    def get_all_faqs(self) -> List[Dict[str, Any]]:
        return self.data.get("faqs", [])

    def search(self, query: str) -> List[Dict[str, Any]]:
        """
        Heuristic multi-field semantic relevance matching across all knowledge categories.
        """
        clean_q = query.lower()
        tokens = set(re.findall(r"\w+", clean_q))
        results = []

        # 1. Search FAQs
        for faq in self.get_all_faqs():
            score = 0
            q_text = faq["question"].lower()
            a_text = faq["answer"].lower()
            for t in tokens:
                if len(t) > 2:
                    if t in q_text:
                        score += 3
                    if t in a_text:
                        score += 1.5
            if score > 0:
                results.append({
                    "category": "FAQ",
                    "title": faq["question"],
                    "content": faq["answer"],
                    "score": score,
                    "metadata": faq
                })

        # 2. Search Rooms
        for room in self.get_all_rooms():
            score = 0
            code = room["code"].lower()
            name = room["name"].lower()
            bldg = room["building_name"].lower()
            floor = room["floor"].lower()
            rtype = room["type"].lower()
            features = " ".join(room.get("features", [])).lower()

            if clean_q in code or code in clean_q:
                score += 8
            for t in tokens:
                if len(t) > 2:
                    if t in code: score += 5
                    if t in name: score += 3
                    if t in bldg: score += 2
                    if t in floor: score += 2
                    if t in rtype: score += 2
                    if t in features: score += 1
            if score > 0:
                results.append({
                    "category": "Room / Lab",
                    "title": f"{room['code']}: {room['name']}",
                    "content": f"Location: {room['building_name']}, {room['floor']}. Type: {room['type']}. Capacity: {room['capacity']}. Features: {', '.join(room.get('features', []))}. Accessibility: {room.get('accessibility', 'Standard')}.",
                    "score": score,
                    "metadata": room
                })

        # 3. Search Buildings
        for bldg in self.get_all_buildings():
            score = 0
            code = bldg["code"].lower()
            name = bldg["name"].lower()
            desc = bldg["description"].lower()
            if code in tokens:
                score += 6
            for t in tokens:
                if len(t) > 2:
                    if t in name: score += 3
                    if t in desc: score += 1.5
            if score > 0:
                results.append({
                    "category": "Building",
                    "title": f"{bldg['code']} - {bldg['name']}",
                    "content": f"{bldg['name']} ({bldg['code']}): {bldg['description']} Floors: {bldg['floors']}. Amenities: {', '.join(bldg.get('amenities', []))}.",
                    "score": score,
                    "metadata": bldg
                })

        # 4. Search Departments
        for dept in self.get_all_departments():
            score = 0
            name = dept["name"].lower()
            head = dept["head"].lower()
            office = dept["office"].lower()
            desc = dept["description"].lower()
            for t in tokens:
                if len(t) > 2:
                    if t in name: score += 4
                    if t in head: score += 3
                    if t in office: score += 2
                    if t in desc: score += 1.5
            if score > 0:
                results.append({
                    "category": "Department",
                    "title": dept["name"],
                    "content": f"Head: {dept['head']}. Office: {dept['office']}. Programs: {', '.join(dept.get('programs', []))}. Contact: {dept.get('email', '')}.",
                    "score": score,
                    "metadata": dept
                })

        # 5. Search Timetables / Classes
        for tt in self.get_all_timetables():
            score = 0
            code = tt["course_code"].lower()
            title = tt["course_title"].lower()
            instructor = tt["instructor"].lower()
            days = " ".join(tt["days"]).lower()
            room = tt["room"].lower()

            if clean_q in code or code in clean_q:
                score += 8
            for t in tokens:
                if len(t) > 2:
                    if t in code: score += 5
                    if t in title: score += 3
                    if t in instructor: score += 2.5
                    if t in days: score += 2
                    if t in room: score += 2
            if score > 0:
                results.append({
                    "category": "Timetable",
                    "title": f"{tt['course_code']} - {tt['course_title']}",
                    "content": f"Instructor: {tt['instructor']}. Room: {tt['room']} ({tt['building']}). Days: {', '.join(tt['days'])} at {tt['time_slot']}. Batch: {tt['batch']}.",
                    "score": score,
                    "metadata": tt
                })

        # 6. Search Rules & Policies
        for rule in self.get_all_rules():
            score = 0
            title = rule["rule_title"].lower()
            cat = rule["category"].lower()
            summary = rule["summary"].lower()
            details = rule["details"].lower()
            for t in tokens:
                if len(t) > 2:
                    if t in title: score += 4
                    if t in cat: score += 3
                    if t in summary: score += 2
                    if t in details: score += 1.5
            if score > 0:
                results.append({
                    "category": "Campus Rule",
                    "title": rule["rule_title"],
                    "content": f"Category: {rule['category']}. Summary: {rule['summary']} Full details: {rule['details']}",
                    "score": score,
                    "metadata": rule
                })

        # 7. Search Amenities / Dining
        for item in self.get_all_amenities():
            score = 0
            name = item["name"].lower()
            loc = item["location"].lower()
            hours = item.get("hours", "").lower()
            spec = item.get("specialty", "").lower()
            for t in tokens:
                if len(t) > 2:
                    if t in name: score += 4
                    if t in loc: score += 2.5
                    if t in spec: score += 2
                    if t in hours: score += 1.5
            if score > 0:
                results.append({
                    "category": "Amenity / Service",
                    "title": item["name"],
                    "content": f"Location: {item['location']}. Hours: {item.get('hours', 'N/A')}. Details: {item.get('specialty', '')}. Payment/Terms: {item.get('payment', '')}",
                    "score": score,
                    "metadata": item
                })

        # Sort by score descending
        results.sort(key=lambda x: x["score"], reverse=True)
        return results[:6]

    def build_grounded_prompt(self, user_query: str, history: List[Dict[str, str]] = None) -> Tuple[str, List[Dict[str, Any]]]:
        """
        Builds a strict grounding prompt incorporating retrieved context.
        """
        hits = self.search(user_query)

        if hits:
            context_text = "\n\n".join([
                f"[{hit['category']}] {hit['title']}\n{hit['content']}"
                for hit in hits
            ])
        else:
            context_text = "No direct matches found in campus records."

        system_instruction = (
            "You are Casperion (Ghost in the Campus), the friendly, helpful spectral AI campus mascot for Specter University.\n"
            "STRICT GROUNDING & ACCURACY RULES:\n"
            "1. You must answer using ONLY the Verified Campus Knowledge provided below.\n"
            "2. NEVER invent, assume, or hallucinate room numbers, building names, professor names, timetables, or rules.\n"
            "3. If the answer cannot be determined from the Verified Campus Knowledge, clearly state:\n"
            "   'I could not find that specific record in the Specter University demo database. Please check at the Campus Security Post A at the Main Gate or visit the Registrar Office in ADM-101.'\n"
            "4. Clearly mention building codes and room identifiers (e.g. ST-101, TAI-102, LIB-201) when answering.\n"
            "5. Maintain a friendly, warm spectral mascot persona (subtle cheerful ghostly charm, but always concise, crisp, and helpful).\n"
            "6. Remember that this information is demonstration data for the project showcase.\n\n"
            "--- VERIFIED CAMPUS KNOWLEDGE ---\n"
            f"{context_text}\n"
            "--- END OF VERIFIED KNOWLEDGE ---"
        )

        return system_instruction, hits

kb_service = KnowledgeBaseService()
