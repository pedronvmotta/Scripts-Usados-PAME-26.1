"""
Cruza disponibilidade de candidatos e Coordenas — Fase 3 do PAME.

Regras:
- Candidato area X so pode ser entrevistado por Coordena area X (sem excecoes).
- PRO/QAB tem 2 Coordenas cada - equalizar carga.
- 1 slot = 1 entrevista por Coordena.
- MNP nao tem Coordena disponivel - pular por enquanto.
- Fonte: E.C Candidatos (respostas do form) - ignorar aba BD Candidatos.
- Pular 14/07 (hoje) - manter agenda de amanha em diante.
"""

import csv
import io
import re
import sys
from collections import defaultdict
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

BASE = Path(__file__).parent
CAND_FILE = BASE / "E.C Candidatos - disponibilidade  (respostas) - Respostas ao formulário 1.csv"
COORD_FILE = BASE / "Coordenas - disponibilidade (respostas) - Respostas ao formulário 1 (1).csv"

DIAS = ["14/07","15/07","16/07","17/07","20/07","21/07","22/07","23/07","24/07","27/07","28/07","29/07"]
HORARIOS = ["10h","11h","13h","14h","15h","16h","17h"]
PULAR_DIAS = {"14/07"}  # hoje - deixar de fora

NO_AVAIL = "Não tenho disponibilidade nenhum horário"

def parse_horarios(cell):
    if not cell or cell.strip() == "" or NO_AVAIL in cell:
        return set()
    return {h.strip() for h in re.findall(r"\d+h", cell)}

def load(path):
    rows = []
    with open(path, encoding="utf-8") as f:
        reader = csv.reader(f)
        next(reader)  # header
        for row in reader:
            if len(row) < 4 or not row[1].strip():
                continue
            nome = row[1].strip()
            email = row[2].strip().lower()
            coord = row[3].strip()
            disp = {}
            for i, dia in enumerate(DIAS):
                col = 4 + i
                disp[dia] = parse_horarios(row[col]) if col < len(row) else set()
            rows.append({"nome": nome, "email": email, "coord": coord, "disp": disp})
    return rows

def dedup_candidatos(rows):
    seen = {}
    for r in rows:
        key = r["email"] or r["nome"].lower()
        seen[key] = r  # mantem a mais recente
    return list(seen.values())

candidatos = dedup_candidatos(load(CAND_FILE))
coordenas = load(COORD_FILE)

cand_by_area = defaultdict(list)
for c in candidatos:
    cand_by_area[c["coord"]].append(c)

coord_by_area = defaultdict(list)
for c in coordenas:
    coord_by_area[c["coord"]].append(c)

# Alocacao proposta: dict[(coord_nome, dia, horario)] = candidato_nome
carga = defaultdict(int)              # entrevistas por Coordena (total)
carga_dia = defaultdict(int)          # entrevistas por (Coordena, dia)
alocacao = {}
MAX_POR_COORD_POR_DIA = 5             # limite pra evitar concentração num dia só

def opcoes_livres(cand, coords):
    """Todas as opcoes (coord, dia, h) validas e ainda nao ocupadas."""
    ops = []
    for co in coords:
        for dia in DIAS:
            if dia in PULAR_DIAS:
                continue
            for h in HORARIOS:
                if h in cand["disp"].get(dia, set()) and h in co["disp"].get(dia, set()):
                    if (co["nome"], dia, h) not in alocacao:
                        ops.append((co["nome"], dia, h))
    return ops

def alocar_area(area):
    coords = coord_by_area.get(area, [])
    if not coords:
        return []
    cands = cand_by_area[area][:]
    # ordenar por menor numero de opcoes (mais restrito primeiro)
    cands.sort(key=lambda c: len(opcoes_livres(c, coords)))
    faltando = []
    for cand in cands:
        opcoes = opcoes_livres(cand, coords)
        # tenta primeiro respeitando o limite por dia; se nao der, relaxa
        opcoes_ok = [op for op in opcoes if carga_dia[(op[0], op[1])] < MAX_POR_COORD_POR_DIA]
        pool = opcoes_ok if opcoes_ok else opcoes
        if not pool:
            faltando.append(cand["nome"])
            continue
        # priorizar: carga total menor do Coordena, dia mais cedo, horario mais cedo
        pool.sort(key=lambda op: (carga[op[0]], DIAS.index(op[1]), HORARIOS.index(op[2])))
        escolhida = pool[0]
        alocacao[escolhida] = cand["nome"]
        carga[escolhida[0]] += 1
        carga_dia[(escolhida[0], escolhida[1])] += 1
    return faltando

def alternativas(cand, coords, escolhida, limite=5):
    """Outros slots que serviriam ao candidato (livres OU ocupados por outros)."""
    ops = []
    for co in coords:
        for dia in DIAS:
            if dia in PULAR_DIAS:
                continue
            for h in HORARIOS:
                if h in cand["disp"].get(dia, set()) and h in co["disp"].get(dia, set()):
                    key = (co["nome"], dia, h)
                    if key == escolhida:
                        continue
                    ocupado_por = alocacao.get(key)
                    ops.append((co["nome"], dia, h, ocupado_por))
    ops.sort(key=lambda o: (DIAS.index(o[1]), HORARIOS.index(o[2]), o[0]))
    return ops[:limite]

# ---- Executa ----
faltando_por_area = {}
for area in ["ACE", "CCE", "MNP", "PRO", "QAB"]:
    faltando_por_area[area] = alocar_area(area)

# ---- Imprime ----
print("=" * 90)
print("PROPOSTA DE MARCAÇÃO — FASE 3 (Entrevista com Coordena)")
print("Data de hoje: 14/07/2026 (dia 14/07 pulado no cruzamento — usar apenas 15/07 em diante)")
print("=" * 90)

for area in ["ACE", "CCE", "MNP", "PRO", "QAB"]:
    coords = coord_by_area[area]
    cands = cand_by_area[area]
    print(f"\n{'─'*90}")
    print(f"ÁREA {area} — {len(cands)} candidatos × {len(coords)} Coordena(s)")
    print(f"Coordena(s): {', '.join(co['nome'] for co in coords)}")
    print(f"{'─'*90}")

    # linhas marcadas nesta area, ordenadas por dia/horario
    coord_nomes = {co["nome"] for co in coords}
    linhas = sorted(
        [(k, v) for k, v in alocacao.items() if k[0] in coord_nomes],
        key=lambda x: (DIAS.index(x[0][1]), HORARIOS.index(x[0][2]), x[0][0])
    )
    print(f"{'Dia':<8}{'Hora':<6}{'Coordena':<22}{'Candidato'}")
    for (co_nome, dia, h), cand_nome in linhas:
        print(f"{dia:<8}{h:<6}{co_nome:<22}{cand_nome}")

    if faltando_por_area[area]:
        print(f"\n⚠️ SEM SLOT (candidato incompatível): {', '.join(faltando_por_area[area])}")

    if area in ("PRO", "QAB"):
        print("\nCarga por Coordena: " + " · ".join(
            f"{co['nome']}: {sum(1 for k in alocacao if k[0]==co['nome'])}" for co in coords
        ))

# ---- Alternativas ----
print("\n" + "=" * 90)
print("ALTERNATIVAS por candidato (outros slots que também servem)")
print("=" * 90)

for area in ["ACE", "CCE", "MNP", "PRO", "QAB"]:
    coords = coord_by_area[area]
    coord_nomes = {co["nome"] for co in coords}
    print(f"\n── {area} ──")
    for cand in cand_by_area[area]:
        # slot proposto pra ele
        prop = next((k for k, v in alocacao.items() if v == cand["nome"] and k[0] in coord_nomes), None)
        if not prop:
            continue
        alts = alternativas(cand, coords, prop, limite=6)
        prop_str = f"{prop[1]} {prop[2]} c/ {prop[0]}"
        alt_strs = []
        for co_nome, dia, h, ocup in alts:
            marca = f" (ocupado: {ocup})" if ocup else ""
            alt_strs.append(f"{dia} {h}/{co_nome.split()[0]}{marca}")
        print(f"  • {cand['nome']:<55} PROP: {prop_str}")
        if alt_strs:
            print(f"    alternativas: {' | '.join(alt_strs)}")

# ---- Cronologia unificada ----
print("\n" + "=" * 90)
print("MARCAÇÕES EM ORDEM CRONOLÓGICA (todas as áreas)")
print("=" * 90)
# mapeia candidato -> area
area_do_cand = {c["nome"]: c["coord"] for c in candidatos}
todas = sorted(alocacao.items(), key=lambda x: (DIAS.index(x[0][1]), HORARIOS.index(x[0][2]), x[0][0]))
print(f"{'Dia':<8}{'Hora':<6}{'Área':<6}{'Coordena':<22}{'Candidato'}")
for (co_nome, dia, h), cand_nome in todas:
    area = area_do_cand.get(cand_nome, "?")
    print(f"{dia:<8}{h:<6}{area:<6}{co_nome:<22}{cand_nome}")

# ---- Resumo final ----
print("\n" + "=" * 90)
total = sum(1 for _ in alocacao)
print(f"TOTAL marcado: {total} entrevistas")
print("=" * 90)
