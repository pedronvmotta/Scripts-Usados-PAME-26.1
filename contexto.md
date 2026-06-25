# Contexto do Projeto PAME

## Regras de montagem de grupo

- **Tamanho do grupo:** sempre **4 candidatos por dinâmica**.
- **Grupos paralelos:** é permitido ter mais de uma dinâmica no mesmo `Dia` + `Horário` (já existe em vários slots da planilha — ex.: 22/06 8h, 22/06 11h, 22/06 13h, 22/06 15h). Quando o slot já tiver um grupo cheio, criar nova linha para um 2º grupo paralelo se houver candidatos disponíveis.
- Ao sugerir candidatos para um slot, montar grupos de 4 não-alocados disponíveis (planilha (3)). Cada candidato só pode estar em uma dinâmica.

## BD Candidatos (pool de candidatos)

**Arquivo de referência:** `Meus-Scripts/Cruzar-Horarios/Alocações de Membros - Dinâmicas em grupo - BD Candidatos.csv`

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

**Arquivo:** `Meus-Scripts/Cruzar-Horarios/Alocações de Membros - Dinâmicas em grupo - Alocação - Candidatos.csv`

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
