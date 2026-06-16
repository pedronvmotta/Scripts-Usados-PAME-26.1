const ABA_POR_HORARIO = 'Mapeamento por horário';

function cruzarHorariosPrincipal() {
  const abaMembros = SpreadsheetApp.openById(ID_MEMBROS).getSheets()[0];
  const abaCandidatos = SpreadsheetApp.openById(ID_CANDIDATOS).getSheets()[0];
  const ssSaida = SpreadsheetApp.openById(ID_SAIDA);

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

  const HEADER = ['Data', 'Horário', 'Candidato', 'Membro', 'Cargo', 'Email do membro'];

  const slots = new Map();
  for (const cand of candidatos.values()) {
    for (const [day, hoursSet] of cand.slots.entries()) {
      for (const hour of hoursSet) {
        const key = `${day}|${hour}`;
        if (!slots.has(key)) slots.set(key, { day, hour, candidatos: [], membros: [] });
        slots.get(key).candidatos.push(cand);
      }
    }
  }
  for (const m of membros.values()) {
    for (const [day, hoursSet] of m.slots.entries()) {
      for (const hour of hoursSet) {
        const key = `${day}|${hour}`;
        if (!slots.has(key)) continue;
        slots.get(key).membros.push(m);
      }
    }
  }

  const slotsOrdenados = [...slots.values()].sort((a, b) => {
    return sortByDate(a.day, b.day) || sortByHour(a.hour, b.hour);
  });

  const novasLinhas = [];
  for (const slot of slotsOrdenados) {
    const candList = slot.candidatos.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    const memList = slot.membros.sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'));
    for (const cand of candList) {
      for (const m of memList) {
        novasLinhas.push([slot.day, slot.hour, cand.name, m.name, m.extra, m.email]);
      }
    }
  }

  let abaSaida = ssSaida.getSheetByName(ABA_POR_HORARIO);
  if (!abaSaida) abaSaida = ssSaida.insertSheet(ABA_POR_HORARIO);

  const existentes = lerChavesPorHorario(abaSaida);
  const paraAdicionar = novasLinhas.filter(
    r => !existentes.chaves.has(`${r[0]}|${r[1]}|${r[2]}|${r[3]}`)
  );

  if (!existentes.temHeader) {
    const tudo = [HEADER, ...paraAdicionar];
    if (paraAdicionar.length > 0) {
      formatarTextoPorHorario(abaSaida, 2, paraAdicionar.length);
    }
    abaSaida.getRange(1, 1, tudo.length, HEADER.length).setValues(tudo);
    abaSaida.setFrozenRows(1);
  } else if (paraAdicionar.length > 0) {
    const startRow = abaSaida.getLastRow() + 1;
    formatarTextoPorHorario(abaSaida, startRow, paraAdicionar.length);
    abaSaida.getRange(startRow, 1, paraAdicionar.length, HEADER.length).setValues(paraAdicionar);
  }

  ssSaida.toast(
    `+${paraAdicionar.length} novos | total na aba: ${existentes.chaves.size + paraAdicionar.length}`,
    'cruzarHorariosPorSlot concluído',
    8
  );
}

function formatarTextoPorHorario(aba, startRow, numRows) {
  try {
    aba.getRange(startRow, 1, numRows, 2).setNumberFormat('@');
  } catch (e) {
    // Se a coluna tiver tipo definido no Sheets, o setNumberFormat é bloqueado — ignoramos.
  }
}

function lerChavesPorHorario(aba) {
  const dados = aba.getDataRange().getValues();
  const chaves = new Set();
  if (dados.length === 0 || String(dados[0][0] || '').trim() !== 'Data') {
    return { chaves, temHeader: false };
  }
  const hdr = dados[0].map(h => String(h || '').trim());
  const iDia = hdr.indexOf('Data');
  const iHora = hdr.indexOf('Horário');
  const iCand = hdr.indexOf('Candidato');
  const iMembro = hdr.indexOf('Membro');
  for (let r = 1; r < dados.length; r++) {
    const row = dados[r];
    const dia = normalizarDia(row[iDia]);
    const hora = normalizarHora(row[iHora]);
    const cand = String(row[iCand] || '').trim();
    const membro = String(row[iMembro] || '').trim();
    if (!dia && !hora && !cand && !membro) continue;
    chaves.add(`${dia}|${hora}|${cand}|${membro}`);
  }
  return { chaves, temHeader: true };
}
