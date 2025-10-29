// app/suscripciones/page.tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import Button from "../components/Button";
import SubscriptionBadge from "../components/SubscriptionBadge";
import {
  SUBSCRIPTION_PRICES,
  PLAN_FEATURES,
  getPlanName,
  hasPremiumAccess,
  getDaysRemaining,
  formatExpirationDate,
} from "../../utils/subscriptionUtils";

type SubscriptionPlan = "basic" | "premium" | "grupal";

export default function SuscripcionesPage() {
  const router = useRouter();
  const { user, activateSubscription, cancelSubscription } = useAuth();
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Redirigir si no hay usuario autenticado
  if (!user) {
    router.push("/");
    return null;
  }

  const hasActiveSubscription = hasPremiumAccess(user.role || "");
  const daysRemaining = getDaysRemaining(user.subscriptionEndDate || null);
  const expirationDate = formatExpirationDate(user.subscriptionEndDate || null);

  // Manejar selección de plan
  const handleSelectPlan = (plan: SubscriptionPlan) => {
    if (hasActiveSubscription && user.subscriptionPlan === plan) {
      alert("Ya tienes este plan activo");
      return;
    }
    setSelectedPlan(plan);
  };

  // Procesar suscripción (preparado para Stripe)
  const handleSubscribe = async () => {
    if (!selectedPlan) {
      alert("Por favor, selecciona un plan");
      return;
    }

    setIsProcessing(true);

    try {
      // 🔮 AQUÍ SE INTEGRARÁ STRIPE EN EL FUTURO
      // Por ahora, solo activamos la suscripción directamente
      console.log(`🎯 Procesando suscripción al plan: ${selectedPlan}`);

      // TODO: Integrar con Stripe Checkout
      // const response = await fetch("/api/create-checkout-session", {
      //   method: "POST",
      //   headers: { "Content-Type": "application/json" },
      //   body: JSON.stringify({ plan: selectedPlan }),
      // });
      // const { sessionId } = await response.json();
      // const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY!);
      // await stripe.redirectToCheckout({ sessionId });

      // Simulación: activar suscripción directamente (TEMPORAL)
      await activateSubscription(selectedPlan);

      alert(`¡Suscripción al ${getPlanName(selectedPlan)} activada exitosamente!`);
      setSelectedPlan(null);
    } catch (error: any) {
      console.error("Error al procesar suscripción:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  // Cancelar suscripción
  const handleCancelSubscription = async () => {
    const confirm = window.confirm(
      "¿Estás seguro de que deseas cancelar tu suscripción? Perderás el acceso a las funciones premium al finalizar el período actual."
    );

    if (!confirm) return;

    setIsProcessing(true);

    try {
      await cancelSubscription();
      alert("Suscripción cancelada exitosamente");
    } catch (error: any) {
      console.error("Error al cancelar suscripción:", error);
      alert(`Error: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-bluegreen-eske mb-4">
            Planes de Suscripción
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Elige el plan que mejor se adapte a tus necesidades y lleva tu
            aprendizaje al siguiente nivel
          </p>

          {/* Mostrar estado actual */}
          {user && (
            <div className="mt-6 flex justify-center">
              <SubscriptionBadge />
            </div>
          )}

          {hasActiveSubscription && (
            <div className="mt-4 bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
              <p className="text-sm text-blue-800">
                <strong>Plan actual:</strong> {getPlanName(user.subscriptionPlan || null)}
              </p>
              {daysRemaining > 0 && (
                <p className="text-sm text-blue-600 mt-1">
                  Expira el {expirationDate} ({daysRemaining} días restantes)
                </p>
              )}
            </div>
          )}
        </div>

        {/* Planes */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Plan Básico */}
          <div
            className={`bg-white rounded-lg shadow-lg p-8 border-2 transition-all duration-300 ${
              selectedPlan === "basic"
                ? "border-blue-500 transform scale-105"
                : "border-gray-200 hover:border-blue-300"
            }`}
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Plan Básico
              </h3>
              <div className="text-4xl font-bold text-blue-600 mb-2">
                ${SUBSCRIPTION_PRICES.basic}
                <span className="text-lg text-gray-500">/mes</span>
              </div>
              <p className="text-gray-600">Ideal para comenzar</p>
            </div>

            <ul className="space-y-3 mb-8">
              {PLAN_FEATURES.basic.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700 text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              label={
                user.subscriptionPlan === "basic"
                  ? "Plan Actual"
                  : selectedPlan === "basic"
                  ? "Seleccionado"
                  : "Seleccionar"
              }
              variant={selectedPlan === "basic" ? "primary" : "secondary"}
              onClick={() => handleSelectPlan("basic")}
              disabled={user.subscriptionPlan === "basic"}
            />
          </div>

          {/* Plan Premium */}
          <div
            className={`bg-white rounded-lg shadow-lg p-8 border-2 transition-all duration-300 relative ${
              selectedPlan === "premium"
                ? "border-purple-500 transform scale-105"
                : "border-purple-300 hover:border-purple-400"
            }`}
          >
            {/* Badge "Más Popular" */}
            <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <span className="bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-semibold">
                Más Popular
              </span>
            </div>

            <div className="text-center mb-6 mt-4">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Plan Premium
              </h3>
              <div className="text-4xl font-bold text-purple-600 mb-2">
                ${SUBSCRIPTION_PRICES.premium}
                <span className="text-lg text-gray-500">/mes</span>
              </div>
              <p className="text-gray-600">Para profesionales</p>
            </div>

            <ul className="space-y-3 mb-8">
              {PLAN_FEATURES.premium.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700 text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              label={
                user.subscriptionPlan === "premium"
                  ? "Plan Actual"
                  : selectedPlan === "premium"
                  ? "Seleccionado"
                  : "Seleccionar"
              }
              variant={selectedPlan === "premium" ? "primary" : "secondary"}
              onClick={() => handleSelectPlan("premium")}
              disabled={user.subscriptionPlan === "premium"}
            />
          </div>

          {/* Plan Grupal */}
          <div
            className={`bg-white rounded-lg shadow-lg p-8 border-2 transition-all duration-300 ${
              selectedPlan === "grupal"
                ? "border-green-500 transform scale-105"
                : "border-gray-200 hover:border-green-300"
            }`}
          >
            <div className="text-center mb-6">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Plan Grupal
              </h3>
              <div className="text-4xl font-bold text-green-600 mb-2">
                ${SUBSCRIPTION_PRICES.grupal}
                <span className="text-lg text-gray-500">/mes</span>
              </div>
              <p className="text-gray-600">Para equipos y empresas</p>
            </div>

            <ul className="space-y-3 mb-8">
              {PLAN_FEATURES.grupal.map((feature, index) => (
                <li key={index} className="flex items-start">
                  <svg
                    className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span className="text-gray-700 text-sm">{feature}</span>
                </li>
              ))}
            </ul>

            <Button
              label={
                user.subscriptionPlan === "grupal"
                  ? "Plan Actual"
                  : selectedPlan === "grupal"
                  ? "Seleccionado"
                  : "Seleccionar"
              }
              variant={selectedPlan === "grupal" ? "primary" : "secondary"}
              onClick={() => handleSelectPlan("grupal")}
              disabled={user.subscriptionPlan === "grupal"}
            />
          </div>
        </div>

        {/* Botones de acción */}
        <div className="flex justify-center gap-4">
          {selectedPlan && !hasActiveSubscription && (
            <Button
              label={isProcessing ? "Procesando..." : "Confirmar Suscripción"}
              variant="primary"
              onClick={handleSubscribe}
              disabled={isProcessing}
            />
          )}

          {hasActiveSubscription && user.subscriptionStatus === "active" && (
            <Button
              label={isProcessing ? "Cancelando..." : "Cancelar Suscripción"}
              variant="secondary"
              onClick={handleCancelSubscription}
              disabled={isProcessing}
            />
          )}
        </div>

        {/* Nota sobre integración futura */}
        <div className="mt-12 bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-3xl mx-auto">
          <h4 className="font-semibold text-yellow-800 mb-2 flex items-center">
            <svg
              className="w-5 h-5 mr-2"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                clipRule="evenodd"
              />
            </svg>
            Integración de pagos pendiente
          </h4>
          <p className="text-sm text-yellow-700">
            Actualmente, la funcionalidad de suscripción está en modo de prueba.
            La integración con Stripe para procesar pagos reales se implementará
            próximamente. Por ahora, puedes activar cualquier plan para probar
            las funcionalidades.
          </p>
        </div>
      </div>
    </div>
  );
}