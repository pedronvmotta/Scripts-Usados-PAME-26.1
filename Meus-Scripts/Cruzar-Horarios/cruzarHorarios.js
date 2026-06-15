function cruzarHorarios() {
  // =========================================================================
  // VALORES QUE VOCÊ DEVE ALTERAR PARA O SEU CASO ESPECÍFICO:
  // =========================================================================
  
  // 1. IDs das Planilhas Externas
  const ID_PLANILHA_CANDIDATOS = "11-_eB0OWeqFZb0kxLp3T81fO4mrHUIMNCYY-PEnCyhU";
  const ID_PLANILHA_MEMBROS     = "1V7tu2xC4IpVZu3h831c3T_dJ1OOJwpnrbgNChxsyZI0";
  
  // 2. Nomes exatos das abas dentro de cada uma dessas planilhas
  const NOME_ABA_CANDIDATOS = "Respostas ao formulário 1"; 
  const NOME_ABA_MEMBROS     = "Respostas ao formulário 1"; 
  
  // 3. Linha onde começam os dados de fato (pulando cabeçalhos)
  const LINHA_INICIAL = 3; 
  
  // =========================================================================

  // Mapeamento das colunas I a P (Coluna I é a 9ª, total de 8 colunas: I, J, K, L, M, N, O, P)
  const COLUNA_I = 9;
  const TOTAL_COLUNAS = 8;
  const formatoHorario = /^\d{1,2}h$/i; // Valida o formato "Xh"

  // Arrays para guardar as listas de horários extraídas
  let listaCandidatos = [];
  let listaMembros = [];

  // --- 1. LEITURA DOS HORÁRIOS DOS CANDIDATOS ---
  try {
    const ssCand = SpreadsheetApp.openById(ID_PLANILHA_CANDIDATOS);
    const abaCand = ssCand.getSheetByName(NOME_ABA_CANDIDATOS);
    
    if (abaCand) {
      const uLinha = abaCand.getLastRow();
      if (uLinha >= LINHA_INICIAL) {
        // Pega os nomes (assumindo coluna B/2 como exemplo, ajuste se necessário) e os horários em I:P
        const nomes = abaCand.getRange(LINHA_INICIAL, 2, uLinha - LINHA_INICIAL + 1, 1).getValues();
        const dadosHorarios = abaCand.getRange(LINHA_INICIAL, COLUNA_I, uLinha - LINHA_INICIAL + 1, TOTAL_COLUNAS).getValues();
        
        for (let i = 0; i < dadosHorarios.length; i++) {
          let nome = nomes[i][0];
          let horarios = [];
          for (let j = 0; j < dadosHorarios[i].length; j++) {
            let valor = String(dadosHorarios[i][j]).trim();
            if (valor && formatoHorario.test(valor)) horarios.push(valor);
          }
          if (nome && horarios.length > 0) {
            listaCandidatos.push({ nome: nome, horarios: horarios });
          }
        }
      }
    }
  } catch(e) {
    console.error("Erro ao ler Candidatos: " + e.message);
  }

  // --- 2. LEITURA DOS HORÁRIOS DOS MEMBROS ---
  try {
    const ssMemb = SpreadsheetApp.openById(ID_PLANILHA_MEMBROS);
    const abaMemb = ssMemb.getSheetByName(NOME_ABA_MEMBROS);
    
    if (abaMemb) {
      const uLinha = abaMemb.getLastRow();
      if (uLinha >= LINHA_INICIAL) {
        // Pega os nomes (assumindo coluna B/2 também) e os horários em I:P
        const nomes = abaMemb.getRange(LINHA_INICIAL, 2, uLinha - LINHA_INICIAL + 1, 1).getValues();
        const dadosHorarios = abaMemb.getRange(LINHA_INICIAL, COLUNA_I, uLinha - LINHA_INICIAL + 1, TOTAL_COLUNAS).getValues();
        
        for (let i = 0; i < dadosHorarios.length; i++) {
          let nome = nomes[i][0];
          let horarios = [];
          for (let j = 0; j < dadosHorarios[i].length; j++) {
            let valor = String(dadosHorarios[i][j]).trim();
            if (valor && formatoHorario.test(valor)) horarios.push(valor);
          }
          if (nome && horarios.length > 0) {
            listaMembros.push({ nome: nome, horarios: horarios });
          }
        }
      }
    }
  } catch(e) {
    console.error("Erro ao ler Membros: " + e.message);
  }

  // --- 3. CRUZAMENTO E RETORNO NO CONSOLE ---
  console.log("--- INICIANDO CRUZAMENTO DE HORÁRIOS ---");
  
  listaCandidatos.forEach(cand => {
    listaMembros.forEach(memb => {
      // Encontra a interseção de horários que batem ('Xh') entre o candidato e o membro
      let horariosBatem = cand.horarios.filter(h => memb.horarios.includes(h));
      
      if (horariosBatem.length > 0) {
        console.log(`[MATCH] Candidato: ${cand.nome} | Membro: ${memb.nome} | Horários compatíveis: [${horariosBatem.join(", ")}]`);
      }
    });
  });

  console.log("--- FIM DO CRUZAMENTO ---");
}