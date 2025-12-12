import React from 'react';
import { format } from 'date-fns'; // Para formatar as datas

const DetailItem = ({ label, value }) => (
  <div>
    <h3 className="text-sm font-medium text-gray-500">{label}</h3>
    <p className="mt-1 text-base text-gray-900">{value || 'Não informado'}</p>
  </div>
);

const AvaliacaoDetails = ({ avaliacao, onEdit, onDelete, loading }) => {
  if (!avaliacao) {
    return (
      <div className="text-center py-10">
        <p className="text-gray-500">Nenhuma avaliação selecionada.</p>
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return 'Não informado';
    // Adiciona um dia para corrigir problemas de fuso horário que podem fazer a data "voltar" um dia
    const date = new Date(dateString);
    date.setUTCDate(date.getUTCDate() + 1);
    return format(date, 'dd/MM/yyyy');
  };

  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            Avaliação de {formatDate(avaliacao.data_avaliacao)}
          </h2>
          <p className="text-sm text-gray-600">
            Realizada por: {avaliacao.instrutor_nome}
          </p>
        </div>
        <div className="flex space-x-3">
          <button onClick={onEdit} disabled={loading} className="flex items-center justify-center rounded-xl h-9 px-4 border border-gray-300 bg-white text-gray-700 text-sm font-bold hover:bg-gray-50 disabled:opacity-50">
            Editar
          </button>
          <button onClick={onDelete} disabled={loading} className="flex items-center justify-center rounded-xl h-9 px-4 bg-red-600 text-white text-sm font-bold hover:bg-red-700 disabled:opacity-50">
            {loading ? 'Excluindo...' : 'Excluir'}
          </button>
        </div>
      </div>

      <div className="space-y-6">
        {avaliacao.foto_avaliacao_postural && (
          <div className="w-full md:w-1/2">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Foto da Avaliação Postural</h3>
            <img 
              src={avaliacao.foto_avaliacao_postural} 
              alt="Avaliação Postural" 
              className="rounded-lg border"
            />
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DetailItem label="Diagnóstico Fisioterapêutico" value={avaliacao.diagnostico_fisioterapeutico} />
          <DetailItem label="Objetivo do Aluno" value={avaliacao.objetivo_aluno} />
          <DetailItem label="Histórico Médico" value={avaliacao.historico_medico} />
          <DetailItem label="Patologias" value={avaliacao.patologias} />
          <DetailItem label="Exames Complementares" value={avaliacao.exames_complementares} />
          <DetailItem label="Medicamentos em Uso" value={avaliacao.medicamentos_em_uso} />
          <DetailItem label="Tratamentos Realizados" value={avaliacao.tratamentos_realizados} />
          <DetailItem label="Data da Próxima Reavaliação" value={formatDate(avaliacao.data_reavalicao)} />
        </div>
      </div>
    </div>
  );
};

export default AvaliacaoDetails;
