// ============================================================
// SCRIPT 3 — Criar OU atualizar items do Podio ao editar a planilha
// Conecte como trigger 'Ao editar' (instalável).
// APP_ID já está declarado no Script 2 — compartilhado entre arquivos do projeto.
// ============================================================
const SHEET_NAME = "Página1";
const COL_ITEM_ID = 1;   // Coluna A — vazia = criar; preenchida = atualizar
const HEADER_ROWS = 1;

// 🔧 MAPEAMENTO COLUNA → external_id do campo no Podio
// Adicione/comente entradas conforme expandir a planilha.
// O número é o índice da coluna (A=1, B=2, C=3, …).
const FIELD_MAP = {
  2: "titulo",       // Coluna B → campo "Título"
  // 3: "email",     // Coluna C → campo "E-mail"
  // 4: "telefone",  // Coluna D → campo "Telefone"
  // 5: "cargo",     // Coluna E → campo "Cargo"
};

function aoEditarPlanilha(e) {
  const sheet = e.range.getSheet();
  if (sheet.getName() !== SHEET_NAME) return;

  // Evita loop: ignora edição que cobre SÓ a coluna A (é o próprio script gravando o item_id)
  if (e.range.getColumn() === COL_ITEM_ID && e.range.getLastColumn() === COL_ITEM_ID) return;

  const startRow = e.range.getRow();
  const numRows = e.range.getNumRows();

  // Pega o token UMA vez, mesmo se forem várias linhas (paste de várias linhas)
  let token;
  try {
    token = getPodioToken();
  } catch (err) {
    Logger.log("❌ Token falhou: " + err.message);
    return;
  }

  for (let row = startRow; row < startRow + numRows; row++) {
    if (row <= HEADER_ROWS) continue;
    processarLinha(sheet, row, token);
  }
}

function processarLinha(sheet, row, token) {
  const itemId = sheet.getRange(row, COL_ITEM_ID).getValue();
  const fields = montarFields(sheet, row);

  if (Object.keys(fields).length === 0) return; // nenhum valor a enviar

  try {
    if (itemId) {
      atualizarItem(itemId, fields, token);
      Logger.log("🔄 Linha " + row + ": item " + itemId + " atualizado → " + JSON.stringify(fields));
    } else {
      const novoItemId = criarItem(fields, token);
      sheet.getRange(row, COL_ITEM_ID).setValue(novoItemId);
      Logger.log("➕ Linha " + row + ": item criado " + novoItemId + " → " + JSON.stringify(fields));
    }
  } catch (err) {
    Logger.log("❌ Linha " + row + ": " + err.message);
  }
}

function montarFields(sheet, row) {
  const fields = {};
  for (const colStr in FIELD_MAP) {
    const col = Number(colStr);
    const valor = sheet.getRange(row, col).getValue();
    if (valor !== "" && valor !== null) {
      // ⚠️ Assume campo de TEXTO. Outros tipos precisam de formato diferente — veja notas.
      fields[FIELD_MAP[col]] = String(valor);
    }
  }
  return fields;
}

function criarItem(fields, token) {
  const url = "https://api.podio.com/item/app/" + APP_ID + "/";
  const resp = UrlFetchApp.fetch(url, {
    method: "post",
    contentType: "application/json",
    headers: { Authorization: "OAuth2 " + token },
    payload: JSON.stringify({ fields: fields }),
    muteHttpExceptions: true
  });
  if (resp.getResponseCode() >= 300) {
    throw new Error("Podio (create) " + resp.getResponseCode() + ": " + resp.getContentText());
  }
  return JSON.parse(resp.getContentText()).item_id;
}

function atualizarItem(itemId, fields, token) {
  const url = "https://api.podio.com/item/" + itemId;
  const resp = UrlFetchApp.fetch(url, {
    method: "put",
    contentType: "application/json",
    headers: { Authorization: "OAuth2 " + token },
    payload: JSON.stringify({ fields: fields }),
    muteHttpExceptions: true
  });
  if (resp.getResponseCode() >= 300) {
    throw new Error("Podio (update) " + resp.getResponseCode() + ": " + resp.getContentText());
  }
}