import sys
import os
import asyncio
from fastapi.testclient import TestClient

sys.path.insert(0, "backend")
from app.main import app

def test_full_connectivity():
    client = TestClient(app)
    
    print("Testing backend connectivity across all major routes...")
    
    # 1. Health
    r = client.get("/health")
    assert r.status_code == 200, f"Health failed: {r.status_code}"
    print("✓ Health Check: OK")
    
    # 2. Dashboard Stats
    r = client.get("/api/v1/dashboard/stats")
    assert r.status_code == 200, f"Dashboard failed: {r.status_code}"
    stats = r.json()
    assert "metrics" in stats and "system" in stats
    print(f"✓ Dashboard Stats: OK (Total Signals={stats['metrics']['total_signals']}, Analyses={stats['metrics']['total_analyses']})")
    
    # 3. Signals List
    r = client.get("/api/v1/signals")
    assert r.status_code == 200, f"Signals list failed: {r.status_code}"
    signals = r.json()
    assert len(signals) > 0, "No signals found in database"
    sig_id = signals[0]["id"]
    print(f"✓ Signals List: OK ({len(signals)} signals, selected {sig_id[:8]})")
    
    # 4. Signal EDA & Waveform
    r_eda = client.get(f"/api/v1/signals/{sig_id}/eda")
    assert r_eda.status_code == 200, f"Signal EDA failed: {r_eda.status_code}"
    print("✓ Signal EDA: OK")
    
    r_wave = client.get(f"/api/v1/signals/{sig_id}/waveform?points=200")
    assert r_wave.status_code == 200, f"Signal Waveform failed: {r_wave.status_code}"
    print("✓ Signal Waveform: OK")
    
    # 5. Analysis List & Detail
    r_an = client.get("/api/v1/analysis")
    assert r_an.status_code == 200, f"Analysis list failed: {r_an.status_code}"
    analyses = r_an.json()
    assert len(analyses) > 0, "No analysis runs found in database"
    an_id = analyses[0]["id"]
    print(f"✓ Analysis Runs: OK ({len(analyses)} runs, selected {an_id[:8]})")
    
    r_detail = client.get(f"/api/v1/analysis/{an_id}")
    assert r_detail.status_code == 200, f"Analysis detail failed: {r_detail.status_code}"
    print(f"✓ Analysis Detail: OK (CDPI={r_detail.json().get('cdpi_score')})")
    
    # 6. Persistence & Barcode Data
    r_pers = client.get(f"/api/v1/analysis/{an_id}/persistence")
    assert r_pers.status_code == 200, f"Persistence failed: {r_pers.status_code}"
    pers_data = r_pers.json()
    assert "barcode_intervals" in pers_data and "betti_curves" in pers_data
    print(f"✓ Persistence Barcodes & Landscapes: OK ({len(pers_data['barcode_intervals'])} intervals)")
    
    # 7. Model Comparison
    r_comp = client.get(f"/api/v1/analysis/{an_id}/comparison")
    assert r_comp.status_code == 200, f"Comparison failed: {r_comp.status_code}"
    comp = r_comp.json()
    assert "models" in comp
    print("✓ Model Comparison & Consensus Triangulation: OK")
    
    # 8. Report PDF Download
    r_pdf = client.get(f"/api/v1/analysis/{an_id}/report.pdf")
    assert r_pdf.status_code == 200, f"PDF report failed: {r_pdf.status_code}"
    assert r_pdf.headers["content-type"] == "application/pdf"
    assert len(r_pdf.content) > 1000
    print(f"✓ Certified PDF Report Generation: OK ({len(r_pdf.content)} bytes)")
    
    # 9. Performance Benchmark
    r_bench = client.get("/api/v1/analysis/benchmark/performance")
    assert r_bench.status_code == 200, f"Benchmark failed: {r_bench.status_code}"
    print("✓ Landmark FPS & Ripser Performance Benchmark: OK")
    
    print("\n🎉 ALL 9 CRITICAL BACKEND CONNECTIVITY CHECKS PASSED PERFECTLY!")

if __name__ == "__main__":
    test_full_connectivity()
