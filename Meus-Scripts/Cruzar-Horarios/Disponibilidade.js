const ID_PLANILHA = '1GZUpr-DgaktUIc060NSuHw_nWt2qkNUPG6-P3nN-oQM';
const ABA_DESTINO = 'Disponibilidade';

function aoAbrir(){
  const ui = SpreadsheetApp.getUi()
  const menu = ui.createMenu('Disponibilidade')
  menu
  .addItem('Atualizar aba disponibilidade', 'gerarDisponibilidade')
  .addToUi()
}

function gerarDisponibilidade() {
  const ss = SpreadsheetApp.openById(ID_PLANILHA);
  const abaFonte = ss.getSheets()[0];
  const rows = abaFonte.getDataRange().getValues();
  if (rows.length < 2) throw new Error('Aba de origem vazia');

  const header = rows[0].map(h => String(h || '').trim());
  const idxCand = header.indexOf('Candidato');
  const idxDia = header.indexOf('Dia');
  const idxHora = header.indexOf('Horário');
  const idxMembro = header.indexOf('Membro');
  const idxCargo = header.indexOf('Cargo');

  if (idxCand < 0 || idxDia < 0 || idxHora < 0 || idxMembro < 0) {
    throw new Error('Cabeçalho não tem Candidato/Dia/Horário/Membro');
  }

  const grupos = new Map();
  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const cand = String(row[idxCand] || '').trim();
    const dia = String(row[idxDia] || '').trim();
    const hora = String(row[idxHora] || '').trim();
    const membro = String(row[idxMembro] || '').trim();
    const cargo = idxCargo >= 0 ? String(row[idxCargo] || '').trim() : '';
    if (!cand || !dia || !hora || !membro) continue;
    const key = cand + '|' + dia + '|' + hora;
    if (!grupos.has(key)) grupos.set(key, { cand, dia, hora, membros: [] });
    grupos.get(key).membros.push(cargo ? `${membro} (${cargo})` : membro);
  }

  const arr = [...grupos.values()].sort((a, b) => {
    let cmp = a.cand.localeCompare(b.cand, 'pt-BR');
    if (cmp !== 0) return cmp;
    const [da, ma] = a.dia.split('/').map(Number);
    const [db, mb] = b.dia.split('/').map(Number);
    cmp = (ma - mb) || (da - db);
    if (cmp !== 0) return cmp;
    return parseInt(a.hora, 10) - parseInt(b.hora, 10);
  });

  const outRows = [['Candidato', 'Dia', 'Horário', 'Membros disponíveis']];
  for (const g of arr) {
    outRows.push([g.cand, g.dia, g.hora, g.membros.join(', ')]);
  }

  let abaDest = ss.getSheetByName(ABA_DESTINO);
  if (!abaDest) abaDest = ss.insertSheet(ABA_DESTINO);
  abaDest.clearContents();
  abaDest.getRange(1, 1, outRows.length, outRows[0].length).setValues(outRows);
  abaDest.setFrozenRows(1);

  ss.toast(
    `${arr.length} blocos (candidato × dia × horário) em "${ABA_DESTINO}"`,
    'gerarDisponibilidade concluído',
    8
  );
}
