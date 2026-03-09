import React from "react";
import Toast, { BaseToast, ToastConfig } from "react-native-toast-message";

/**
 * Toast helper functions for showing notifications
 * Usage: toast.success("Category created"), toast.error("Error message"), toast.info("Info message")
 */

export const toast = {
  success: (message: string) => {
    Toast.show({
      type: "success",
      text1: message,
      position: "bottom",
      bottomOffset: 80,
    });
  },

  error: (message: string) => {
    Toast.show({
      type: "error",
      text1: message,
      position: "bottom",
      bottomOffset: 80,
    });
  },

  info: (message: string) => {
    Toast.show({
      type: "info",
      text1: message,
      position: "bottom",
      bottomOffset: 80,
    });
  },
};

/**
 * Toast configuration for custom styling
 */
export const toastConfig: ToastConfig = {
  success: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: "#22c55e",
        backgroundColor: "#1f2937",
        borderRadius: 8,
      }}
      text1Style={{
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "500",
      }}
      text2Style={{
        color: "#9ca3af",
        fontSize: 12,
      }}
    />
  ),
  error: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: "#ef4444",
        backgroundColor: "#1f2937",
        borderRadius: 8,
      }}
      text1Style={{
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "500",
      }}
      text2Style={{
        color: "#9ca3af",
        fontSize: 12,
      }}
    />
  ),
  info: (props) => (
    <BaseToast
      {...props}
      style={{
        borderLeftColor: "#3b82f6",
        backgroundColor: "#1f2937",
        borderRadius: 8,
      }}
      text1Style={{
        color: "#ffffff",
        fontSize: 14,
        fontWeight: "500",
      }}
      text2Style={{
        color: "#9ca3af",
        fontSize: 12,
      }}
    />
  ),
};

export default Toast;
