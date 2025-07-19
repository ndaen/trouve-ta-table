interface InputProps {
    placeholder?: string;
    type?: 'text' | 'password' | 'email' | 'number';
    className?: string;
    disabled?: boolean;
    value?: string | number;
    [key: string]: any;
}

export const Input = ({ placeholder, type = 'text', className = '', disabled = false, value = '', ...props }: InputProps) => (
    <input
        type={type}
        placeholder={placeholder}
        className={`${className} input`}
        disabled={disabled}
        value={value}
        {...props}
    />
);
