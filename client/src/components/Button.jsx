export default function Button({ children, onClick, variant = 'primary', className = '', disabled = false }) {
  const baseStyles = 'pos-button px-4 py-2';
  
  const variants = {
    primary: '',
    secondary: '',
    danger: '',
    ghost: '',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {children}
    </button>
  );
}
