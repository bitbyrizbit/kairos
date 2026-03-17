"""
report.py
PDF report generation endpoint.
Returns raw bytes as a file download — frontend triggers this on button click.
"""

from fastapi import APIRouter, HTTPException
from fastapi.responses import Response
from app.models.schemas import ReportRequest
from app.services import report_generator

router = APIRouter()


@router.post("/report")
async def generate_report(req: ReportRequest):
    try:
        pdf_bytes = report_generator.generate_pdf(
            req.event_description,
            req.ripple_data,
            req.kairos_score,
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Report generation failed: {str(e)}")

    filename = f"kairos-brief-{req.kairos_score}.pdf"

    return Response(
        content=pdf_bytes,
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"}
    )