# Nome do ficheiro: limpar_migracoes.py

import os
import sys

def limpar_migracoes_do_backend():
    """
    Percorre todos os subdiretórios a partir da localização atual (a pasta 'backend'),
    encontra todas as pastas 'migrations' e apaga os ficheiros de migração,
    exceto o ficheiro '__init__.py'.
    """
    
    # O ponto de partida é o diretório atual ('.'), que deve ser a pasta 'backend'.
    diretorio_inicial = '.'
    
    # Lista para guardar os caminhos dos ficheiros que devem ser apagados.
    ficheiros_a_eliminar = []

    print("--- Iniciando a busca por ficheiros de migração ---")

    # os.walk() percorre recursivamente todas as pastas e ficheiros.
    # Para cada pasta, ele dá-nos o caminho, as subpastas e os ficheiros nela contidos.
    for pasta_atual, subpastas, ficheiros in os.walk(diretorio_inicial):
        
        # A condição chave: estamos interessados apenas em pastas chamadas 'migrations'.
        # os.path.basename() pega o último nome do caminho (o nome da pasta).
        if os.path.basename(pasta_atual) == 'migrations':
            
            print(f"-> Encontrada a pasta de migrações em: {pasta_atual}")
            
            # Percorremos os ficheiros encontrados dentro desta pasta 'migrations'.
            for nome_ficheiro in ficheiros:
                
                # A regra de exclusão: ignoramos o ficheiro de inicialização do Python.
                if nome_ficheiro != '__init__.py':
                    
                    # Construímos o caminho completo para o ficheiro.
                    # os.path.join() é a forma correta de juntar caminhos, funciona em qualquer sistema operativo.
                    caminho_completo = os.path.join(pasta_atual, nome_ficheiro)
                    
                    # Adicionamos o ficheiro à nossa lista de alvos.
                    ficheiros_a_eliminar.append(caminho_completo)

    # Se, após toda a busca, a lista estiver vazia, informamos o utilizador.
    if not ficheiros_a_eliminar:
        print("\n✅ Nenhum ficheiro de migração para apagar foi encontrado.")
        return

    # Se encontrámos ficheiros, apresentamos um aviso claro antes de continuar.
    print("\n---------------------------------------------------------")
    print("⚠️  AVISO: Os seguintes ficheiros serão apagados para sempre:")
    print("---------------------------------------------------------")
    
    for caminho in ficheiros_a_eliminar:
        print(f"  - {caminho}")

    # A etapa de confirmação, a nossa salvaguarda.
    try:
        confirmacao = input("\n❓ Tem a certeza absoluta que deseja continuar? (s/n): ")
    except KeyboardInterrupt:
        # Permite cancelar com Ctrl+C de forma elegante.
        print("\n\nOperação cancelada pelo utilizador.")
        sys.exit()

    # Processamos a resposta do utilizador.
    if confirmacao.lower() == 's':
        print("\nIniciando a limpeza...")
        sucessos = 0
        erros = 0
        
        for caminho in ficheiros_a_eliminar:
            try:
                os.remove(caminho)
                print(f"  [✓] Apagado: {caminho}")
                sucessos += 1
            except OSError as e:
                print(f"  [✗] ERRO ao apagar {caminho}: {e}")
                erros += 1
        
        print(f"\n✨ Limpeza concluída! {sucessos} ficheiro(s) apagado(s), {erros} erro(s).")
    else:
        print("\nOperação cancelada. Nenhum ficheiro foi modificado.")

# Padrão em Python para garantir que o código só é executado quando o ficheiro é chamado diretamente.
if __name__ == "__main__":
    limpar_migracoes_do_backend()