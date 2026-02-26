import React from "react";
import { ActivityIndicator, Text, TouchableOpacity } from "react-native";
import { useTheme } from "../context/ThemeContext";
import { ButtonVariant } from "../types";

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

const Button: React.FC<ButtonProps> = ({
  title,
  onPress,
  variant = "primary",
  disabled = false,
  loading = false,
  className = "",
}) => {
  const { isDark } = useTheme();

  const getButtonClasses = (): string => {
    const baseClasses = "py-3 px-6 rounded-xl items-center justify-center";
    const disabledClasses = disabled ? "opacity-50" : "";

    switch (variant) {
      case "primary":
        return `${baseClasses} bg-primary ${disabledClasses}`;
      case "secondary":
        return `${baseClasses} border border-primary ${disabledClasses}`;
      case "danger":
        return `${baseClasses} bg-red-500 ${disabledClasses}`;
      default:
        return `${baseClasses} bg-primary ${disabledClasses}`;
    }
  };

  const getTextClasses = (): string => {
    switch (variant) {
      case "primary":
        return "text-white font-semibold text-base";
      case "secondary":
        return "text-primary font-semibold text-base";
      case "danger":
        return "text-white font-semibold text-base";
      default:
        return "text-white font-semibold text-base";
    }
  };

  return (
    <TouchableOpacity
      className={`${getButtonClasses()} ${className}`}
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "secondary" ? "#C0301E" : "#ffffff"}
        />
      ) : (
        <Text className={getTextClasses()}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

export default Button;
