import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getModalidades } from '../services/modalidadesService';
import studiosService from '../services/studiosService';
import { getColaboradores } from '../services/colaboradoresService';
import { createAula } from '../services/aulasService';
import { useAuth } from '../context/AuthContext';

const useCadastrarAulaViewModel = () => {
  const navigate = useNavigate();
  const { userType } = useAuth();
  const [formData, setFormData] = useState({
    modalidade: '',
    studio: '',
    instrutor_principal: '',
    instrutor_substituto: '',
    data_hora_inicio: '',
    capacidade_maxima: '10',
    duracao_minutos: '60',
    tipo_aula: 'REGULAR',
  });
  const [modalidades, setModalidades] = useState([]);
  const [studios, setStudios] = useState([]);
  const [instrutores, setInstrutores] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const isStaff = userType === 'admin_master' || userType === 'studio_admin';

  useEffect(() => {
    const fetchData = async () => {
      if (!isStaff) {
        setError("Você não tem permissão para acessar esta página.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const [mods, studs, colabs] = await Promise.all([
          getModalidades(),
          studiosService.getAllStudios(),
          getColaboradores(),
        ]);
        setModalidades(mods.data);
        setStudios(studs.data);
        // Corrigido: Filtrar colaboradores com base no array de perfis
        const instrutoresFiltrados = colabs.data.filter(colab =>
          colab.perfis.some(perfil => perfil.nome.toLowerCase() === 'instrutor')
        );
        setInstrutores(instrutoresFiltrados);
      } catch (err) {
        setError("Erro ao carregar dados necessários.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isStaff]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleDateTimeChange = useCallback((date, time) => {
    if (date && time) {
      const dateTimeString = `${date}T${time}:00`;
      setFormData((prev) => ({ ...prev, data_hora_inicio: dateTimeString }));
    }
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!formData.data_hora_inicio) {
        throw new Error("Data e hora são obrigatórias.");
    }

    try {
      await createAula(formData);
      navigate('/agenda');
    } catch (err) {
      console.error("Erro ao criar aula:", err.response?.data);
      const errorMessage = err.response?.data?.message || "Ocorreu um erro ao criar a aula.";
      setError(errorMessage);
      throw err;
    }
  };

  return {
    formData,
    modalidades,
    studios,
    instrutores,
    loading,
    error,
    isStaff,
    handleChange,
    handleDateTimeChange,
    handleSubmit,
  };
};

export default useCadastrarAulaViewModel;
