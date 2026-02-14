from sqlalchemy import Column, String, Float, Integer, DateTime, Text, Index
from sqlalchemy.ext.declarative import declarative_base
from datetime import datetime

Base = declarative_base()


class Location(Base):
    """Location tracking data from OwnTracks"""
    __tablename__ = "locations"

    id = Column(Integer, primary_key=True, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    altitude = Column(Float, nullable=True)
    accuracy = Column(Float, nullable=True)
    timestamp = Column(DateTime, nullable=False, index=True)  # OwnTracks timestamp
    device_id = Column(String(255), nullable=True, index=True)
    tracker_id = Column(String(10), nullable=True)
    battery = Column(Integer, nullable=True)
    connection = Column(String(50), nullable=True)
    user_id = Column(String(255), nullable=True, index=True)
    
    # Server-side timestamp
    server_received_at = Column(DateTime, nullable=False, default=datetime.utcnow, index=True)
    
    # Raw data (for storing extra fields from OwnTracks)
    raw_data = Column(Text, nullable=True)

    __table_args__ = (
        Index("idx_timestamp_device", "timestamp", "device_id"),
        Index("idx_server_received_at", "server_received_at"),
    )


class APIKey(Base):
    """API keys for accessing endpoints"""
    __tablename__ = "api_keys"

    id = Column(Integer, primary_key=True, index=True)
    key = Column(String(255), unique=True, nullable=False, index=True)
    user_name = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    created_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    last_used = Column(DateTime, nullable=True)
    is_active = Column(Integer, default=1)  # 1 = active, 0 = revoked

    __table_args__ = (
        Index("idx_key_active", "key", "is_active"),
    )
