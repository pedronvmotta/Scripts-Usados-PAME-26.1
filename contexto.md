# Contexto do Projeto PAME

## Regras de montagem de grupo

- **Tamanho preferencial:** 4 candidatos por dinâmica.
- **Grupo de 3 é aceitável** quando não dá pra fechar 4 com não-alocados disponíveis (regra flexibilizada em 2026-06-25). Preferível alocar 3 do que deixar candidato de fora por rigidez.
- **5º candidato como exceção:** quando um candidato não-alocado tem disponibilidade num slot que já tem grupo cheio (4 candidatos), encaixar como 5º (planilha tem coluna `Candidato 5`). Usar para "salvar" candidatos que ficariam sem grupo formável. Validado em 2026-06-25.
- **Grupos paralelos:** é permitido ter mais de uma dinâmica no mesmo `Dia` + `Horário` (já existe em vários slots da planilha). Quando o slot já tiver um grupo cheio, criar nova linha para um 2º grupo paralelo se houver candidatos disponíveis.
- Ao sugerir candidatos para um slot, priorizar grupos de 4 não-alocados; aceitar 3 quando 4 não for viável; usar 5º como exceção pra encaixar candidatos órfãos. Cada candidato só pode estar em uma dinâmica.
- **Sempre listar alternativas:** ao sugerir um grupo para um slot, junto com a sugestão principal **sempre retornar a lista completa de outros candidatos que também podem nesse horário** (não-alocados disponíveis + remarcáveis), pra que o usuário possa trocar. Validado em 2026-06-25.
- **NUNCA marcar dinâmica direto na planilha sem validação prévia:** toda marcação de dinâmica (nova linha na planilha de Alocação, atualização do BD "Alocado em um horário", etc.) deve ser **proposta primeiro no terminal** e **aguardar OK explícito do usuário** antes de qualquer edição em planilha. Vale tanto para o `Alocação - Candidatos.csv` quanto para o `BD Candidatos.csv`. Validado em 2026-06-25.
- **Atenção a datas — não rotular slot de hoje/futuro como "ausência":** ao classificar candidatos como "remarcáveis" ou "ausentes", **sempre comparar com a data de hoje**. Um slot com `Vai?/Presente? = FALSE` só é ausência real se a data do slot já passou. Slots de **hoje** ou **futuro** com FALSE significam apenas "dinâmica ainda não rolou / status ainda não atualizado", NÃO ausência. Validado em 2026-06-25 (eu errei e marquei dinâmicas de 25/06 — hoje — como ausências quando elas só não tinham ocorrido ainda).

## Candidatos REPROVADOS — ignorar sempre

Os candidatos abaixo foram **reprovados na última etapa** (anterior à dinâmica em grupo). Foram **removidos do BD em 2026-06-25** e **não devem ser considerados para nenhuma alocação, contagem ou sugestão**:

- Antonio Bittencourt Correa
- Arthur Siqueira Paz Teixeira
- Carlos José Batista da Silva
- Gabriel Mendes De Lima Chagas
- Gustavo Faria Takama
- João Pedro Carvalho dos Santos
- Marisa Pires Coutinho Machado
- Rafael Britto Binder
- Victor Hugo Russo Cordeiro
- Vítor Fernandes de Carvalho Ambrizzi

Se algum desses nomes aparecer em alguma planilha ou input do usuário, tratar como "fora do processo" — não sugerir para grupo, não contar como pendente.

## BD Candidatos (pool de candidatos)

**Arquivo de referência (ATUAL):** `Meus-Scripts/Cruzar-Horarios/Alocações de Membros - Dinâmicas em grupo - BD Candidatos (1).csv`

> ⚠️ Mudança em 2026-06-25: o arquivo de referência agora tem sufixo `(1)`. O arquivo antigo (sem sufixo) foi substituído.
> - O BD (1) tem **141 candidatos** (registros lógicos, considerando que a entrada da Agatha tem mensagem multi-linha), **INCLUINDO os 10 reprovados** — continuar ignorando os 10 reprovados listados acima.
> - A coluna `Alocado em um horário` está **vazia para todos** no BD atual (não é mantida sincronizada com a planilha de Alocação). **Para descobrir se alguém está alocado, consultar a planilha de Alocação, NÃO esta coluna do BD.**

Esta planilha é o **pool oficial de candidatos**. Todos os nomes listados nela devem ser considerados candidatos do processo.

### Como usar como referência
- **Quem é candidato:** qualquer nome presente nesta planilha.
- **Já alocado:** verificar a coluna `Alocado em um horário` — se preenchida, o candidato já tem horário marcado.
- **Quantos faltam:** contar as linhas em que `Alocado em um horário` está vazio.
- **Status complementares:** as colunas `Mensagem enviada`, `Fez a dinâmica` e `Esta no BD podio` indicam o avanço de cada candidato no processo.

### Colunas da planilha
1. `Nome Completo`
2. `Alocado em um horário`
3. `Número` (telefone)
4. `Mensagem enviada`
5. `Fez a dinâmica`
6. `Esta no BD podio`

## Planilha de alocação (referência cruzada)

**Arquivo (ATUAL):** `Meus-Scripts/Cruzar-Horarios/Alocações de Membros - Dinâmicas em grupo - Alocação - Candidatos (1).csv`

> ⚠️ Mudança em 2026-06-25: o arquivo de alocação agora tem sufixo `(1)`. O arquivo antigo (sem sufixo) foi substituído.

Cada linha representa uma dinâmica em grupo (`Dia` + `Horario`) com até 5 candidatos (`Candidato 1` a `Candidato 5`). Um candidato está **alocado** quando seu nome aparece em qualquer uma dessas colunas.

## Planilha de disponibilidade (fonte da verdade para horários)

**Arquivo:** `Meus-Scripts/Cruzar-Horarios/Cruzamento de horários - Dinâmicas - Mapeamento por horário (3).csv`

Esta é a **base oficial para checar a disponibilidade de horários dos candidatos**. Sempre consultar este arquivo (e não as outras versões do mapeamento, nem os CSVs brutos do formulário) ao verificar se um candidato pode em determinado `Dia` + `Horário`.

Estrutura:
- `Data` (ex.: `26/06`)
- `Horário` (ex.: `11h`)
- `Candidato` — lista de candidatos disponíveis naquele slot, separados por vírgula
- `Membro`, `Cargo`, `Email do membro` — membros disponíveis no mesmo slot

Para saber quem **pode** num horário X: filtrar linhas com `Data` + `Horário` correspondentes e olhar a coluna `Candidato`.

## Alocações repetidas — atenção ao contar

> ⚠️ **REGRA OBRIGATÓRIA:** Toda vez que varrer a planilha de Alocação (para contar, cruzar, listar quem está/não está alocado, etc.), **sempre aplicar deduplicação por nome ANTES de retornar resultado**. O BD Candidatos não tem duplicatas — só a Alocação tem. Não pular esse passo.

A planilha de Alocação tem **23 candidatos que aparecem em mais de um slot** (em geral remarcações onde a linha antiga não foi removida — `Vai?`/`Presente?` = FALSE no slot antigo). Ao contar candidatos alocados, **deduplicar por nome** (case-insensitive, ignorando acentos e espaços): cada candidato conta apenas 1x, independente de em quantos slots o nome apareça.

Candidatos com múltiplas linhas (snapshot 2026-06-24):

- Aparecem em 3 slots: Nicoly Maia Santos, Lucas Costa Sousa Gomes, Luiza Gomes dos Reis, Maria Eduarda Giordano, Pedro passos farias
- Aparecem em 2 slots: Bernardo Borelli Mourelle, Larissa Castro de Oliveira, Lucas Andrade Silva, Murilo Carvalho Gripp, Lucas da Silva Rezende, Letícia Portela Oliveira Bem, Natalia Lima de Carvalho, João Pedro Pereira da Silva Santos, Ana Carolina Lessa Maia, Mateus Pereira Dutra, Matheus Brito Tosta da Silva, Sophia Oliveira do Souto, Hugo Nazare Boher e Souza Estrada Alves, Giuliana Olivia Silva de Lima, Isabela Gluck Clemente, Kim Pimenta Bernardes, Miguel Antonio Guimarães de Abreu Lima, Isamu Nakandakara Ono

## Candidatos NÃO alocados — snapshot 2026-06-24

Total: **36 candidatos** (de 140 no BD). 104 já estão na planilha de alocação (contagem deduplicada — ver seção acima sobre repetições).

1. Agatha Marques de Castilho
2. Ana Clara Basilio Portes
3. Ana Clara Véras Barros
4. Antonio Bittencourt Correa
5. Arthur Siqueira Paz Teixeira
6. Bernardo Pereira Costa
7. Brenno Chaves dos Santos
8. Breno Almeida Monteiro
9. Caio Nogueira silva costa Chaffin guedes pereira
10. Carlos José Batista da Silva
11. DOUGLAS SANTOS MARQUES FERREIRA
12. Franco Aleixo de Moraes
13. Gabriel Arcanjo de Moura Costa
14. Gabriel Mendes De Lima Chagas
15. Guilherme Rocha Borges
16. Gustavo Assis Carvalho Cota
17. Gustavo Faria Takama
18. Inara Fernanda dos Santos de Souza
19. João Pedro Carvalho dos Santos
20. Kauã de araujo soares godim da silva
21. Kayo Enzo Oliveira da Silva
22. Leonardo de Sá Berbat
23. Luca Castro de Melo
24. Lucas Dotto e Oliveira
25. Marcelo Lôbo Nogueira Santos
26. Maria Clara Carvalho
27. Mariana Rocha de Oliveira Ferreira
28. Marisa Pires Coutinho Machado
29. Matheus da Silva Conceição
30. Matheus Viana Gomes
31. Nina Estefan Lima Gomes Costa
32. Rafael Britto Binder
33. Victor Hugo Russo Cordeiro
34. Vítor Fernandes de Carvalho Ambrizzi
35. Vitor Gadelha
36. Rayka kamyly da Silva Constancio

> Snapshot gerado em 2026-06-24 a partir do cruzamento BD Candidatos × Alocação - Candidatos (com deduplicação por nome — ver seção "Alocações repetidas"). Pode estar desatualizado se as planilhas mudaram — refazer o cruzamento antes de agir.

## Dinâmicas sugeridas (pendentes de marcação)

*(nenhuma pendente no momento)*
