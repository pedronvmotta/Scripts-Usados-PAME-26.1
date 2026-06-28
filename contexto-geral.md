# Contexto Geral — Marcação de Dinâmicas PAME

> **Como usar este arquivo:** é um manual conceitual pra você (Claude novo) entender o domínio do problema sem precisar que o Pedro te explique de novo. Leitura recomendada na ordem:
> 1. `contexto-geral.md` (este) — **o que é**, **como funciona**, **como agir**.
> 2. `contexto.md` — **estado atual operacional**: paths dos CSVs, listas vigentes (reprovados, snapshots), regras detalhadas.
> 3. `memory/MEMORY.md` — preferências do usuário e regras transversais.
>
> Esses arquivos são complementares. Quando algo no `contexto.md` parecer desatualizado (path quebrado, arquivo sumiu), confie no filesystem e atualize o `contexto.md`. Este arquivo aqui muda raramente — só se o processo em si mudar.

---

## 1. O que é o projeto

O **PAME** é uma etapa de um processo seletivo (organização "Fluxo", baseada em sala/sede física com "Bloco A" e "salas de cálculo"). A **dinâmica em grupo** é uma das etapas do processo: candidatos pré-aprovados são reunidos em grupos pequenos num slot de horário pra fazer uma sessão presencial avaliada por **membros** (staff).

**Meu papel (Claude):** ajudar o Pedro a operar a marcação dessas dinâmicas — saber quem ainda precisa ser marcado, sugerir grupos compatíveis com a disponibilidade dos candidatos e dos membros, e atualizar as planilhas que controlam tudo isso. Eu **não tomo decisões sozinho** — sempre proponho e espero OK.

---

## 2. Glossário

| Termo | O que é |
|---|---|
| **Candidato** | Pessoa do processo seletivo. Precisa fazer a dinâmica pra avançar. |
| **Membro** | Staff/avaliador que conduz a dinâmica. Tem disponibilidade própria que precisa bater com o slot. |
| **Dinâmica** | Sessão presencial em grupo, geralmente 3–5 candidatos por sessão. |
| **Slot** | Combinação `Dia` + `Horário` em que uma dinâmica pode ser marcada. |
| **Grupo** | Conjunto de candidatos alocados num mesmo slot. |
| **BD Candidatos** | Pool oficial — lista de todos os candidatos ativos no processo. |
| **Alocação** | Planilha onde cada linha = um grupo marcado (slot + até 5 candidatos). |
| **Mapeamento por horário** | Planilha derivada dos forms — pra cada slot, quem (candidatos e membros) está disponível. |
| **Remarcar** | Candidato estava num slot e pediu pra trocar. Linha antiga fica com `Vai?`/`Presente?` = FALSE e uma nova linha aparece em outro slot. |
| **Reprovado** | Eliminado em etapa anterior à dinâmica — fora do processo, **sempre ignorar**. |

---

## 3. Atores e seus estados

### Candidato

Fluxo de vida típico no processo de dinâmica:
1. **Pendente:** está no BD, mas não está em nenhuma linha da Alocação.
2. **Alocado:** aparece em uma linha da Alocação (`Candidato 1` … `Candidato 5`).
3. **Confirmado:** alocado + `Vai? = TRUE`.
4. **Fez a dinâmica:** `Presente? = TRUE` na coluna correspondente (I/N/S/X/AC pra Cand 1/2/3/4/5). **Esta é a fonte oficial de "fez ou não fez".**
5. **Ausente:** linha de slot **já passado** com `Presente? = FALSE`.
6. **Remarcou:** linha velha com `Presente? = FALSE` + linha nova num slot futuro.
7. **Reprovado:** eliminado antes — fora do processo.

> ⚠️ Slot **de hoje ou futuro** com `Presente? = FALSE` **NÃO é ausência** — é "dinâmica ainda não rolou". Comparar sempre com a data de hoje antes de classificar como ausência.
>
> ⚠️ A coluna `Fez a dinâmica` do **BD Candidatos** NÃO é fonte da verdade — usar sempre `Presente?` da Alocação.

### Membro

- Tem disponibilidade própria (vem de outro form).
- Aparece no Mapeamento por horário junto com os candidatos.
- Não é minha responsa direta — o Pedro casa membro × candidato; eu foco em encaixar candidatos em slots que tenham pelo menos algum membro disponível.

---

## 4. Fluxo dos dados (de onde sai a informação)

```
Form de disponibilidade dos CANDIDATOS (Google Forms)
   │
Form de disponibilidade dos MEMBROS (Google Forms)
   │
   ▼
Respostas brutas (CSVs em Automacao-marcao-dinamicas-final/)
   │
   ▼
Scripts no Google Sheets (Disponibilidade.js, scriptAba*.js)
   │  consolidam tudo
   ▼
Mapeamento por horário (3).csv   ← FONTE DA VERDADE de disponibilidade
   │
   ▼
[Eu cruzo: BD × Alocação × Mapeamento]
   │
   ▼
Proposta de grupo + alternativas (no terminal)
   │
   ▼  (OK do Pedro)
Atualização da planilha de Alocação
```

**Três planilhas mandam:**
- **BD Candidatos** → quem existe no processo.
- **Alocação - Candidatos** → quem já está marcado e em qual slot.
- **Mapeamento por horário** → quem pode em cada slot.

(Os paths atualizados estão em `contexto.md` — não duplicar aqui.)

---

## 5. Tarefas típicas que o Pedro pede

| Pedido | Como resolver |
|---|---|
| "Quem ainda não foi marcado?" | BD menos Alocação (deduplicado, sem reprovados). |
| "Sugere um grupo pro slot DD/MM HHh" | Mapeamento daquele slot ∩ não-alocados → propor grupo de 4 + listar alternativas. |
| "Quem pode no horário X?" | Filtrar Mapeamento por horário (3) pela linha do slot. |
| "Marca esse grupo aí" | **Nunca direto.** Propor primeiro no terminal, esperar OK explícito, depois editar planilha. |
| "Cruza X com Y" | Sempre dedup por nome (case-insensitive, ignorando acentos/espaços). |

---

## 6. Regras de ouro (não negociáveis)

1. **Nunca editar planilha do PAME sem proposta no terminal + OK explícito do Pedro.** Vale pra Alocação e BD.
2. **Sempre deduplicar por nome** ao varrer a Alocação (mesmo candidato aparece em múltiplas linhas quando remarca).
3. **Sempre filtrar os 10 reprovados** (lista em `contexto.md`).
4. **Slot futuro/hoje com FALSE ≠ ausência.** Só é ausência se a data já passou.
5. **Ao sugerir grupo, sempre listar alternativas** — outros candidatos do mesmo slot que poderiam entrar no lugar.
6. **Tamanho de grupo:** ideal 4, aceitável 3, exceção 5 (pra "salvar" candidato órfão).
7. **Coluna `Alocado em um horário` do BD está sempre vazia** — não confiar nela. Pra saber se alguém está alocado, ir na Alocação.
8. **"Fez a dinâmica?" = `Presente?` da Alocação (colunas I/N/S/X/AC).** TRUE = fez; FALSE = não fez. **NÃO usar** a coluna `Fez a dinâmica` do BD.

---

## 7. Anti-padrões (erros que o Claude já cometeu — não repetir)

- ❌ Marcar dinâmicas **do dia atual** como "ausência" só porque viu `FALSE` em Presente.
- ❌ Contar candidatos alocados sem deduplicar (dá número inflado por causa das remarcações).
- ❌ Usar a coluna `Alocado em um horário` do BD pra inferir alocação.
- ❌ Editar planilha direto sem propor antes.
- ❌ Sugerir grupo sem listar alternativas — o Pedro precisa do leque pra trocar.
- ❌ Considerar reprovados em contagens/sugestões.
- ❌ Assumir que paths são estáveis — a estrutura de pastas já mudou pelo menos 2x. Sempre verificar.

---

## 8. Onboarding rápido — primeiros minutos pro novo Claude

Sequência sugerida quando você (Claude) entrar nesse projeto pela primeira vez:

1. **Ler este arquivo (`contexto-geral.md`)** — domínio e regras conceituais.
2. **Ler `contexto.md`** — paths atuais, lista de reprovados, regras operacionais detalhadas, snapshots.
3. **Ler `memory/MEMORY.md`** — preferências do Pedro e regras transversais salvas em sessões anteriores.
4. **Antes da primeira ação:**
   - Verificar com `ls`/`Glob` se os paths do `contexto.md` ainda batem com o filesystem (a pasta de trabalho já mudou de `Cruzar-Horarios/` pra `Automacao-marcao-dinamicas-final/`).
   - Comparar a data de hoje (sistema diz no `currentDate`) com qualquer snapshot do `contexto.md` — snapshot antigo precisa ser refeito antes de usar.
5. **Quando o Pedro pedir algo:** identificar qual das 3 planilhas resolve, propor no terminal, esperar OK.

---

## 9. Divisão de responsabilidade entre os arquivos de contexto

| Tipo de info | Arquivo |
|---|---|
| O que é PAME, glossário, fluxo do processo, regras conceituais | `contexto-geral.md` (este) |
| Onboarding pra Claude novo | `contexto-geral.md` (este) |
| Paths atuais dos CSVs ativos | `contexto.md` |
| Lista nominal de reprovados | `contexto.md` |
| Regras operacionais detalhadas e datadas | `contexto.md` |
| Snapshots (não-alocados, alocações repetidas) | `contexto.md` |
| Histórico de reorganizações de pastas | `contexto.md` |
| Preferências pessoais do Pedro / hábitos | `memory/MEMORY.md` |

**Regra de manutenção:**
- Path mudou? Arquivo sumiu? → atualizar `contexto.md`.
- Processo mudou (novo tipo de etapa, novo ator, regra estrutural)? → atualizar `contexto-geral.md`.
- Pedro deu nova preferência transversal? → atualizar `memory/MEMORY.md`.
