import pandas as pd
import pywhatkit as kit
import time
from datetime import datetime
import os
import json
import pyautogui
import random

# ============================================
# configuracoes
# ============================================

# caminho do arquivo excel (pode ser .xlsx ou .csv)
ARQUIVO_PLANILHA = "Planilha-mensagens-Fit-cultural.csv"

# nome da coluna que contem os numeros de telefone
COLUNA_TELEFONE = "Telefone (somente números)"

# nome da coluna que contem os nomes (opcional, use None se nao tiver)
COLUNA_NOME = "Nome completo"

# mensagem a ser enviada
# use {nome} se quiser personalizar com o nome da pessoa
MENSAGEM = """Olá {nome}! Tudo bem?

Meu nome é Camilla e eu sou uma das responsáveis pelo PAME 26.1 da Fluxo

Passando para lembrar que a nossa primeira etapa do PAME, o Fit Cultural, já está acontecendo! Essa é a nossa chance de te conhecer melhor, entender seu perfil e ver como você se conecta com a Fluxo.

Vi aqui que você ainda não respondeu ao formulário. O prazo final é até Terça-Feira (09/06).

O link para responder é esse aqui: https://forms.gle/TDiMG4XD1QVvjyjy8

Qualquer dúvida ou problema com o link, pode me mandar mensagem por aqui. Estamos ansiosos para te conhecer melhor!

"""

# tempo de espera entre mensagens (em segundos)
# recomendado: minimo 15-20 segundos para evitar bloqueio
#IMPORTANTE: mudei essa parte pra um tempo aleatório usando a biblioteca random
TEMPO_ESPERA = 20

# tempo de espera apos enviar cada mensagem (segundos)
TEMPO_CONFIRMACAO = 3

# arquivo para salvar progresso
ARQUIVO_PROGRESSO = "progresso_envio.json"

# arquivo de log
ARQUIVO_LOG = "log_envios.txt"

# ============================================
# codigo principal
# ============================================

def carregar_progresso():
    """carrega o progresso do arquivo json"""
    if os.path.exists(ARQUIVO_PROGRESSO):
        with open(ARQUIVO_PROGRESSO, 'r', encoding='utf-8') as f:
            return json.load(f)
    return {"enviados": [], "inicio": None}

def salvar_progresso(enviados):
    """salva o progresso no arquivo json"""
    with open(ARQUIVO_PROGRESSO, 'w', encoding='utf-8') as f:
        json.dump({
            "enviados": enviados,
            "inicio": datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        }, f, indent=2, ensure_ascii=False)

def registrar_log(mensagem):
    """registra uma mensagem no arquivo de log"""
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    with open(ARQUIVO_LOG, 'a', encoding='utf-8') as f:
        f.write(f"[{timestamp}] {mensagem}\n")
    print(mensagem)

def formatar_telefone(numero):
    """formata o numero para o padrao internacional +55 e trata o digito 9"""
    numero = str(numero).strip()
    # remove caracteres especiais
    numero = ''.join(filter(str.isdigit, numero))
    
    # Se já começar com 55, remove temporariamente para tratar o miolo
    if numero.startswith('55') and len(numero) > 11:
        numero = numero[2:]
    
    # Se o número ficou com 11 dígitos (ex: 21976099651)
    if len(numero) == 11:
        ddd = int(numero[:2])
        # A maioria dos DDDs do Brasil (especialmente de 11 a 28, que inclui RJ e SP)
        # usa o formato de 10 dígitos no banco de dados do WhatsApp
        if 11 <= ddd <= 28:
            numero = numero[:2] + numero[3:] # Remove o terceiro dígito (o 9)

    return '+55' + numero

def estimar_tempo(total_mensagens, tempo_por_msg):
    """estima o tempo total de envio"""
    total_segundos = total_mensagens * tempo_por_msg
    horas = int(total_segundos // 3600)
    minutos = int((total_segundos % 3600) // 60)
    return horas, minutos

# colocando uma função de gerar caracteres aleatórios pra diminuir o risco de levar o soft ban do spam,

#vai gerar uma sequência aleatória pequena e discreta pra tornar a mensagem única, ele escolhe uma tag entre letras e números e retorna isso formatado entre colchetes 

def gerar_emoji_aleatorio():
    emojis = [
    " 🚀", " 💥", " 🎯", " 🌟", " 📢", " 💡", " 💎", " 📈"]
    return random.choice(emojis)

def enviar_mensagens():
    print("Iniciando função...")
    print("=" * 50)
    print("SISTEMA DE ENVIO AUTOMÁTICO DE MENSAGENS")
    print("=" * 50)
    print()
    
    try:
        # le a planilha
        if ARQUIVO_PLANILHA.endswith('.csv'):
            df = pd.read_csv(ARQUIVO_PLANILHA)
        else:
            df = pd.read_excel(ARQUIVO_PLANILHA)
        
        print(f"Planilha carregada com sucesso!")
        print(f"  Total de contatos: {len(df)}")
        
        # verifica se a coluna de telefone existe
        if COLUNA_TELEFONE not in df.columns:
            print(f"ERRO: Coluna '{COLUNA_TELEFONE}' nao encontrada na planilha!")
            print(f"   Colunas disponiveis: {list(df.columns)}")
            return
        
        # carrega progresso anterior
        progresso = carregar_progresso()
        enviados_anteriormente = progresso.get("enviados", [])
        
        if enviados_anteriormente:
            print(f"\nProgresso anterior encontrado!")
            print(f"   {len(enviados_anteriormente)} mensagens ja foram enviadas.")
            resposta = input("   Deseja continuar de onde parou? (s/n): ").lower()
            if resposta != 's':
                enviados_anteriormente = []
                if os.path.exists(ARQUIVO_PROGRESSO):
                    os.remove(ARQUIVO_PROGRESSO)
                print("   Progresso resetado. Comecando do zero.")
        
        # filtra contatos ja enviados
        contatos_pendentes = df[~df.index.isin(enviados_anteriormente)]
        total_pendentes = len(contatos_pendentes)
        
        if total_pendentes == 0:
            print("\nTodas as mensagens ja foram enviadas!")
            return
        
        # estimativa de tempo
        tempo_por_msg = TEMPO_ESPERA + TEMPO_CONFIRMACAO + 5  # 5s para processar
        horas, minutos = estimar_tempo(total_pendentes, tempo_por_msg)
        
        print(f"\nEstatisticas:")
        print(f"   Total de contatos: {len(df)}")
        print(f"   Ja enviados: {len(enviados_anteriormente)}")
        print(f"   Pendentes: {total_pendentes}")
        print(f"   Tempo estimado: {horas}h {minutos}min")
        print()
        
        input("Pressione ENTER para iniciar o envio (certifique-se de que o WhatsApp Web está aberto)...")
        print()
        
        registrar_log("=" * 50)
        registrar_log(f"INÍCIO DO ENVIO - {total_pendentes} mensagens pendentes")
        registrar_log("=" * 50)
        
        sucessos = 0
        erros = 0
        enviados = list(enviados_anteriormente)
        
        for index, row in contatos_pendentes.iterrows():
            try:
                # pega o telefone
                telefone = formatar_telefone(row[COLUNA_TELEFONE])
                
                # pega o nome (se existir)
                if COLUNA_NOME and COLUNA_NOME in df.columns:
                    nome = row[COLUNA_NOME]
                else:
                    nome = "Cliente"
                
                # personaliza a mensagem
                mensagem_final = MENSAGEM.format(nome=nome)
                #colocando minha bobeira random (o "id" da mensagem)
                mensagem_final += gerar_emoji_aleatorio()
                
                print(f"[{len(enviados) + 1}/{len(df)}] Enviando para {nome} ({telefone})...")
                
                # envia a mensagem (abre em 15 segundos, sem fechar a aba)
                kit.sendwhatmsg_instantly(telefone, mensagem_final, wait_time=15, tab_close=False)
                
                # aguarda 5 segundos para garantir que a mensagem seja enviada
                print(f"  Aguardando confirmacao de envio...")
                time.sleep(TEMPO_CONFIRMACAO)
                
                print(f"  Mensagem enviada!")
                sucessos += 1
                enviados.append(index)
                
                # salva progresso a cada 5 mensagens
                if len(enviados) % 5 == 0:
                    salvar_progresso(enviados)
                    print(f"  Progresso salvo ({len(enviados)}/{len(df)})")
                
                registrar_log(f"Enviado para {nome} ({telefone})")
                
                # aguarda antes de enviar a proxima
                if len(enviados) < len(df):
                    #agora, ele espera de 20 a 40 segundos, mas escolhe um tempo aleatório
                    tempo_aleatorio = random.randint(20,40)
                    print(f"  Aguardando {tempo_aleatorio} segundos...")
                    time.sleep(tempo_aleatorio)
                    
                    # fecha a aba do whatsapp
                    print(f"  Fechando aba...")
                    pyautogui.hotkey('ctrl', 'w')  # ctrl+w fecha a aba
                    time.sleep(1)
                    
                
            except KeyboardInterrupt:
                print("\n\nEnvio interrompido pelo usuario!")
                salvar_progresso(enviados)
                registrar_log(f"INTERROMPIDO - {len(enviados)}/{len(df)} enviados")
                print(f"\nProgresso salvo! Voce pode continuar depois executando o script novamente.")
                print(f"   Enviados: {len(enviados)}/{len(df)}")
                return
                
            except Exception as e:
                print(f"  Erro ao enviar: {str(e)}")
                registrar_log(f"Erro ao enviar para {nome} ({telefone}): {str(e)}")
                erros += 1
                # salva progresso mesmo em caso de erro
                salvar_progresso(enviados)
                # aguarda um pouco mais em caso de erro
                time.sleep(10)
                continue
        
        # salva progresso final
        salvar_progresso(enviados)
        
        print()
        print("=" * 50)
        print("ENVIO CONCLUIDO!")
        print(f"Sucessos: {sucessos}")
        print(f"Erros: {erros}")
        print(f"Total: {len(enviados)}/{len(df)}")
        print("=" * 50)
        
        registrar_log("=" * 50)
        registrar_log(f"FIM DO ENVIO - Sucessos: {sucessos} | Erros: {erros}")
        registrar_log("=" * 50)
        
        # limpa arquivo de progresso se tudo foi enviado
        if len(enviados) == len(df):
            if os.path.exists(ARQUIVO_PROGRESSO):
                os.remove(ARQUIVO_PROGRESSO)
            print("\nTodos os contatos foram processados!")
        
    except FileNotFoundError:
        print(f"ERRO: Arquivo '{ARQUIVO_PLANILHA}' nao encontrado!")
        print("   Certifique-se de que o arquivo esta na mesma pasta do script.")
    except Exception as e:
        print(f"ERRO: {str(e)}")
        registrar_log(f"ERRO CRITICO: {str(e)}")

if __name__ == "__main__":
    enviar_mensagens()