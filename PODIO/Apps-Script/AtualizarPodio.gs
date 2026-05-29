// ============================================================
// SCRIPT 3 — Atualizar Podio ao editar a planilha
// Não roda sozinho — conecte-o como trigger 'Ao editar' instalável.
// ============================================================
const FIELD_ID_TITULO = 0;       // ← Cole o field_id do "Titulo" que veio do Script 2
const SHEET_NAME = "Página1";    // ← Nome exato da aba que dispara o envio
const COL_ITEM_ID = 1;           // Coluna A
const COL_VALOR = 2;             // Coluna B
const HEADER_ROWS = 1;           // Linhas de cabeçalho a pular

function aoEditarPlanilha(e) {
  const sheet = e.range.getSheet();
  if (sheet.getName() !== SHEET_NAME) return;

  const row = e.range.getRow();
  if (row <= HEADER_ROWS) return;

  const itemId = sheet.getRange(row, COL_ITEM_ID).getValue();
  const valor  = sheet.getRange(row, COL_VALOR).getValue();
  if (!itemId || valor === "" || valor === null) return;

  try {
    const token = getPodioToken();
    const url = "https://api.podio.com/item/" + itemId + "/value/" + FIELD_ID_TITULO;
    const payload = [{ value: String(valor) }];

    const resp = UrlFetchApp.fetch(url, {
      method: "put",
      contentType: "application/json",
      headers: { Authorization: "OAuth2 " + token },
      payload: JSON.stringify(payload),
      muteHttpExceptions: true
    });
    if (resp.getResponseCode() >= 300) throw new Error("Podio " + resp.getResponseCode() + ": " + resp.getContentText());
    Logger.log("✅ Item " + itemId + " atualizado com '" + valor + "' (linha " + row + ")");
  } catch (err) {
    Logger.log("❌ Linha " + row + ": " + err.message);
  }
}