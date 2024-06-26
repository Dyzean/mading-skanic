type InputProps = {
  name: string;
  label?: string;
  placeholder?: string;
  type: "email" | "text" | "password";
  disabled?: boolean;
  required?: boolean;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  pattern?: string | undefined;
  autoFocus?: boolean;
  className?: string;
};

const Input = ({
  name,
  label,
  placeholder = "",
  type,
  disabled = false,
  required = true,
  value,
  onChange,
  pattern = undefined,
  autoFocus = false,
  className = "",
}: InputProps) => {
  return (
    <>
      {label && (
        <label htmlFor={name} className="font-mono text-sm uppercase">
          {label}
        </label>
      )}
      <input
        id={name}
        type={type}
        placeholder={placeholder}
        disabled={disabled}
        required={required}
        autoComplete="off"
        pattern={pattern}
        autoFocus={autoFocus}
        value={value}
        onChange={onChange}
        className={`border-mono-black bg-mono-white p-2.5 text-sm text-mono-black focus:border-x-2 focus:border-mono-black focus:ring-0 ${className}`}
      />
    </>
  );
};

export default Input;
