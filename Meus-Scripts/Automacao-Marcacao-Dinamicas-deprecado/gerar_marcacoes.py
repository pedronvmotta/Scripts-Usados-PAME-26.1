"""
Gera os CSVs atualizados de Horários (membros) e Alocação - Candidatos a partir
do Mapeamento por horário, preservando as marcações que já existem.

Regras:
- 1 facilitador + 2 observadores por dinâmica (staff conta como observador)
- 4 candidatos por dinâmica
- 1 dinâmica por slot (data + horário) nas NOVAS marcações
- Cada candidato em no máximo 1 dinâmica
- Membros: balanceamento por carga (quem foi alocado menos tem prioridade)
- Tema (CORES) deixado em branco nas novas
- Alcance: até 03/07 (fim do Mapeamento)
"""
import csv
import re
import unicodedata
from pathlib import Path
from collections import defaultdict

def norm_name(s: str) -> str:
    """Normaliza nome p/ comparar: lower, sem acentos, espaços colapsados."""
    s = unicodedata.normalize("NFD", s)
    s = "".join(c for c in s if unicodedata.category(c) != "Mn")
    s = re.sub(r"\s+", " ", s).strip().lower()
    return s

# Lixo que vem das linhas de header do Alocação que ficaram coladas no body
JUNK_NAMES = {"nome", ""} | {f"candidato {i}" for i in range(1, 10)}

# Candidatos que devem ser encaixados como 5º quando não couberem nos slots
# em modo "4 únicos por slot" (override manual da regra padrão).
PRIORITY_AS_FIFTH = [
    "Tiago de Góis Paz",
]

def is_real_name(s: str) -> bool:
    return norm_name(s) not in JUNK_NAMES

BASE = Path(__file__).parent
MAPEAMENTO = BASE / "Cruzamento de horários - Dinâmicas - Mapeamento por horário (2).csv"
HORARIOS_IN = BASE / "Cópia de Alocações de Membros - Dinâmicas em grupo - Horários.csv"
ALOC_IN = BASE / "Cópia de Alocações de Membros - Dinâmicas em grupo - Alocação - Candidatos.csv"
HORARIOS_OUT = BASE / "Horários - Atualizado.csv"
ALOC_OUT = BASE / "Alocação - Candidatos - Atualizado.csv"

YEAR = "2026"

# ---------- Normalização de chaves de slot ----------

def norm_date(s: str) -> str:
    """'17/06' ou '17/06/2026' -> '17/06'"""
    s = s.strip()
    m = re.match(r"^(\d{1,2})/(\d{1,2})", s)
    if not m:
        return ""
    return f"{int(m.group(1)):02d}/{int(m.group(2)):02d}"

def norm_hour(s: str) -> str:
    """'11h', '11:00:00', '11:00' -> '11'"""
    s = s.strip().lower()
    m = re.match(r"^(\d{1,2})", s)
    if not m:
        return ""
    return str(int(m.group(1)))

def slot_key(date_raw: str, hour_raw: str):
    d = norm_date(date_raw)
    h = norm_hour(hour_raw)
    if not d or not h:
        return None
    return (d, h)

# ---------- Lê Mapeamento ----------

def read_mapeamento():
    """
    Retorna dict {(date_key, hour_key): {
        'candidatos': [nomes],
        'membros': [(nome, cargo, email)],
        'date_raw': '17/06',
        'hour_raw': '17h',
    }}
    """
    slots = {}
    with open(MAPEAMENTO, encoding="utf-8") as f:
        r = csv.reader(f)
        next(r)  # header
        cur_key = None
        for row in r:
            if len(row) < 6:
                continue
            date_raw, hour_raw, cand_field, membro, cargo, email = row[:6]
            if not date_raw.strip() or not hour_raw.strip():
                continue
            key = slot_key(date_raw, hour_raw)
            if key is None:
                continue
            if key not in slots:
                cands = [c.strip() for c in cand_field.split(",") if c.strip()]
                slots[key] = {
                    "candidatos": cands,
                    "membros": [],
                    "date_raw": date_raw.strip(),
                    "hour_raw": hour_raw.strip(),
                }
            if membro.strip():
                slots[key]["membros"].append((membro.strip(), cargo.strip(), email.strip()))
    return slots

# ---------- Lê Horários existente ----------

def read_horarios():
    """
    Retorna (header_rows, data_rows, allocated_keys, member_usage_count, name_to_email).
    - header_rows: 3 primeiras linhas para reuso
    - data_rows: todas as linhas a partir da 4ª, preservadas
    - allocated_keys: set de slot_keys já com Dia+Horario preenchidos
    - member_usage_count: contagem de aparições por membro (para balanceamento)
    - name_to_email: nome -> email (para preencher emails de novos)
    """
    rows = []
    with open(HORARIOS_IN, encoding="utf-8") as f:
        r = csv.reader(f)
        for row in r:
            rows.append(row)
    header = rows[:3]
    body = rows[3:]
    allocated = set()
    usage = defaultdict(int)
    name_to_email = {}
    for row in body:
        if len(row) < 9:
            continue
        # Estrutura: [0]vazio, [1]Dia, [2]Horario, [3]FacNome, [4]FacEmail,
        #            [5]Obs1Nome, [6]Obs1Email, [7]Obs2Nome, [8]Obs2Email, [9]Status, [10]ID, [11]EquipeCompleta
        dia = row[1].strip() if len(row) > 1 else ""
        hora = row[2].strip() if len(row) > 2 else ""
        if dia and hora:
            k = slot_key(dia, hora)
            if k:
                allocated.add(k)
        for n_idx, e_idx in [(3, 4), (5, 6), (7, 8)]:
            if len(row) > e_idx:
                nome = row[n_idx].strip()
                email = row[e_idx].strip()
                if nome:
                    usage[nome] += 1
                    if email and nome not in name_to_email:
                        name_to_email[nome] = email
    return header, body, allocated, usage, name_to_email

# ---------- Lê Alocação Candidatos existente ----------

def read_alocacao():
    rows = []
    with open(ALOC_IN, encoding="utf-8") as f:
        r = csv.reader(f)
        for row in r:
            rows.append(row)
    header = rows[:3]
    body = rows[3:]
    allocated = set()
    used_candidates = set()
    for row in body:
        if len(row) < 4:
            continue
        dia = row[2].strip() if len(row) > 2 else ""
        hora = row[3].strip() if len(row) > 3 else ""
        if dia and hora:
            k = slot_key(dia, hora)
            if k:
                allocated.add(k)
        # 5 candidatos em colunas 4, 9, 14, 19, 24 (cada um ocupa 5 colunas)
        for c_idx in [4, 9, 14, 19, 24]:
            if len(row) > c_idx:
                nome = row[c_idx].strip()
                if nome and is_real_name(nome):
                    used_candidates.add(norm_name(nome))
    return header, body, allocated, used_candidates

# ---------- Seleção balanceada ----------

def pick_members(membros, usage):
    """
    Retorna (facilitador, obs1, obs2) ou None se não couber.
    membros: lista de (nome, cargo, email) disponíveis no slot.
    usage: dict nome -> contagem atual.
    """
    fac_eligible = [m for m in membros if "facilitador" in m[1].lower()]
    # observador-eligible: observador, staff, ou observador e facilitador
    obs_eligible = [
        m for m in membros
        if "observador" in m[1].lower() or "staff" in m[1].lower()
    ]

    def by_usage(m):
        return (usage[m[0]], m[0])

    fac_eligible.sort(key=by_usage)
    obs_eligible.sort(key=by_usage)

    if not fac_eligible:
        return None
    fac = fac_eligible[0]
    # Remove o fac do pool de obs
    obs_pool = [m for m in obs_eligible if m[0] != fac[0]]
    if len(obs_pool) < 2:
        return None
    obs1 = obs_pool[0]
    obs2 = obs_pool[1]
    return fac, obs1, obs2

def pick_candidates(candidatos_disponiveis, used_candidates, scarcity):
    """
    Pega 4 candidatos ainda não usados, priorizando os mais escassos
    (que aparecem em menos slots no Mapeamento).
    """
    available = [c for c in candidatos_disponiveis if norm_name(c) not in used_candidates]
    if len(available) < 4:
        return None
    available.sort(key=lambda c: (scarcity.get(norm_name(c), 999), norm_name(c)))
    return available[:4]

# ---------- Monta linhas para os outputs ----------

def make_horario_row(date_raw, hour_raw, fac, obs1, obs2):
    """Gera linha no formato do Horários para uma nova alocação."""
    dia_fmt = f"{norm_date(date_raw)}/{YEAR}"  # 15/06 -> 15/06/2026
    hora_fmt = f"{int(norm_hour(hour_raw)):02d}:00:00"
    return [
        "",
        dia_fmt,
        hora_fmt,
        fac[0], fac[2],
        obs1[0], obs1[2],
        obs2[0], obs2[2],
        "",   # Status do evento
        "",   # ID do evento
        "TRUE",  # Equipe completa
    ]

def make_aloc_row(date_raw, hour_raw, candidatos):
    """Gera linha no formato da Alocação - Candidatos."""
    dia_fmt = f"{norm_date(date_raw)}/{YEAR}"
    hora_fmt = f"{int(norm_hour(hour_raw)):02d}:00:00"
    # 32 colunas no header. Layout por candidato (5 cols): Nome, Número, Msg?, Vai?, Presente?
    row = ["", ""]  # cols 0, 1
    row.append(dia_fmt)
    row.append(hora_fmt)
    for i in range(5):
        if i < len(candidatos):
            row.extend([candidatos[i], "", "FALSE", "FALSE", "FALSE"])
        else:
            row.extend(["", "", "FALSE", "FALSE", "FALSE"])
    # idx 29 vazio, idx 30 tema (em branco) — total 31 campos, igual ao input
    row.extend(["", ""])
    return row

# ---------- Main ----------

def main():
    mapeamento = read_mapeamento()
    h_header, h_body, h_alloc, m_usage, name_to_email = read_horarios()
    a_header, a_body, a_alloc, used_cands = read_alocacao()

    # Slots já marcados em pelo menos um dos arquivos -> não tocar
    already_done = h_alloc | a_alloc

    # Escassez: em quantos slots ABERTOS cada candidato aparece. Quem aparece
    # em menos slots tem prioridade (senão "perde" para nomes que estão em
    # muitos slots e sobram alternativas).
    scarcity = defaultdict(int)
    open_slots = [k for k in mapeamento if k not in already_done]
    for k in open_slots:
        for c in mapeamento[k]["candidatos"]:
            scarcity[norm_name(c)] += 1

    new_horario_rows = []
    new_aloc_rows = []
    skipped = []

    def chrono_key(k):
        d, h = k
        dd, mm = d.split("/")
        return (int(mm), int(dd), int(h))

    # Ordem de processamento: slots com MENOS candidatos disponíveis primeiro
    # (mais restritos), desempate pela soma de escassez dos candidatos do slot
    # (slots com candidatos raros têm prioridade), depois cronológico.
    def slot_priority(k):
        cands = mapeamento[k]["candidatos"]
        n_disponiveis = sum(1 for c in cands if norm_name(c) not in used_cands)
        soma_escassez = sum(scarcity.get(norm_name(c), 0) for c in cands)
        return (n_disponiveis, soma_escassez, chrono_key(k))

    pendentes = [k for k in open_slots]
    while pendentes:
        pendentes.sort(key=slot_priority)
        key = pendentes.pop(0)
        info = mapeamento[key]
        # Enriquece emails de membros do Mapeamento no name_to_email global
        for nome, _, email in info["membros"]:
            if email and nome not in name_to_email:
                name_to_email[nome] = email
        picked_m = pick_members(info["membros"], m_usage)
        picked_c = pick_candidates(info["candidatos"], used_cands, scarcity)
        reason = []
        if picked_m is None:
            reason.append("membros insuficientes (precisa 1 fac + 2 obs)")
        if picked_c is None:
            reason.append("candidatos insuficientes (precisa 4 não-usados)")
        if reason:
            skipped.append((key, info["date_raw"], info["hour_raw"], "; ".join(reason)))
            continue
        fac, obs1, obs2 = picked_m
        new_horario_rows.append(make_horario_row(info["date_raw"], info["hour_raw"], fac, obs1, obs2))
        new_aloc_rows.append(make_aloc_row(info["date_raw"], info["hour_raw"], picked_c))
        # Atualiza estado
        for m in (fac, obs1, obs2):
            m_usage[m[0]] += 1
        for c in picked_c:
            used_cands.add(norm_name(c))

    # Reordena as novas linhas cronologicamente para escrita amigável
    def row_chrono(row, date_col, hour_col):
        d = row[date_col]
        h = row[hour_col]
        m = re.match(r"^(\d{1,2})/(\d{1,2})", d)
        dd, mm = (int(m.group(1)), int(m.group(2))) if m else (0, 0)
        hh_m = re.match(r"^(\d{1,2})", h)
        hh = int(hh_m.group(1)) if hh_m else 0
        return (mm, dd, hh)
    new_horario_rows.sort(key=lambda r: row_chrono(r, 1, 2))
    new_aloc_rows.sort(key=lambda r: row_chrono(r, 2, 3))

    # ---------- Passada extra: prioritários como 5º candidato ----------
    # Para cada nome em PRIORITY_AS_FIFTH que ainda não está em used_cands,
    # procura um slot (no body antigo ou nos novos) onde ele aparece no
    # Mapeamento e tem a col. do 5º candidato vazia, e o encaixa lá.
    fifth_added = []
    def try_add_fifth(rows_aloc, date_col, hour_col):
        added = []
        for nome_pref in PRIORITY_AS_FIFTH:
            cn = norm_name(nome_pref)
            if cn in used_cands:
                continue
            for row in rows_aloc:
                if len(row) <= 24:
                    continue
                dia = row[date_col].strip()
                hora = row[hour_col].strip()
                if not dia or not hora:
                    continue
                k = slot_key(dia, hora)
                if k is None or k not in mapeamento:
                    continue
                # Esse candidato é mesmo desse slot?
                slot_cands_norm = {norm_name(c) for c in mapeamento[k]["candidatos"]}
                if cn not in slot_cands_norm:
                    continue
                # 5º cand vazio?
                if row[24].strip():
                    continue
                row[24] = nome_pref
                if len(row) > 25 and not row[25].strip():
                    row[25] = ""
                if len(row) > 26:
                    row[26] = "FALSE"
                if len(row) > 27:
                    row[27] = "FALSE"
                if len(row) > 28:
                    row[28] = "FALSE"
                used_cands.add(cn)
                added.append((nome_pref, dia, hora))
                break
        return added

    # Prioriza encaixar nos NOVOS slots (slots que o próprio script criou);
    # se não couber lá, tenta nos slots já existentes (body original).
    fifth_added += try_add_fifth(new_aloc_rows, 2, 3)
    fifth_added += try_add_fifth(a_body, 2, 3)

    # Escreve outputs: header + body existente + novas linhas
    with open(HORARIOS_OUT, "w", encoding="utf-8", newline="") as f:
        w = csv.writer(f)
        for row in h_header:
            w.writerow(row)
        for row in h_body:
            w.writerow(row)
        for row in new_horario_rows:
            w.writerow(row)

    with open(ALOC_OUT, "w", encoding="utf-8", newline="") as f:
        w = csv.writer(f)
        for row in a_header:
            w.writerow(row)
        for row in a_body:
            w.writerow(row)
        for row in new_aloc_rows:
            w.writerow(row)

    # Relatório
    print(f"Slots no Mapeamento: {len(mapeamento)}")
    print(f"Slots já marcados (preservados): {len(already_done)}")
    print(f"Novas dinâmicas geradas: {len(new_horario_rows)}")
    print(f"Slots pulados (sem recursos suficientes): {len(skipped)}")
    if fifth_added:
        print("\nPrioritários encaixados como 5º candidato:")
        for nome, d, h in fifth_added:
            print(f"  {nome} -> {d} {h}")
    if skipped:
        print("\nDetalhe dos pulados:")
        for k, d, h, why in skipped:
            print(f"  {d} {h}: {why}")
    print(f"\nNovos arquivos gerados:")
    print(f"  {HORARIOS_OUT.name}")
    print(f"  {ALOC_OUT.name}")

if __name__ == "__main__":
    main()
