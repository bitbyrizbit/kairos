"""
report_generator.py
Professional white-background PDF — readable in all viewers and when printed.
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

# clean professional palette
COLOR_BG = colors.HexColor("#ffffff")
COLOR_HEADER = colors.HexColor("#0a0a0a")
COLOR_BODY = colors.HexColor("#1a1a1a")
COLOR_MUTED = colors.HexColor("#666666")
COLOR_BORDER = colors.HexColor("#e0e0e0")
COLOR_ACCENT = colors.HexColor("#f59e0b")
COLOR_RED = colors.HexColor("#dc2626")
COLOR_ORANGE = colors.HexColor("#ea580c")
COLOR_GREEN = colors.HexColor("#16a34a")
COLOR_CARD_BG = colors.HexColor("#f9f9f9")


def _score_color(score: int) -> colors.HexColor:
    if score >= 80: return COLOR_RED
    elif score >= 65: return COLOR_ORANGE
    elif score >= 45: return COLOR_ACCENT
    return COLOR_GREEN


def _score_label(score: int) -> str:
    if score >= 80: return "CATASTROPHIC"
    elif score >= 65: return "CRITICAL"
    elif score >= 45: return "ELEVATED"
    return "MONITORING"


def _impact_color(impact: str) -> colors.HexColor:
    mapping = {
        "critical": COLOR_RED,
        "high": COLOR_ORANGE,
        "medium": COLOR_ACCENT,
        "low": COLOR_GREEN,
    }
    return mapping.get(impact.lower(), COLOR_MUTED)


def generate_pdf(event_description: str, ripple_data: dict, kairos_score: int) -> bytes:
    markdown_brief = claude_service.generate_report(event_description, ripple_data, kairos_score)

    buffer = io.BytesIO()
    doc = SimpleDocTemplate(
        buffer, pagesize=A4,
        leftMargin=22*mm, rightMargin=22*mm,
        topMargin=20*mm, bottomMargin=20*mm,
    )

    story = []

    # -- top bar --
    top_data = [[
        Paragraph('<font name="Helvetica-Bold" size="18">KAIROS</font>', ParagraphStyle(
            "h", fontSize=18, textColor=COLOR_HEADER, fontName="Helvetica-Bold"
        )),
        Paragraph(
            f'<font name="Helvetica-Bold" size="22" color="{_score_color(kairos_score).hexval()}">{kairos_score}</font>',
            ParagraphStyle("sc", fontSize=22, textColor=_score_color(kairos_score),
                          fontName="Helvetica-Bold", alignment=TA_CENTER)
        ),
        Paragraph(
            f'<font name="Helvetica" size="8" color="#666666">Generated<br/>{datetime.now(timezone.utc).strftime("%d %b %Y · %H:%M UTC")}</font>',
            ParagraphStyle("sd", fontSize=8, textColor=COLOR_MUTED, fontName="Helvetica", alignment=TA_RIGHT, leading=12)
        ),
    ]]

    top_table = Table(top_data, colWidths=[80*mm, 30*mm, None])
    top_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("BACKGROUND", (0, 0), (-1, -1), COLOR_CARD_BG),
        ("TOPPADDING", (0, 0), (-1, -1), 4*mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4*mm),
        ("LEFTPADDING", (0, 0), (-1, -1), 4*mm),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4*mm),
        ("LINEBELOW", (0, 0), (-1, 0), 2, COLOR_ACCENT),
    ]))
    story.append(top_table)
    story.append(Spacer(1, 5*mm))

    # -- subtitle --
    story.append(Paragraph(
        "Crisis Intelligence Brief",
        ParagraphStyle("sub", fontSize=9, textColor=COLOR_MUTED, fontName="Helvetica",
                      letterSpacing=1, spaceAfter=1*mm)
    ))
    story.append(HRFlowable(width="100%", thickness=1, color=COLOR_BORDER))
    story.append(Spacer(1, 4*mm))

    # -- status badge + event --
    status_label = _score_label(kairos_score)
    status_color = _score_color(kairos_score)

    badge_data = [[
        Paragraph(
            f'<font name="Helvetica-Bold" size="9" color="{status_color.hexval()}">{status_label}</font>',
            ParagraphStyle("badge", fontSize=9, textColor=status_color, fontName="Helvetica-Bold")
        ),
        Paragraph(
            f'<font name="Helvetica" size="10" color="#1a1a1a">{event_description}</font>',
            ParagraphStyle("ev", fontSize=10, textColor=COLOR_BODY, fontName="Helvetica", leading=14)
        ),
    ]]
    badge_table = Table(badge_data, colWidths=[32*mm, None])
    badge_table.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("BACKGROUND", (0, 0), (0, 0), colors.HexColor(status_color.hexval() + "18")),
        ("TOPPADDING", (0, 0), (-1, -1), 3*mm),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3*mm),
        ("LEFTPADDING", (0, 0), (-1, -1), 3*mm),
        ("RIGHTPADDING", (0, 0), (-1, -1), 3*mm),
        ("BOX", (0, 0), (-1, -1), 0.5, COLOR_BORDER),
        ("LINEAFTER", (0, 0), (0, 0), 0.5, COLOR_BORDER),
    ]))
    story.append(badge_table)
    story.append(Spacer(1, 5*mm))

    # -- sector blast radius table --
    blast = ripple_data.get("sector_blast_radius", {})
    if blast:
        story.append(Paragraph(
            "SECTOR BLAST RADIUS",
            ParagraphStyle("sh", fontSize=8, textColor=COLOR_MUTED, fontName="Helvetica-Bold",
                          letterSpacing=1, spaceAfter=2*mm)
        ))

        blast_rows = [["Sector", "Impact Level", "Sector", "Impact Level"]]
        items = list(blast.items())
        # two columns in the table
        for i in range(0, len(items), 2):
            row = []
            for j in range(2):
                if i + j < len(items):
                    sector, impact = items[i + j]
                    ic = _impact_color(impact)
                    row.append(Paragraph(sector, ParagraphStyle("bt", fontSize=9, textColor=COLOR_BODY, fontName="Helvetica")))
                    row.append(Paragraph(
                        f'<font name="Helvetica-Bold" size="9" color="{ic.hexval()}">{impact.upper()}</font>',
                        ParagraphStyle("bl", fontSize=9, fontName="Helvetica-Bold")
                    ))
                else:
                    row.extend([Paragraph("", ParagraphStyle("e", fontSize=9)), Paragraph("", ParagraphStyle("e2", fontSize=9))])
            blast_rows.append(row)

        col_w = (doc.width) / 4
        blast_table = Table(blast_rows, colWidths=[col_w * 1.4, col_w * 0.6, col_w * 1.4, col_w * 0.6])
        blast_table.setStyle(TableStyle([
            ("BACKGROUND", (0, 0), (-1, 0), COLOR_CARD_BG),
            ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
            ("FONTSIZE", (0, 0), (-1, 0), 8),
            ("TEXTCOLOR", (0, 0), (-1, 0), COLOR_MUTED),
            ("GRID", (0, 0), (-1, -1), 0.3, COLOR_BORDER),
            ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, COLOR_CARD_BG]),
            ("TOPPADDING", (0, 0), (-1, -1), 2*mm),
            ("BOTTOMPADDING", (0, 0), (-1, -1), 2*mm),
            ("LEFTPADDING", (0, 0), (-1, -1), 3*mm),
        ]))
        story.append(blast_table)
        story.append(Spacer(1, 5*mm))

    # -- main brief --
    heading_style = ParagraphStyle(
        "h2", fontSize=11, textColor=COLOR_HEADER,
        fontName="Helvetica-Bold", spaceBefore=4*mm, spaceAfter=2*mm
    )
    body_style = ParagraphStyle(
        "body", fontSize=10, textColor=COLOR_BODY,
        fontName="Helvetica", leading=15, spaceAfter=2*mm
    )
    bullet_style = ParagraphStyle(
        "bullet", fontSize=10, textColor=COLOR_BODY,
        fontName="Helvetica", leading=14, leftIndent=4*mm, spaceAfter=1*mm
    )

    for line in markdown_brief.split("\n"):
        line = line.strip()
        if not line:
            story.append(Spacer(1, 2*mm))
        elif line.startswith("## "):
            story.append(Paragraph(line[3:], heading_style))
        elif line.startswith("# "):
            pass  # skip top title
        elif line.startswith("- ") or line.startswith("* "):
            story.append(Paragraph(f"• {line[2:]}", bullet_style))
        else:
            story.append(Paragraph(line, body_style))

    # -- footer --
    story.append(Spacer(1, 6*mm))
    story.append(HRFlowable(width="100%", thickness=0.5, color=COLOR_BORDER))
    story.append(Spacer(1, 2*mm))
    story.append(Paragraph(
        "KAIROS Crisis Intelligence Platform · Confidential · For internal use only",
        ParagraphStyle("foot", fontSize=7, textColor=COLOR_MUTED,
                      fontName="Helvetica", alignment=TA_CENTER)
    ))

    doc.build(story)
    return buffer.getvalue()