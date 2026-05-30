// ============================================================
// SCRIPT 3 — Criar OU atualizar items do Podio ao editar a planilha
// Conecte como trigger 'Ao editar' (instalável).
// APP_ID já está declarado no Script 2 — compartilhado entre arquivos do projeto.
// ============================================================
const SHEET_NAME = "Página1";
const COL_ITEM_ID = 27;   // Coluna A — vazia = criar; preenchida = atualizar
const HEADER_ROWS = 1;

// 🔧 MAPEAMENTO COLUNA → external_id do campo no Podio
// Adicione/comente entradas conforme expandir a planilha.
// O número é o índice da coluna (A=1, B=2, C=3, …).
// Coluna da planilha → external_id no Podio
const FIELD_MAP = {
  2:  "email",                                          // B  → Email
  3:  "titulo",                                         // C  → Nome Completo (é o Title)
  4:  "nome-social",                                    // D
  5:  "cpf",                                            // E
  6:  "telefone",                                       // F  → Phone
  7:  "curso-na-ufrj",                                  // G
  8:  "periodo",                                        // H  → Number
  9:  "coordenacao-de-interesse",                       // I
  10: "como-ficou-sabendo-do-pame",                     // J
  11: "membro-que-indicou",                             // K
  12: "ja-participou-de-outro-pame",                    // L
  13: "identidade-de-genero",                           // M
  14: "pronomes",                                       // N
  15: "orientacao-sexual",                              // O
  16: "pcd",                                            // P
  17: "neuroatipicidade",                               // Q
  18: "autodeclaracao-racial",                          // R
  19: "entrou-por-cotas",                               // S
  20: "atividade-remunerada",                           // T
  21: "carga-horaria-se-exercer-atividade-remunerada",  // U
  22: "faz-parte-de-iniciativa-estudantil",             // V
  23: "em-quanto-tempo-pensa-em-procurar-estagio",      // W
  24: "tempo-que-pretende-ficar-na-fluxo",              // X
  25: "texto",                                          // Y  
  26: "quer-newsletter",                                // Z
};

const COL_ITEM_ID = 27;  // coluna AA — primeira livre após Z
const HEADER_ROWS = 1;

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
    Logger.log("Token falhou: " + err.message);
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
      Logger.log(" Linha " + row + ": item " + itemId + " atualizado → " + JSON.stringify(fields));
    } else {
      const novoItemId = criarItem(fields, token);
      sheet.getRange(row, COL_ITEM_ID).setValue(novoItemId);
      Logger.log("Linha " + row + ": item criado " + novoItemId + " → " + JSON.stringify(fields));
    }
  } catch (err) {
    Logger.log("Linha " + row + ": " + err.message);
  }
}

function montarFields(sheet, row) {
  const fields = {};
  for (const colStr in FIELD_MAP) {
    const col = Number(colStr);
    const externalId = FIELD_MAP[col];
    let valor = sheet.getRange(row, col).getValue();
    if (valor === "" || valor === null) continue;

    switch (externalId) {
      case "email":
        // Email exige array de objetos com tipo
        fields[externalId] = [{ value: String(valor).trim(), type: "work" }];
        break;

      case "telefone":
        // Phone exige array; tira tudo que não é dígito por segurança
        const numero = String(valor).replace(/\D/g, "");
        if (numero) fields[externalId] = [{ value: numero, type: "mobile" }];
        break;

      case "periodo":
        // Number exige número, não string
        const n = Number(valor);
        if (!isNaN(n)) fields[externalId] = n;
        break;

      default:
        // Demais campos: texto puro
        fields[externalId] = String(valor);
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