"""Snapshot atual da Fase 3 — le a planilha de alocacoes e conta numeros atualizados."""
import csv
import io
import sys
from collections import defaultdict
from pathlib import Path

sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding="utf-8")

BASE = Path(__file__).parent
ALLOC = BASE / "Entrevistas com Coordena - Alocações - Horários (5).csv"
CAND = BASE / "E.C Candidatos - disponibilidade  (respostas) - Respostas ao formulário 1 (2).csv"

# Colunas (0-indexadas): A=0
COL_DIA = 1
COL_HORA = 2
COL_COORD = 3
COL_CAND = 7
COL_AREA = 9
COL_STATUS = 10
COL_ID = 11
COL_MSG = 13         # Mensagem enviada
COL_CONFIRM = 14     # Candidato confirmado
COL_OCORREU = 15     # Entrevista ocorreu
COL_PODIO = 16

def parse_bool(v):
    return (v or "").strip().upper() == "TRUE"

with open(ALLOC, encoding="utf-8") as f:
    reader = csv.reader(f)
    rows = list(reader)

# pula 3 primeiras linhas (cabecalhos)
data = [r for r in rows[3:] if len(r) > COL_CAND and r[COL_CAND].strip()]

total_linhas = len(data)
ocorreu = [r for r in data if parse_bool(r[COL_OCORREU])]
nao_ocorreu = [r for r in data if not parse_bool(r[COL_OCORREU])]
confirmadas = [r for r in data if parse_bool(r[COL_CONFIRM])]
com_evento = [r for r in data if r[COL_ID].strip()]

# distribuir por area
por_area = defaultdict(lambda: {"total": 0, "ocorreu": 0, "pendente": 0})
for r in data:
    area = r[COL_AREA].strip().split("\n")[0].strip()  # limpa "remarcar\n..."
    if area in ("ACE","CCE","MNP","PRO","QAB"):
        por_area[area]["total"] += 1
        if parse_bool(r[COL_OCORREU]):
            por_area[area]["ocorreu"] += 1
        else:
            por_area[area]["pendente"] += 1

# carga por Coordena
carga_coord = defaultdict(lambda: {"total": 0, "ocorreu": 0, "pendente": 0})
for r in data:
    coord = r[COL_COORD].strip()
    if not coord:
        continue
    carga_coord[coord]["total"] += 1
    if parse_bool(r[COL_OCORREU]):
        carga_coord[coord]["ocorreu"] += 1
    else:
        carga_coord[coord]["pendente"] += 1

# candidatos unicos
cands_marcados = set()
cands_fizeram = set()
for r in data:
    nome = r[COL_CAND].strip().lower()
    cands_marcados.add(nome)
    if parse_bool(r[COL_OCORREU]):
        cands_fizeram.add(nome)

# pendentes por dia (futuro)
por_dia = defaultdict(lambda: {"total": 0, "ocorreu": 0, "pendente": 0})
for r in data:
    dia = r[COL_DIA].strip()
    por_dia[dia]["total"] += 1
    if parse_bool(r[COL_OCORREU]):
        por_dia[dia]["ocorreu"] += 1
    else:
        por_dia[dia]["pendente"] += 1

# pool total de candidatos ativos (do CSV de disponibilidade, dedup)
def load_pool():
    pool = {}
    with open(CAND, encoding="utf-8") as f:
        reader = csv.reader(f)
        next(reader)
        for row in reader:
            if len(row) < 4 or not row[1].strip():
                continue
            nome = row[1].strip()
            email = row[2].strip().lower()
            area = row[3].strip()
            key = email or nome.lower()
            pool[key] = {"nome": nome, "area": area}
    return pool

pool = load_pool()
pool_por_area = defaultdict(int)
for p in pool.values():
    if p["area"] in ("ACE","CCE","MNP","PRO","QAB"):
        pool_por_area[p["area"]] += 1

print("=" * 80)
print("SNAPSHOT FASE 3 — 21/07/2026")
print("=" * 80)
print(f"Pool total (respostas E.C dedup):  {len(pool)}")
print(f"Total de linhas na planilha:       {total_linhas}")
print(f"Candidatos únicos com marcação:    {len(cands_marcados)}")
print(f"Entrevistas OCORRIDAS (col P):     {len(ocorreu)}")
print(f"Entrevistas PENDENTES:             {len(nao_ocorreu)}")
print(f"Com ID de evento (agendadas):      {len(com_evento)}")
print(f"Confirmadas pelo candidato:        {len(confirmadas)}")

print()
print("─" * 80)
print(f"{'Área':<8}{'Pool':<8}{'Marcadas':<12}{'Ocorridas':<12}{'Pendentes':<12}")
print("─" * 80)
for area in ["ACE","CCE","MNP","PRO","QAB"]:
    p = pool_por_area[area]
    d = por_area[area]
    print(f"{area:<8}{p:<8}{d['total']:<12}{d['ocorreu']:<12}{d['pendente']:<12}")

print()
print("─" * 80)
print("Por Coordena:")
print("─" * 80)
for coord in sorted(carga_coord.keys()):
    c = carga_coord[coord]
    print(f"  {coord:<40} total={c['total']:<4} ocorreu={c['ocorreu']:<4} pendente={c['pendente']}")

print()
print("─" * 80)
print("Por dia (ordem cronologica):")
print("─" * 80)
def dia_key(d):
    try:
        p = d.split("/")
        return (int(p[1]), int(p[0]))
    except:
        return (99,99)
for dia in sorted(por_dia.keys(), key=dia_key):
    d = por_dia[dia]
    print(f"  {dia}: total={d['total']:<4} ocorreu={d['ocorreu']:<4} pendente={d['pendente']}")

print()
print("=" * 80)
