"""
Seed script for local development.
Creates a SQLite database with mock location data and a test API key.

Usage:
    python seed_mock_data.py

This will create/reset `dev.db` with realistic mock data.
"""

import os
import json
import secrets
import bcrypt
from datetime import datetime, timedelta
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models import Base, Location, APIKey

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------
DB_PATH = "dev.db"
DATABASE_URL = f"sqlite:///{DB_PATH}"
NUM_LOCATIONS = 200         # total location points to generate
TEST_API_KEY = "dev-test-key-manadia-1234567890abcdef"  # fixed key for dev

# ---------------------------------------------------------------------------
# Mock data: route waypoints (lat, lon, label)
# Simulates movement across Kuala Lumpur, Malaysia
# ---------------------------------------------------------------------------
KL_WAYPOINTS = [
    (3.1390, 101.6869, "KLCC / Petronas Towers"),
    (3.1466, 101.6958, "Kampung Baru"),
    (3.1516, 101.7036, "Titiwangsa"),
    (3.1579, 101.7123, "Sentul"),
    (3.1350, 101.6883, "Bukit Bintang"),
    (3.1285, 101.6868, "Raja Chulan"),
    (3.1200, 101.6797, "KL Sentral"),
    (3.1118, 101.6703, "Brickfields"),
    (3.1048, 101.6626, "Mid Valley"),
    (3.0833, 101.6500, "Petaling Jaya"),
    (3.0670, 101.6068, "Subang Jaya"),
    (3.0319, 101.5513, "Shah Alam"),
    (2.9264, 101.6424, "Putrajaya"),
    (2.7456, 101.7072, "KLIA"),
    (3.1570, 101.7116, "Sentul East"),
    (3.1700, 101.6940, "Batu Caves area"),
    (3.1840, 101.7300, "Gombak"),
    (3.1100, 101.7200, "Cheras"),
    (3.0800, 101.7500, "Kajang"),
    (3.0500, 101.7100, "Serdang"),
]

# Secondary set: Tokyo waypoints for a second device
TOKYO_WAYPOINTS = [
    (35.6762, 139.6503, "Shinjuku"),
    (35.6812, 139.7671, "Tokyo Station"),
    (35.6595, 139.7004, "Shibuya"),
    (35.7148, 139.7967, "Ueno"),
    (35.6586, 139.7454, "Roppongi"),
    (35.6938, 139.7034, "Ikebukuro"),
    (35.6684, 139.6009, "Kichijoji"),
    (35.6329, 139.8804, "Tokyo Disney"),
    (35.7101, 139.8107, "Asakusa"),
    (35.6852, 139.7528, "Akihabara"),
]


def interpolate(p1, p2, t):
    """Linearly interpolate between two (lat, lon) points."""
    return (
        p1[0] + (p2[0] - p1[0]) * t,
        p1[1] + (p2[1] - p1[1]) * t,
    )


def generate_route(waypoints, num_points, start_time, device_id, user_id, tracker_id):
    """Generate a list of Location dicts simulating movement along waypoints."""
    locations = []
    segments = len(waypoints) - 1
    points_per_segment = max(num_points // segments, 1)

    current_time = start_time
    battery = 100

    for seg in range(segments):
        for i in range(points_per_segment):
            if len(locations) >= num_points:
                break
            t = i / points_per_segment
            lat, lon = interpolate(waypoints[seg], waypoints[seg + 1], t)

            # Add small random jitter (deterministic based on index for reproducibility)
            jitter_lat = ((len(locations) * 7 + 3) % 100 - 50) * 0.00001
            jitter_lon = ((len(locations) * 13 + 7) % 100 - 50) * 0.00001

            battery = max(5, battery - (1 if len(locations) % 10 == 0 else 0))
            accuracy = 10.0 + (len(locations) % 5) * 2.0
            altitude = 40.0 + (len(locations) % 20)

            locations.append({
                "latitude": round(lat + jitter_lat, 6),
                "longitude": round(lon + jitter_lon, 6),
                "altitude": altitude,
                "accuracy": accuracy,
                "timestamp": current_time,
                "device_id": device_id,
                "tracker_id": tracker_id,
                "battery": battery,
                "connection": "w" if len(locations) % 3 == 0 else "m",
                "user_id": user_id,
                "server_received_at": current_time + timedelta(seconds=2),
                "raw_data": json.dumps({
                    "_type": "location",
                    "lat": round(lat + jitter_lat, 6),
                    "lon": round(lon + jitter_lon, 6),
                    "tst": int(current_time.timestamp()),
                    "acc": accuracy,
                    "alt": altitude,
                    "batt": battery,
                    "conn": "w" if len(locations) % 3 == 0 else "m",
                    "tid": tracker_id,
                }),
            })

            current_time += timedelta(minutes=5)

    return locations[:num_points]


def seed_database():
    """Create tables and insert mock data."""

    # Remove old dev database if it exists
    if os.path.exists(DB_PATH):
        os.remove(DB_PATH)
        print(f"  Removed existing {DB_PATH}")

    engine = create_engine(DATABASE_URL, echo=False, connect_args={"check_same_thread": False})
    Base.metadata.create_all(bind=engine)
    Session = sessionmaker(bind=engine)
    db = Session()

    # ------------------------------------------------------------------
    # 1. Seed Locations
    # ------------------------------------------------------------------
    print("\n--- Seeding Location Data ---")

    # Device 1: KL route (today and yesterday)
    base_time_today = datetime(2026, 2, 15, 8, 0, 0)
    base_time_yesterday = datetime(2026, 2, 14, 9, 0, 0)

    kl_today = generate_route(
        [(w[0], w[1]) for w in KL_WAYPOINTS],
        num_points=80,
        start_time=base_time_today,
        device_id="pixel-8",
        user_id="dania",
        tracker_id="DA",
    )

    kl_yesterday = generate_route(
        [(w[0], w[1]) for w in KL_WAYPOINTS[:10]],
        num_points=50,
        start_time=base_time_yesterday,
        device_id="pixel-8",
        user_id="dania",
        tracker_id="DA",
    )

    # Device 2: Tokyo route (today)
    tokyo_today = generate_route(
        [(w[0], w[1]) for w in TOKYO_WAYPOINTS],
        num_points=40,
        start_time=datetime(2026, 2, 15, 10, 0, 0),
        device_id="iphone-15",
        user_id="taro",
        tracker_id="TR",
    )

    # Device 3: Stationary device (KL, only a few pings)
    stationary = generate_route(
        [(3.1390, 101.6869), (3.1392, 101.6871)],
        num_points=30,
        start_time=datetime(2026, 2, 15, 0, 0, 0),
        device_id="tablet-home",
        user_id="dania",
        tracker_id="HM",
    )

    all_locations = kl_today + kl_yesterday + tokyo_today + stationary
    print(f"  Generating {len(all_locations)} location records...")

    for loc_data in all_locations:
        loc = Location(**loc_data)
        db.add(loc)

    db.commit()
    print(f"  ✓ Inserted {len(all_locations)} locations")

    # ------------------------------------------------------------------
    # 2. Seed API Keys
    # ------------------------------------------------------------------
    print("\n--- Seeding API Keys ---")

    # Fixed dev key (so it's predictable for local testing)
    key_hash = bcrypt.hashpw(TEST_API_KEY.encode(), bcrypt.gensalt(rounds=4)).decode()
    dev_key = APIKey(
        key_prefix=TEST_API_KEY[:8],
        key_hash=key_hash,
        user_name="dev-admin",
        description="Local development API key",
        created_at=datetime(2026, 1, 1),
        expires_at=datetime(2027, 1, 1),
        is_active=1,
    )
    db.add(dev_key)

    # An expired key (for testing expiry logic)
    expired_hash = bcrypt.hashpw(b"expired-key-do-not-use-123456789", bcrypt.gensalt(rounds=4)).decode()
    expired_key = APIKey(
        key_prefix="expired-",
        key_hash=expired_hash,
        user_name="old-user",
        description="Expired test key",
        created_at=datetime(2024, 1, 1),
        expires_at=datetime(2025, 1, 1),
        is_active=1,
    )
    db.add(expired_key)

    # A revoked key (for testing revocation)
    revoked_hash = bcrypt.hashpw(b"revoked-key-do-not-use-123456789", bcrypt.gensalt(rounds=4)).decode()
    revoked_key = APIKey(
        key_prefix="revoked-",
        key_hash=revoked_hash,
        user_name="revoked-user",
        description="Revoked test key",
        created_at=datetime(2025, 6, 1),
        expires_at=datetime(2027, 1, 1),
        is_active=0,
    )
    db.add(revoked_key)

    db.commit()
    print("  ✓ Inserted 3 API keys:")
    print(f"    • dev-admin   (active)   key = {TEST_API_KEY}")
    print(f"    • old-user    (expired)  key = expired-key-do-not-use-123456789")
    print(f"    • revoked-user(revoked)  key = revoked-key-do-not-use-123456789")

    # ------------------------------------------------------------------
    # Summary
    # ------------------------------------------------------------------
    loc_count = db.query(Location).count()
    key_count = db.query(APIKey).count()
    db.close()

    print(f"\n{'='*50}")
    print(f"  Mock database ready: {DB_PATH}")
    print(f"  Locations : {loc_count}")
    print(f"  API Keys  : {key_count}")
    print(f"{'='*50}")
    print(f"\nTo start the backend with this database:")
    print(f'  $env:DATABASE_URL="sqlite:///dev.db"')
    print(f'  uvicorn main:app --host 0.0.0.0 --port 8000 --reload')
    print(f"\nTest API key for X-Api-Key header:")
    print(f"  {TEST_API_KEY}")
    print()


if __name__ == "__main__":
    seed_database()
