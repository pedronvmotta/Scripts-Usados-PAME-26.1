// ============================================================
// SCRIPT 4 — Carga inicial em massa, com retomada automática
// Rode MANUALMENTE pelo botão ▶️ no editor (selecione importarEmMassa).
// Reusa montarFields() e criarItem() do Script 3.
// ============================================================
function importarEmMassa() {
  const INICIO = Date.now();
  const LIMITE_MS = 5 * 60 * 1000; // sai antes dos 6 min do Apps Script

  const sheet = SpreadsheetApp.getActive().getSheetByName(SHEET_NAME);
  if (!sheet) { Logger.log("Aba '" + SHEET_NAME + "' não existe."); return; }

  const ultimaLinha = sheet.getLastRow();
  if (ultimaLinha <= HEADER_ROWS) { Logger.log("Sem dados a processar."); return; }

  // Resume: se rodada anterior parou no meio, retoma de onde estava
  const props = PropertiesService.getScriptProperties();
  const linhaInicial = Number(props.getProperty("BULK_RESUME_ROW")) || (HEADER_ROWS + 1);
  Logger.log("Iniciando em linha " + linhaInicial + " até " + ultimaLinha);

  const token = getPodioToken();
  let criados = 0, pulados = 0, erros = 0;

  for (let row = linhaInicial; row <= ultimaLinha; row++) {
    // Marca o ponto antes de cada chamada — se travar, retomamos daqui
    props.setProperty("BULK_RESUME_ROW", String(row));

    // Sai antes do timeout pra evitar corte abrupto
    if (Date.now() - INICIO > LIMITE_MS) {
      Logger.log("Pausando em linha " + row + ". Rode de novo pra continuar.");
      Logger.log("   Parcial: criados=" + criados + ", pulados=" + pulados + ", erros=" + erros);
      return;
    }

    const itemId = sheet.getRange(row, COL_ITEM_ID).getValue();
    if (itemId) { pulados++; continue; } // já tem id → não recria

    const fields = montarFields(sheet, row);
    if (Object.keys(fields).length === 0) { pulados++; continue; } // linha vazia

    try {
      const novoItemId = criarItem(fields, token);
      sheet.getRange(row, COL_ITEM_ID).setValue(novoItemId);
      criados++;
    } catch (err) {
      Logger.log("Linha " + row + ": " + err.message);
      erros++;
    }

    Utilities.sleep(100); // throttle leve
  }

  props.deleteProperty("BULK_RESUME_ROW");
  Logger.log("✅ Concluído. criados=" + criados + " | pulados=" + pulados + " | erros=" + erros);
}

// Use pra forçar começar do zero (limpa o marcador de resume)
function resetarResume() {
  PropertiesService.getScriptProperties().deleteProperty("BULK_RESUME_ROW");
  Logger.log("Marcador limpo. Próxima execução começa do início.");
}