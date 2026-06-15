const ID_MEMBROS = '1V7tu2xC4IpVZu3h831c3T_dJ1OOJwpnrbgNChxsyZI0';
const ID_CANDIDATOS = '11-_eB0OWeqFZb0kxLp3T81fO4mrHUIMNCYY-PEnCyhU';
const ID_SAIDA = '1GZUpr-DgaktUIc060NSuHw_nWt2qkNUPG6-P3nN-oQM';

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Atualizar abas')
    .addItem('Atualizar aba mapeamento', 'cruzarHorarios')
    .addItem('Atualizar aba disponibilidade', 'gerarDisponibilidade')
    .addToUi();
}

function cruzarHorarios() {
  const abaMembros = SpreadsheetApp.openById(ID_MEMBROS).getSheets()[0];
  const abaCandidatos = SpreadsheetApp.openById(ID_CANDIDATOS).getSheets()[0];
  const ssSaida = SpreadsheetApp.openById(ID_SAIDA);
  const abaSaida = ssSaida.getSheets()[0];

  const membrosRows = abaMembros.getDataRange().getValues();
  const candidatosRows = abaCandidatos.getDataRange().getValues();
  const mHdr = membrosRows[0];
  const cHdr = candidatosRows[0];

  const membros = buildAvailability(membrosRows, {
    nameIdx: findIndex(mHdr, h => /seu nome/i.test(h)),
    emailIdx: findIndex(mHdr, h => /email/i.test(h)),
    extraIdx: findIndex(mHdr, h => /cargo/i.test(h)),
  });

  const candidatos = buildAvailability(candidatosRows, {
    nameIdx: findIndex(cHdr, h => /seu nome/i.test(h)),
    emailIdx: findIndex(cHdr, h => /email/i.test(h)),
    extraIdx: findIndex(cHdr, h => /coordena/i.test(h)),
  });

  const HEADER = ['Candidato', 'Dia', 'Horário', 'Membro', 'Cargo', 'Email do membro'];
  const novasLinhas = [];

  const candList = [...candidatos.values()].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  const memList = [...membros.values()];

  for (const cand of candList) {
    const days = [...cand.slots.keys()].sort(sortByDate);
    for (const day of days) {
      const hours = [...cand.slots.get(day)].sort(sortByHour);
      for (const hour of hours) {
        const matches = memList
          .filter(m => m.slots.get(day) && m.slots.get(day).has(hour))
          .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
        for (const m of matches) {
          novasLinhas.push([cand.name, day, hour, m.name, m.extra, m.email]);
        }
      }
    }
  }

  const existentes = lerChavesExistentes(abaSaida);
  const paraAdicionar = novasLinhas.filter(
    r => !existentes.chaves.has(`${r[0]}|${r[1]}|${r[2]}|${r[3]}`)
  );

  abaSaida.getRange(1, 2, abaSaida.getMaxRows(), 2).setNumberFormat('@');

  if (!existentes.temHeader) {
    const tudo = [HEADER, ...paraAdicionar];
    abaSaida.getRange(1, 1, tudo.length, HEADER.length).setValues(tudo);
    abaSaida.setFrozenRows(1);
  } else if (paraAdicionar.length > 0) {
    const startRow = abaSaida.getLastRow() + 1;
    abaSaida.getRange(startRow, 1, paraAdicionar.length, HEADER.length).setValues(paraAdicionar);
  }

  ssSaida.toast(
    `+${paraAdicionar.length} novos | total na aba: ${existentes.chaves.size + paraAdicionar.length}`,
    'cruzarHorarios concluído',
    8
  );
}

function lerChavesExistentes(aba) {
  const dados = aba.getDataRange().getValues();
  const chaves = new Set();
  if (dados.length === 0 || String(dados[0][0] || '').trim() !== 'Candidato') {
    return { chaves, temHeader: false };
  }
  const hdr = dados[0].map(h => String(h || '').trim());
  const iCand = hdr.indexOf('Candidato');
  const iDia = hdr.indexOf('Dia');
  const iHora = hdr.indexOf('Horário');
  const iMembro = hdr.indexOf('Membro');
  for (let r = 1; r < dados.length; r++) {
    const row = dados[r];
    const cand = String(row[iCand] || '').trim();
    const dia = normalizarDia(row[iDia]);
    const hora = normalizarHora(row[iHora]);
    const membro = String(row[iMembro] || '').trim();
    if (!cand && !dia && !hora && !membro) continue;
    chaves.add(`${cand}|${dia}|${hora}|${membro}`);
  }
  return { chaves, temHeader: true };
}

function normalizarDia(v) {
  if (v instanceof Date) {
    const dd = String(v.getDate()).padStart(2, '0');
    const mm = String(v.getMonth() + 1).padStart(2, '0');
    return `${dd}/${mm}`;
  }
  return String(v == null ? '' : v).trim();
}

function normalizarHora(v) {
  if (v instanceof Date) {
    return `${v.getHours()}h`;
  }
  const s = String(v == null ? '' : v).trim();
  const m = s.match(/^(\d+)\s*h?$/i);
  return m ? `${parseInt(m[1], 10)}h` : s;
}

function buildAvailability(rows, opts) {
  const header = rows[0];
  const dayCols = [];
  for (let i = 0; i < header.length; i++) {
    const h = String(header[i] || '');
    if (/horários/i.test(h)) {
      const date = extractDate(h);
      if (date) dayCols.push({ idx: i, date });
    }
  }
  const byKey = new Map();
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.every(c => c === '' || c == null)) continue;
    const name = String(row[opts.nameIdx] || '').trim();
    const email = String(row[opts.emailIdx] || '').trim();
    if (!name && !email) continue;
    const extra = opts.extraIdx >= 0 ? String(row[opts.extraIdx] || '').trim() : '';
    const key = (email || name).toLowerCase();
    let entry = byKey.get(key);
    if (!entry) {
      entry = { name, email, extra, slots: new Map() };
      byKey.set(key, entry);
    }
    for (const col of dayCols) {
      const hours = parseHours(row[col.idx]);
      if (!hours.length) continue;
      let set = entry.slots.get(col.date);
      if (!set) { set = new Set(); entry.slots.set(col.date, set); }
      for (const h of hours) set.add(h);
    }
  }
  return byKey;
}

function extractDate(header) {
  const m = String(header).match(/(\d{2}\/\d{2})/);
  return m ? m[1] : null;
}

function parseHours(cell) {
  if (cell == null) return [];
  const trimmed = String(cell).trim();
  if (!trimmed) return [];
  if (/Não tenho disponibilidade/i.test(trimmed)) return [];
  return trimmed.split(',').map(s => s.trim()).filter(s => /^\d+h$/.test(s));
}

function findIndex(header, predicate) {
  for (let i = 0; i < header.length; i++) {
    if (predicate(String(header[i] || ''))) return i;
  }
  return -1;
}

function sortByDate(a, b) {
  const [da, ma] = a.split('/').map(Number);
  const [db, mb] = b.split('/').map(Number);
  return ma - mb || da - db;
}

function sortByHour(a, b) {
  return parseInt(a, 10) - parseInt(b, 10);
}
const ID_MEMBROS = '1V7tu2xC4IpVZu3h831c3T_dJ1OOJwpnrbgNChxsyZI0';
const ID_CANDIDATOS = '11-_eB0OWeqFZb0kxLp3T81fO4mrHUIMNCYY-PEnCyhU';
const ID_SAIDA = '1GZUpr-DgaktUIc060NSuHw_nWt2qkNUPG6-P3nN-oQM';

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('Atualizar abas')
    .addItem('Atualizar aba mapeamento', 'cruzarHorarios')
    .addItem('Atualizar aba disponibilidade', 'gerarDisponibilidade')
    .addToUi();
}

function cruzarHorarios() {
  const abaMembros = SpreadsheetApp.openById(ID_MEMBROS).getSheets()[0];
  const abaCandidatos = SpreadsheetApp.openById(ID_CANDIDATOS).getSheets()[0];
  const ssSaida = SpreadsheetApp.openById(ID_SAIDA);
  const abaSaida = ssSaida.getSheets()[0];

  const membrosRows = abaMembros.getDataRange().getValues();
  const candidatosRows = abaCandidatos.getDataRange().getValues();
  const mHdr = membrosRows[0];
  const cHdr = candidatosRows[0];

  const membros = buildAvailability(membrosRows, {
    nameIdx: findIndex(mHdr, h => /seu nome/i.test(h)),
    emailIdx: findIndex(mHdr, h => /email/i.test(h)),
    extraIdx: findIndex(mHdr, h => /cargo/i.test(h)),
  });

  const candidatos = buildAvailability(candidatosRows, {
    nameIdx: findIndex(cHdr, h => /seu nome/i.test(h)),
    emailIdx: findIndex(cHdr, h => /email/i.test(h)),
    extraIdx: findIndex(cHdr, h => /coordena/i.test(h)),
  });

  const HEADER = ['Candidato', 'Dia', 'Horário', 'Membro', 'Cargo', 'Email do membro'];
  const novasLinhas = [];

  const candList = [...candidatos.values()].sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
  const memList = [...membros.values()];

  for (const cand of candList) {
    const days = [...cand.slots.keys()].sort(sortByDate);
    for (const day of days) {
      const hours = [...cand.slots.get(day)].sort(sortByHour);
      for (const hour of hours) {
        const matches = memList
          .filter(m => m.slots.get(day) && m.slots.get(day).has(hour))
          .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
        for (const m of matches) {
          novasLinhas.push([cand.name, day, hour, m.name, m.extra, m.email]);
        }
      }
    }
  }

  const existentes = lerChavesExistentes(abaSaida);
  const paraAdicionar = novasLinhas.filter(
    r => !existentes.chaves.has(`${r[0]}|${r[1]}|${r[2]}|${r[3]}`)
  );

  abaSaida.getRange(1, 2, abaSaida.getMaxRows(), 2).setNumberFormat('@');

  if (!existentes.temHeader) {
    const tudo = [HEADER, ...paraAdicionar];
    abaSaida.getRange(1, 1, tudo.length, HEADER.length).setValues(tudo);
    abaSaida.setFrozenRows(1);
  } else if (paraAdicionar.length > 0) {
    const startRow = abaSaida.getLastRow() + 1;
    abaSaida.getRange(startRow, 1, paraAdicionar.length, HEADER.length).setValues(paraAdicionar);
  }

  ssSaida.toast(
    `+${paraAdicionar.length} novos | total na aba: ${existentes.chaves.size + paraAdicionar.length}`,
    'cruzarHorarios concluído',
    8
  );
}

function lerChavesExistentes(aba) {
  const dados = aba.getDataRange().getValues();
  const chaves = new Set();
  if (dados.length === 0 || String(dados[0][0] || '').trim() !== 'Candidato') {
    return { chaves, temHeader: false };
  }
  const hdr = dados[0].map(h => String(h || '').trim());
  const iCand = hdr.indexOf('Candidato');
  const iDia = hdr.indexOf('Dia');
  const iHora = hdr.indexOf('Horário');
  const iMembro = hdr.indexOf('Membro');
  for (let r = 1; r < dados.length; r++) {
    const row = dados[r];
    const cand = String(row[iCand] || '').trim();
    const dia = normalizarDia(row[iDia]);
    const hora = normalizarHora(row[iHora]);
    const membro = String(row[iMembro] || '').trim();
    if (!cand && !dia && !hora && !membro) continue;
    chaves.add(`${cand}|${dia}|${hora}|${membro}`);
  }
  return { chaves, temHeader: true };
}

function normalizarDia(v) {
  if (v instanceof Date) {
    const dd = String(v.getDate()).padStart(2, '0');
    const mm = String(v.getMonth() + 1).padStart(2, '0');
    return `${dd}/${mm}`;
  }
  return String(v == null ? '' : v).trim();
}

function normalizarHora(v) {
  if (v instanceof Date) {
    return `${v.getHours()}h`;
  }
  const s = String(v == null ? '' : v).trim();
  const m = s.match(/^(\d+)\s*h?$/i);
  return m ? `${parseInt(m[1], 10)}h` : s;
}

function buildAvailability(rows, opts) {
  const header = rows[0];
  const dayCols = [];
  for (let i = 0; i < header.length; i++) {
    const h = String(header[i] || '');
    if (/horários/i.test(h)) {
      const date = extractDate(h);
      if (date) dayCols.push({ idx: i, date });
    }
  }
  const byKey = new Map();
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    if (!row || row.every(c => c === '' || c == null)) continue;
    const name = String(row[opts.nameIdx] || '').trim();
    const email = String(row[opts.emailIdx] || '').trim();
    if (!name && !email) continue;
    const extra = opts.extraIdx >= 0 ? String(row[opts.extraIdx] || '').trim() : '';
    const key = (email || name).toLowerCase();
    let entry = byKey.get(key);
    if (!entry) {
      entry = { name, email, extra, slots: new Map() };
      byKey.set(key, entry);
    }
    for (const col of dayCols) {
      const hours = parseHours(row[col.idx]);
      if (!hours.length) continue;
      let set = entry.slots.get(col.date);
      if (!set) { set = new Set(); entry.slots.set(col.date, set); }
      for (const h of hours) set.add(h);
    }
  }
  return byKey;
}

function extractDate(header) {
  const m = String(header).match(/(\d{2}\/\d{2})/);
  return m ? m[1] : null;
}

function parseHours(cell) {
  if (cell == null) return [];
  const trimmed = String(cell).trim();
  if (!trimmed) return [];
  if (/Não tenho disponibilidade/i.test(trimmed)) return [];
  return trimmed.split(',').map(s => s.trim()).filter(s => /^\d+h$/.test(s));
}

function findIndex(header, predicate) {
  for (let i = 0; i < header.length; i++) {
    if (predicate(String(header[i] || ''))) return i;
  }
  return -1;
}

function sortByDate(a, b) {
  const [da, ma] = a.split('/').map(Number);
  const [db, mb] = b.split('/').map(Number);
  return ma - mb || da - db;
}

function sortByHour(a, b) {
  return parseInt(a, 10) - parseInt(b, 10);
}
