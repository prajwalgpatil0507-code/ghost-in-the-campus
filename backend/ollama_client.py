"""
Ollama Client for Ghost in the Campus
Connects to local Ollama API using model gemma4:e2b
"""

import logging
from typing import List, Dict, Any, AsyncGenerator, Optional
import httpx

logger = logging.getLogger("ghost_campus.ollama")

OLLAMA_BASE_URL = "http://localhost:11434"
DEFAULT_MODEL = "gemma4:e2b"

class OllamaClient:
    def __init__(self, base_url: str = OLLAMA_BASE_URL, model: str = DEFAULT_MODEL):
        self.base_url = base_url.rstrip("/")
        self.model = model

    async def check_health(self) -> Dict[str, Any]:
        """
        Checks if Ollama server is running and whether target model exists.
        """
        try:
            async with httpx.AsyncClient(timeout=3.0) as client:
                res = await client.get(f"{self.base_url}/api/tags")
                if res.status_code == 200:
                    data = res.json()
                    models = [m.get("name") for m in data.get("models", [])]
                    has_model = any(self.model in m for m in models)
                    return {
                        "status": "online",
                        "model": self.model,
                        "model_available": has_model,
                        "available_models": models,
                        "endpoint": f"{self.base_url}/api/chat"
                    }
                return {
                    "status": "error",
                    "status_code": res.status_code,
                    "model": self.model,
                    "model_available": False
                }
        except Exception as e:
            logger.warning(f"Ollama health check failed: {e}")
            return {
                "status": "offline",
                "error": str(e),
                "model": self.model,
                "model_available": False,
                "endpoint": f"{self.base_url}/api/chat"
            }

    async def chat(
        self,
        system_instruction: str,
        messages: List[Dict[str, str]],
        temperature: float = 0.2
    ) -> Dict[str, Any]:
        """
        Sends a grounded chat query to Ollama API.
        """
        formatted_messages = [{"role": "system", "content": system_instruction}]
        for msg in messages:
            formatted_messages.append({
                "role": msg.get("role", "user"),
                "content": msg.get("content", "")
            })

        payload = {
            "model": self.model,
            "messages": formatted_messages,
            "stream": False,
            "options": {
                "temperature": temperature,
                "top_p": 0.9
            }
        }

        try:
            async with httpx.AsyncClient(timeout=90.0) as client:
                response = await client.post(
                    f"{self.base_url}/api/chat",
                    json=payload
                )
                if response.status_code == 200:
                    data = response.json()
                    content = data.get("message", {}).get("content", "")
                    return {
                        "success": True,
                        "content": content,
                        "model": self.model,
                        "mode": "ollama-live",
                        "done": data.get("done", True),
                        "total_duration": data.get("total_duration")
                    }
                else:
                    logger.error(f"Ollama returned status {response.status_code}: {response.text}")
                    return {
                        "success": False,
                        "error": f"Ollama HTTP {response.status_code}: {response.text}",
                        "mode": "fallback"
                    }
        except httpx.ConnectError:
            logger.error("Cannot connect to Ollama at %s", self.base_url)
            return {
                "success": False,
                "error": f"Cannot connect to Ollama on {self.base_url}. Please ensure Ollama is running.",
                "mode": "offline"
            }
        except httpx.TimeoutException:
            logger.error("Ollama request timed out")
            return {
                "success": False,
                "error": "Ollama request timed out after 90 seconds.",
                "mode": "timeout"
            }
        except Exception as e:
            logger.exception("Unexpected error communicating with Ollama")
            return {
                "success": False,
                "error": str(e),
                "mode": "error"
            }

    async def chat_stream(
        self,
        system_instruction: str,
        messages: List[Dict[str, str]],
        temperature: float = 0.2
    ) -> AsyncGenerator[str, None]:
        """
        Streams response chunks from Ollama.
        """
        formatted_messages = [{"role": "system", "content": system_instruction}]
        for msg in messages:
            formatted_messages.append({
                "role": msg.get("role", "user"),
                "content": msg.get("content", "")
            })

        payload = {
            "model": self.model,
            "messages": formatted_messages,
            "stream": True,
            "options": {
                "temperature": temperature,
                "top_p": 0.9
            }
        }

        async with httpx.AsyncClient(timeout=120.0) as client:
            async with client.stream("POST", f"{self.base_url}/api/chat", json=payload) as response:
                if response.status_code != 200:
                    yield f"Error: Ollama returned status {response.status_code}"
                    return
                async for line in response.aiter_lines():
                    if line.strip():
                        try:
                            import json
                            data = json.loads(line)
                            content = data.get("message", {}).get("content", "")
                            if content:
                                yield content
                        except Exception:
                            continue

ollama_client = OllamaClient()
