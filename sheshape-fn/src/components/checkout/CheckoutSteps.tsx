// src/components/checkout/CheckoutSteps.tsx
"use client";

import { Check, Truck, CreditCard, Eye, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type CheckoutStep = "shipping" | "payment" | "review" | "success";

interface Step {
  id: CheckoutStep;
  name: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface CheckoutStepsProps {
  currentStep: CheckoutStep;
  completedSteps: CheckoutStep[];
  onStepClick?: (step: CheckoutStep) => void;
  className?: string;
}

const steps: Step[] = [
  {
    id: "shipping",
    name: "Shipping",
    description: "Address & delivery",
    icon: Truck,
  },
  {
    id: "payment",
    name: "Payment",
    description: "Payment method",
    icon: CreditCard,
  },
  {
    id: "review",
    name: "Review",
    description: "Check your order",
    icon: Eye,
  },
  {
    id: "success",
    name: "Complete",
    description: "Order placed",
    icon: CheckCircle,
  },
];

export function CheckoutSteps({
  currentStep,
  completedSteps,
  onStepClick,
  className,
}: CheckoutStepsProps) {
  const getStepStatus = (stepId: CheckoutStep) => {
    if (completedSteps.includes(stepId)) {
      return "completed";
    }
    if (stepId === currentStep) {
      return "current";
    }
    return "upcoming";
  };

  const getStepNumber = (stepId: CheckoutStep) => {
    return steps.findIndex((step) => step.id === stepId) + 1;
  };

  const isClickable = (stepId: CheckoutStep) => {
    // Can click on completed steps or current step
    return completedSteps.includes(stepId) || stepId === currentStep;
  };

  return (
    <div className={cn("w-full", className)}>
      {/* Desktop Version */}
      <div className="hidden md:block">
        <nav aria-label="Progress">
          <ol className="flex items-center justify-between">
            {steps.map((step, stepIdx) => {
              const status = getStepStatus(step.id);
              const stepNumber = getStepNumber(step.id);
              const clickable = isClickable(step.id) && onStepClick;

              return (
                <li key={step.name} className="relative flex-1">
                  {/* Connection Line */}
                  {stepIdx < steps.length - 1 && (
                    <div className="absolute top-4 left-1/2 w-full h-0.5 bg-gray-200">
                      <div
                        className={cn(
                          "h-full transition-all duration-300",
                          status === "completed" ||
                            (completedSteps.includes(step.id) &&
                              completedSteps.includes(steps[stepIdx + 1]?.id))
                            ? "bg-primary"
                            : "bg-gray-200"
                        )}
                      />
                    </div>
                  )}

                  {/* Step Button */}
                  <button
                    onClick={() => clickable && onStepClick?.(step.id)}
                    disabled={!clickable}
                    className={cn(
                      "relative flex flex-col items-center group",
                      clickable ? "cursor-pointer" : "cursor-default"
                    )}
                  >
                    {/* Step Circle */}
                    <div
                      className={cn(
                        "flex items-center justify-center w-10 h-10 rounded-full border-2 transition-all duration-200",
                        {
                          "bg-primary border-primary text-white":
                            status === "completed",
                          "border-primary bg-white text-primary border-2":
                            status === "current",
                          "border-gray-300 bg-white text-gray-500":
                            status === "upcoming",
                          "group-hover:border-primary-600 group-hover:text-primary-600":
                            clickable && status !== "completed",
                        }
                      )}
                    >
                      {status === "completed" ? (
                        <Check className="h-5 w-5" aria-hidden="true" />
                      ) : (
                        <step.icon className="h-5 w-5" />
                      )}
                    </div>

                    {/* Step Text */}
                    <div className="mt-3 text-center">
                      <p
                        className={cn(
                          "text-sm font-medium transition-colors duration-200",
                          {
                            "text-primary": status === "current",
                            "text-gray-900": status === "completed",
                            "text-gray-500": status === "upcoming",
                            "group-hover:text-primary-600":
                              clickable && status === "upcoming",
                          }
                        )}
                      >
                        {step.name}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {step.description}
                      </p>
                    </div>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      {/* Mobile Version */}
      <div className="md:hidden">
        <div className="flex items-center justify-between mb-4">
          <p className="text-sm font-medium text-gray-600">
            Step {getStepNumber(currentStep)} of {steps.length}
          </p>
          <p className="text-sm text-gray-500">
            {Math.round((getStepNumber(currentStep) / steps.length) * 100)}%
            Complete
          </p>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div
            className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
            style={{
              width: `${(getStepNumber(currentStep) / steps.length) * 100}%`,
            }}
          />
        </div>

        {/* Current Step Info */}
        <div className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
          <div
            className={cn(
              "flex items-center justify-center w-8 h-8 rounded-full",
              "bg-primary text-white"
            )}
          >
            {(() => {
              const step = steps.find((s) => s.id === currentStep);
              const StepIcon = step?.icon || Truck;
              return <StepIcon className="h-4 w-4" />;
            })()}
          </div>
          <div>
            <p className="font-medium text-gray-900">
              {steps.find((s) => s.id === currentStep)?.name}
            </p>
            <p className="text-sm text-gray-500">
              {steps.find((s) => s.id === currentStep)?.description}
            </p>
          </div>
        </div>

        {/* Step Navigation (Mobile) */}
        <div className="flex justify-between items-center mt-4">
          {steps.map((step, index) => (
            <button
              key={step.id}
              onClick={() => isClickable(step.id) && onStepClick?.(step.id)}
              disabled={!isClickable(step.id)}
              className={cn(
                "w-8 h-8 rounded-full text-xs font-medium transition-all duration-200",
                {
                  "bg-primary text-white":
                    getStepStatus(step.id) === "completed",
                  "bg-primary text-white ring-2 ring-primary ring-offset-2":
                    getStepStatus(step.id) === "current",
                  "bg-gray-200 text-gray-500":
                    getStepStatus(step.id) === "upcoming",
                  "cursor-pointer hover:bg-primary-600":
                    isClickable(step.id) &&
                    getStepStatus(step.id) !== "completed",
                  "cursor-default": !isClickable(step.id),
                }
              )}
            >
              {getStepStatus(step.id) === "completed" ? (
                <Check className="h-4 w-4 mx-auto" />
              ) : (
                index + 1
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
