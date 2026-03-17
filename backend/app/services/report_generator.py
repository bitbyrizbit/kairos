"""
report_generator.py
Converts the crisis brief markdown from claude_service into a PDF.
Using reportlab directly — it's verbose but gives full control over layout.
"""

import io
from datetime import datetime, timezone
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.lib import colors
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable, Table, TableStyle
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_RIGHT

from app.services import claude_service


# -- colors matching the dashboard theme --
COLOR_BG = colors.HexColor("#0a0f1e")
COLOR_RED = colors.HexColor("#ef4444")
COLOR_AMBER = colors.HexColor("#f59e0b")
COLOR_WHITE = colors.HexColor("#f1f5f9")
COLOR_MUTED = colors.HexColor("#64748b")
COLOR_BORDER = colors.HexColor("#1e293b")


def _build_styles():
    base = getSampleStyleSheet()

    title_style = ParagraphStyle(
        "KairosTitle",
        parent=base["Normal"],
        fontSize=22,
        textColor=COLOR_WHITE,
        fontName="Helvetica-Bold",
        alignment=TA_LEFT,
        spaceAfter=2*mm,
    )

    subtitle_style = ParagraphStyle(
        "KairosSubtitle",
        parent=base["Normal"],
        fontSize=10,
        textColor=COLOR_MUTED,
        fontName="Helvetica",
        alignment=TA_LEFT,
        spaceAfter=6*mm,
    )

    heading_style = ParagraphStyle(
        "KairosHeading",
        parent=base["Normal"],
        fontSize=13,
        textColor=COLOR_AMBER,
        fontName="Helvetica-Bold",
        spaceBefore=6*mm,
        spaceAfter=2*mm,
    )

    body_style = ParagraphStyle(
        "KairosBody",
        parent=base["Normal"],
        fontSize=9,
        textColor=COLOR_WHITE,
        fontName="Helvetica",
        leading=14,
        spaceAfter=3*mm,
    )

    label_style = ParagraphStyle(
        "KairosLabel",
        parent=base["Normal"],
        fontSize=8,
        textColor=COLOR_MUTED,
        fontName="Helvetica",
    )

    return title_style, subtitle_style, heading_style, body_style, label_style


def _score_color(score: int) -> colors.HexColor:
    if score >= 80:
        return COLOR_RED
    elif score >= 65:
        return colors.HexColor("#f97316")
    elif score >= 45:
        return COLOR_AMBER
    return colors.HexColor("#22c55e")


def _score_label(score: int) -> str:
    if score >= 80:
        return "CATASTROPHIC"
    elif score >= 65:
        return "CRITICAL"
    elif score >= 45:
        return "ELEVATED"
    return "MONITORING"


def generate_pdf(event_description: str, ripple_data: dict, kairos_score: int) -> bytes:
    """
    Returns raw PDF bytes — route handler sends this directly as a file download.
    Dark background + amber/red accents to match the dashboard aesthetic.
    """
    markdown_brief = claude_service.generate_report(event_description, ripple_data, kairos_score)

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer,
        pagesize=A4,
        leftMargin=20*mm,
        rightMargin=20*mm,
        topMargin=20*mm,
        bottomMargin=20*mm,
    )

    title_s, subtitle_s, heading_s, body_s, label_s = _build_styles()
    story = []

    # -- header --
    story.append(Paragraph("KAIROS", title_s))
    story.append(Paragraph("Crisis Intelligence Brief", subtitle_s))
    story.append(HRFlowable(width="100%", thickness=1, color=COLOR_BORDER))
    story.append(Spacer(1, 4*mm))

    # -- score + timestamp row --
    score_col = colors.HexColor("#0a0f1e")
    score_table_data = [[
        Paragraph(f'<font color="{_score_color(kairos_score).hexval()}"><b>{kairos_score}</b></font>', ParagraphStyle("sc", fontSize=28, textColor=_score_color(kairos_score), fontName="Helvetica-Bold")),
        Paragraph(f'<b>{_score_label(kairos_score)}</b><br/><font color="#64748b">Kairos Score</font>', ParagraphStyle("sl", fontSize=10, textColor=COLOR_WHITE, fontName="Helvetica", leading=16)),
        Paragraph(f'<font color="#64748b">Generated</font><br/>{datetime.now(timezone.utc).strftime("%d %b %Y %H:%M UTC")}', ParagraphStyle("sd", fontSize=9, textColor=COLOR_WHITE, fontName="Helvetica", leading=14, alignment=TA_RIGHT)),
    ]]

    score_table = Table(score_table_data, colWidths=[25*mm, 80*mm, None])
    score_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("BACKGROUND", (0, 0), (-1, -1), COLOR_BORDER),
        ("ROUNDEDCORNERS", [3]),
        ("TOPPADDING", (0, 0), (-1, -1), 4*mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4*mm),
        ("LEFTPADDING", (0, 0), (-1, -1), 4*mm),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4*mm),
    ]))
    story.append(score_table)
    story.append(Spacer(1, 6*mm))

    # -- event --
    story.append(Paragraph("Triggering Event", heading_s))
    story.append(Paragraph(event_description, body_s))

    # -- sector blast radius --
    blast = ripple_data.get("sector_blast_radius", {})
    if blast:
        story.append(Paragraph("Sector Blast Radius", heading_s))
        blast_data = [["Sector", "Impact Level"]]
        impact_colors = {
            "critical": "#ef4444",
            "high": "#f97316",
            "medium": "#f59e0b",
            "low": "#22c55e",
        }
        for sector, level in blast.items():
            hex_col = impact_colors.get(level, "#64748b")
            blast_data.append([
                Paragraph(sector, ParagraphStyle("bt", fontSize=9, textColor=COLOR_WHITE, fontName="Helvetica")),
                Paragraph(f'<font color="{hex_col}"><b>{level.upper()}</b></font>', ParagraphStyle("bl", fontSize=9, textColor=COLOR_WHITE, fontName="Helvetica-Bold")),
            ])

        blast_table = Table(blast_data, colWidths=[100*mm, 60*mm])
        blast_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), COLOR_BORDER),
            ("TEXTCOLOR", (0, 0), (-1, 0), COLOR_AMBER),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 9),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.HexColor("#0f172a"), COLOR_BG]),
            ("GRID", (0, 0), (-1, -1), 0.5, COLOR_BORDER),
            ("TOPPADDING", (0, 0), (-1, -1), 2*mm),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 2*mm),
            ("LEFTPADDING", (0, 0), (-1, -1), 3*mm),
        ]))
        story.append(blast_table)
        story.append(Spacer(1, 4*mm))

    # -- main brief from LLM --
    story.append(Paragraph("Intelligence Brief", heading_s))

    # parse the markdown into paragraphs — not a full md parser, just handles ## and bullets
    for line in markdown_brief.split("\n"):
        line = line.strip()
        if not line:
            story.append(Spacer(1, 2*mm))
        elif line.startswith("## "):
            story.append(Paragraph(line[3:], heading_s))
        elif line.startswith("# "):
            pass  # skip the top-level title, we already have our own header
        elif line.startswith("- ") or line.startswith("* "):
            story.append(Paragraph(f"• {line[2:]}", body_s))
        else:
            story.append(Paragraph(line, body_s))

    # -- footer --
    story.append(Spacer(1, 8*mm))
    story.append(HRFlowable(width="100%", thickness=0.5, color=COLOR_BORDER))
    story.append(Spacer(1, 2*mm))
    story.append(Paragraph(
        "This brief was generated by KAIROS — Global Crisis Intelligence Platform. "
        "For internal use only.",
        label_s
    ))

    doc.build(story)
    return buffer.getvalue()