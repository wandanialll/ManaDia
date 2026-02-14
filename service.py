from sqlalchemy.orm import Session
from datetime import datetime, date
import hashlib
from repository import LocationRepository, APIKeyRepository


class LocationService:
    """Business logic for location handling"""

    def __init__(self, db: Session):
        self.location_repo = LocationRepository(db)
        self.db = db

    def ingest_location(self, data: dict):
        """Process incoming OwnTracks location data"""
        # Extract OwnTracks fields
        tst = data.get("tst")
        if tst:
            timestamp = datetime.fromtimestamp(tst)
        else:
            timestamp = datetime.utcnow()

        location = self.location_repo.create(
            latitude=data.get("lat"),
            longitude=data.get("lon"),
            timestamp=timestamp,
            altitude=data.get("alt"),
            accuracy=data.get("acc"),
            device_id=data.get("devid", data.get("deviceId")),
            tracker_id=data.get("tid"),
            battery=data.get("batt"),
            connection=data.get("conn"),
            user_id=data.get("user"),
            **data  # Store all extra fields
        )
        return location

    def get_history(self, limit: int = None, offset: int = 0):
        """Get location history with pagination"""
        locations = self.location_repo.get_all(limit=limit, offset=offset)
        total = self.location_repo.count()
        return {"total": total, "data": locations}

    def get_history_by_date(self, target_date: date):
        """Get locations for a specific date"""
        locations = self.location_repo.get_by_date(target_date)
        return {"date": target_date.isoformat(), "count": len(locations), "data": locations}

    def get_device_history(self, device_id: str):
        """Get all locations for a device"""
        locations = self.location_repo.get_by_device(device_id)
        return {"device_id": device_id, "count": len(locations), "data": locations}


class APIKeyService:
    """Business logic for API key management"""

    def __init__(self, db: Session):
        self.api_key_repo = APIKeyRepository(db)
        self.db = db

    def generate_api_key(self, user_name: str, description: str = None) -> dict:
        """Generate a new API key for a user"""
        # Create a unique key based on username and timestamp
        key_source = f"{user_name}{datetime.utcnow().isoformat()}"
        api_key = hashlib.sha256(key_source.encode()).hexdigest()
        
        created_key = self.api_key_repo.create(
            key=api_key,
            user_name=user_name,
            description=description
        )
        
        return {
            "api_key": api_key,
            "user": user_name,
            "created_at": created_key.created_at.isoformat()
        }

    def verify_api_key(self, api_key: str) -> bool:
        """Verify if an API key is valid"""
        key_record = self.api_key_repo.get_by_key(api_key)
        if key_record:
            self.api_key_repo.update_last_used(api_key)
            return True
        return False

    def get_api_key_info(self, api_key: str) -> dict:
        """Get info about an API key"""
        key_record = self.api_key_repo.get_by_key(api_key)
        if key_record:
            return {
                "user": key_record.user_name,
                "created_at": key_record.created_at.isoformat(),
                "last_used": key_record.last_used.isoformat() if key_record.last_used else None
            }
        return None

    def revoke_api_key(self, api_key: str) -> bool:
        """Revoke an API key"""
        return self.api_key_repo.revoke(api_key)
