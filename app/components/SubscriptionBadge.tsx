// app/components/SubscriptionBadge.tsx
"use client";
import { useAuth } from "../../context/AuthContext";
import { getRoleName } from "../../utils/roleUtils";
import {
  getDaysRemaining,
  formatExpirationDate,
} from "../../utils/subscriptionUtils";

export default function SubscriptionBadge() {
  const { user } = useAuth();

  if (!user) return null;

  const daysRemaining = getDaysRemaining(user.subscriptionEndDate || null);
  const expirationDate = formatExpirationDate(user.subscriptionEndDate || null);

  const getBadgeColor = (): string => {
    switch (user.role) {
      case "admin":
        return "bg-red-600 text-white";
      case "basic":
        return "bg-blue-500 text-white";
      case "premium":
        return "bg-purple-600 text-white";
      case "professional":  // ✅ CAMBIADO
        return "bg-green-600 text-white";
      case "expired":
        return "bg-red-500 text-white";
      case "unsubscribed-basic":
      case "unsubscribed-premium":
      case "unsubscribed-professional":  // ✅ CAMBIADO
        return "bg-orange-500 text-white";
      case "user":
        return "bg-bluegreen-eske text-white";
      case "registered":
        return "bg-gray-400 text-white";
      case "visitor":
        return "bg-gray-300 text-gray-700";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const showExtraInfo = () => {
    if (user.role === "admin") return null;

    if (["basic", "premium", "professional"].includes(user.role) && daysRemaining > 0) {  // ✅ CAMBIADO
      return (
        <span className="ml-2 max-sm:ml-1.5 text-xs max-sm:text-[10px] opacity-90">
          ({daysRemaining} día{daysRemaining !== 1 ? "s" : ""} restante{daysRemaining !== 1 ? "s" : ""})
        </span>
      );
    }

    if (user.role === "expired") {
      return (
        <span className="ml-2 max-sm:ml-1.5 text-xs max-sm:text-[10px] opacity-90">
          (Expiró {expirationDate})
        </span>
      );
    }

    if (["unsubscribed-basic", "unsubscribed-premium", "unsubscribed-professional"].includes(user.role)) {  // ✅ CAMBIADO
      return (
        <span className="ml-2 max-sm:ml-1.5 text-xs max-sm:text-[10px] opacity-90">
          (Cancelado)
        </span>
      );
    }

    return null;
  };

  const getAriaLabel = (): string => {
    const roleName = getRoleName(user.role);

    if (user.role === "admin") {
      return "Rol de administrador del sistema";
    }

    if (["basic", "premium", "professional"].includes(user.role) && daysRemaining > 0) {  // ✅ CAMBIADO
      return `Suscripción ${roleName}, ${daysRemaining} día${daysRemaining !== 1 ? "s" : ""} restante${daysRemaining !== 1 ? "s" : ""}`;
    }

    if (user.role === "expired") {
      return `Suscripción expirada el ${expirationDate}`;
    }

    if (["unsubscribed-basic", "unsubscribed-premium", "unsubscribed-professional"].includes(user.role)) {  // ✅ CAMBIADO
      return `Suscripción ${roleName} cancelada`;
    }

    return `Estado de cuenta: ${roleName}`;
  };

  return (
    <div
      className={`inline-flex items-center px-3 max-sm:px-2 py-1.5 max-sm:py-1 rounded-full text-sm max-sm:text-xs font-medium ${getBadgeColor()} shadow-sm`}
      role="status"
      aria-label={getAriaLabel()}
    >
      <span aria-hidden="true">{getRoleName(user.role)}</span>
      <span aria-hidden="true">{showExtraInfo()}</span>
    </div>
  );
}
