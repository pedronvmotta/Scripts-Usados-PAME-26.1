// ============================================================
// SCRIPT 2 — Descobrir field_id do "Titulo" e item_ids existentes
// Antes de rodar, cole o APP_ID abaixo.
// ============================================================
const APP_ID = 0; // ← Cole aqui o APP_ID que veio do Script 1

function descobrirCamposEItems() {
  const token = getPodioToken();
  const authHeader = { Authorization: "OAuth2 " + token };

  // Parte 1: campos do app (label + field_id + tipo)
  Logger.log("=== CAMPOS DO APP ===");
  const appResp = UrlFetchApp.fetch("https://api.podio.com/app/" + APP_ID, {
    method: "get", headers: authHeader, muteHttpExceptions: true
  });
  const app = JSON.parse(appResp.getContentText());
  app.fields.forEach(function(field) {
    Logger.log("  label: '" + field.label + "' | field_id: " + field.field_id + " | type: " + field.type);
  });

  // Parte 2: items existentes (item_id + título)
  Logger.log("\n=== ITEMS EXISTENTES ===");
  const itemsResp = UrlFetchApp.fetch("https://api.podio.com/item/app/" + APP_ID + "/filter/", {
    method: "post",
    contentType: "application/json",
    headers: authHeader,
    payload: JSON.stringify({ limit: 100 }),
    muteHttpExceptions: true
  });
  const data = JSON.parse(itemsResp.getContentText());
  Logger.log("Total: " + data.total + " | mostrando " + data.items.length);
  data.items.forEach(function(item) {
    Logger.log("  item_id: " + item.item_id + " | título atual: '" + item.title + "'");
  });
}