import json
from backend.ai.gemini_client import ask_gemini


def extract_product_filters(user_message: str) -> dict:
    """
    Extract shopping filters from a user's natural language query.
    """

    prompt = f"""
You are an AI shopping assistant.

Extract the shopping information from the user's message.

Return ONLY valid JSON.

JSON format:

{{
    "category": "",
    "brand": "",
    "color": "",
    "gender": "",
    "min_price": null,
    "max_price": null,
    "keywords": ""
}}

Rules:
- If a value is not mentioned, use an empty string.
- Use null for prices if not provided.
- Do not explain anything.
- Return JSON only.

User Message:
{user_message}
"""

    response = ask_gemini(prompt)

    try:
        return json.loads(response)

    except Exception:

        return {
            "category": "",
            "brand": "",
            "color": "",
            "gender": "",
            "min_price": None,
            "max_price": None,
            "keywords": user_message
        }