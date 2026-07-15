// Adaptacao do Cria-evento-na-agenda.js para a Fase 3 (Entrevista com Coordena, 1x1).
// Roda em cima da aba "Horarios" da planilha "Entrevistas com Coordena - Alocacoes".
//
// REQUISITOS:
// 1) Ativar o servico avancado "Google Calendar API" no editor (Servicos + -> Google Calendar API).
// 2) Editar o manifesto appsscript.json (Configuracoes do projeto -> marcar
//    "Mostrar arquivo de manifesto appsscript.json") e incluir os oauthScopes
//    do arquivo appsscript.json que acompanha este script. O escopo novo e:
//      https://www.googleapis.com/auth/meetings.space.settings
//    Ele permite editar a configuracao do Meet (accessType) via Meet REST API.
//    Na proxima execucao o script vai pedir re-autorizacao.
//
// O QUE MUDOU: depois de criar/atualizar o evento, o script chama a Meet REST API
// e seta accessType = OPEN no espaco do Meet. Com isso QUALQUER pessoa com o link
// entra direto, sem precisar "pedir para participar" e sem depender de alguem
// com conta Poli/UFRJ aceitar. Nao precisa nem estar logado numa conta Google.
//
// Colunas esperadas (linhas 1-3 sao cabecalho, dados a partir da linha 4):
//   B  Dia
//   C  Horario
//   D  Coordena  - Nome
//   E  Coordena  - Email
//   F  Observador - Nome
//   G  Observador - Email
//   H  Candidato - Nome
//   I  Candidato - Numero
//   J  Candidato - Coordenacao
//   K  Status do evento    (Atualizar / Deletar)
//   L  ID do evento        (preenchido apos criar/atualizar)
//   M  Mensagem enviada
//   N  Candidato confirmado
//   O  Entrevista ocorreu
//   P  Candidato - Email   (usado para adicionar o candidato como convidado)

const CAL_ID = "8eb0b6a9bea03527a7b8070510d4cc3c9aa941a577a598d599dc84f8e2e0796d@group.calendar.google.com";
const TZ = "America/Sao_Paulo";

function onOpen(e){
  try {
    SpreadsheetApp.getUi()
      .createMenu("Agenda")
      .addItem("Jogar entrevistas na agenda","envioAgendaEntrevistas")
      .addToUi();
  } catch(err){
    Logger.log("onOpen sem UI disponivel: " + err);
  }
}

function combinarDataHora(data, hora) {
  return new Date(
    data.getFullYear(),
    data.getMonth(),
    data.getDate(),
    hora.getHours(),
    hora.getMinutes(),
    hora.getSeconds()
  );
}

// Extrai o codigo do Meet (ex: "abc-defg-hij") do evento.
// Logo apos o insert, o conferenceData pode demorar 1-2s pra consolidar,
// entao tem um retry com Events.get.
function obterMeetCode(event){
  let code = event && event.conferenceData && event.conferenceData.conferenceId;
  if (!code && event && event.id){
    Utilities.sleep(2000);
    try {
      const ev = Calendar.Events.get(CAL_ID, event.id);
      code = ev.conferenceData && ev.conferenceData.conferenceId;
    } catch(err){
      Logger.log("Nao consegui reler o evento pra pegar o Meet code: " + err);
    }
  }
  return code || "";
}

// Abre o acesso do Meet: accessType OPEN = qualquer pessoa com o link entra
// sem "knocking" (sem pedir para participar), independente de conta Google.
function abrirAcessoMeet(meetCode, linha){
  if (!meetCode){
    Logger.log("Linha " + linha + ": sem Meet code, acesso nao alterado.");
    return;
  }

  const token = ScriptApp.getOAuthToken();
  const headers = { Authorization: "Bearer " + token };

  // 1) GET pra resolver o nome canonico do space (spaces/{meetingCode} e um alias valido no GET)
  const getResp = UrlFetchApp.fetch(
    "https://meet.googleapis.com/v2/spaces/" + meetCode + "?fields=name,config",
    { headers: headers, muteHttpExceptions: true }
  );
  if (getResp.getResponseCode() !== 200){
    Logger.log("Linha " + linha + ": Meet GET falhou (" + getResp.getResponseCode() + "): " + getResp.getContentText());
    return;
  }

  const space = JSON.parse(getResp.getContentText());
  if (space.config && space.config.accessType === "OPEN"){
    return; // ja esta aberto, nada a fazer
  }

  // 2) PATCH no accessType
  const patchResp = UrlFetchApp.fetch(
    "https://meet.googleapis.com/v2/" + space.name + "?updateMask=config.accessType,config.entryPointAccess",
    {
      method: "patch",
      contentType: "application/json",
      headers: headers,
      payload: JSON.stringify({
        config: { accessType: "OPEN", entryPointAccess: "ALL" }
      }),
      muteHttpExceptions: true
    }
  );

  if (patchResp.getResponseCode() === 200){
    Logger.log("Linha " + linha + ": Meet " + meetCode + " aberto (accessType = OPEN).");
  } else {
    // 403 aqui geralmente = politica do admin do Workspace bloqueando acesso aberto
    Logger.log("Linha " + linha + ": Meet PATCH falhou (" + patchResp.getResponseCode() + "): " + patchResp.getContentText());
  }
}

function envioAgendaEntrevistas() {
  const sheet = SpreadsheetApp.getActive().getSheetByName("Horários");
  const values = sheet.getDataRange().getValues();

  const linkDoAnexo = "https://docs.google.com/spreadsheets/d/1hkuq8cE7vt1Luh3y0wT6mEjkcmyDn-uqOd1trWSIE0Y/edit?gid=342694246#gid=342694246";
  const linkDoCase  = "https://docs.google.com/document/d/1ZslWEw4cMyl_yNJ99FctMT8Ns9yzJKiCaygQaxjO68g/edit?usp=sharing";

  // Linhas 1-3 sao cabecalho, dados comecam em i=3 (linha 4).
  for (let i = 3; i < values.length; i++){
    const dia            = values[i][1];   // B
    const hora           = values[i][2];   // C
    const coordenaNome   = values[i][3];   // D
    const coordenaEmail  = values[i][4];   // E
    const observadorNome = values[i][5];   // F
    const observadorEmail= values[i][6];   // G
    const candidatoNome  = values[i][7];   // H
    const candidatoNum   = values[i][8];   // I
    const candidatoCoord = values[i][9];   // J
    const validation     = values[i][10];  // K
    const exists         = values[i][11];  // L
    const candidatoEmail = values[i][15];  // P

    if (validation === "Atualizar"){
      if (dia === "" || hora === "" || candidatoNome === "" || coordenaEmail === ""){
        Logger.log("Linha " + (i+1) + " incompleta - pulando.");
        continue;
      }

      const dateI = combinarDataHora(dia, hora);
      const dateF = new Date(dateI.getTime() + 60*60*1000); // 1h

      const attendees = [{ email: coordenaEmail }];
      if (observadorEmail) attendees.push({ email: observadorEmail });
      if (candidatoEmail)  attendees.push({ email: candidatoEmail });

      const descricao =
        (observadorNome ? "Observador(a): " + observadorNome + " (" + observadorEmail + ")\n" : "") +
        "\nCandidato(a): " + candidatoNome + "\n" +
        "Numero: " + candidatoNum + "\n" +
        "Coordenacao de interesse: " + candidatoCoord + "\n\n" +
        "Roteiro da dinamica: " + linkDoAnexo + "\n\n" +
        "Case base da entrevista: " + linkDoCase;

      const titulo = "Entrevista com Coordena - PAME";

      const eventBody = {
        summary: titulo,
        description: descricao,
        start: { dateTime: dateI.toISOString(), timeZone: TZ },
        end:   { dateTime: dateF.toISOString(), timeZone: TZ },
        attendees: attendees,
        guestsCanSeeOtherGuests: true,
        guestsCanInviteOthers: false
      };

      let event;
      let atualizou = false;

      if (exists){
        try {
          const existente = Calendar.Events.get(CAL_ID, exists);
          if (existente){
            // patch preserva conferenceData (Meet nao e recriado).
            event = Calendar.Events.patch(eventBody, CAL_ID, exists, { sendUpdates: "all" });
            atualizou = true;
            Logger.log("Evento atualizado: " + candidatoNome);
          }
        } catch(err){
          Logger.log("Falha ao atualizar (linha " + (i+1) + "): " + err + " - criando novo...");
        }
      }

      if (!atualizou){
        // Cria evento novo ja com Meet.
        eventBody.conferenceData = {
          createRequest: {
            requestId: Utilities.getUuid(),
            conferenceSolutionKey: { type: "hangoutsMeet" }
          }
        };
        event = Calendar.Events.insert(eventBody, CAL_ID, {
          conferenceDataVersion: 1,
          sendUpdates: "all"
        });
        sheet.getRange(i+1, 12).setValue(event.id); // coluna L
        Logger.log("Novo evento criado: " + candidatoNome + " (Meet: " + (event.hangoutLink || "-") + ")");
      }

      // Abre o Meet pra qualquer pessoa com o link (sem "pedir para participar").
      abrirAcessoMeet(obterMeetCode(event), i+1);

      sheet.getRange(i+1, 11).setValue("Atualizado"); // coluna K
    }

    else if (validation === "Deletar"){
      if (exists){
        try {
          Calendar.Events.remove(CAL_ID, exists, { sendUpdates: "all" });
        } catch(err){
          Logger.log("Evento ja nao existia na agenda (linha " + (i+1) + "): " + err);
        }
        sheet.getRange(i+1, 12).setValue(""); // limpa ID
        sheet.getRange(i+1, 11).setValue(""); // limpa Status
      }
    }
  }
}