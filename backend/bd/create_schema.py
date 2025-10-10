import enum
from datetime import datetime
from sqlalchemy import (
    create_engine,
    Column,
    Integer,
    String,
    Text,
    DateTime,
    Boolean,
    ForeignKey,
    Numeric,
    Time,
    Enum,
    Date,
    UniqueConstraint
)
from sqlalchemy.orm import relationship, declarative_base
from sqlalchemy.sql import func
from config import engine

Base = declarative_base()

# --- Modelos do App 'Core' e 'Accounts' ---
class Unidade(Base):
    __tablename__ = 'unidades'
    id = Column(Integer, primary_key=True)
    nome = Column(String(100), unique=True, nullable=False)
    endereco = Column(Text, nullable=True)
    telefone = Column(String(20), nullable=True)
    is_active = Column(Boolean, default=True, nullable=False)
    criado_em = Column(DateTime, default=datetime.utcnow)
    atualizado_em = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    username = Column(String(150), unique=True, nullable=False)
    password = Column(String(128), nullable=False)
    email = Column(String(254), unique=True, nullable=False)
    first_name = Column(String(150))
    last_name = Column(String(150))
    is_active = Column(Boolean, default=True)
    is_superuser = Column(Boolean, default=False) 
    criado_em = Column(DateTime, default=datetime.utcnow)

class PerfilCargoEnum(enum.Enum):
    ADMIN_MASTER = 'Admin Master'
    ADMINISTRADOR = 'Administrador'
    RECEPCIONISTA = 'Recepcionista'
    FISIOTERAPEUTA = 'Fisioterapeuta'
    INSTRUTOR = 'Instrutor (Ed. Físico)'
    ALUNO = 'Aluno / Paciente'

class Perfil(Base):
    __tablename__ = 'perfis'
    id = Column(Integer, primary_key=True)
    usuario_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    unidade_id = Column(Integer, ForeignKey('unidades.id'), nullable=False)
    cargo = Column(Enum(PerfilCargoEnum), nullable=False)
    pode_realizar_vendas = Column(Boolean, default=False)
    
    usuario = relationship("User", backref="perfis")
    unidade = relationship("Unidade", backref="perfis")

    __table_args__ = (UniqueConstraint('usuario_id', 'unidade_id', 'cargo', name='_usuario_unidade_cargo_uc'),)


# --- Modelos do App 'Studio' ---
class Plano(Base):
    __tablename__ = 'planos'
    id = Column(Integer, primary_key=True)
    nome = Column(String(100), nullable=False)
    descricao = Column(Text)
    valor = Column(Numeric(10, 2), nullable=False)
    aulas_semanais = Column(Integer)
    is_active = Column(Boolean, default=True)

class Matricula(Base):
    __tablename__ = 'matriculas'
    id = Column(Integer, primary_key=True)
    aluno_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    plano_id = Column(Integer, ForeignKey('planos.id'), nullable=False)
    data_inicio = Column(Date, nullable=False)
    data_vencimento = Column(Date, nullable=False)
    is_active = Column(Boolean, default=True)

    aluno = relationship("User", backref="matriculas")
    plano = relationship("Plano")

class SolicitacaoTrocaPlanoStatusEnum(enum.Enum):
    PENDENTE = 'Pendente'
    APROVADO = 'Aprovado'
    REJEITADO = 'Rejeitado'

class SolicitacaoTrocaPlano(Base):
    __tablename__ = 'solicitacoes_troca_plano'
    id = Column(Integer, primary_key=True)
    matricula_id = Column(Integer, ForeignKey('matriculas.id'), nullable=False)
    novo_plano_id = Column(Integer, ForeignKey('planos.id'), nullable=False)
    status = Column(Enum(SolicitacaoTrocaPlanoStatusEnum), default=SolicitacaoTrocaPlanoStatusEnum.PENDENTE, nullable=False)
    observacao_admin = Column(Text)
    criado_em = Column(DateTime, default=datetime.utcnow)

    matricula = relationship("Matricula")
    novo_plano = relationship("Plano")

class Aula(Base):
    __tablename__ = 'aulas'
    id = Column(Integer, primary_key=True)
    unidade_id = Column(Integer, ForeignKey('unidades.id'), nullable=False)
    instrutor_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    dia_semana = Column(Integer, nullable=False)
    horario = Column(Time, nullable=False)
    capacidade_maxima = Column(Integer, nullable=False)

    unidade = relationship("Unidade")
    instrutor = relationship("User")

class AgendamentoStatusPresencaEnum(enum.Enum):
    PRESENTE = 'Presente'
    FALTA = 'Falta'
    CANCELADO = 'Cancelado'
    REMARCADO = 'Remarcado'

class Agendamento(Base):
    __tablename__ = 'agendamentos'
    id = Column(Integer, primary_key=True)
    aluno_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    aula_id = Column(Integer, ForeignKey('aulas.id'), nullable=False)
    data_aula = Column(Date, nullable=False)
    status_presenca = Column(Enum(AgendamentoStatusPresencaEnum))
    
    aluno = relationship("User")
    aula = relationship("Aula")
    __table_args__ = (UniqueConstraint('aluno_id', 'aula_id', 'data_aula', name='_aluno_aula_data_uc'),)


# --- Modelos do App 'Clinical' ---
class Avaliacao(Base):
    __tablename__ = 'avaliacoes'
    aluno_id = Column(Integer, ForeignKey('users.id'), primary_key=True)
    fisioterapeuta_responsavel_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    diagnostico = Column(Text, nullable=False)
    criado_em = Column(DateTime, default=datetime.utcnow)

    aluno = relationship("User", back_populates="avaliacao")
    User.avaliacao = relationship("Avaliacao", uselist=False, back_populates="aluno")

class RegistroEvolucaoTipoEnum(enum.Enum):
    PRONTUARIO = 'Prontuário (Fisioterapia)'
    PLANEJAMENTO = 'Planejamento de Aula (Ed. Físico)'

class RegistroEvolucao(Base):
    __tablename__ = 'registros_evolucao'
    id = Column(Integer, primary_key=True)
    agendamento_id = Column(Integer, ForeignKey('agendamentos.id'), unique=True, nullable=False)
    tipo = Column(Enum(RegistroEvolucaoTipoEnum), nullable=False)
    descricao = Column(Text, nullable=False)
    
    criado_por_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    atualizado_em = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    agendamento = relationship("Agendamento", backref="evolucao")
    criado_por = relationship("User")


if __name__ == "__main__":
    print("Iniciando a criação do schema do banco de dados...")
    Base.metadata.create_all(engine)
    print("Schema criado com sucesso!")