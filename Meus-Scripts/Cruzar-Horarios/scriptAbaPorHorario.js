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
    if (candList.length === 0 || memList.length === 0) continue;
    const candNames = candList.map(c => c.name).join(', ');
    memList.forEach((m, i) => {
      novasLinhas.push([slot.day, slot.hour, i === 0 ? candNames : '', m.name, m.extra, m.email]);
    });
  }

  let abaSaida = ssSaida.getSheetByName(ABA_POR_HORARIO);
  if (!abaSaida) abaSaida = ssSaida.insertSheet(ABA_POR_HORARIO);

  abaSaida.clearContents();
  const tudo = [HEADER, ...novasLinhas];

  const maxAtual = abaSaida.getMaxRows();
  if (tudo.length > maxAtual) {
    abaSaida.insertRowsAfter(maxAtual, tudo.length - maxAtual);
  }

  abaSaida.getRange(1, 1, tudo.length, HEADER.length).setValues(tudo);
  if (novasLinhas.length > 0) {
    formatarTextoPorHorario(abaSaida, 2, novasLinhas.length);
  }
  abaSaida.setFrozenRows(1);

  ssSaida.toast(
    `${novasLinhas.length} linhas escritas em "${ABA_POR_HORARIO}"`,
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

