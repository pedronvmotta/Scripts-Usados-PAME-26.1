// ============================================================
// SCRIPT 1 — Descobrir o APP_ID do bd-candidatos
// Rode UMA vez. Pegue o número no log e cole no Script 2.
// ============================================================
const WORKSPACE_URL = "https://podio.com/fluxo-consultoria-2c2quifl81/pame-261";
const APP_SLUG = "bd-candidatos";

function descobrirAppID() {
  const token = getPodioToken();
  const authHeader = { Authorization: "OAuth2 " + token };

  // Workspace
  const spaceUrl = "https://api.podio.com/space/url?url=" + encodeURIComponent(WORKSPACE_URL);
  const spaceResp = UrlFetchApp.fetch(spaceUrl, { method: "get", headers: authHeader, muteHttpExceptions: true });
  const spaceData = JSON.parse(spaceResp.getContentText());
  if (!spaceData.space_id) { Logger.log("❌ Workspace não encontrado"); return; }

  // Apps do workspace
  const appsResp = UrlFetchApp.fetch("https://api.podio.com/app/space/" + spaceData.space_id + "/", {
    method: "get", headers: authHeader, muteHttpExceptions: true
  });
  const apps = JSON.parse(appsResp.getContentText());
  const appAlvo = apps.find(function(app) { return app.url_label === APP_SLUG; });

  if (!appAlvo) { Logger.log("❌ App '" + APP_SLUG + "' não encontrado."); return; }
  Logger.log("🎯 APP_ID do " + APP_SLUG + ": " + appAlvo.app_id);
}

// ============================================================
// HELPER COMPARTILHADO — usado pelos 3 scripts do projeto
// ============================================================
function getPodioToken() {
  const props = PropertiesService.getScriptProperties();
  const resp = UrlFetchApp.fetch("https://podio.com/oauth/token", {
    method: "post",
    contentType: "application/x-www-form-urlencoded",
    payload: {
      grant_type: "password",
      client_id: props.getProperty("CLIENT_ID"),
      client_secret: props.getProperty("CLIENT_SECRET"),
      username: props.getProperty("PODIO_EMAIL"),
      password: props.getProperty("PODIO_SENHA")
    },
    muteHttpExceptions: true
  });
  const data = JSON.parse(resp.getContentText());
  if (!data.access_token) throw new Error("Falha no token: " + resp.getContentText());
  return data.access_token;
}