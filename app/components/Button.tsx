"use client"; // Indica que este es un Client Component

interface ButtonProps {
  label: string;
  action?: string; // Identificador de la acción
  variant?: "primary" | "secondary";
  className?: string; // Clases personalizadas (opcional)
  onClick?: () => void; // Función personalizada para manejar clics
}

export default function Button({
  label,
  action,
  variant = "primary",
  className = "", // Valor predeterminado para evitar errores si no se pasa
  onClick, // Desestructurar la propiedad onClick
}: ButtonProps) {
  const baseStyles = "px-8 py-4 uppercase rounded transition duration-200 cursor-pointer";
  const variants = {
    primary: "inline-block bg-bluegreen-eske text-white-eske text-10px font-bold rounded-lg shadow-md hover:bg-bluegreen-eske-60 transition-all duration-300 ease-in-out",
    secondary: "inline-block bg-orange-eske text-white-eske text-10px font-bold rounded-lg shadow-md hover:bg-orange-eske-60 transition-all duration-300 ease-in-out",
  };

  const handleClick = () => {
    if (action === "alert") {
      alert("¡Botón clickeado!");
    }
    // Ejecutar la función personalizada si existe
    if (onClick) {
      onClick();
    }
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${className}`} // Priorizar las clases personalizadas
      onClick={handleClick}
    >
      {label}
    </button>
  );
}