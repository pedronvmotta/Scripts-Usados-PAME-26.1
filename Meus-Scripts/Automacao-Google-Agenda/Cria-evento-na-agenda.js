function onOpen(e){
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("Executar").addItem("Jogar na agenda dos membros","envioAgenda").addToUi();
}

function lerCandidato(dia, hora){
  const abaCandidatos = SpreadsheetApp.getActive().getSheetByName("Alocação - Candidatos");
  const valoresCandidatos = abaCandidatos.getDataRange().getValues();

  const colunasNomes = [4, 9, 14, 19]; // E, J, O, T
  const alvo = combinarDataHora(dia, hora).getTime(); // momento que estamos procurando

  const nomes = [];

  for (let i = 3; i < valoresCandidatos.length; i++){
    const dataAloc = valoresCandidatos[i][2]; // coluna C
    const horaAloc = valoresCandidatos[i][3]; // coluna D

    if (dataAloc === "" || horaAloc === "") continue; // pula linhas vazias

    const momentoAloc = combinarDataHora(dataAloc, horaAloc).getTime();

    if (momentoAloc === alvo){
      for (const col of colunasNomes){
        const nome = valoresCandidatos[i][col];
        if (nome !== "" && nome != null){
          nomes.push(nome);
        }
      }
    }
  }

  return nomes.join("\n");
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

function envioAgenda() {
  const sheet = SpreadsheetApp.getActive().getSheetByName("Horários");
  const calendar = CalendarApp.getCalendarById("8eb0b6a9bea03527a7b8070510d4cc3c9aa941a577a598d599dc84f8e2e0796d@group.calendar.google.com");
  
  if (!calendar) {
    SpreadsheetApp.getUi().alert("Erro: Não foi possível acessar a agenda. Verifique o ID ou permissões.");
    return;
  }

  // Insira aqui a URL completa de compartilhamento do seu arquivo do Google Drive
  const linkDoAnexo = "https://docs.google.com/document/d/1I6LL7TS5jK20xWNE5glWrO9Ln3eBDftfzjuu_ow1_Pg/edit?tab=t.0";

  let values = sheet.getDataRange().getValues();
  
  for (let i = 3; i < values.length; i++){
    let dia = values[i][1];
    let hora = values[i][2];
    let email1 = values[i][4];
    let email2 = values[i][6];
    let email3 = values[i][8];
    let validation = values[i][9];
    let exists = values[i][10];
    
    if (validation == "Atualizar"){
      let candidatos = lerCandidato(dia, hora);   // <-- aqui, por evento
      let dateI = combinarDataHora(dia, hora);
      let dateF = new Date(dateI.getTime() + 60*60*1000);
      
      // Tratamento original das strings de e-mail e descrição
      let listaConvidados = `${email1},${email2},${email3}`;
      let txtDescricao = `Dinâmica marcada com ${email1}, ${email2}, ${email3}` + "\n\n" +
                         `Candidatos:` + "\n" + candidatos + "\n\n" +
                         `Roteiro da dinâmica: ${linkDoAnexo}`;

      let event;
      let eventAltered = false;

      // Se o ID do evento já existe na planilha, ele vai buscar e atualizar sem deletar
      if (exists != ""){
        try {
          event = calendar.getEventById(exists);
          if (event){
            event.setTime(dateI, dateF);
            event.setDescription(txtDescricao);
            eventAltered = true;
            Logger.log("Evento atualizado com sucesso");
          }
        } catch(e){
          Logger.log("Erro ao tentar atualizar. Criando um novo...");
        }
      }

      // Se não existia ou se o bloco de atualizar falhou, cria um novo do zero
      if (!eventAltered){
        event = calendar.createEvent(
          "Dinâmica em grupo - PAME",
          dateI,
          dateF,
          {
            description: txtDescricao,
            guests: listaConvidados
          }
        );
        sheet.getRange(i+1, 11).setValue(event.getId());
        Logger.log("Novo evento criado");
      }
      
      sheet.getRange(i+1, 10).setValue("Atualizado");
    }
    
    else if (validation == "Deletar"){
      if (exists != ''){
        try {
          let eventOld = calendar.getEventById(exists);  
          if (eventOld){
            eventOld.deleteEvent();
          }
        } catch(e){
          Logger.log("Evento já não existia na agenda");
        }
        
        sheet.getRange(i+1, 11).setValue("");
        sheet.getRange(i+1, 10).setValue("");
        sheet.getRange(i+1, 8).setValue("");
        sheet.getRange(i+1, 6).setValue("");
        sheet.getRange(i+1, 4).setValue("");
      } else {
        continue;
      }
    }
  }
}