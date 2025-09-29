# install_tools.py
import subprocess
import sys
import os
import locale

# --- Funções de Log para feedback visual ---
def log_info(message):
    print(f"🔵 [INFO] {message}")

def log_success(message):
    print(f"✅ [SUCESSO] {message}")

def log_error(message):
    print(f"❌ [ERRO] {message}")
    sys.exit(1) # Encerra o script em caso de erro

def run_command(command, description):
    """Executa um comando no terminal, detectando o encoding do sistema."""
    log_info(f"Executando: {description}...")
    try:
        # Usamos sys.executable para garantir que estamos usando o python/pip correto
        if command[0] == "python":
            command[0] = sys.executable
        
        # Detecta a codificação de caracteres padrão do sistema
        system_encoding = locale.getpreferredencoding(False)

        result = subprocess.run(
            command,
            check=True,
            capture_output=True,
            text=True,
            encoding=system_encoding,
            errors='ignore' # Ignora caracteres que ainda possam causar problemas
        )
        log_success(f"{description} concluído.")
        return result.stdout
    except subprocess.CalledProcessError as e:
        log_error(f"Falha ao executar '{description}'.")
        print("--- Detalhes do Erro ---")
        print(e.stderr)
        print("-------------------------")
        sys.exit(1)

def main():
    """Função principal para instalar as ferramentas."""
    print("--- 🚀 Iniciando Instalação de Ferramentas de Desenvolvimento ---")

    # 1. Instalar pipx
    run_command(
        ["python", "-m", "pip", "install", "--user", "pipx"],
        "Instalando pipx"
    )

    # 2. Adicionar pipx ao PATH do sistema
    run_command(
        ["python", "-m", "pipx", "ensurepath"],
        "Configurando o PATH para pipx"
    )

    # 3. Instalar Poetry usando pipx
    run_command(
        ["python", "-m", "pipx", "install", "poetry"],
        "Instalando Poetry de forma isolada com pipx"
    )

    print("\n" + "="*60)
    log_success("Todas as ferramentas foram instaladas com sucesso!")
    print("🔴 AÇÃO NECESSÁRIA: Por favor, REINICIE SEU TERMINAL agora.")
    print("Isso é crucial para que o comando 'poetry' seja reconhecido.")
    print("Após reiniciar, siga o Anexo B do Guia de Padronização.")
    print("="*60 + "\n")


if __name__ == "__main__":
    main()