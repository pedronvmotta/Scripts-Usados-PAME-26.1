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

**Arquivo (ATUAL):** `Meus-Scripts/Automacao-marcao-dinamicas-final/Alocações de Membros - Dinâmicas em grupo - Alocação - Candidatos (3).csv`

> ⚠️ Atualizado em 2026-06-28: agora é `(3)` (era `(2)` mais cedo na mesma sessão). Sempre usar a versão mais alta encontrada em `Automacao-marcao-dinamicas-final/`.

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

A planilha de Alocação tem **25 candidatos que aparecem em mais de um slot** (em geral remarcações onde a linha antiga não foi removida — `Vai?`/`Presente?` = FALSE no slot antigo). Ao contar candidatos alocados, **deduplicar por nome** (case-insensitive, ignorando acentos e espaços): cada candidato conta apenas 1x, independente de em quantos slots o nome apareça.

Candidatos com múltiplas linhas (snapshot 2026-06-28, contra Alocação (2)):

- **Em 4 slots (1):** Luiza Gomes dos Reis (remarcou 3x — caso pra olhar com atenção)
- **Em 3 slots (5):** Nicoly Maia Santos, Lucas Costa Sousa Gomes, Letícia Portela Oliveira Bem, Maria Eduarda Giordano, Pedro passos farias
- **Em 2 slots (19):** Bernardo Borelli Mourelle, Larissa Castro de Oliveira, Lucas Andrade Silva, Murilo Carvalho Gripp, Lucas da Silva Rezende, Natalia Lima de Carvalho, João Pedro Pereira da Silva Santos, Ana Carolina Lessa Maia, Mateus Pereira Dutra, Matheus Brito Tosta da Silva, Sophia Oliveira do Souto, Hugo Nazare Boher e Souza Estrada Alves, João Pedro Mansur Dias Bianco, Giuliana Olivia Silva de Lima, Isabela Gluck Clemente, Kim Pimenta Bernardes, Miguel Antonio Guimarães de Abreu Lima, Isamu Nakandakara Ono, Luís Filipe Gois Alves das Neves

**Conta:** 138 aparições totais na Alocação − 32 duplicatas = **106 candidatos únicos alocados**.

## Panorama da marcação — snapshot 2026-06-28 (contra Alocação (3))

| Categoria | Qtd | % do ativo |
|---|---:|---:|
| Total no BD | 141 | — |
| Reprovados (ignorados) | 10 | — |
| **Ativos no processo** | **131** | 100% |
| 🟢 **Fizeram a dinâmica** (`Presente?=TRUE` em I/N/S/X/AC) | **87** | **66%** |
| 🟡 Alocados, mas ainda NÃO fizeram | **19** | 15% |
| 🔴 Nem alocados (sem slot) | **25** | 19% |

Verificação: 87 + 19 + 25 = 131 ✓

**Total que falta fechar:** 44 candidatos (19 com slot + 25 sem slot).

### 🟢 Fizeram a dinâmica (87)

Adriana Rodrigues dos Santos da Cruz · Allan Gotlib · Ana Carolina Lessa Maia · Ana Carolina Rodrigues Correia da Silva · Ana Clara Bilitário Trianon · André Ferreira Guedes Kang · Anna Julia dos Santos Vieira · Antonio Gaida Coutinho Marques · Arthur Gonsales Cadengue · Arthur Yuan da Costa · Beatriz Martins Soares Ramires Savino · Bernardo Borelli Mourelle · Breno Ribeiro Palma de Souza · Bruno Fayad Cipolla · Caio Ongarato de Arruda · Camila Silva Novitsky · Daniel Cesar Grancieri do Amaral · Eduardo Augusto Pinto Martins · Enrico Almeida Machado Dias de Souza · Estela Wermelinger Corrêa da Fonseca · Felipe Figueiras Nahid Pereira · Felipe Giannattasio Mota · Felipe Onoda Pessanha Bianchi · Flávio Magyar Ortolan Pereira · Francisco Oliveira Navarro · Gabriel Michaeli dos Santos · Gabriel Torres dos Anjos · Gabriela Lara Leuzinger · Gabriela Pereira de Souza · Gisele Ramos dos Santos Silva · Giuliana Olivia Silva de Lima · Guilherme Weber Carvalho Pinto · Henrique de Noronha Souto · Hugo Nazare Boher e Souza Estrada Alves · Isaac Braga Frejoli Domingues · Isabela Gluck Clemente · Isamu Nakandakara Ono · João Marcelo da Gama Nóbrega Costa Pereira · João Pedro de Carvalho Urquiza · João Vitor Carreira Allak · Júlia Nascimento Pereira Rosa · Julio Cesar de Souza Cruz Barbosa · Kim Pimenta Bernardes · Larissa Castro de Oliveira · Leonardo Marques de Vasconcelos Gomes · Leonardo Rodrigues Vieira · Letícia Freixo Amorim · Lucas Albuquerque Danello de Souza · Lucas Andrade Silva · Lucas Costa Sousa Gomes · Lucas de Oliveira Batista · Lucas Gomes da Silva · Luís Filipe Gois Alves das Neves · Luísa Leal Ávila · Luiza Gomes dos Reis · Marcus Vinícius Alves Leandro · Maria Eduarda Giordano · Maria Fernanda Castello Branco Pereira · Maria Gabriela Araujo de Oliveira · Mariana Ferreira Rodrigues Peixoto · Mariana Rocha de Oliveira Ferreira · Mateus Pereira Dutra · Matheus Brito Tosta da Silva · Matheus Cabral · Matheus Duarte Aragão · Matheus Duffles Pinheiro Vieira · Matheus Henriques Lara Resende · Matheus Maroñas Varela · Mauro de Avila Martins Neto · Michel leandro machado · Miguel Felipe Pinto Licurgo de Barros · Mirella da Silva Reis · Murilo Carvalho Gripp · Nicoly Maia Santos · Olivia Jiale Xiao · Pedro dos Santos Correia · Pedro passos farias · Peterson Marques de Carvalho · Rafael Wisnescky Gomes da Silva · Samuel Mendonça Ferreira · Sarah Siqueira de Paiva · Sofia Marques Novaes Valerio · Sophia Oliveira do Souto · Sophia Souza Tiburcio · stella daniel breitinger · Tiago de Góis Paz · Tiago Medalha Mouro Pazos

### 🟡 Alocados, mas ainda NÃO fizeram (19)

Têm pelo menos 1 slot na Alocação mas nenhuma linha com `Presente?=TRUE` — geralmente faltaram ou pediram remarcação.

| Candidato | Aparições |
|---|---:|
| Camile dos Santos Silva | 1 |
| Eduardo Kina Fernandes | 1 |
| Helena Ayrão Venancio da Silva Franco Quintella Mendes | 1 |
| João Pedro Mansur Dias Bianco | 2 |
| João Pedro Pereira da Silva Santos | 2 |
| JÚLIO KALÉO FERNANDES OITICICA SANTOS | 1 |
| Letícia Portela Oliveira Bem | 3 |
| Lucas da Silva Rezende | 2 |
| Lucas Santos Nogueira | 1 |
| LUIZ HENRIQUE GUERRIERI RZETELNY | 1 |
| Matheus da Silva Conceição | 1 |
| Miguel Antonio Guimarães de Abreu Lima | 2 |
| Miguel Crespo Nogueira | 1 |
| Natalia Lima de Carvalho | 2 |
| Paola Scalco Perim | 1 |
| Rodrigo Jales Carneiro da Silva | 1 |
| Samara Bruna Wanderley Chagas | 1 |
| Sophia Palmeira Melo | 1 |
| Tainá Ribeiro dos Santos | 1 |

### 🔴 Nem alocados, sem slot (25)

1. Agatha Marques de Castilho
2. Ana Clara Basilio Portes
3. Ana Clara Véras Barros
4. Bernardo Pereira Costa
5. Brenno Chaves dos Santos
6. Breno Almeida Monteiro
7. Caio Nogueira silva costa Chaffin guedes pereira
8. DOUGLAS SANTOS MARQUES FERREIRA
9. Franco Aleixo de Moraes
10. Gabriel Arcanjo de Moura Costa
11. Guilherme Rocha Borges
12. Gustavo Assis Carvalho Cota
13. Inara Fernanda dos Santos de Souza
14. Kauã de araujo soares godim da silva
15. Kayo Enzo Oliveira da Silva
16. Leonardo de Sá Berbat
17. Luca Castro de Melo
18. Lucas Dotto e Oliveira
19. Marcelo Lôbo Nogueira Santos
20. Maria Clara Carvalho
21. Matheus Viana Gomes
22. Nina Estefan Lima Gomes Costa
23. Rayka kamyly da Silva Constancio
24. Rodrigo Ferreira Mies
25. Vitor Gadelha

**Notas do cruzamento:**
- Todos os slots da Alocação (17/06 a 26/06) **já passaram** (hoje é 28/06). Pra encaixar os 44 que faltam, será necessário abrir slots futuros.
- `Matheusupershock@gmail.com` no BD foi corrigido para `Matheus Cabral` (linha 111 do BD) — é a mesma pessoa, já fez a dinâmica (26/06 15h).
- Critério usado: **alocado** = nome aparece em alguma coluna `Candidato 1-5` (dedup por nome); **fez** = `Presente?=TRUE` em pelo menos uma linha (colunas I, N, S, X, AC).

> Snapshot gerado em 2026-06-28 a partir do cruzamento BD (2) × Alocação (3) com deduplicação por nome (ver seção "Alocações repetidas") e a norma do `Presente?`. Refazer antes de agir se as planilhas mudarem.

## Dinâmicas sugeridas (pendentes de marcação)

*(nenhuma pendente no momento)*

## Arquivos CSV — quais usar e pra quê

> ⚠️ Reorganização em 2026-06-28: toda a pasta `Meus-Scripts/Cruzar-Horarios/` foi removida. Os arquivos da marcação de dinâmica agora vivem em `Meus-Scripts/Automacao-marcao-dinamicas-final/`. A pasta `Meus-Scripts/Automacao-Marcacao-Dinamicas-deprecado/` é histórico — **ignorar tudo lá dentro**.

### Arquivos ATIVOS (usar nestes)

Todos em `Meus-Scripts/Automacao-marcao-dinamicas-final/`:

| Arquivo | Pra que serve | Quando consultar |
|---|---|---|
| `Alocações de Membros - Dinâmicas em grupo - BD Candidatos (2).csv` | **Pool oficial de candidatos.** Lista de todos os nomes que estão no processo. Schema: `Nome Completo`, `Alocado em um horário` (vazio — não confiar), `Número`, `Mensagem enviada`, `Fez a dinâmica`, `Esta no BD podio`. | Pra saber **quem é candidato** e calcular **quem ainda falta marcar** (cruzando com Alocação). |
| `Alocações de Membros - Dinâmicas em grupo - Alocação - Candidatos (3).csv` | **Planilha das dinâmicas marcadas.** Cada linha = um grupo (`Dia` + `Horario` + até 5 candidatos), cada candidato com `Nome`, `Número`, `Msg?`, `Vai?`, `Presente?`. **Colunas I, N, S, X, AC = `Presente?` (=fez a dinâmica) dos Cand 1-5.** | Pra saber **quem já está alocado** (nome aparece), **quem fez a dinâmica** (`Presente?=TRUE` nas colunas I/N/S/X/AC) e **em quais slots cada grupo está marcado**. Lembrar de deduplicar por nome ao contar alocados (ver "Alocações repetidas"). |
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
- Snapshot de "Candidatos NÃO alocados" de 2026-06-24 ficou desatualizado — refeito contra `(2)` (106 alocados, 25 pendentes). Precisa ser refeito de novo contra `(3)`.
- BD: `Matheusupershock@gmail.com` corrigido para `Matheus Cabral` (linha 111).
- **Nova norma estabelecida:** colunas `Presente?` (I, N, S, X, AC) da Alocação são a fonte da verdade para "fez a dinâmica" (TRUE=fez, FALSE=não fez). Total de dinâmicas realizadas: 74 em Alocação (2), 87 em Alocação (3).
