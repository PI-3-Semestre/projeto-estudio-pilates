import React, { useState } from "react";

const countries = [
  { code: "BR", name: "Brasil", flag: "🇧🇷", ddi: "55", mask: "(XX) XXXXX-XXXX" },
  // Outros países podem ser adicionados aqui se necessário
];

const PhoneInput = ({
  id,
  name,
  label,
  placeholder,
  value = "", // O valor é controlado pelo componente pai
  onChange, // A função onChange é controlada pelo componente pai
  className = "",
  disabled = false,
  error = false,
}) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]); // Brasil por padrão

  const formatPhoneNumber = (val) => {
    const digits = val.replace(/\D/g, "");
    const mask = selectedCountry.mask;

    if (!mask) return digits;

    let result = "";
    let digitIndex = 0;
    for (let i = 0; i < mask.length && digitIndex < digits.length; i++) {
      if (mask[i] === "X") {
        result += digits[digitIndex++];
      } else {
        result += mask[i];
      }
    }
    return result;
  };

  const handlePhoneChange = (e) => {
    const formattedValue = formatPhoneNumber(e.target.value);
    // Chama o onChange do pai com o valor formatado
    onChange({
      target: {
        name: name,
        value: formattedValue,
      },
    });
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false);
    // Limpa o valor ao trocar de país para evitar máscaras conflitantes
    onChange({
      target: {
        name: name,
        value: "",
      },
    });
  };

  const inputClasses = `
    form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl
    ${error ? "text-red-900 border-red-500 bg-red-50" : "text-text-light dark:text-text-dark focus:outline-0 focus:ring-2 focus:ring-action-primary/50 border border-action-secondary dark:border-action-primary/20 bg-input-background-light dark:bg-input-background-dark focus:border-action-primary"}
    h-14 placeholder:text-text-subtle-light dark:placeholder:text-text-subtle-dark p-[15px] text-base font-normal leading-normal
    disabled:bg-gray-100 disabled:cursor-not-allowed
    ${className}
  `;

  return (
    <div className="flex flex-col w-full">
      {label && (
        <label htmlFor={id} className="text-text-light dark:text-text-dark text-base font-medium leading-normal pb-2">
          {label}
        </label>
      )}
      <div className="relative flex items-stretch rounded-xl">
        <div className="relative">
          <button
            type="button"
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            disabled={disabled}
            className="flex items-center justify-center min-w-[80px] h-14 px-3 bg-gray-50 dark:bg-gray-700 border border-r-0 border-action-secondary dark:border-action-primary/20 rounded-l-xl hover:bg-gray-100 dark:hover:bg-gray-600"
          >
            <span className="text-lg mr-1">{selectedCountry.flag}</span>
            <span className="text-sm font-medium">+{selectedCountry.ddi}</span>
            <span className="material-symbols-outlined text-gray-500 ml-1 text-sm">
              {isDropdownOpen ? "expand_less" : "expand_more"}
            </span>
          </button>
          {isDropdownOpen && (
            <div className="absolute top-full left-0 z-10 mt-1 w-64 bg-white dark:bg-gray-800 border rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {countries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3"
                >
                  <span className="text-lg">{country.flag}</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium">{country.name}</span>
                    <span className="text-xs text-gray-500">+{country.ddi}</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
        <input
          id={id}
          name={name}
          type="tel"
          placeholder={placeholder}
          value={value} // Usa o valor diretamente das props
          onChange={handlePhoneChange}
          disabled={disabled}
          className={inputClasses}
        />
        {isDropdownOpen && (
          <div className="fixed inset-0 z-0" onClick={() => setIsDropdownOpen(false)} />
        )}
      </div>
    </div>
  );
};

export default PhoneInput;
