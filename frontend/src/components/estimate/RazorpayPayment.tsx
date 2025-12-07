// components/RazorpayPayment.tsx
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";

interface RazorpayPaymentProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
}

const RazorpayPayment = ({
  isOpen,
  onClose,
  onSuccess,
  onError,
}: RazorpayPaymentProps) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    // Load Razorpay script dynamically
    const loadRazorpayScript = () => {
      return new Promise((resolve, reject) => {
        // Check if script already exists
        if (window.Razorpay) {
          resolve(true);
          return;
        }

        const script = document.createElement("script");
        script.src = "https://checkout.razorpay.com/v1/checkout.js";
        script.onload = () => resolve(true);
        script.onerror = () => reject(new Error("Failed to load Razorpay"));
        document.body.appendChild(script);
      });
    };

    const initializePayment = async () => {
      try {
        setIsLoading(true);
        await loadRazorpayScript();
        setIsLoading(false);

        // Razorpay test mode options
        const options = {
          key: "rzp_test_1DP5mmOlF5G5ag",
          amount: 200000, // ₹2000 in paise
          currency: "INR",
          name: "Elegant Pro",
          description: "Premium Subscription - Monthly",
          image: "https://cdn-icons-png.flaticon.com/512/2942/2942813.png",
          handler: function (response: any) {
            onSuccess(response.razorpay_payment_id);
          },
          prefill: {
            name: "Elegant Pro User",
            email: "admin@elegant.com",
            contact: "9999999999",
          },
          notes: {
            subscription_plan: "premium_monthly",
            app_name: "Elegant Pro Estimate Generator",
          },
          theme: {
            color: "#6366f1",
          },
          modal: {
            ondismiss: function () {
              onClose();
            },
          },
        };

        const razorpay = new window.Razorpay(options);
        razorpay.open();
      } catch (error) {
        setIsLoading(false);
        onError("Failed to initialize payment gateway. Please try again.");
      }
    };

    initializePayment();
  }, [isOpen, onClose, onSuccess, onError]);

  if (!isOpen) return null;

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 flex flex-col items-center gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          <p className="text-gray-700 font-medium">
            Loading payment gateway...
          </p>
        </div>
      </div>
    );
  }

  return null;
};

export default RazorpayPayment;
