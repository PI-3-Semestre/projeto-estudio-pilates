import React, { useState, useEffect } from 'react';
import FormInput from './FormInput';

const AvaliacaoForm = ({ initialData, onSubmit, onCancel, loading, errors = {} }) => {
  const [formData, setFormData] = useState({
    data_avaliacao: '',
    diagnostico_fisioterapeutico: '',
    historico_medico: '',
    patologias: '',
    exames_complementares: '',
    medicamentos_em_uso: '',
    tratamentos_realizados: '',
    objetivo_aluno: '',
    foto_avaliacao_postural: null,
    data_reavalicao: '',
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        data_avaliacao: initialData.data_avaliacao || '',
        diagnostico_fisioterapeutico: initialData.diagnostico_fisioterapeutico || '',
        historico_medico: initialData.historico_medico || '',
        patologias: initialData.patologias || '',
        exames_complementares: initialData.exames_complementares || '',
        medicamentos_em_uso: initialData.medicamentos_em_uso || '',
        tratamentos_realizados: initialData.tratamentos_realizados || '',
        objetivo_aluno: initialData.objetivo_aluno || '',
        foto_avaliacao_postural: null,
        data_reavalicao: initialData.data_reavalicao || '',
      });
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, foto_avaliacao_postural: reader.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // **CORREÇÃO APLICADA AQUI**
    // O formulário agora envia seu estado bruto. A responsabilidade de montar
    // o objeto final é da view que o utiliza.
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormInput
          label="Data da Avaliação"
          name="data_avaliacao"
          type="date"
          value={formData.data_avaliacao}
          onChange={handleChange}
          error={errors.data_avaliacao}
          required
        />
        <FormInput
          label="Data da Reavaliação"
          name="data_reavalicao"
          type="date"
          value={formData.data_reavalicao}
          onChange={handleChange}
          error={errors.data_reavalicao}
        />
      </div>
      <FormInput
        label="Diagnóstico Fisioterapêutico"
        name="diagnostico_fisioterapeutico"
        type="textarea"
        value={formData.diagnostico_fisioterapeutico}
        onChange={handleChange}
        error={errors.diagnostico_fisioterapeutico}
      />
      <FormInput
        label="Histórico Médico"
        name="historico_medico"
        type="textarea"
        value={formData.historico_medico}
        onChange={handleChange}
        error={errors.historico_medico}
      />
      <FormInput
        label="Patologias"
        name="patologias"
        type="textarea"
        value={formData.patologias}
        onChange={handleChange}
        error={errors.patologias}
      />
      <FormInput
        label="Exames Complementares"
        name="exames_complementares"
        type="textarea"
        value={formData.exames_complementares}
        onChange={handleChange}
        error={errors.exames_complementares}
      />
      <FormInput
        label="Medicamentos em Uso"
        name="medicamentos_em_uso"
        type="textarea"
        value={formData.medicamentos_em_uso}
        onChange={handleChange}
        error={errors.medicamentos_em_uso}
      />
      <FormInput
        label="Tratamentos Realizados"
        name="tratamentos_realizados"
        type="textarea"
        value={formData.tratamentos_realizados}
        onChange={handleChange}
        error={errors.tratamentos_realizados}
      />
      <FormInput
        label="Objetivo do Aluno"
        name="objetivo_aluno"
        type="textarea"
        value={formData.objetivo_aluno}
        onChange={handleChange}
        error={errors.objetivo_aluno}
      />
      <FormInput
        label="Foto da Avaliação Postural"
        name="foto_avaliacao_postural"
        type="file"
        onChange={handleFileChange}
        accept="image/*"
        error={errors.foto_avaliacao_postural}
      />
      <div className="flex justify-end space-x-4">
        <button type="button" onClick={onCancel} disabled={loading} className="flex items-center justify-center rounded-xl h-12 px-5 border border-gray-300 bg-white text-gray-700 font-bold hover:bg-gray-50 disabled:opacity-50">
          Cancelar
        </button>
        <button type="submit" disabled={loading} className="flex items-center justify-center rounded-xl h-12 px-5 bg-action-primary text-text-light font-bold hover:bg-action-primary/90 disabled:opacity-50">
          {loading ? 'Salvando...' : 'Salvar Avaliação'}
        </button>
      </div>
    </form>
  );
};

export default AvaliacaoForm;
