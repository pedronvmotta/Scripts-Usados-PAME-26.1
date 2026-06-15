  // ============================================================
  // SCRIPT 2 — Descobrir external_id dos campos + listar items existentes
  // Antes de rodar, cole o APP_ID abaixo.
  // ============================================================
const APP_ID = 0; // ← Cole aqui o número que veio do Script 1

function descobrirCamposEItems() {
  const token = getPodioToken();
  const authHeader = { Authorization: "OAuth2 " + token };

  // Parte 1: campos do app (use o external_id no FIELD_MAP do Script 3)
  Logger.log("=== CAMPOS DO APP ===");
  const appResp = UrlFetchApp.fetch("https://api.podio.com/app/" + APP_ID, {
    method: "get", headers: authHeader, muteHttpExceptions: true
  });
  const app = JSON.parse(appResp.getContentText());
  app.fields.forEach(function(field) {
    Logger.log(
      "  label: '" + field.label +
      "' | external_id: '" + field.external_id +
      "' | field_id: " + field.field_id +
      " | type: " + field.type
    );
  });

  // Parte 2: items existentes (item_id + título). Aumenta o limit se tiver mais items.
  Logger.log("\n=== ITEMS EXISTENTES ===");
  const itemsResp = UrlFetchApp.fetch("https://api.podio.com/item/app/" + APP_ID + "/filter/", {
    method: "post",
    contentType: "application/json",
    headers: authHeader,
    payload: JSON.stringify({ limit: 500 }), // máx por página: 500
    muteHttpExceptions: true
  });
  const data = JSON.parse(itemsResp.getContentText());
  Logger.log("Total no Podio: " + data.total + " | mostrando " + data.items.length);
  data.items.forEach(function(item) {
    Logger.log("  item_id: " + item.item_id + " | título: '" + item.title + "'");
  });

  if (data.total > data.items.length) {
    Logger.log("Tem mais items que o limite. Pagine com 'offset' se precisar.");
  }
}