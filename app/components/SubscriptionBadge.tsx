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

  // Colores según el rol
  const getBadgeColor = () => {
    switch (user.role) {
      case "basic":
        return "bg-blue-500 text-white";
      case "premium":
        return "bg-purple-600 text-white";
      case "grupal":
        return "bg-green-600 text-white";
      case "expired":
        return "bg-red-500 text-white";
      case "unsubscribed-basic":
      case "unsubscribed-premium":
      case "unsubscribed-grupal":
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

  // Determinar si mostrar información adicional
  const showExtraInfo = () => {
    if (
      ["basic", "premium", "grupal"].includes(user.role) &&
      daysRemaining > 0
    ) {
      return (
        <span className="ml-2 text-xs opacity-90">
          ({daysRemaining} día{daysRemaining !== 1 ? "s" : ""} restante
          {daysRemaining !== 1 ? "s" : ""})
        </span>
      );
    }

    if (user.role === "expired") {
      return (
        <span className="ml-2 text-xs opacity-90">
          (Expiró el {expirationDate})
        </span>
      );
    }

    if (
      [
        "unsubscribed-basic",
        "unsubscribed-premium",
        "unsubscribed-grupal",
      ].includes(user.role)
    ) {
      return <span className="ml-2 text-xs opacity-90">(Cancelado)</span>;
    }

    return null;
  };

  return (
    <div
      className={`inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium ${getBadgeColor()} shadow-sm`}
    >
      <span>{getRoleName(user.role)}</span>
      {showExtraInfo()}
    </div>
  );
}
