import React, { useState, useMemo } from "react";

// Lista de países com códigos e bandeiras (principais países de interesse)
const countries = [
  {
    code: "BR",
    name: "Brasil",
    flag: "🇧🇷",
    ddi: "55",
    mask: "(XX) XXXXX-XXXX",
  },
  {
    code: "US",
    name: "Estados Unidos",
    flag: "🇺🇸",
    ddi: "1",
    mask: "(XXX) XXX-XXXX",
  },
  { code: "PT", name: "Portugal", flag: "🇵🇹", ddi: "351", mask: "XXX XXX XXX" },
  {
    code: "AR",
    name: "Argentina",
    flag: "🇦🇷",
    ddi: "54",
    mask: "(XXX) XXX-XXXX",
  },
  { code: "CL", name: "Chile", flag: "🇨🇱", ddi: "56", mask: "(X) XXXX XXXX" },
  {
    code: "CO",
    name: "Colômbia",
    flag: "🇨🇴",
    ddi: "57",
    mask: "(XXX) XXX XXXX",
  },
  { code: "MX", name: "México", flag: "🇲🇽", ddi: "52", mask: "(XXX) XXX-XXXX" },
  {
    code: "PY",
    name: "Paraguai",
    flag: "🇵🇾",
    ddi: "595",
    mask: "(XXX) XXX-XXX",
  },
  { code: "UY", name: "Uruguai", flag: "🇺🇾", ddi: "598", mask: "(X) XXX-XXXX" },
];

const PhoneInput = ({
  id,
  name,
  label,
  placeholder,
  value: initialValue = "",
  onChange,
  className = "",
  disabled = false,
  error = false,
}) => {
  // Estado interno do componente
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [selectedCountry, setSelectedCountry] = useState(countries[0]); // Brasil por padrão
  const [phoneNumber, setPhoneNumber] = useState(initialValue);

  // Calcular formato internacional e texto de display
  const { internationalFormat, displayValue } = useMemo(() => {
    // Se já é um formato internacional (+XX...), extrair informações
    if (phoneNumber.startsWith("+")) {
      const match = phoneNumber.match(/^\+(\d{1,3})(\d{2})(\d{8,10})$/);
      if (match) {
        const [, ddi, ddd, number] = match;
        const country = countries.find((c) => c.ddi === ddi) || countries[0];
        const localNumber = `${ddd}${number}`;

        return {
          internationalFormat: phoneNumber,
          displayValue: localNumber,
          selectedCountry: country,
        };
      }
    }

    // Para valores locais, assumir Brasil
    const isValidInternational = /^\+\d{11,15}$/.test(phoneNumber);
    if (isValidInternational) {
      return {
        internationalFormat: phoneNumber,
        displayValue: phoneNumber.substring(3), // Remove +XX
      };
    }

    // Valor local
    return {
      internationalFormat: `+${selectedCountry.ddi}${phoneNumber.replace(
        /\D/g,
        ""
      )}`,
      displayValue: phoneNumber,
    };
  }, [phoneNumber, selectedCountry]);

  // Notificar mudança para component pai
  React.useEffect(() => {
    if (onChange) {
      onChange({
        target: {
          name,
          value: internationalFormat,
        },
      });
    }
  }, [internationalFormat, name, onChange]);

  // Função para aplicar máscara ao número
  const formatPhoneNumber = (value) => {
    const digits = value.replace(/\D/g, "");
    const mask = selectedCountry.mask;

    if (!mask || mask === "") return digits;

    let result = "";
    let digitIndex = 0;

    for (let i = 0; i < mask.length && digitIndex < digits.length; i++) {
      const char = mask[i];
      if (char === "X") {
        result += digits[digitIndex];
        digitIndex++;
      } else {
        result += char;
      }
    }

    return result;
  };

  const handleCountrySelect = (country) => {
    setSelectedCountry(country);
    setIsDropdownOpen(false);
  };

  const handlePhoneChange = (e) => {
    const inputValue = e.target.value;
    const formattedValue = formatPhoneNumber(inputValue);
    setPhoneNumber(formattedValue);
  };

  const inputClasses = `
    form-input flex w-full min-w-0 flex-1 resize-none overflow-hidden rounded-xl
    ${
      error
        ? "text-red-900 border-red-500 bg-red-50 focus:border-red-500 focus:ring-red-500/50"
        : "text-text-light dark:text-text-dark focus:outline-0 focus:ring-2 focus:ring-action-primary/50 border border-action-secondary dark:border-action-primary/20 bg-input-background-light dark:bg-input-background-dark focus:border-action-primary"
    }
    h-14 placeholder:text-text-subtle-light dark:placeholder:text-text-subtle-dark p-[15px] text-base font-normal leading-normal
    disabled:bg-gray-100 disabled:cursor-not-allowed
    ${className}
  `;

  return (
    <div className="flex flex-col w-full">
      {label && (
        <label
          htmlFor={id}
          className="text-text-light dark:text-text-dark text-base font-medium leading-normal pb-2"
        >
          {label}
        </label>
      )}
      <div className="relative flex items-stretch rounded-xl">
        {/* Dropdown de País */}
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
            <div className="absolute top-full left-0 z-10 mt-1 w-64 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-y-auto">
              {countries.map((country) => (
                <button
                  key={country.code}
                  type="button"
                  onClick={() => handleCountrySelect(country)}
                  className="w-full px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-700 flex items-center gap-3 first:rounded-t-lg last:rounded-b-lg"
                >
                  <span className="text-lg">{country.flag}</span>
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {country.name}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                      +{country.ddi}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Campo do Número */}
        <input
          id={id}
          name={name}
          type="tel"
          placeholder={placeholder}
          value={displayValue}
          onChange={handlePhoneChange}
          disabled={disabled}
          className={inputClasses}
        />
      </div>

      {/* Overlay para fechar dropdown */}
      {isDropdownOpen && (
        <div
          className="fixed inset-0 z-0"
          onClick={() => setIsDropdownOpen(false)}
        />
      )}
    </div>
  );
};

export default PhoneInput;
