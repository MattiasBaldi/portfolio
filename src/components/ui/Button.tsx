import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost";
  children: React.ReactNode;
}

export function Button({
  variant = "primary",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const baseStyles = "px-4 py-2 rounded font-semibold transition-colors hover:cursor-pointer";

  const variantStyles = {
    primary: "bg-grey-900 text-grey-0 hover:bg-grey-800",
    secondary: "bg-grey-200 text-grey-900 hover:bg-grey-300",
    ghost: "bg-transparent hover:underline",
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

interface CloseButtonProps {
  onClick: () => void;
  className?: string;
  isHovering?: boolean;
}

export function CloseButton({ onClick, className = "", isHovering }: CloseButtonProps) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onClick();
      }}
      className={`close-button hover:cursor-pointer ${isHovering ? "underline" : ""} ${className}`}
    >
      Close
    </button>
  );
}

interface IconButton {
  onClick: () => void;
  imageUrl: string,  
  alt: string, 
  className?: string, 
  isHovering?: boolean; 
}

export function IconButton({onClick, imageUrl, alt, className, isHovering}: IconButton) {
  return <Button onClick={onClick} className={className}> <img src={imageUrl} alt={alt}></img></Button>
}