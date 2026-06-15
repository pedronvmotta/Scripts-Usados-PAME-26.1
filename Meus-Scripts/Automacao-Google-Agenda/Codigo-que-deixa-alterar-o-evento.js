function onOpen(e){
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("Executar").addItem("Criar/Atualizar eventos","envioAgenda").addToUi();
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
      let dateI = combinarDataHora(dia, hora);
      let dateF = new Date(dateI.getTime() + 60*60*1000); // 1 hora de duração
      let txtDescricao = `Dinâmica marcada com: ${email1}  ${email2}  ${email3}`;
      let listaConvidados = `${email1},${email2},${email3}`;
      
      let event;
      let eventAltered = false;

      // Se a ID do evento já existe na planilha, tenta buscar e atualizar
      if (exists != "") {
        try {
          event = calendar.getEventById(exists);
          if (event) {
            // Modifica o evento existente em vez de deletar
            event.setTime(dateI, dateF);
            event.setDescription(txtDescricao);
            eventAltered = true;
            Logger.log("Evento atualizado com sucesso");
          }
        } catch(e) {
          Logger.log("Erro ao tentar atualizar. Criando um novo");
        }
      }    
    else if (validation == "Deletar"){
      if (exists != "") {
        try {
          let eventOld = calendar.getEventById(exists);
          if (eventOld) {
            eventOld.deleteEvent();
          }
        } catch(e) {
          Logger.log("Erro: Evento já não existia na agenda.");
        }
      }
      // Limpa os campos da planilha após deletar
      sheet.getRange(i+1, 11).setValue("");
      sheet.getRange(i+1, 10).setValue("");
      sheet.getRange(i+1, 8).setValue("");
      sheet.getRange(i+1, 6).setValue("");
      sheet.getRange(i+1, 4).setValue("");
    }
    
    else {
      continue;
    }
  }
}

}