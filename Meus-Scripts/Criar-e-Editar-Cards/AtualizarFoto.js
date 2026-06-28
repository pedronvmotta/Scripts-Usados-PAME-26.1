// ============================================================
// SCRIPT 5 — Atualizar "foto-do-candidato" em massa
// Lê (nome, URL da foto) de outra planilha, encontra o card
// correspondente no bd-candidatos pelo nome, baixa a imagem,
// faz upload no Podio e anexa ao campo.
// ============================================================

const CONFIG_FOTOS = {
  // Planilha das fotos - fit cultural - (pegue da URL: /spreadsheets/d/SPREADSHEET_ID/edit)
  SHEET_ID: "1BK7ySPkHfFdCwTxtrRlyM__yvHYYEriibuY1KP_ANRM",
  SHEET_NAME: "Respostas ao formulário 1",
  
  COL_NOME: 3,        // coluna com o nome completo (A=1, B=2...)
  COL_FOTO_URL: 5,    // coluna com o link da foto
  LINHA_INICIO: 2,    // 2 se a linha 1 for cabeçalho
  
  // external_id do campo "Nome Completo" no bd-candidatos
  // (confirme rodando o 2_descobrirIds.gs)
  NOME_EXTERNAL_ID: "titulo",
  
  FOTO_EXTERNAL_ID: "foto-do-candidato",
};

// ============================================================
// FUNÇÃO PRINCIPAL — rode esta
// ============================================================
function atualizarFotosNoPodio() {
  const token = getPodioToken();  // reaproveita o helper que já temos
  if (!token) { Logger.log("❌ Falha ao obter token."); return; }
  
  Logger.log("Buscando todos os items do bd-candidatos...");
  const mapaNomeItem = buscarMapaNomeItem_(token);
  Logger.log(`✅ ${Object.keys(mapaNomeItem).length} candidatos carregados.`);
  
  const sheet = SpreadsheetApp.openById(CONFIG_FOTOS.SHEET_ID)
                              .getSheetByName(CONFIG_FOTOS.SHEET_NAME);
  const ultimaLinha = sheet.getLastRow();
  const numLinhas = ultimaLinha - CONFIG_FOTOS.LINHA_INICIO + 1;
  const maxCol = Math.max(CONFIG_FOTOS.COL_NOME, CONFIG_FOTOS.COL_FOTO_URL);
  const dados = sheet.getRange(CONFIG_FOTOS.LINHA_INICIO, 1, numLinhas, maxCol).getValues();
  
  // Resume — onde paramos da última execução
  const props = PropertiesService.getScriptProperties();
  let inicio = parseInt(props.getProperty("FOTOS_RESUME_ROW")) || 0;
  Logger.log(`▶️ Iniciando do índice ${inicio} (linha ${inicio + CONFIG_FOTOS.LINHA_INICIO}).`);
  
  const naoEncontrados = [];
  let sucessos = 0;
  
  for (let i = inicio; i < dados.length; i++) {
    const linha = dados[i];
    const nome = String(linha[CONFIG_FOTOS.COL_NOME - 1] || "").trim();
    const fotoUrl = String(linha[CONFIG_FOTOS.COL_FOTO_URL - 1] || "").trim();
    
    if (!nome || !fotoUrl) {
      Logger.log(`⚠️ Linha ${i + CONFIG_FOTOS.LINHA_INICIO}: dados incompletos, pulando.`);
      props.setProperty("FOTOS_RESUME_ROW", String(i + 1));
      continue;
    }
    
    const itemId = mapaNomeItem[normalizarNome_(nome)];
    if (!itemId) {
      Logger.log(`❌ "${nome}" não encontrado no Podio.`);
      naoEncontrados.push(nome);
      props.setProperty("FOTOS_RESUME_ROW", String(i + 1));
      continue;
    }
    
    try {
      const blob = obterBlobDeFoto_(fotoUrl, nome);
      const fileId = uploadParaPodio_(blob, token);
      atualizarCampoFoto_(itemId, fileId, token);
      Logger.log(`✅ ${nome} → item ${itemId}`);
      sucessos++;
      props.setProperty("FOTOS_RESUME_ROW", String(i + 1));
      Utilities.sleep(400);  // suaviza rate limit
    } catch (e) {
      const msg = String(e.message);
      Logger.log(`💥 ${nome}: ${msg}`);
      
      // Em caso de rate limit, NÃO avança o resume — para aqui
      if (msg.includes("420") || msg.toLowerCase().includes("rate")) {
        Logger.log("⏸️ Rate limit. Rode de novo em alguns minutos — o resume preserva o progresso.");
        return;
      }
      // Para outros erros, avança (para não travar para sempre na mesma linha)
      props.setProperty("FOTOS_RESUME_ROW", String(i + 1));
    }
  }
  
  Logger.log("============================");
  Logger.log(`✅ Sucessos: ${sucessos}`);
  Logger.log(`❌ Não encontrados: ${naoEncontrados.length}`);
  naoEncontrados.forEach(n => Logger.log(`   - ${n}`));
}

function resetarResumeFotos() {
  PropertiesService.getScriptProperties().deleteProperty("FOTOS_RESUME_ROW");
  Logger.log("✅ Resume zerado.");
}

// ============================================================
// HELPERS
// ============================================================

function normalizarNome_(nome) {
  return String(nome)
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")   // remove acentos
    .replace(/\s+/g, " ")              // colapsa espaços
    .trim();
}

function buscarMapaNomeItem_(token) {
  const mapa = {};
  let offset = 0;
  const limit = 100;
  
  while (true) {
    const url = `https://api.podio.com/item/app/${APP_ID}/filter/`;
    const resp = UrlFetchApp.fetch(url, {
      method: "post",
      contentType: "application/json",
      headers: { Authorization: "OAuth2 " + token },
      payload: JSON.stringify({ limit, offset, sort_by: "created_on" }),
      muteHttpExceptions: true,
    });
    
    if (resp.getResponseCode() !== 200) {
      throw new Error(`Falha buscar items: ${resp.getResponseCode()} - ${resp.getContentText()}`);
    }
    
    const items = JSON.parse(resp.getContentText()).items || [];
    items.forEach(item => {
      const campoNome = (item.fields || []).find(f => f.external_id === CONFIG_FOTOS.NOME_EXTERNAL_ID);
      if (campoNome?.values?.[0]?.value) {
        mapa[normalizarNome_(campoNome.values[0].value)] = item.item_id;
      }
    });
    
    if (items.length < limit) break;
    offset += limit;
  }
  
  return mapa;
}

function obterBlobDeFoto_(url, nomeArquivo) {
  // Caso especial: link do Google Drive — usar DriveApp direto
  if (url.includes("drive.google.com")) {
    const match = url.match(/[-\w]{25,}/);
    if (!match) throw new Error("URL do Drive sem ID identificável.");
    const blob = DriveApp.getFileById(match[0]).getBlob();
    const ext = (blob.getContentType().split("/")[1] || "jpg").split("+")[0];
    blob.setName(`${nomeArquivo}.${ext}`);
    return blob;
  }
  
  // URL pública qualquer
  const resp = UrlFetchApp.fetch(url, { muteHttpExceptions: true });
  if (resp.getResponseCode() >= 300) {
    throw new Error(`Falha ao baixar foto: ${resp.getResponseCode()}`);
  }
  const blob = resp.getBlob();
  const ext = (blob.getContentType().split("/")[1] || "jpg").split("+")[0];
  blob.setName(`${nomeArquivo}.${ext}`);
  return blob;
}

function uploadParaPodio_(blob, token) {
  const resp = UrlFetchApp.fetch("https://api.podio.com/file/v2/", {
    method: "post",
    headers: { Authorization: "OAuth2 " + token },
    payload: { source: blob, filename: blob.getName() },
    muteHttpExceptions: true,
  });
  
  if (resp.getResponseCode() !== 200) {
    throw new Error(`Upload falhou: ${resp.getResponseCode()} - ${resp.getContentText()}`);
  }
  return JSON.parse(resp.getContentText()).file_id;
}

function atualizarCampoFoto_(itemId, fileId, token) {
  const url = `https://api.podio.com/item/${itemId}/value/${CONFIG_FOTOS.FOTO_EXTERNAL_ID}/`;
  const resp = UrlFetchApp.fetch(url, {
    method: "put",
    contentType: "application/json",
    headers: { Authorization: "OAuth2 " + token },
    payload: JSON.stringify([{ value: fileId }]),
    muteHttpExceptions: true,
  });
  
  if (resp.getResponseCode() >= 300) {
    throw new Error(`PUT falhou: ${resp.getResponseCode()} - ${resp.getContentText()}`);
  }
}