#!/usr/bin/env python3
"""
OTTO. — Servidor Full Stack para Geração, Diagramação, Correção por Foto e Backup de Provas
Arquitetura leve, rápida e resiliente com SQLite + PyMuPDF (fitz) nativo.
"""
import base64
import datetime
import io
import json
import os
import re
import sqlite3
from http.server import HTTPServer, SimpleHTTPRequestHandler
from urllib.parse import parse_qs, urlparse

try:
    import pymupdf as fitz
except ImportError:
    try:
        import fitz
    except ImportError:
        fitz = None

BASE_DIR = os.path.dirname(os.path.abspath(__file__))
DB_PATH = os.path.join(BASE_DIR, "otto.db")
ASSETS_DIR = os.path.join(BASE_DIR, "assets")


def init_db():
    conn = sqlite3.connect(DB_PATH)
    c = conn.cursor()
    c.execute(
        """
        CREATE TABLE IF NOT EXISTS backups (
            id TEXT PRIMARY KEY,
            title TEXT NOT NULL,
            student_name TEXT DEFAULT '',
            subject TEXT NOT NULL,
            institution TEXT NOT NULL,
            date_str TEXT NOT NULL,
            category TEXT NOT NULL,
            exam_style TEXT DEFAULT 'classico',
            score TEXT DEFAULT '',
            tags TEXT DEFAULT '',
            summary TEXT DEFAULT '',
            image_data TEXT DEFAULT '',
            payload_json TEXT DEFAULT '{}',
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
        """
    )
    conn.commit()
    conn.close()


def generate_pdf_bytes(payload: dict) -> bytes:
    """Gera um PDF A4 diagramado com precisão tipográfica usando PyMuPDF."""
    if fitz is None:
        raise RuntimeError("PyMuPDF não disponível")

    doc = fitz.open()
    page_w, page_h = 595.28, 841.89  # A4 em pontos (72 dpi)
    margin = 38.0

    meta = payload.get("meta", {})
    institution = meta.get("institution", "UNIVERSIDADE FEDERAL / HOSPITAL ESCOLA")
    title = meta.get("title", "Avaliação Oficial — Clínica Médica & Diretrizes")
    subject = meta.get("subject", "Clínica Médica / Cardiologia e Terapia Intensiva")
    professor = meta.get("professor", "Prof. Dr. Titular")
    date_str = meta.get("date", datetime.date.today().strftime("%d/%m/%Y"))
    version = meta.get("version", "CADERNO ALFA")
    style = meta.get("style", "classico")  # classico | duas_colunas | clinico
    include_key = bool(payload.get("includeKey", True))
    questions = payload.get("questions", [])

    avatar_path = os.path.join(ASSETS_DIR, "otto-avatar.png")

    def draw_header(p, is_first=True, page_num=1):
        # Moldura superior estilo nanquim OTTO.
        p.draw_line(
            fitz.Point(margin, 28),
            fitz.Point(page_w - margin, 28),
            color=(0.07, 0.07, 0.07),
            width=1.8,
        )
        if not is_first:
            p.insert_text(
                fitz.Point(margin, 44),
                f"{institution.upper()}  •  {title} ({version})",
                fontsize=8.5,
                fontname="helv",
                color=(0.25, 0.25, 0.25),
            )
            p.insert_text(
                fitz.Point(page_w - margin - 55, 44),
                f"Página {page_num}",
                fontsize=8.5,
                fontname="helv",
                color=(0.25, 0.25, 0.25),
            )
            p.draw_line(
                fitz.Point(margin, 50),
                fitz.Point(page_w - margin, 50),
                color=(0.07, 0.07, 0.07),
                width=0.8,
            )
            return 66.0

        # Caixa de cabeçalho completo na primeira página
        hdr_rect = fitz.Rect(margin, 34, page_w - margin, 122)
        p.draw_rect(hdr_rect, color=(0.07, 0.07, 0.07), width=1.4)

        if os.path.exists(avatar_path):
            img_rect = fitz.Rect(margin + 8, 42, margin + 56, 90)
            p.insert_image(img_rect, filename=avatar_path)
            p.insert_text(
                fitz.Point(margin + 15, 104),
                "OTTO.",
                fontsize=9.5,
                fontname="hebo",
                color=(0.07, 0.07, 0.07),
            )

        text_x = margin + 68
        p.insert_text(
            fitz.Point(text_x, 50),
            institution.upper(),
            fontsize=10.5,
            fontname="hebo",
            color=(0.07, 0.07, 0.07),
        )
        p.insert_text(
            fitz.Point(text_x, 66),
            title,
            fontsize=12.0,
            fontname="hebo",
            color=(0.05, 0.05, 0.05),
        )
        p.insert_text(
            fitz.Point(text_x, 81),
            f"Disciplina/Assunto: {subject}   |   Docente: {professor}",
            fontsize=8.8,
            fontname="helv",
            color=(0.2, 0.2, 0.2),
        )
        p.insert_text(
            fitz.Point(text_x, 95),
            f"Data: {date_str}   |   Modelo: {style.upper()}   |   Versão: {version}",
            fontsize=8.5,
            fontname="helv",
            color=(0.25, 0.25, 0.25),
        )

        # Linha de identificação do aluno
        p.draw_line(
            fitz.Point(margin, 100),
            fitz.Point(page_w - margin, 100),
            color=(0.07, 0.07, 0.07),
            width=0.7,
        )
        p.insert_text(
            fitz.Point(text_x, 114),
            "ALUNO(A): ________________________________________________   MATRÍCULA: _______________   NOTA: _______",
            fontsize=8.8,
            fontname="hebo",
            color=(0.1, 0.1, 0.1),
        )

        # Mini grade OMR rápida para leitura óptica por foto
        mc_qs = [q for q in questions if q.get("type") == "mc"]
        y_cursor = 132.0
        if mc_qs:
            omr_rect = fitz.Rect(margin, y_cursor, page_w - margin, y_cursor + 38)
            p.draw_rect(
                omr_rect,
                color=(0.12, 0.12, 0.12),
                fill=(0.97, 0.96, 0.94),
                width=0.9,
            )
            p.insert_text(
                fitz.Point(margin + 8, y_cursor + 13),
                "CARTÃO OMR (PREENCHA TOTALMENTE A BOLHA PARA CORREÇÃO POR FOTO NO OTTO):",
                fontsize=7.5,
                fontname="hebo",
                color=(0.1, 0.1, 0.1),
            )
            bx = margin + 8
            by = y_cursor + 27
            for idx, q in enumerate(mc_qs[:10], start=1):
                p.insert_text(
                    fitz.Point(bx, by),
                    f"Q{idx}:",
                    fontsize=7.5,
                    fontname="hebo",
                )
                bx += 16
                for letter in ["A", "B", "C", "D", "E"]:
                    p.draw_circle(
                        fitz.Point(bx + 4, by - 2.5),
                        4.2,
                        color=(0.1, 0.1, 0.1),
                        width=0.7,
                    )
                    p.insert_text(
                        fitz.Point(bx + 2.1, by - 0.3),
                        letter,
                        fontsize=5.5,
                        fontname="helv",
                    )
                    bx += 10.5
                bx += 6
            y_cursor += 48.0

        return y_cursor

    page_num = 1
    page = doc.new_page(width=page_w, height=page_h)
    y = draw_header(page, is_first=True, page_num=page_num)

    two_col = style == "duas_colunas"
    col_gap = 18.0
    col_w = (page_w - 2 * margin - col_gap) / 2.0 if two_col else (page_w - 2 * margin)
    col_idx = 0
    col_top_y = y

    def next_slot(needed_h):
        nonlocal page, page_num, y, col_idx, col_top_y
        if y + needed_h <= page_h - 42:
            return
        if two_col and col_idx == 0:
            # Desenha linha divisória central
            mid_x = page_w / 2.0
            page.draw_line(
                fitz.Point(mid_x, col_top_y),
                fitz.Point(mid_x, page_h - 42),
                color=(0.75, 0.75, 0.75),
                width=0.6,
            )
            col_idx = 1
            y = col_top_y
            return
        # Rodapé antes de criar nova página
        page.draw_line(
            fitz.Point(margin, page_h - 30),
            fitz.Point(page_w - margin, page_h - 30),
            color=(0.07, 0.07, 0.07),
            width=1.2,
        )
        page.insert_text(
            fitz.Point(margin, page_h - 18),
            f"OTTO. Sistema Editorial & Correção Inteligente de Provas  •  {version}",
            fontsize=7.5,
            fontname="helv",
            color=(0.35, 0.35, 0.35),
        )
        page_num += 1
        page = doc.new_page(width=page_w, height=page_h)
        y = draw_header(page, is_first=False, page_num=page_num)
        col_top_y = y
        col_idx = 0

    for idx, q in enumerate(questions, start=1):
        qtype = q.get("type", "mc")
        stem = q.get("stem", "")
        topic = q.get("topic", "Diretriz")
        points = q.get("points", 1.0)
        options = q.get("options", [])
        lines_needed = max(2, int(len(stem) / (48 if two_col else 95)) + 1)
        est_h = 26 + lines_needed * 12 + (len(options) * 15 if qtype == "mc" else 68)
        next_slot(est_h)

        x0 = margin if (not two_col or col_idx == 0) else (margin + col_w + col_gap)
        x1 = x0 + col_w

        # Cabeçalho da questão
        badge_rect = fitz.Rect(x0, y, x1, y + 16)
        if style == "clinico":
            page.draw_rect(
                badge_rect,
                color=(0.1, 0.1, 0.1),
                fill=(0.94, 0.95, 0.98),
                width=0.7,
            )
        else:
            page.draw_line(
                fitz.Point(x0, y + 15),
                fitz.Point(x1, y + 15),
                color=(0.2, 0.2, 0.2),
                width=0.6,
            )

        q_label = "MÚLTIPLA ESCOLHA" if qtype == "mc" else "DISSERTATIVA CONCEITUAL"
        page.insert_text(
            fitz.Point(x0 + 4, y + 11.5),
            f"QUESTÃO {idx:02d}  •  [{topic.upper()}]  •  {q_label} ({points:.1f} pt)",
            fontsize=8.0,
            fontname="hebo",
            color=(0.07, 0.07, 0.07),
        )
        y += 20

        # Enunciado com quebra automática
        stem_rect = fitz.Rect(x0, y, x1, y + 220)
        rc = page.insert_textbox(
            stem_rect,
            stem,
            fontsize=9.2 if not two_col else 8.6,
            fontname="helv",
            color=(0.08, 0.08, 0.08),
        )
        used_h = max(18.0, (220.0 - rc) if rc >= 0 else 65.0)
        y += used_h + 4

        if qtype == "mc":
            letters = ["A", "B", "C", "D", "E"]
            for o_idx, opt_text in enumerate(options[:5]):
                letter = letters[o_idx]
                opt_clean = re.sub(r"^[A-Ea-e][\)\.\-]\s*", "", str(opt_text))
                opt_rect = fitz.Rect(x0 + 6, y, x1, y + 42)
                rc_opt = page.insert_textbox(
                    opt_rect,
                    f"({letter})  {opt_clean}",
                    fontsize=8.6 if not two_col else 8.1,
                    fontname="helv",
                    color=(0.12, 0.12, 0.12),
                )
                opt_h = max(13.5, (42.0 - rc_opt) if rc_opt >= 0 else 26.0)
                y += opt_h + 2
        else:
            # Linhas pautadas para questão dissertativa
            box_h = 56.0
            resp_rect = fitz.Rect(x0, y, x1, y + box_h)
            page.draw_rect(resp_rect, color=(0.55, 0.55, 0.55), width=0.6)
            for l_i in range(1, 5):
                ly = y + l_i * 13.5
                page.draw_line(
                    fitz.Point(x0 + 6, ly),
                    fitz.Point(x1 - 6, ly),
                    color=(0.82, 0.82, 0.82),
                    width=0.5,
                )
            y += box_h + 4

        y += 10

    # Rodapé da última página de prova
    page.draw_line(
        fitz.Point(margin, page_h - 30),
        fitz.Point(page_w - margin, page_h - 30),
        color=(0.07, 0.07, 0.07),
        width=1.2,
    )
    page.insert_text(
        fitz.Point(margin, page_h - 18),
        f"OTTO. Sistema Editorial & Correção Inteligente de Provas  •  {version}  •  Página {page_num}",
        fontsize=7.5,
        fontname="helv",
        color=(0.35, 0.35, 0.35),
    )

    # Página adicional com Gabarito Oficial + Espelho de Conceitos & Palavras-Chave
    if include_key:
        kpage = doc.new_page(width=page_w, height=page_h)
        kpage.draw_line(
            fitz.Point(margin, 28),
            fitz.Point(page_w - margin, 28),
            color=(0.07, 0.07, 0.07),
            width=1.8,
        )
        kpage.insert_text(
            fitz.Point(margin, 48),
            f"GABARITO OFICIAL & ESPELHO DE CONCEITOS (OTTO.) — {version}",
            fontsize=12.0,
            fontname="hebo",
            color=(0.07, 0.07, 0.07),
        )
        kpage.insert_text(
            fitz.Point(margin, 62),
            f"{institution}  •  {title}  •  Data: {date_str}",
            fontsize=8.8,
            fontname="helv",
            color=(0.3, 0.3, 0.3),
        )
        kpage.draw_line(
            fitz.Point(margin, 70),
            fitz.Point(page_w - margin, 70),
            color=(0.07, 0.07, 0.07),
            width=0.8,
        )
        ky = 88.0
        letters = ["A", "B", "C", "D", "E"]
        for idx, q in enumerate(questions, start=1):
            if ky > page_h - 80:
                kpage = doc.new_page(width=page_w, height=page_h)
                ky = 48.0
            qtype = q.get("type", "mc")
            if qtype == "mc":
                ans_idx = int(q.get("answer", 0))
                ans_letter = letters[ans_idx] if 0 <= ans_idx < 5 else "A"
                rationale = q.get("rationale", "Conforme diretriz atualizada.")
                kpage.insert_text(
                    fitz.Point(margin, ky),
                    f"Questão {idx:02d} [Múltipla Escolha]  →  GABARITO: ({ans_letter})",
                    fontsize=9.5,
                    fontname="hebo",
                    color=(0.04, 0.45, 0.28),
                )
                ky += 12
                r_rect = fitz.Rect(margin + 10, ky, page_w - margin, ky + 45)
                rc = kpage.insert_textbox(
                    r_rect,
                    f"Justificativa/Diretriz: {rationale}",
                    fontsize=8.3,
                    fontname="helv",
                    color=(0.2, 0.2, 0.2),
                )
                ky += max(15.0, (45.0 - rc) if rc >= 0 else 28.0) + 8
            else:
                concept = q.get("conceptKey", "")
                kws = ", ".join(q.get("keywords", []))
                kpage.insert_text(
                    fitz.Point(margin, ky),
                    f"Questão {idx:02d} [Dissertativa — Correção por Conceito & Palavras-Chave]",
                    fontsize=9.5,
                    fontname="hebo",
                    color=(0.12, 0.28, 0.72),
                )
                ky += 12
                c_rect = fitz.Rect(margin + 10, ky, page_w - margin, ky + 60)
                rc = kpage.insert_textbox(
                    c_rect,
                    f"Conceito-Alvo: {concept}\nPalavras-Chave Obrigatórias: {kws}",
                    fontsize=8.3,
                    fontname="helv",
                    color=(0.15, 0.15, 0.15),
                )
                ky += max(24.0, (60.0 - rc) if rc >= 0 else 38.0) + 8

    out = doc.tobytes()
    doc.close()
    return out


class OttoRequestHandler(SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=BASE_DIR, **kwargs)

    def log_message(self, format, *args):
        pass

    def _send_json(self, data: dict, status: int = 200):
        raw = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(raw)))
        self.send_header("Access-Control-Allow-Origin", "*")
        self.end_headers()
        self.wfile.write(raw)

    def do_OPTIONS(self):
        self.send_response(204)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, DELETE, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/health":
            self._send_json(
                {
                    "status": "ok",
                    "app": "OTTO.",
                    "pymupdf": fitz is not None,
                    "timestamp": datetime.datetime.now().isoformat(),
                }
            )
            return

        if parsed.path == "/api/backups":
            qs = parse_qs(parsed.query)
            q = (qs.get("q", [""])[0] or "").strip().lower()
            conn = sqlite3.connect(DB_PATH)
            conn.row_factory = sqlite3.Row
            c = conn.cursor()
            c.execute("SELECT * FROM backups ORDER BY date_str DESC, created_at DESC")
            rows = [dict(r) for r in c.fetchall()]
            conn.close()
            if q:
                rows = [
                    r
                    for r in rows
                    if q in r["title"].lower()
                    or q in r["student_name"].lower()
                    or q in r["subject"].lower()
                    or q in r["institution"].lower()
                    or q in r["date_str"].lower()
                    or q in r["tags"].lower()
                    or q in r["summary"].lower()
                ]
            self._send_json({"items": rows})
            return

        return super().do_GET()

    def do_POST(self):
        parsed = urlparse(self.path)
        length = int(self.headers.get("Content-Length", "0"))
        raw_body = self.rfile.read(length) if length > 0 else b"{}"

        if parsed.path == "/api/extract-pdf":
            try:
                body = json.loads(raw_body.decode("utf-8"))
                b64_data = body.get("data", "")
                if "," in b64_data:
                    b64_data = b64_data.split(",", 1)[1]
                pdf_bytes = base64.b64decode(b64_data)
                if fitz is None:
                    self._send_json({"error": "PyMuPDF indisponível"}, 500)
                    return
                doc = fitz.open(stream=pdf_bytes, filetype="pdf")
                pages_text = []
                for idx, page in enumerate(doc):
                    t = page.get_text("text").strip()
                    if t:
                        pages_text.append(f"--- Página {idx + 1} ---\n{t}")
                full_text = "\n\n".join(pages_text)
                doc.close()
                self._send_json(
                    {
                        "ok": True,
                        "pages": len(pages_text),
                        "text": full_text[:25000],
                    }
                )
            except Exception as e:
                self._send_json({"ok": False, "error": str(e)}, 400)
            return

        if parsed.path == "/api/generate-pdf":
            try:
                payload = json.loads(raw_body.decode("utf-8"))
                pdf_bytes = generate_pdf_bytes(payload)
                self.send_response(200)
                self.send_header("Content-Type", "application/pdf")
                self.send_header(
                    "Content-Disposition", 'attachment; filename="prova_otto.pdf"'
                )
                self.send_header("Content-Length", str(len(pdf_bytes)))
                self.send_header("Access-Control-Allow-Origin", "*")
                self.end_headers()
                self.wfile.write(pdf_bytes)
            except Exception as e:
                self._send_json({"ok": False, "error": str(e)}, 500)
            return

        if parsed.path == "/api/backups":
            try:
                item = json.loads(raw_body.decode("utf-8"))
                item_id = item.get("id") or f"bkp-{int(datetime.datetime.now().timestamp() * 1000)}"
                conn = sqlite3.connect(DB_PATH)
                c = conn.cursor()
                c.execute(
                    """
                    INSERT OR REPLACE INTO backups
                    (id, title, student_name, subject, institution, date_str, category, exam_style, score, tags, summary, image_data, payload_json)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        item_id,
                        item.get("title", "Arquivo sem título"),
                        item.get("student_name", ""),
                        item.get("subject", "Geral"),
                        item.get("institution", "Instituição"),
                        item.get("date_str", datetime.date.today().isoformat()),
                        item.get("category", "prova_aluno"),
                        item.get("exam_style", "classico"),
                        item.get("score", ""),
                        item.get("tags", ""),
                        item.get("summary", ""),
                        item.get("image_data", ""),
                        json.dumps(item.get("payload", {}), ensure_ascii=False),
                    ),
                )
                conn.commit()
                conn.close()
                self._send_json({"ok": True, "id": item_id})
            except Exception as e:
                self._send_json({"ok": False, "error": str(e)}, 400)
            return

        self._send_json({"error": "Rota não encontrada"}, 404)

    def do_DELETE(self):
        parsed = urlparse(self.path)
        if parsed.path.startswith("/api/backups/"):
            item_id = parsed.path.split("/api/backups/", 1)[1]
            conn = sqlite3.connect(DB_PATH)
            c = conn.cursor()
            c.execute("DELETE FROM backups WHERE id = ?", (item_id,))
            conn.commit()
            conn.close()
            self._send_json({"ok": True, "deleted": item_id})
            return
        self._send_json({"error": "Rota não encontrada"}, 404)


if __name__ == "__main__":
    init_db()
    port = int(os.environ.get("PORT", "8080"))
    server = HTTPServer(("0.0.0.0", port), OttoRequestHandler)
    print(f"OTTO. Server rodando em http://0.0.0.0:{port}")
    server.serve_forever()
