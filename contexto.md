# Contexto do Projeto PAME

## Fase atual — Fase 3: Entrevista com Coordenador (a partir de 2026-07-14)

O PAME entrou na **Fase 3: Entrevista com Coordenador (Coordena)**. Formato **1x1 (individual)** — 1 candidato ↔ 1 Coordena por slot. Descrição conceitual detalhada em `contexto-geral.md` § 9.

### Estrutura Fluxo — 5 Coordenações

**ACE, CCE, MNP, PRO, QAB**. PRO e QAB têm **2 Coordenas** cada; as outras 3 têm 1.

### Regra dura (não negociável)

**Candidato da coordenação X SÓ pode, sem exceções, ser entrevistado pelo Coordena da coordenação X.** Não fazer cross-área nem sugerir fallback.

### Equalização em PRO e QAB

Distribuir entrevistas equilibradamente entre os 2 Coordenas da mesma área — diferença ideal 0 ou 1. Só desbalancear se disponibilidade forçar.

### Arquivos — Fase 3

Todos em `Meus-Scripts/Automacao-Marcacao-Entrevista-Coordenadores/`:

| Arquivo | Conteúdo |
|---|---|
| `E.C Candidatos - disponibilidade  (respostas) - Respostas ao formulário 1.csv` | Respostas dos candidatos. Coluna D = coordenação de interesse. Colunas E–P = disponibilidade dia a dia (14/07 a 29/07). |
| `Coordenas - disponibilidade (respostas) - Respostas ao formulário 1.csv` | Respostas dos Coordenas. Coluna D = coordenação que coordenam. Colunas E–P = disponibilidade dia a dia. |

Schema idêntico nos 2 arquivos: `Carimbo`, `Nome`, `Email`, `Coordenação`, 12 colunas de dias (14/07, 15/07, 16/07, 17/07, 20/07, 21/07, 22/07, 23/07, 24/07, 27/07, 28/07, 29/07). Horários possíveis por dia: 10h, 11h, 13h, 14h, 15h, 16h, 17h.

### Snapshot 2026-07-14 — Coordenas ativos

| Área | Coordenas que responderam |
|---|---|
| ACE | Pedro de Souza |
| CCE | Gabriel Santos |
| **MNP** | ⚠️ **NENHUM ainda** — bloqueia os candidatos MNP até resolver |
| PRO | Lucas Angelo, Vitor Malfa |
| QAB | Gabriela D'Agostini, Maria Clara Menegoy |

### Snapshot 2026-07-14 — Candidatos por coordenação (dedup por email)

Total: **42 candidatos únicos** (45 linhas − 3 respostas duplicadas: Ana Carolina Lessa Maia, Luísa Leal Ávila, Mirella Reis, Marcelo Lôbo com 2 respostas).

| Área | Qtd | Candidatos |
|---|---:|---|
| ACE | 7 | Michel Leandro Machado, Francisco Oliveira Navarro, Ana Carolina Lessa Maia, Helena Ayrão, Tiago Medalha Mouro Pazos, Enrico Almeida Machado Dias de Souza, Adriana Rodrigues dos Santos da Cruz |
| CCE | 13 | Tainá Ribeiro dos Santos, Antonio Gaida Coutinho Marques, Felipe Onoda Pessanha Bianchi, Henrique de Noronha Souto, Arthur Gonsales Cadengue, Mateus Pereira Dutra, Eduardo Augusto Pinto Martins, Hugo Nazare Boher e Souza Estrada Alves, Matheus da Silva Conceição, Olivia Jiale Xiao, Matheus Henriques Lara Resende, Matheus Viana Gomes, Sarah Siqueira de Paiva |
| **MNP** | 8 | João Pedro de Carvalho Urquiza, Mirella da Silva Reis, Arthur Yuan da Costa, Miguel Antonio Guimarães de Abreu Lima, Flávio Magyar Ortolan Pereira, Gabriel Torres dos Anjos, Marcelo Lôbo Nogueira Santos, Luís Filipe Gois Alves das Neves |
| PRO | 9 | Luísa Leal Ávila, Ana Carolina Rodrigues Correia da Silva, Maria Fernanda Castello Branco Pereira, Bernardo Borelli Mourelle, Giuliana Olivia Silva de Lima, Júlio Kaléo Fernandes Oiticica Santos, Luiz Henrique Guerrieri Rzetelny, Nicoly Maia Santos, Felipe Figueiras Nahid Pereira |
| QAB | 5 | Anna Julia dos Santos Vieira, Rayka Kamyly da Silva Constancio, Samuel Mendonça Ferreira, Mariana Ferreira Rodrigues Peixoto, Stella Daniel Breitinger |

> ⚠️ Os 8 candidatos de MNP não têm Coordena para entrevista enquanto o formulário do Coordena MNP não for respondido.

### Onde marcar a Fase 3

Existe planilha oficial de marcação — o Pedro vai mandar. **Aguardar antes de propor edições.** Os candidatos MNP ficam pendentes até o Coordena de MNP responder o form (decisão de 2026-07-14: seguir marcando as outras 4 áreas primeiro).

### Duração do slot (Fase 3)

Cada slot horário (10h, 11h, 13h, 14h, 15h, 16h, 17h) comporta **1 entrevista 1x1 por Coordena**. Um mesmo Coordena pode fazer várias entrevistas no mesmo dia em slots diferentes, mas nunca 2 no mesmo horário.

---

## Regras de montagem de grupo

- **Tamanho preferencial:** 4 candidatos por dinâmica.
- **Grupo de 3 é aceitável** quando não dá pra fechar 4 com não-alocados disponíveis (regra flexibilizada em 2026-06-25). Preferível alocar 3 do que deixar candidato de fora por rigidez.
- **5º candidato como exceção:** quando um candidato não-alocado tem disponibilidade num slot que já tem grupo cheio (4 candidatos), encaixar como 5º (planilha tem coluna `Candidato 5`). Usar para "salvar" candidatos que ficariam sem grupo formável. Validado em 2026-06-25.
- **Grupos paralelos:** é permitido ter mais de uma dinâmica no mesmo `Dia` + `Horário` (já existe em vários slots da planilha). Quando o slot já tiver um grupo cheio, criar nova linha para um 2º grupo paralelo se houver candidatos disponíveis.
- Ao sugerir candidatos para um slot, priorizar grupos de 4 não-alocados; aceitar 3 quando 4 não for viável; usar 5º como exceção pra encaixar candidatos órfãos. Cada candidato só pode estar em uma dinâmica.
- **Sempre listar alternativas:** ao sugerir um grupo para um slot, junto com a sugestão principal **sempre retornar a lista completa de outros candidatos que também podem nesse horário** (não-alocados disponíveis + remarcáveis), pra que o usuário possa trocar. Validado em 2026-06-25.
- **NUNCA marcar dinâmica direto na planilha sem validação prévia:** toda marcação de dinâmica (nova linha na planilha de Alocação, atualização do BD "Alocado em um horário", etc.) deve ser **proposta primeiro no terminal** e **aguardar OK explícito do usuário** antes de qualquer edição em planilha. Vale tanto para o `Alocação - Candidatos.csv` quanto para o `BD Candidatos.csv`. Validado em 2026-06-25.
- **Atenção a datas — não rotular slot de hoje/futuro como "ausência":** ao classificar candidatos como "remarcáveis" ou "ausentes", **sempre comparar com a data de hoje**. Um slot com `Vai?/Presente? = FALSE` só é ausência real se a data do slot já passou. Slots de **hoje** ou **futuro** com FALSE significam apenas "dinâmica ainda não rolou / status ainda não atualizado", NÃO ausência. Validado em 2026-06-25 (eu errei e marquei dinâmicas de 25/06 — hoje — como ausências quando elas só não tinham ocorrido ainda).
- **NORMA — "Fez a dinâmica?" = coluna `Presente?` da Alocação:** para saber se um candidato **fez ou não a dinâmica**, a fonte da verdade são as colunas **`Presente?`** da planilha de Alocação — colunas **I, N, S, X, AC** (uma por candidato: Cand 1, Cand 2, Cand 3, Cand 4, Cand 5 respectivamente). `TRUE` = fez a dinâmica; `FALSE` = ainda não fez. Validado em 2026-06-28. **Não usar** a coluna `Fez a dinâmica` do BD (não é mantida sincronizada) nem inferir presença pelo simples fato de o nome aparecer na Alocação.

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

## Candidatos DESISTENTES / ELIMINADOS — ignorar sempre

Candidatos que **desistiram voluntariamente ou foram eliminados** no meio do processo (depois da entrada no BD). Tratar igual aos reprovados: **não sugerir para grupo, não contar como pendente**.

- Agatha Marques de Castilho *(2026-07-06)* — eliminada por decisão interna (não respondeu contatos)
- Ana Clara Basilio Portes *(2026-07-06)* — eliminada por decisão interna (não respondeu contatos)
- Ana Clara Véras Barros *(2026-07-03)*
- Franco Aleixo de Moraes *(2026-06-29)*
- Gabriel Arcanjo de Moura Costa *(2026-07-03)*
- João Pedro Mansur Dias Bianco *(2026-07-06)*
- Kauê de Araujo Soares Godim da Silva *(2026-07-06)* — eliminado por decisão interna (não respondeu contatos)
- Letícia Portela Oliveira Bem *(2026-07-06)* — eliminada por decisão interna (não respondeu contatos)
- Luca Castro de Melo *(2026-07-03)*
- Lucas da Silva Rezende *(sinalizado na Alocação — slot 25/06 13h)*
- Lucas Dotto de Oliveira *(2026-07-06)* — variação de nome no BD ("Lucas Dotto **e** Oliveira") vs Alocação ("Lucas Dotto **de** Oliveira")
- Lucas Santos Nogueira *(sinalizado na Alocação — slot 26/06 15h)*
- Natalia Lima de Carvalho *(sinalizado na Alocação — slot 25/06 15h)*
- Nina Estefan Lima Gomes Costa *(2026-06-29)*
- Vitor Gadelha *(2026-07-06)* — eliminado por decisão interna (não respondeu contatos)

**Total: 15 fora do processo** (além dos 10 reprovados).

## BD Candidatos (pool de candidatos)

**Arquivo de referência (ATUAL):** `Meus-Scripts/Automacao-marcao-dinamicas-final/Alocações de Membros - Dinâmicas em grupo - BD Candidatos (2).csv`

> ⚠️ Mudança em 2026-06-28: o BD agora é `(2)` e foi movido para `Meus-Scripts/Automacao-marcao-dinamicas-final/`. Mesmo schema do BD anterior (mesmas colunas).
> - O usuário recriou o BD nessa sessão porque a pasta `Meus-Scripts/Cruzar-Horarios/` inteira foi deletada. Versões antigas (`(1)` e sem sufixo) **não existem mais no working tree**.
> - A coluna `Alocado em um horário` está **vazia para todos** (não é mantida sincronizada com a planilha de Alocação). **Para descobrir se alguém está alocado, consultar a planilha de Alocação, NÃO esta coluna do BD.**
> - Os 10 reprovados podem ou não estar nesse BD novo — **sempre filtrar pela lista de reprovados desta sessão** ao usar o BD.

Esta planilha é o **pool oficial de candidatos**. Todos os nomes listados nela devem ser considerados candidatos do processo.

### Como usar como referência
- **Quem é candidato:** qualquer nome presente nesta planilha.
- **Já alocado:** ❌ **NÃO** usar a coluna `Alocado em um horário` (está vazia). Cruzar com a planilha de Alocação.
- **Fez a dinâmica:** ❌ **NÃO** usar a coluna `Fez a dinâmica` do BD. Consultar as colunas `Presente?` (I, N, S, X, AC) da Alocação — ver seção "Planilha de alocação" abaixo.
- **Status complementares (auxiliares):** `Mensagem enviada`, `Esta no BD podio` — informativos, podem estar desatualizados.

### Colunas da planilha
1. `Nome Completo`
2. `Alocado em um horário`
3. `Número` (telefone)
4. `Mensagem enviada`
5. `Fez a dinâmica`
6. `Esta no BD podio`

## Planilha de alocação (referência cruzada)

**Arquivo (ATUAL):** `Meus-Scripts/Automacao-marcao-dinamicas-final/Alocações de Membros - Dinâmicas em grupo - Alocação - Candidatos (6).csv`

> ⚠️ Atualizado em 2026-07-03: agora é `(6)` — usuário confirmou como a nova base de acompanhamento. Versões `(1)` a `(5)` estão superadas. Sempre usar a versão mais alta encontrada em `Automacao-marcao-dinamicas-final/`.

Cada linha representa uma dinâmica em grupo (`Dia` + `Horario`) com até 5 candidatos (`Candidato 1` a `Candidato 5`). Um candidato está **alocado** quando seu nome aparece em qualquer uma dessas colunas.

### Colunas críticas — `Presente?` (I, N, S, X, AC) = "fez a dinâmica?"

Cada um dos 5 candidatos de uma linha tem 4 colunas associadas: `Nome`, `Número`, `Msg?`, `Vai?`, `Presente?`. As colunas **`Presente?`** ocupam as posições:

| Coluna | Candidato |
|---|---|
| **I** | Candidato 1 |
| **N** | Candidato 2 |
| **S** | Candidato 3 |
| **X** | Candidato 4 |
| **AC** | Candidato 5 |

**`TRUE` na coluna `Presente?` = candidato FEZ a dinâmica.** `FALSE` = ainda não fez (seja por ausência, por remarcação, ou porque o slot ainda não rolou — combinar com a data do slot vs. hoje pra interpretar).

**Pra contar quantas dinâmicas foram realizadas:** somar TRUEs em I + N + S + X + AC (ver memória sobre essa norma).

## Planilha de disponibilidade (fonte da verdade para horários)

**Arquivo:** `Meus-Scripts/Automacao-marcao-dinamicas-final/Cruzamento de horários - Dinâmicas - Mapeamento por horário (3).csv`

> ⚠️ Mudança em 2026-06-28: também movida pra `Automacao-marcao-dinamicas-final/`.

Esta é a **base oficial para checar a disponibilidade de horários dos candidatos**. Sempre consultar este arquivo (e não as outras versões do mapeamento, nem os CSVs brutos do formulário) ao verificar se um candidato pode em determinado `Dia` + `Horário`.

Estrutura:
- `Data` (ex.: `26/06`)
- `Horário` (ex.: `11h`)
- `Candidato` — lista de candidatos disponíveis naquele slot, separados por vírgula
- `Membro`, `Cargo`, `Email do membro` — membros disponíveis no mesmo slot

Para saber quem **pode** num horário X: filtrar linhas com `Data` + `Horário` correspondentes e olhar a coluna `Candidato`.

## Alocações repetidas — atenção ao contar

> ⚠️ **REGRA OBRIGATÓRIA:** Toda vez que varrer a planilha de Alocação (para contar, cruzar, listar quem está/não está alocado, etc.), **sempre aplicar deduplicação por nome ANTES de retornar resultado**. O BD Candidatos não tem duplicatas — só a Alocação tem. Não pular esse passo.

A planilha de Alocação tem **38 candidatos ativos que aparecem em mais de um slot** (em geral remarcações onde a linha antiga não foi removida — `Vai?`/`Presente?` = FALSE no slot antigo). Ao contar candidatos alocados, **deduplicar por nome** (case-insensitive, ignorando acentos e espaços): cada candidato conta apenas 1x, independente de em quantos slots o nome apareça.

Candidatos com múltiplas linhas (snapshot 2026-07-03, contra Alocação (6), já filtrando reprovados/desistentes):

- **Em 4 slots (2):** Letícia Portela Oliveira Bem, Luiza Gomes dos Reis
- **Em 3 slots (8):** Camile dos Santos Silva, João Pedro Pereira da Silva Santos, Lucas Costa Sousa Gomes, Maria Eduarda Giordano, Miguel Antonio Guimarães de Abreu Lima, Nicoly Maia Santos, Paola Scalco Perim, Pedro passos farias
- **Em 2 slots (28):** Ana Carolina Lessa Maia, Bernardo Borelli Mourelle, Eduardo Kina Fernandes, Giuliana Olivia Silva de Lima, Helena Ayrão Venancio da Silva Franco Quintella Mendes, Hugo Nazare Boher e Souza Estrada Alves, Isabela Gluck Clemente, Isamu Nakandakara Ono, João Pedro Mansur Dias Bianco, Júlio Kaléo Fernandes Oiticica Santos, Kayo Enzo Oliveira da Silva, Kim Pimenta Bernardes, Larissa Castro de Oliveira, Lucas Andrade Silva, Lucas Dotto de Oliveira, Luiz Henrique Guerrieri Rzetelny, Luís Filipe Gois Alves das Neves, Mateus Pereira Dutra, Matheus Brito Tosta da Silva, Matheus da Silva Conceição, Miguel Crespo Nogueira, Murilo Carvalho Gripp, Rayka Kamyly da Silva, Rodrigo Jales Carneiro da Silva, Samara Bruna Wanderley Chagas, Sophia Oliveira do Souto, Sophia Palmeira Melo, Tainá Ribeiro dos Santos

**Conta:** 169 aparições totais na Alocação (só ativos, excluindo reprovados/desistentes) − 50 duplicatas = **119 candidatos únicos alocados**.

## Panorama da marcação — snapshot 2026-07-03 (contra Alocação (6))

| Categoria | Qtd | % do ativo |
|---|---:|---:|
| Total no BD | 141 | — |
| Reprovados (ignorados) | 10 | — |
| Desistentes/eliminados (ignorados) | 15 | — |
| **Ativos no processo** | **116** | 100% |
| 🟢 **Fizeram a dinâmica** (`Presente?=TRUE` em I/N/S/X/AC) | **91** | **78%** |
| 🟡 Alocados, mas ainda NÃO fizeram | **25** | 22% |
| 🔴 Nem alocados (sem slot) | **0** | 0% |

Verificação: 91 + 25 + 0 = 116 ✓

**Total que falta fechar:** 25 candidatos (todos com slot). Sem resposta pra semana extra: Brenno Chaves, Inara Fernanda, Paola Scalco (3). Gustavo Assis (1) — declarou que não pode nenhum dia. Os outros 21 estão alocados nos G1-G5.
**Dinâmicas realizadas** (slots com ≥1 `Presente?=TRUE`): **29**.
Ignorado no cruzamento: slots de 29/06 (não houve dinâmica nesse dia).

### 🟢 Fizeram a dinâmica (91)

Adriana Rodrigues dos Santos da Cruz · Allan Gotlib · Ana Carolina Lessa Maia · Ana Carolina Rodrigues Correia da Silva · Ana Clara Bilitário Trianon · André Ferreira Guedes Kang · Anna Julia dos Santos Vieira · Antonio Gaida Coutinho Marques · Arthur Gonsales Cadengue · Arthur Yuan da Costa · Beatriz Martins Soares Ramires Savino · Bernardo Borelli Mourelle · Bernardo Pereira Costa · Breno Ribeiro Palma de Souza · Bruno Fayad Cipolla · Caio Ongarato de Arruda · Camila Silva Novitsky · Daniel Cesar Grancieri do Amaral · Eduardo Augusto Pinto Martins · Eduardo Kina Fernandes · Enrico Almeida Machado Dias de Souza · Estela Wermelinger Corrêa da Fonseca · Felipe Figueiras Nahid Pereira · Felipe Giannattasio Mota · Felipe Onoda Pessanha Bianchi · Flávio Magyar Ortolan Pereira · Francisco Oliveira Navarro · Gabriel Michaeli dos Santos · Gabriel Torres dos Anjos · Gabriela Lara Leuzinger · Gabriela Pereira de Souza · Gisele Ramos dos Santos Silva · Giuliana Olivia Silva de Lima · Guilherme Weber Carvalho Pinto · Henrique de Noronha Souto · Hugo Nazare Boher e Souza Estrada Alves · Isaac Braga Frejoli Domingues · Isabela Gluck Clemente · Isamu Nakandakara Ono · João Marcelo da Gama Nóbrega Costa Pereira · João Pedro de Carvalho Urquiza · João Vitor Carreira Allak · Júlia Nascimento Pereira Rosa · Julio Cesar de Souza Cruz Barbosa · Kim Pimenta Bernardes · Larissa Castro de Oliveira · Leonardo Marques de Vasconcelos Gomes · Leonardo Rodrigues Vieira · Letícia Freixo Amorim · Lucas Albuquerque Danello de Souza · Lucas Andrade Silva · Lucas Costa Sousa Gomes · Lucas de Oliveira Batista · Lucas Gomes da Silva · Luís Filipe Gois Alves das Neves · Luísa Leal Ávila · Luiza Gomes dos Reis · Marcus Vinícius Alves Leandro · Maria Eduarda Giordano · Maria Fernanda Castello Branco Pereira · Maria Gabriela Araujo de Oliveira · Mariana Ferreira Rodrigues Peixoto · Mariana Rocha de Oliveira Ferreira · Mateus Pereira Dutra · Matheus Brito Tosta da Silva · Matheus Cabral · Matheus Duarte Aragão · Matheus Duffles Pinheiro Vieira · Matheus Henriques Lara Resende · Matheus Maroñas Varela · Mauro de Avila Martins Neto · Michel leandro machado · Miguel Crespo Nogueira · Miguel Felipe Pinto Licurgo de Barros · Mirella da Silva Reis · Murilo Carvalho Gripp · Nicoly Maia Santos · Olivia Jiale Xiao · Pedro dos Santos Correia · Pedro passos farias · Peterson Marques de Carvalho · Rafael Wisnescky Gomes da Silva · Samuel Mendonça Ferreira · Sarah Siqueira de Paiva · Sofia Marques Novaes Valerio · Sophia Oliveira do Souto · Sophia Souza Tiburcio · stella daniel breitinger · Tainá Ribeiro dos Santos · Tiago de Góis Paz · Tiago Medalha Mouro Pazos

### 🟡 Alocados, mas ainda NÃO fizeram (25)

Têm pelo menos 1 slot na Alocação mas nenhuma linha com `Presente?=TRUE` — geralmente faltaram, pediram remarcação, ou têm slot futuro que ainda não rolou.

- Brenno Chaves dos Santos
- Breno Almeida Monteiro
- Caio Nogueira Silva Costa Chaffin Guedes Pereira
- Camile dos Santos Silva
- Douglas Santos Marques Ferreira
- Guilherme Rocha Borges
- Gustavo Assis Carvalho Cota
- Helena Ayrão Venancio da Silva Franco Quintella Mendes
- Inara Fernanda dos Santos de Souza
- João Pedro Pereira da Silva Santos
- Júlio Kaléo Fernandes Oiticica Santos
- Kayo Enzo Oliveira da Silva
- Leonardo de Sá Berbat
- Luiz Henrique Guerrieri Rzetelny
- Marcelo Lôbo Nogueira Santos
- Maria Clara Carvalho
- Matheus da Silva Conceição
- Matheus Viana Gomes
- Miguel Antonio Guimarães de Abreu Lima
- Paola Scalco Perim
- Rayka Kamyly da Silva Constancio
- Rodrigo Ferreira Mies
- Rodrigo Jales Carneiro da Silva
- Samara Bruna Wanderley Chagas
- Sophia Palmeira Melo

### 🔴 Nem alocados, sem slot (0)

*(vazio — todos os antigos 🔴 ou entraram em grupo da semana extra ou foram eliminados por não responder)*

**Notas do cruzamento:**
- Hoje é **03/07/2026**. Alocação (6) tem slots futuros marcados para 03/07 (11h, 14h, 15h) — vários dos 25 pendentes com slot têm slot nesses horários e o `Presente?=FALSE` pode ser apenas "ainda não rolou".
- Critério usado: **alocado** = nome aparece em alguma coluna `Candidato 1-5` (dedup por nome); **fez** = `Presente?=TRUE` em pelo menos uma linha (colunas I, N, S, X, AC).
- Slots de 29/06 ignorados no cruzamento (não houve dinâmica nesse dia).

> Snapshot gerado em 2026-07-03 a partir do cruzamento BD (2) × Alocação (6) com deduplicação por nome (ver seção "Alocações repetidas") e a norma do `Presente?`. Refazer antes de agir se as planilhas mudarem.

## Dinâmicas sugeridas (pendentes de marcação)

*(nenhuma pendente no momento)*

## Arquivos CSV — quais usar e pra quê

> ⚠️ Reorganização em 2026-06-28: toda a pasta `Meus-Scripts/Cruzar-Horarios/` foi removida. Os arquivos da marcação de dinâmica agora vivem em `Meus-Scripts/Automacao-marcao-dinamicas-final/`. A pasta `Meus-Scripts/Automacao-Marcacao-Dinamicas-deprecado/` é histórico — **ignorar tudo lá dentro**.

### Arquivos ATIVOS (usar nestes)

Todos em `Meus-Scripts/Automacao-marcao-dinamicas-final/`:

| Arquivo | Pra que serve | Quando consultar |
|---|---|---|
| `Alocações de Membros - Dinâmicas em grupo - BD Candidatos (2).csv` | **Pool oficial de candidatos.** Lista de todos os nomes que estão no processo. Schema: `Nome Completo`, `Alocado em um horário` (vazio — não confiar), `Número`, `Mensagem enviada`, `Fez a dinâmica`, `Esta no BD podio`. | Pra saber **quem é candidato** e calcular **quem ainda falta marcar** (cruzando com Alocação). |
| `Alocações de Membros - Dinâmicas em grupo - Alocação - Candidatos (6).csv` | **Planilha das dinâmicas marcadas / acompanhamento oficial.** Cada linha = um grupo (`Dia` + `Horario` + até 5 candidatos), cada candidato com `Nome`, `Número`, `Msg?`, `Vai?`, `Presente?`. **Colunas I, N, S, X, AC = `Presente?` (=fez a dinâmica) dos Cand 1-5.** | Pra saber **quem já está alocado** (nome aparece), **quem fez a dinâmica** (`Presente?=TRUE` nas colunas I/N/S/X/AC) e **em quais slots cada grupo está marcado**. Lembrar de deduplicar por nome ao contar alocados (ver "Alocações repetidas"). |
| `Cruzamento de horários - Dinâmicas - Mapeamento por horário (3).csv` | **Disponibilidade por slot.** Cada linha = um `Data` + `Horário` com a lista de candidatos e membros que podem nele. | Pra **sugerir grupos novos** — saber quem pode em cada horário e quais membros estão livres pra cobrir. |

### Arquivos AUXILIARES (do mesmo diretório, mas raramente uso)

| Arquivo | Status |
|---|---|
| `Candidatos - Disponibilidade de horários (respostas) - Respostas ao formulário 1 (1).csv` e variações | **Brutos do Google Forms.** Redundante com o Mapeamento (3). Não consultar diretamente. |
| `Disponibilidade de horários - Membros (respostas) - ...` | Bruto do form dos membros. Já consolidado no Mapeamento. |
| `Cruzamento de horários - Dinâmicas - Mapeamento por horário.csv` (sem `(3)`) e `Cruzamento ... - Mapeamento.csv` | Versões antigas do mapeamento. **Não usar** — sempre o `(3)`. |
| `Membros disponíveis no horário dos candidatos - Página1.csv` | Recorte parcial. Usar o Mapeamento (3) que já tem essa info. |
| `Disponibilidade.js`, `scriptAbaMapemento.js`, `scriptAbaPorHorario.js` | Scripts do Google Sheets que geram o Mapeamento (3). Pra entender a origem dos dados, não pra rodar localmente. |

### Arquivos a IGNORAR

- Tudo em `Meus-Scripts/Automacao-Marcacao-Dinamicas-deprecado/` — versões antigas e arquivadas.

## Histórico da sessão 2026-06-28

- Pasta `Meus-Scripts/Cruzar-Horarios/` foi deletada inteira; arquivos da marcação migraram para `Meus-Scripts/Automacao-marcao-dinamicas-final/`.
- BD Candidatos foi recriado pelo usuário como `BD Candidatos (2).csv` (mesmo schema do anterior) porque o `(1)` foi perdido na limpeza.
- Alocação atualizada de `(1)` → `(2)` → `(3)` ao longo da sessão.
- Snapshot de "Candidatos NÃO alocados" de 2026-06-24 ficou desatualizado — refeito contra `(2)` (106 alocados, 25 pendentes). Refeito de novo contra `(3)` (87 fizeram, 44 pendentes).
- BD: `Matheusupershock@gmail.com` corrigido para `Matheus Cabral` (linha 111).
- **Nova norma estabelecida:** colunas `Presente?` (I, N, S, X, AC) da Alocação são a fonte da verdade para "fez a dinâmica" (TRUE=fez, FALSE=não fez). Total de dinâmicas realizadas: 74 em Alocação (2), 87 em Alocação (3).

## Histórico da sessão 2026-06-29

- **29/06 não teve dinâmica** — apesar de o Mapeamento (3) listar slots 29/06, nenhum foi realizado. Ignorar esses slots em cruzamentos futuros.
- **5 desistentes formalizados:** Nina Estefan, Franco Aleixo, Lucas da Silva Rezende, Lucas Santos Nogueira, Natalia Lima de Carvalho — todos fora do processo (igual reprovados).
- **5 disponibilidades novas informadas** e adicionadas ao Mapeamento (3): Bernardo Pereira Costa, Helena Ayrão, Rodrigo Ferreira Mies, Rayka Kamyly, Eduardo Kina Fernandes.

## Histórico da sessão 2026-07-03

- **Nova base de acompanhamento oficial:** `Alocação - Candidatos (6).csv` (versões `(1)`–`(5)` superadas). Estrutura de colunas idêntica (Presente? em I, N, S, X, AC).
- **3 novos desistentes/eliminados** adicionados à lista fora-do-processo: Ana Clara Véras Barros, Gabriel Arcanjo de Moura Costa, Luca Castro de Melo. Total agora: 8 desistentes + 10 reprovados = 18 fora.
- **Snapshot atualizado contra (6):** 123 ativos, 91 fizeram (74%), 32 pendentes (25 com slot / 7 sem slot), **29 dinâmicas realizadas**.
- **Progresso vs. sessão anterior:** +4 fizeram (87→91), pendentes caíram de 44 para 32 (parte pelo avanço real, parte pelos 3 eliminados).

## Semana extra de dinâmicas — 07/07, 08/07 e 09/07 de 2026

Devido a imprevistos, foi acrescentada uma **semana extra** de dinâmicas em grupo pra fechar os pendentes que ainda não fizeram. Disponibilidades **coletadas por mensagem direta** (não formulário), então respostas chegaram em formato mais vago — interpretadas contra os slots padrão **11h, 13h, 14h e 15h** e gravadas no Mapeamento (3) em 2026-07-06.

**Gustavo Assis Carvalho Cota** — sinalizou que **não pode em nenhum dia** dessa semana. Não está em nenhum slot 07-09/07.

### Disponibilidades gravadas por slot

**07/07**
- **11h:** Júlio Kaléo, Matheus da Silva Conceição, Miguel Antonio, Rodrigo Ferreira Mies, Rodrigo Jales, Samara Bruna
- **13h:** Guilherme Rocha, Júlio Kaléo, Miguel Antonio, Samara Bruna
- **14h:** Guilherme Rocha, Júlio Kaléo, Miguel Antonio, Samara Bruna
- **15h:** Guilherme Rocha, Júlio Kaléo, Miguel Antonio, Rodrigo Jales, Samara Bruna

**08/07**
- **11h:** João Pedro Pereira, Marcelo Lôbo, Matheus da Silva Conceição, Matheus Viana, Miguel Antonio, Rodrigo Jales, Samara Bruna
- **13h:** João Pedro Pereira, Júlio Kaléo, Marcelo Lôbo, Miguel Antonio, Rodrigo Jales
- **14h:** Júlio Kaléo, Marcelo Lôbo, Miguel Antonio, Rodrigo Jales
- **15h:** Júlio Kaléo, Marcelo Lôbo, Miguel Antonio, Rodrigo Jales, Samara Bruna

**09/07**
- **11h:** Guilherme Rocha, João Pedro Pereira, Júlio Kaléo, Leonardo Berbat, Matheus da Silva Conceição, Matheus Viana, Rayka Kamyly, Rodrigo Ferreira Mies, Rodrigo Jales
- **13h:** Guilherme Rocha, Júlio Kaléo, Leonardo Berbat, Miguel Antonio, Rayka Kamyly, Rodrigo Jales
- **14h:** Guilherme Rocha, Júlio Kaléo, Leonardo Berbat, Miguel Antonio, Rayka Kamyly, Rodrigo Jales
- **15h:** Douglas Santos, Guilherme Rocha, João Pedro Pereira, Júlio Kaléo, Leonardo Berbat, Matheus Viana, Miguel Antonio, Rayka Kamyly, Rodrigo Jales

### Interpretações confirmadas (respostas vagas → slots)

- **João Pedro Pereira — 08/07 "10h às 14h":** entrou em 11h e 13h. Não entrou em 14h (a dinâmica das 14h começa às 14 e ele "sai" nesse horário).
- **Júlio Kaléo — 08/07 "não pode 10h às 13h":** entrou em 13h (dinâmica começa exatamente às 13). Fora de 11h.
- **Samara Bruna — 08/07 "não pode 13h às 15h":** entrou em 15h (dinâmica começa exatamente às 15). Fora de 13h e 14h.

Fonte das respostas: mensagens diretas coletadas até 2026-07-06.

### Dinâmicas marcadas para a semana extra (2026-07-06)

Marcadas na `Alocação - Candidatos (6).csv` — 5 dinâmicas cobrindo 21 candidatos (Gustavo Assis fora):

| Dinâmica | Data / Horário | Candidatos |
|---|---|---|
| G1 (5) | 07/07 11h | Rodrigo Ferreira Mies · Rodrigo Jales · Helena Ayrão · Kayo Enzo · Maria Clara Carvalho |
| G2 (4) | 07/07 13h | Guilherme Rocha · Júlio Kaléo · Miguel Antonio · Sophia Palmeira |
| G3 (4) | 08/07 11h | Marcelo Lôbo · João Pedro Pereira · Matheus Viana · Breno Almeida |
| G5 (5) | 09/07 11h | Luiz Henrique Rzetelny · Camile dos Santos Silva · Matheus da Silva Conceição · Caio Chaffin · Samara Bruna |
| G4 (3) | 09/07 15h | Douglas Santos · Leonardo Berbat · Rayka Kamyly |

**Segunda leva de respostas (2026-07-06, mais tarde):** +3 candidatos (Luiz Henrique, Camile, Sophia Palmeira). Ajustes feitos:
- Sophia Palmeira entrou como 4º no G2 (07/07 13h).
- Matheus da Silva Conceição saiu do G1 e foi pro G5 novo (09/07 11h), pra abrir vaga junto com Luiz e Camile — Camile só tinha 09/07 11h como opção.
- Sophia disse "13-15h" nos dias 08 e 09: por consistência com a interpretação "disponível até X" ≠ "disponível a partir de X", **excluída de 08/07 15h e 09/07 15h** no Mapeamento (confirmado pelo usuário).

Distribuição atual: 21 = 5+4+4+5+3. Segunda leva incluiu Caio Chaffin (→ G5, 09/07 11h) e Breno Almeida (→ G3, 08/07 11h como 5º) em 2026-07-06 — Breno restrito a esse único slot por preferência dele. Samara Bruna precisou migrar de G1 (07/07 11h) para G5 (09/07 11h) como 5ª também em 2026-07-06. Kayo Enzo movido de G3 → G1 em 2026-07-06 para fechar G1 em 4 e reduzir G3 pra 4 (removendo uma exceção de 5). Maria Clara migrou de G2 → G1 em 2026-07-06 (necessidade dela) — G1 vira 5 (exceção), G2 volta pra 4.
