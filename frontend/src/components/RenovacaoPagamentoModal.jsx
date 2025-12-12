import React from 'react';
import { useNavigate } from 'react-router-dom';

const RenovacaoPagamentoModal = ({ isOpen, onClose, matricula }) => {
    const navigate = useNavigate();

    if (!isOpen || !matricula) return null;

    const handleRegisterPayment = () => {
        navigate('/financeiro/pagamentos/novo', {
            state: {
                matriculaId: matricula.id,
                valor: matricula.plano.preco,
            },
        });
    };

    const handleRegisterLater = () => {
        onClose();
        navigate('/matriculas');
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white dark:bg-card-dark rounded-lg shadow-xl w-full max-w-md text-center p-6">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Matrícula Registrada!</h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                    A matrícula para o plano "{matricula.plano.nome}" foi registrada com sucesso. Deseja registrar o pagamento agora?
                </p>
                <div className="flex justify-center space-x-4">
                    <button
                        onClick={handleRegisterLater}
                        className="px-6 py-2 bg-gray-300 dark:bg-gray-600 text-gray-800 dark:text-gray-200 rounded-lg hover:bg-gray-400 dark:hover:bg-gray-700 transition-colors"
                    >
                        Registrar Depois
                    </button>
                    <button
                        onClick={handleRegisterPayment}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Registrar Pagamento Agora
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RenovacaoPagamentoModal;
