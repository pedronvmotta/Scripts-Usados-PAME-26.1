# PAME — Contexto Geral para Nova Chatbox

> Este documento existe para que uma nova sessão do Claude entenda, sem precisar reconstruir contexto, o que é o processo PAME, em que etapa estamos hoje (Fase 3 — Entrevista com Coordenador), quais arquivos são fonte da verdade e quais regras operacionais valem.
>
> Data de referência: **2026-07-14**.

---

## 1. O que é o PAME

PAME é o processo seletivo interno da **Fluxo** para admissão de novos membros. É estruturado em fases sequenciais, cada uma com seu próprio critério de corte:

1. **Fase 1** — Triagem / etapas anteriores à dinâmica (encerrada; 10 candidatos reprovados).
2. **Fase 2** — Dinâmica em grupo (encerrada; a maioria dos ativos já fez).
3. **Fase 3** — **Entrevista 1x1 com Coordenador** ("Coordena"). ← **estamos aqui**.

A Fluxo tem **5 Coordenações** (áreas): **ACE, CCE, MNP, PRO, QAB**. Cada candidato escolhe **uma** coordenação de interesse no formulário de inscrição — essa escolha determina com qual Coordena ele conversa na Fase 3.

---

## 2. Panorama do funil (snapshot 2026-07-06 — pode estar defasado)

| Categoria | Qtd |
|---|---:|
| Total no BD | 141 |
| Reprovados (fora) | 10 |
| Desistentes / eliminados (fora) | 15 |
| **Ativos entrando na Fase 3** | **~116** |
| Fizeram a dinâmica em grupo (Fase 2) | 91 |
| Alocados na semana extra 07-09/07 (Fase 2) | 21 |

Observação: o número "quem chega efetivamente na Fase 3" depende de quem passou da dinâmica em grupo — a fonte oficial passa a ser o **formulário de disponibilidade da Fase 3**, não mais o BD antigo.

---

## 3. FASE 3 — Entrevista com Coordenador (foco atual)

### 3.1 Formato
- Entrevista **1x1 (individual)** entre 1 candidato e 1 Coordena.
- **Janela de datas**: 14/07 a 29/07/2026 (terça a quarta-feira, 12 dias úteis).
- **Horários possíveis**: 10h, 11h, 13h, 14h, 15h, 16h, 17h.
- Cada slot horário comporta **1 entrevista por Coordena**. O mesmo Coordena pode fazer várias entrevistas no dia em slots **diferentes** (10h + 11h + 13h + ...), mas nunca 2 candidatos no mesmo Coordena no mesmo horário.

### 3.2 Regra dura de matching por Coordenação
Candidato da coordenação **X** **só** pode ser entrevistado por Coordena da área **X**. Sem exceção, sem fallback cross-área.

- **ACE** → Pedro de Souza
- **CCE** → Gabriel Santos
- **MNP** → Gilson Batista
- **PRO** → Lucas Angelo, Vitor Malfa (2 Coordenas)
- **QAB** → Gabriela D'Agostini, Maria Clara Menegoy (2 Coordenas)

(Snapshot 2026-07-14; releia o CSV de Coordenas antes de agir, pode ter atualização.)

### 3.3 Equalização PRO / QAB
Como **PRO** e **QAB** têm 2 Coordenas cada, distribuir a carga de entrevistas de forma **equilibrada** entre os dois da mesma área.
- Diferença ideal: 0 ou 1.
- Só aceitar desequilíbrio maior se a disponibilidade do candidato/Coordena forçar.
- ACE, CCE e MNP têm 1 Coordena único → não tem essa complicação.

### 3.4 Fontes de verdade da Fase 3 (arquivos)

Todos em `Meus-Scripts/Automacao-Marcacao-Entrevista-Coordenadores/`:

| Arquivo | Uso |
|---|---|
| `E.C Candidatos - disponibilidade  (respostas) - Respostas ao formulário 1.csv` | **Pool oficial de candidatos da Fase 3.** Coluna D = coordenação de interesse do candidato. Deduplicar por nome/email (às vezes mesma pessoa responde 2x). |
| `Coordenas - disponibilidade (respostas) - Respostas ao formulário 1 (1).csv` | Respostas dos Coordenadores. Coluna D = coordenação que eles coordenam. **Atenção ao sufixo `(1)` no nome** — versão atual. |
| `Entrevistas com Coordena - Alocações - Horários (1).csv` | Planilha de alocação das entrevistas. **Não editar** (ver regra 3.6). |
| `cruzar_fase3.py` | Script auxiliar de cruzamento (se existir; verificar antes de assumir estrutura). |
| `Cria-evento-entrevista-agenda.js` | Script Google Apps Script que cria o evento na agenda a partir da planilha de alocação. |

### 3.5 ⚠️ Aba "BD Candidatos" da planilha oficial está DESATUALIZADA
Na Fase 3, **ignorar** a aba `BD Candidatos` da planilha `Entrevistas com Coordena - Alocações...`. A fonte da verdade para "quem é candidato na Fase 3" é o **CSV de respostas do formulário** (`E.C Candidatos - disponibilidade...`).

Diferença em relação à Fase 2: lá o BD Candidatos era a fonte da verdade; aqui é o formulário.

### 3.6 Regra de output: marcações **só no terminal**
Na Fase 3 **nunca editar a planilha** (`Entrevistas com Coordena - Alocações - Horários (1).csv` nem sucessoras). Todas as propostas de marcação devem sair **apenas como texto/tabela no terminal**. O Pedro copia manualmente para a planilha depois.

Fluxo esperado:
1. Claude propõe par `Candidato × Coordena × Dia × Horário` no chat.
2. Pedro dá OK explícito ("ok marca", "confirma").
3. Pedro digita na planilha ele mesmo — Claude não toca.

---

## 4. Regras operacionais que valem em qualquer fase

Estas regras foram formadas ao longo da Fase 2 e continuam valendo:

### 4.1 Nunca marcar sem validação
Toda proposta de alocação exige:
1. Sugestão completa no terminal (com alternativas — ver 4.2).
2. **OK explícito** do usuário.
3. Só então gravar (na Fase 3, "gravar" = o Pedro digitando, não o Claude).

### 4.2 Sempre listar alternativas ao sugerir
Ao propor um par/grupo para um slot, retornar **dois blocos**:
1. **Proposta principal**.
2. **Outros candidatos disponíveis para o mesmo slot** (com o status de cada um), pra o Pedro poder trocar sem precisar pedir nova consulta.

Não aplicar essa regra em cruzamentos massivos (panorama geral), só em pedidos do tipo "monte marcações para o slot X".

### 4.3 Dedup obrigatória por nome
Ao varrer qualquer planilha do PAME, deduplicar candidatos por **nome completo** (case-insensitive, ignorando acentos e espaços extras). CSVs acumulam remarcações antigas com linhas repetidas — contar sem dedup infla números.

### 4.4 Atenção a datas
Slot com `FALSE` **só é ausência real** se a data já passou. Slots de hoje ou futuros com `FALSE` são apenas "ainda não rolou / status não atualizado". Comparar sempre com a data de hoje antes de rotular alguém como "ausente" ou "remarcável".

### 4.5 Reprovados e desistentes ficam de fora
Filtrar **antes** de qualquer contagem ou cruzamento.

**10 reprovados (2026-06-25):**
Antonio Bittencourt Correa · Arthur Siqueira Paz Teixeira · Carlos José Batista da Silva · Gabriel Mendes De Lima Chagas · Gustavo Faria Takama · João Pedro Carvalho dos Santos · Marisa Pires Coutinho Machado · Rafael Britto Binder · Victor Hugo Russo Cordeiro · Vítor Fernandes de Carvalho Ambrizzi.

**15 desistentes / eliminados:**
Nina Estefan Lima Gomes Costa · Franco Aleixo de Moraes · Lucas da Silva Rezende · Lucas Santos Nogueira · Natalia Lima de Carvalho · Ana Clara Véras Barros · Gabriel Arcanjo de Moura Costa · Luca Castro de Melo · João Pedro Mansur Dias Bianco · Lucas Dotto de Oliveira (aparece como "Lucas Dotto e Oliveira" no BD antigo — mesma pessoa) · Agatha Marques de Castilho · Ana Clara Basilio Portes · Kauê de Araujo Soares Godim da Silva · Letícia Portela Oliveira Bem · Vitor Gadelha.

---

## 5. Contexto histórico da Fase 2 (não é foco, mas ajuda contexto)

Guardado só pra explicar de onde vêm certos artefatos e nomes de arquivo. Nada aqui precisa ser reexecutado.

### 5.1 Arquivos da Fase 2 (em `Meus-Scripts/Automacao-marcao-dinamicas-final/`)
- `Alocações de Membros - Dinâmicas em grupo - BD Candidatos (2).csv` — pool oficial de candidatos até a Fase 2. **Coluna `Alocado em um horário` NÃO era mantida sincronizada** — sempre olhar a planilha de Alocação, não o BD.
- `Alocações de Membros - Dinâmicas em grupo - Alocação - Candidatos (6).csv` — planilha de alocação da Fase 2. Cada linha = 1 dinâmica (`Dia` + `Horário`) com até 5 candidatos (colunas `Candidato 1`-`Candidato 5`). Colunas `Presente?` em **I, N, S, X, AC** = fonte da verdade para "fez a dinâmica" (TRUE=fez, FALSE=não fez).
- `Cruzamento de horários - Dinâmicas - Mapeamento por horário (3).csv` — base oficial de disponibilidade dos candidatos por `Data`+`Horário` na Fase 2.

### 5.2 Regras que valeram só na Fase 2 (dinâmica em grupo)
- Tamanho preferencial de grupo: 4 candidatos. Grupo de 3 aceitável; 5º candidato como exceção pra salvar "órfãos"; grupo de 1-2 em "standby" quando não dava pra fechar mais.
- 29/06/2026 **não teve dinâmica** — slots 29/06 do Mapeamento não valem.
- Semana extra 07-09/07/2026 foi criada pra acomodar pendentes.
- Disponibilidades da semana extra vieram por mensagem direta (formato vago), não formulário — pedir esclarecimento se ambíguo.

### 5.3 Cruzamentos típicos da Fase 2
- "Quem é candidato?" → BD Candidatos (2).
- "Quem está alocado?" → nome aparece em qualquer coluna `Candidato 1-5` da Alocação (6), com dedup.
- "Quem fez a dinâmica?" → contar TRUEs nas colunas I, N, S, X, AC da Alocação (6).
- "Quem pode em `Dia`+`Horário`?" → Mapeamento por horário (3).

---

## 6. Perfil do usuário

- **Nome**: Pedro Motta (email: `pnaves9@gmail.com`).
- **Papel**: coordenador do processo PAME na Fluxo.
- Prefere respostas **concisas**, sem resumo redundante no fim.
- Quer ser o **gatekeeper final** de qualquer marcação — Claude propõe, ele decide.
- Escreve em **português (Brasil)**.

---

## 7. Como abordar uma tarefa nova na Fase 3

Roteiro sugerido para o Claude da nova chatbox:

1. **Ler o CSV de candidatos** (`E.C Candidatos - disponibilidade...`) e o CSV de Coordenas (`Coordenas - disponibilidade... (1)`).
2. **Filtrar** reprovados + desistentes (listas em §4.5).
3. **Deduplicar** candidatos por nome.
4. **Agrupar** candidatos por Coordenação (coluna D).
5. Para cada candidato, cruzar disponibilidade × disponibilidade do(s) Coordena(s) da sua área.
6. Ao **propor** marcações:
   - Respeitar regra dura de área (§3.2).
   - Equalizar carga entre os 2 Coordenas de PRO/QAB (§3.3).
   - Nunca 2 entrevistas no mesmo Coordena no mesmo slot (§3.1).
   - Listar alternativas quando aplicável (§4.2).
   - **Entregar tudo no terminal** — não editar planilha (§3.6).
7. Aguardar OK do Pedro antes de considerar qualquer marcação definitiva.
