import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';

// Este é um componente de Modal genérico. Se ele não existir, precisará ser criado
// ou adaptado de alguma outra implementação no projeto.
// Por enquanto, vamos assumir que ele existe e funciona como um wrapper.
const Modal = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex justify-center items-center" onClick={onClose}>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        {children}
      </div>
    </div>
  );
};


const ProductFormModal = ({ isOpen, onClose, onSubmit, product }) => {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [errors, setErrors] = useState({});

  const isEditing = product != null;

  useEffect(() => {
    if (isOpen) {
      if (isEditing) {
        setName(product.nome || '');
        setPrice(product.preco || '');
      } else {
        setName('');
        setPrice('');
      }
      setErrors({});
    }
  }, [isOpen, product, isEditing]);

  const validate = () => {
    const newErrors = {};
    if (!name.trim()) newErrors.name = 'O nome do produto é obrigatório.';
    if (!price) {
        newErrors.price = 'O preço é obrigatório.';
    } else if (isNaN(parseFloat(price))) {
        newErrors.price = 'O preço deve ser um número válido.';
    } else if (parseFloat(price) <= 0) {
        newErrors.price = 'O preço deve ser maior que zero.';
    }
    return newErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = validate();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    onSubmit({ nome: name, preco: price });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={isEditing ? 'Editar Produto' : 'Adicionar Produto'}>
      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-4">
          <div>
            <label htmlFor="product-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nome do Produto</label>
            <input
              id="product-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-text-light dark:text-text-dark focus:outline-0 border bg-input-background-light dark:bg-input-background-dark h-12 px-4 text-base font-normal leading-normal ${errors.name ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
          </div>
          <div>
            <label htmlFor="product-price" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Preço (R$)</label>
            <input
              id="product-price"
              type="number"
              step="0.01"
              placeholder="Ex: 79.90"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className={`form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl text-text-light dark:text-text-dark focus:outline-0 border bg-input-background-light dark:bg-input-background-dark h-12 px-4 text-base font-normal leading-normal ${errors.price ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'}`}
            />
            {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
          </div>
        </div>
        <div className="flex justify-end gap-3 mt-6">
          <button type="button" onClick={onClose} className="flex items-center justify-center rounded-xl h-11 px-5 bg-gray-200 dark:bg-gray-700 text-text-light dark:text-text-dark text-base font-bold hover:bg-gray-300 dark:hover:bg-gray-600">
            Cancelar
          </button>
          <button type="submit" className="flex items-center justify-center rounded-xl h-11 px-5 bg-action-primary text-white text-base font-bold hover:bg-action-primary/90">
            Salvar
          </button>
        </div>
      </form>
    </Modal>
  );
};

ProductFormModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  product: PropTypes.shape({
    id: PropTypes.number,
    nome: PropTypes.string,
    preco: PropTypes.string,
  }),
};

ProductFormModal.defaultProps = {
  product: null,
};

export default ProductFormModal;
