// app/components/Button.tsx
"use client";

interface ButtonProps {
  label: string;
  action?: string;
  variant?: "primary" | "secondary";
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  type?: "button" | "submit" | "reset";
}

export default function Button({
  label,
  action,
  variant = "primary",
  className = "",
  onClick,
  disabled = false,
  type = "button",
}: ButtonProps) {
  const baseStyles = "block text-center w-full py-2 rounded-lg font-medium transition-all duration-300 text-[14px]";
  
  const variants = {
    primary: "bg-bluegreen-eske text-white-eske hover:bg-bluegreen-eske-70",
    secondary: "bg-orange-eske text-white-eske hover:bg-orange-eske-70",
  };

  const disabledStyles = disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer";

  const handleClick = () => {
    if (disabled) return;
    
    if (action === "alert") {
      alert("¡Botón clickeado!");
    }
    if (onClick) {
      onClick();
    }
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${disabledStyles} ${className}`}
      onClick={type === "button" ? handleClick : undefined}
      disabled={disabled}
    >
      {label}
    </button>
  );
}