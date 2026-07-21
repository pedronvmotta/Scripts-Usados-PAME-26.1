"""Proposta de marcacao para 22/07/2026 — apenas para os 47 sem marcacao ainda."""
import csv
import io
import re
import sys
import unicodedata
from collections import defaultdict
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

BASE = Path(__file__).parent
ALLOC = BASE / "Entrevistas com Coordena - Alocações - Horários (5).csv"
CAND = BASE / "E.C Candidatos - disponibilidade  (respostas) - Respostas ao formulário 1 (2).csv"
COORD = BASE / "Coordenas - disponibilidade (respostas) - Respostas ao formulário 1 (1).csv"

DIAS = ["14/07","15/07","16/07","17/07","20/07","21/07","22/07","23/07","24/07","27/07","28/07","29/07"]
DIA_ALVO = "22/07"
IDX_DIA_ALVO = DIAS.index(DIA_ALVO)  # 6
HORARIOS = ["10h","11h","13h","14h","15h","16h","17h"]
NO_AVAIL = "Não tenho disponibilidade nenhum horário"

def norm(s):
    if not s: return ""
    s = unicodedata.normalize("NFD", s).encode("ascii","ignore").decode("ascii")
    return re.sub(r"\s+", " ", s.strip().lower())

def parse_horarios(cell):
    if not cell or NO_AVAIL in cell: return set()
    return {h.strip() for h in re.findall(r"\d+h", cell)}

# ----- Ja marcados -----
with open(ALLOC, encoding="utf-8") as f:
    aloc_rows = list(csv.reader(f))
ja_marcados_nomes = set()
ja_marcados_emails = set()
for r in aloc_rows[3:]:
    if len(r) > 7 and r[7].strip():
        ja_marcados_nomes.add(norm(r[7]))

# ----- Pool candidatos -----
def load_cand():
    pool = {}
    with open(CAND, encoding="utf-8") as f:
        reader = csv.reader(f)
        next(reader)
        for row in reader:
            if len(row) < 4 or not row[1].strip(): continue
            nome = row[1].strip()
            email = row[2].strip().lower()
            area = row[3].strip()
            disp = {}
            for i, dia in enumerate(DIAS):
                col = 4 + i
                disp[dia] = parse_horarios(row[col]) if col < len(row) else set()
            key = email or norm(nome)
            pool[key] = {"nome": nome, "email": email, "area": area, "disp": disp}
    return list(pool.values())

candidatos = load_cand()

# ----- Coordenas -----
def load_coord():
    coords = []
    with open(COORD, encoding="utf-8") as f:
        reader = csv.reader(f)
        next(reader)
        for row in reader:
            if len(row) < 4 or not row[1].strip(): continue
            nome = row[1].strip()
            email = row[2].strip().lower()
            area = row[3].strip()
            disp = {}
            for i, dia in enumerate(DIAS):
                col = 4 + i
                disp[dia] = parse_horarios(row[col]) if col < len(row) else set()
            coords.append({"nome": nome, "email": email, "area": area, "disp": disp})
    return coords

coordenas = load_coord()

# ----- Reprovados Fase 2 e desistentes (ignorar) -----
IGNORAR = {norm(n) for n in [
    "Michel Leandro Machado",
    "Tainá Ribeiro dos Santos",
    "Adriana Rodrigues dos Santos da Cruz",
]}

# ----- Isolar os sem marcacao -----
sem_marcacao = [c for c in candidatos
                if norm(c["nome"]) not in ja_marcados_nomes
                and norm(c["nome"]) not in IGNORAR
                and c["area"] in ("ACE","CCE","MNP","PRO","QAB")]

print(f"Pool total: {len(candidatos)}")
print(f"Ja marcados na planilha: {len(ja_marcados_nomes)}")
print(f"Sem marcacao (sem reprovados F2): {len(sem_marcacao)}")

# ----- Filtrar disponibilidade 22/07 -----
disp_22 = [c for c in sem_marcacao if c["disp"].get(DIA_ALVO)]
sem_disp_22 = [c for c in sem_marcacao if not c["disp"].get(DIA_ALVO)]

print(f"Disponiveis em 22/07: {len(disp_22)}")
print(f"SEM disponibilidade em 22/07: {len(sem_disp_22)}")

# ----- Cargas atuais (das ja marcadas) para equalizar PRO/QAB -----
carga_atual = defaultdict(int)
for r in aloc_rows[3:]:
    if len(r) > 7 and r[7].strip() and r[3].strip():
        carga_atual[r[3].strip()] += 1

# ----- Alocar -----
cand_by_area = defaultdict(list)
for c in disp_22:
    cand_by_area[c["area"]].append(c)

coord_by_area = defaultdict(list)
for c in coordenas:
    coord_by_area[c["area"]].append(c)

alocacao = {}   # (coord_nome, horario) -> cand
carga_nova = defaultdict(int)  # carga adicionada nessa proposta

# Kayo Enzo -> so Vitor Malfa (PRO)
def coord_permitidos_para(cand, coords_area):
    if norm(cand["nome"]).startswith("kayo enzo"):
        return [c for c in coords_area if "vitor" in norm(c["nome"]) and "malfa" in norm(c["nome"])]
    return coords_area

def opcoes(cand, coords_area):
    ops = []
    for co in coord_permitidos_para(cand, coords_area):
        if DIA_ALVO not in co["disp"] or not co["disp"][DIA_ALVO]:
            continue
        for h in HORARIOS:
            if h in cand["disp"][DIA_ALVO] and h in co["disp"][DIA_ALVO]:
                if (co["nome"], h) not in alocacao:
                    ops.append((co["nome"], h))
    return ops

def alocar_area(area):
    coords = coord_by_area.get(area, [])
    if not coords:
        return list(cand_by_area[area])
    cands = cand_by_area[area][:]
    # ordenar por menos opcoes (mais restritos primeiro)
    cands.sort(key=lambda c: len(opcoes(c, coords)))
    faltando = []
    for cand in cands:
        ops = opcoes(cand, coords)
        if not ops:
            faltando.append(cand)
            continue
        # priorizar: (carga_total_do_coord: atual+nova) menor, depois horario cedo
        ops.sort(key=lambda op: (carga_atual[op[0]] + carga_nova[op[0]], HORARIOS.index(op[1])))
        escolhida = ops[0]
        alocacao[escolhida] = cand
        carga_nova[escolhida[0]] += 1
    return faltando

faltando = {}
for area in ["ACE","CCE","MNP","PRO","QAB"]:
    faltando[area] = alocar_area(area)

# ----- Imprimir proposta em ordem cronologica -----
print()
print("=" * 90)
print(f"PROPOSTA DE MARCACAO — 22/07/2026 (apenas candidatos ainda sem entrevista)")
print("=" * 90)

por_horario = defaultdict(list)
for (co_nome, h), cand in alocacao.items():
    por_horario[h].append((co_nome, cand))

total = sum(len(v) for v in por_horario.values())
print(f"Total alocado: {total}")
print()

for h in HORARIOS:
    if not por_horario[h]: continue
    print(f"─── {h.replace('h', ':00')} ───")
    linhas = sorted(por_horario[h], key=lambda x: x[0])
    for co_nome, cand in linhas:
        print(f"  {cand['area']:<4} {cand['nome']:<45} c/ {co_nome}")
    print()

# ----- Sem slot -----
print("=" * 90)
print("SEM SLOT em 22/07 (candidatos sem match viavel neste dia):")
print("=" * 90)
for area in ["ACE","CCE","MNP","PRO","QAB"]:
    if faltando[area]:
        print(f"\n{area}:")
        for c in faltando[area]:
            slots = sorted(c["disp"][DIA_ALVO], key=lambda x: HORARIOS.index(x) if x in HORARIOS else 99)
            print(f"  • {c['nome']} — disponivel: {', '.join(slots)}")

print()
print("=" * 90)
print(f"SEM DISPONIBILIDADE em 22/07 ({len(sem_disp_22)} pessoas — precisam de outro dia):")
print("=" * 90)
por_area_sem = defaultdict(list)
for c in sem_disp_22:
    por_area_sem[c["area"]].append(c["nome"])
for area in ["ACE","CCE","MNP","PRO","QAB"]:
    if por_area_sem[area]:
        print(f"  {area}: {', '.join(por_area_sem[area])}")

# ----- Carga por Coordena apos proposta -----
print()
print("=" * 90)
print("Carga por Coordena (atual + nova):")
print("=" * 90)
todos_coords = set(carga_atual.keys()) | set(carga_nova.keys())
for co in sorted(todos_coords):
    a = carga_atual[co]
    n = carga_nova[co]
    if n > 0 or a > 0:
        marca = " *" if n > 0 else ""
        print(f"  {co:<40} atual={a:<3} +nova={n:<3} total={a+n}{marca}")

# ----- Alternativas para os alocados -----
print()
print("=" * 90)
print("ALTERNATIVAS por candidato alocado (outros slots que serviriam em 22/07)")
print("=" * 90)
def alternativas(cand, coords, escolhida):
    alts = []
    for co in coord_permitidos_para(cand, coords):
        if DIA_ALVO not in co["disp"]: continue
        for h in HORARIOS:
            if h in cand["disp"][DIA_ALVO] and h in co["disp"][DIA_ALVO]:
                if (co["nome"], h) == escolhida: continue
                ocup = alocacao.get((co["nome"], h))
                ocup_nome = ocup["nome"] if ocup else None
                alts.append((h, co["nome"], ocup_nome))
    alts.sort(key=lambda a: (HORARIOS.index(a[0]), a[1]))
    return alts[:5]

for area in ["ACE","CCE","MNP","PRO","QAB"]:
    coords = coord_by_area[area]
    linhas = [(k,v) for k,v in alocacao.items() if v["area"] == area]
    if not linhas: continue
    print(f"\n── {area} ──")
    for (co_nome, h), cand in linhas:
        alts = alternativas(cand, coords, (co_nome, h))
        alt_strs = [f"{a[0]}/{a[1].split()[0]}{f' (ocup: {a[2].split()[0]})' if a[2] else ''}" for a in alts]
        print(f"  {cand['nome']:<45} PROP: {h}/{co_nome.split()[0]}")
        if alt_strs:
            print(f"    alts: {' | '.join(alt_strs)}")
