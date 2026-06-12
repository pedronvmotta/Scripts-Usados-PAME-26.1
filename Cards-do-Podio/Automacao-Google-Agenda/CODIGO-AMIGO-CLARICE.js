function onOpen(e){
  const ui = SpreadsheetApp.getUi();
  ui.createMenu("Executar").addItem("Criar/atualizar eventos","envioAgenda").addToUi();
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
  //Modificar o argumento "getSheetByName" para o nome da página com as informações
  const sheet = SpreadsheetApp.getActive().getSheetByName("Horários")
  //Modificar o id caso queira mudar a agenda
  const calendar = CalendarApp.getCalendarById("c_6226ef363550325a08cfcba0ef8ac1813346573dcb22a116bec613592ec188c7@group.calendar.google.com")
  values = sheet.getDataRange().getValues()
  for (let i = 3; i < values.length; i++){
    let dia = values[i][1]
    let hora = values[i][2]
    let email1 = values[i][4]
    let email2 = values[i][6]
    let email3 = values[i][8]
    let validation = values[i][9]
    let exists = values[i][10]
    if (validation == "Atualizar"){
      if (exists != ""){
        try{
          eventOld = calendar.getEventById(exists)
          eventOld.deleteEvent()
        } catch(e){
          Logger.log("Erro: Evento antigo já deletado")
        }
        
      }
      let dateI = combinarDataHora(dia,hora)
      let dateF = new Date(dateI.getTime() + 60*60*1000)
      let txtDescricao = `Dinâmica marcada com ${email1}, ${email2}, ${email3}`
      let listaConvidados = `${email1} ${email2} ${email3}`

      let event
      let eventAltered = false;

      // se o ID do evento já existe na planilha, ele vai buscar e atualizar 

      if(exists!=""){
        try{
          event = calendar.getEventById(exists)
          if(event){
            event.setTime(dateI, dateF)
            event.setDescription(txtDescricao)
            eventAltered = true
            Logger.log("Evento atualizado com sucesso" + exists)
          }
        }catch(e){
          console.log('Erro ao tentar atualizar. Criando um novo')
        }
      }

      if(!eventAltered){
        even = calendar.createEvent(
          "Dinâmica em grupo",
          dateI,
          dateF,
          {
            description: txtDescricao,
            guests: listaConvidados
          }
        );
        Logger.log('Novo evento criado')
      }
      sheet.getRange(i+1,10).setValue('Atualizado')
    }
    else if(validation == "Deletar"){
      if(exists!=''){
        try{
          let eventOld = calendar.getEventById(exists)  
          if(eventOld){
            eventOld.deleteEvent()
          }
        }catch(e){
          Logger.log("Evento já não existia na agenda")
        }
        sheet.getRange(i+1, 11).setValue("");
      sheet.getRange(i+1, 10).setValue("");
      sheet.getRange(i+1, 8).setValue("");
      sheet.getRange(i+1, 6).setValue("");
      sheet.getRange(i+1, 4).setValue("");
      }else{
        continue;
      }
      }
}
}