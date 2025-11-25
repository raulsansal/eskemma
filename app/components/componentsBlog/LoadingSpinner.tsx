// app/components/componentsBlog/LoadingSpinner.tsx
"use client";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  text?: string;
  fullScreen?: boolean;
}

export default function LoadingSpinner({ 
  size = "md", 
  text = "Cargando...",
  fullScreen = false 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "w-6 h-6 border-2",
    md: "w-10 h-10 border-3",
    lg: "w-16 h-16 border-4",
  };

  const textSizeClasses = {
    sm: "text-sm",
    md: "text-base",
    lg: "text-lg",
  };

  const spinner = (
    <div className="flex flex-col items-center justify-center gap-4">
      {/* Spinner animado */}
      <div
        className={`
          ${sizeClasses[size]}
          border-gray-eske-20
          border-t-bluegreen-eske
          rounded-full
          animate-spin
        `}
        role="status"
        aria-label="Cargando"
      ></div>
      
      {/* Texto opcional */}
      {text && (
        <p className={`${textSizeClasses[size]} text-gray-eske-70 font-medium animate-pulse`}>
          {text}
        </p>
      )}
    </div>
  );

  if (fullScreen) {
    return (
      <div className="fixed inset-0 bg-white-eske bg-opacity-80 backdrop-blur-sm flex items-center justify-center z-50">
        {spinner}
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center py-12">
      {spinner}
    </div>
  );
}