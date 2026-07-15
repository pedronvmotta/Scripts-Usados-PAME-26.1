// Adaptacao do Cria-evento-na-agenda.js para a Fase 3 (Entrevista com Coordena, 1x1).
// Roda em cima da aba "Horarios" da planilha "Entrevistas com Coordena - Alocacoes".
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

function onOpen(e){
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("Agenda").addItem("Jogar entrevistas na agenda","envioAgendaEntrevistas").addToUi();
}

function combinarDataHora(data, hora) {
  const dataFinal = new Date(
    data.getFullYear(),
    data.getMonth(),
    data.getDate(),
    hora.getHours(),
    hora.getMinutes(),
    hora.getSeconds()
  );
  return dataFinal;
}

function envioAgendaEntrevistas() {
  const sheet = SpreadsheetApp.getActive().getSheetByName("Horários");
  const calendar = CalendarApp.getCalendarById("8eb0b6a9bea03527a7b8070510d4cc3c9aa941a577a598d599dc84f8e2e0796d@group.calendar.google.com");

  if (!calendar) {
    SpreadsheetApp.getUi().alert("Erro: Não foi possível acessar a agenda. Verifique o ID ou permissões.");
    return;
  }

  // Link do roteiro da entrevista (trocar depois se tiver um documento proprio)

  const values = sheet.getDataRange().getValues();

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
    const linkDoAnexo = "https://docs.google.com/spreadsheets/d/1hkuq8cE7vt1Luh3y0wT6mEjkcmyDn-uqOd1trWSIE0Y/edit?gid=342694246#gid=342694246"
    const linkDoCase = "https://docs.google.com/document/d/1ZslWEw4cMyl_yNJ99FctMT8Ns9yzJKiCaygQaxjO68g/edit?usp=sharing"

    if (validation == "Atualizar"){
      if (dia === "" || hora === "" || candidatoNome === "" || coordenaEmail === ""){
        Logger.log("Linha " + (i+1) + " incompleta - pulando.");
        continue;
      }

      const dateI = combinarDataHora(dia, hora);
      const dateF = new Date(dateI.getTime() + 60*60*1000); // 1h de duracao

      // Guests: Coordena obrigatorio; Observador se preenchido.
      const guestsArr = [coordenaEmail];
      if (observadorEmail && observadorEmail !== "") guestsArr.push(observadorEmail);
      const listaConvidados = guestsArr.join(",");

      const txtDescricao =
        (observadorNome ? "Observador(a): " + observadorNome + " (" + observadorEmail + ")\n" : "") +
        "\nCandidato(a): " + candidatoNome + "\n" +
        "Numero: " + candidatoNum + "\n" +
        "Coordenacao de interesse: " + candidatoCoord + "\n\n" + `Roteiro da dinâmica: ${linkDoAnexo}` + "\n\n"
        + `Case base da entrevista: ${linkDoCase}`;

      const tituloEvento = "Entrevista com Coordena - PAME ";

      let event;
      let eventAltered = false;

      // Se ja existe um ID, tenta atualizar em vez de criar novo.
      if (exists != ""){
        try {
          event = calendar.getEventById(exists);
          if (event){
            event.setTitle(tituloEvento);
            event.setTime(dateI, dateF);
            event.setDescription(txtDescricao);
            eventAltered = true;
            Logger.log("Evento atualizado: " + candidatoNome);
          }
        } catch(e){
          Logger.log("Falha ao atualizar (linha " + (i+1) + "). Criando novo...");
        }
      }

      if (!eventAltered){
        event = calendar.createEvent(
          tituloEvento,
          dateI,
          dateF,
          {
            description: txtDescricao,
            guests: listaConvidados
          }
        );
        sheet.getRange(i+1, 12).setValue(event.getId()); // coluna L (ID do evento)
        Logger.log("Novo evento criado: " + candidatoNome);
      }

      sheet.getRange(i+1, 11).setValue("Atualizado"); // coluna K (Status)
    }

    else if (validation == "Deletar"){
      if (exists != ''){
        try {
          const eventOld = calendar.getEventById(exists);
          if (eventOld){
            eventOld.deleteEvent();
          }
        } catch(e){
          Logger.log("Evento ja nao existia na agenda (linha " + (i+1) + ")");
        }

        sheet.getRange(i+1, 12).setValue(""); // limpa ID do evento
        sheet.getRange(i+1, 11).setValue(""); // limpa Status
        // Nao apago Coordena / Observador / Candidato aqui - se quiser reaproveitar a linha,
        // basta reeditar e mudar Status para "Atualizar".
      }
    }
  }
}
