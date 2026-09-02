import logging
from supabase import create_client, Client
from app.config import get_settings

logger = logging.getLogger(__name__)

# Module-level singleton
_supabase: Client | None = None

def get_supabase() -> Client:
    """
    Returns the initialized Supabase client.
    Initializes it on the first call.
    """
    global _supabase
    if _supabase is None:
        settings = get_settings()
        url = settings.supabase_url
        key = settings.supabase_key
        
        if not url or not key:
            raise ValueError("SUPABASE_URL and SUPABASE_KEY must be set in the environment.")
            
        logger.info(f"Initializing Supabase client against: {url}")
        _supabase = create_client(url, key)
        
    return _supabase

def save_analyzed_event(description: str, parsed_event: dict, ripple_chain: dict, kairos_score: float) -> dict | None:
    """
    Saves an analyzed event to the analyzed_events table.
    """
    try:
        supabase = get_supabase()
        result = supabase.table("analyzed_events").insert({
            "description": description,
            "parsed_event_json": parsed_event,
            "ripple_chain_json": ripple_chain,
            "kairos_score": kairos_score
        }).execute()
        return result.data[0] if result.data else None
    except Exception as e:
        logger.error(f"Failed to save analyzed event: {e}")
        return None
