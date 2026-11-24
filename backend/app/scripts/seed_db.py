import asyncio
import uuid
import os
import sys

# Ensure backend root is on sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "..")))

from app.core.database import AsyncSessionLocal, engine, Base
from app.core.security import get_password_hash
from app.models.user import User, UserRole
from app.models.project import Project
from app.models.signal import Signal, EventSlice
from app.models.analysis import AnalysisRun, TDAResult, BOCDRecord
from sqlalchemy import select

async def seed():
    print("Initializing Database tables...")
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
        
    async with AsyncSessionLocal() as session:
        # Check if already seeded
        result = await session.execute(select(User).where(User.email == "engineer@echosense.io"))
        if result.scalars().first():
            print("Database already seeded with default records.")
            return
            
        print("Creating default users...")
        admin = User(
            id=str(uuid.uuid4()),
            email="admin@echosense.io",
            hashed_password=get_password_hash("EchoSenseAdmin2026!"),
            full_name="EchoSense Lead Administrator",
            role=UserRole.ADMIN.value,
            is_active=True
        )
        engineer = User(
            id=str(uuid.uuid4()),
            email="engineer@echosense.io",
            hashed_password=get_password_hash("EchoSense2026!"),
            full_name="Structural Field Operations Lead",
            role=UserRole.ENGINEER.value,
            is_active=True
        )
        session.add_all([admin, engineer])
        await session.flush()
        
        print("Creating sample prestressed girder project...")
        project = Project(
            id=str(uuid.uuid4()),
            name="Prestressed Bridge Girder G1 Fatigue Monitoring",
            description="10-meter prestressed concrete girder subjected to cyclic four-point bending and acoustic emission monitoring.",
            specimen_type="Prestressed Concrete Girder G1",
            status="ACTIVE",
            owner_id=engineer.id
        )
        session.add(project)
        await session.flush()
        
        print("Creating benchmark signal records...")
        sig1 = Signal(
            id=str(uuid.uuid4()),
            project_id=project.id,
            filename="AE_GIRDER_G1_EXP4_10MHZ.wav",
            file_path="storage/uploads/AE_GIRDER_G1_EXP4_10MHZ.wav",
            sample_rate=10000000,
            duration_sec=10.0,
            num_samples=100000000,
            channels=1,
            peak_amplitude_v=1.18,
            rms_energy=0.038,
            status="ANALYZED",
            metadata_json='{"sensor": "Physical Acoustics PAC Nano-30", "specimen": "G1-Midspan"}'
        )
        sig2 = Signal(
            id=str(uuid.uuid4()),
            project_id=project.id,
            filename="SMARTPHONE_MEMS_CONCRETE_CRACK.wav",
            file_path="storage/uploads/SMARTPHONE_MEMS_CONCRETE_CRACK.wav",
            sample_rate=48000,
            duration_sec=30.0,
            num_samples=1440000,
            channels=1,
            peak_amplitude_v=0.42,
            rms_energy=0.012,
            status="ANALYZED",
            metadata_json='{"device": "Smartphone MEMS Acoustic Microphone", "sampling": "48 kHz"}'
        )
        session.add_all([sig1, sig2])
        await session.flush()
        
        print("Creating event slices & analysis runs...")
        slice1 = EventSlice(
            id=str(uuid.uuid4()),
            signal_id=sig1.id,
            event_label="EVT-1042",
            start_sample=420000,
            end_sample=424096,
            peak_amp_mv=1180.0,
            sta_lta_ratio=6.8,
            crack_mode="Tensile Onset",
            is_critical="true"
        )
        session.add(slice1)
        
        analysis = AnalysisRun(
            id=str(uuid.uuid4()),
            signal_id=sig1.id,
            status="COMPLETED",
            cdpi_score=0.88,
            crack_mode="Tensile Precursor",
            confidence=0.946,
            lead_time_ms=340.0,
            bocd_alarm="true",
            execution_time_ms=28.4
        )
        session.add(analysis)
        await session.flush()
        
        tda = TDAResult(
            id=str(uuid.uuid4()),
            analysis_id=analysis.id,
            embedding_dimension=3,
            delay_lag=4,
            mutual_info_min=0.23,
            fnn_ratio=0.008,
            entropy_h0=0.880,
            entropy_h1=0.742,
            betti_0_peak=1,
            betti_1_peak=3,
            persistence_pairs_json='[[0.0, 0.42], [0.1, 0.88], [0.15, 0.76]]'
        )
        session.add(tda)
        
        await session.commit()
        print("Database seeded successfully!")

if __name__ == "__main__":
    asyncio.run(seed())
