import { useStripe, Elements, PaymentElement, useElements } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Check, Sparkles } from "lucide-react";
import { NavigationHeader } from "@/components/navigation/NavigationHeader";

// Make sure to call `loadStripe` outside of a component's render to avoid
// recreating the `Stripe` object on every render.
if (!import.meta.env.VITE_STRIPE_PUBLIC_KEY) {
  throw new Error('Missing required Stripe key: VITE_STRIPE_PUBLIC_KEY');
}
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  bonus?: number;
  savings?: string;
}

const CheckoutForm = ({ packageData }: { packageData: CreditPackage }) => {
  const stripe = useStripe();
  const elements = useElements();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/credits?success=true`,
      },
      redirect: 'if_required'
    });

    if (error) {
      toast({
        title: "Payment Failed",
        description: error.message,
        variant: "destructive",
      });
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Payment succeeded, add credits to user account
      try {
        await apiRequest("POST", "/api/add-credits", {
          userId: 1, // Using default user ID - in real app, get from auth
          packageId: packageData.id,
          amount: packageData.price
        });
        
        toast({
          title: "Purchase Successful!",
          description: `${packageData.credits + (packageData.bonus || 0)} credits have been added to your account!`,
        });
        
        // Redirect to credits page after successful purchase
        setTimeout(() => {
          setLocation('/credits?success=true');
        }, 2000);
      } catch (creditError) {
        console.error('Error adding credits:', creditError);
        toast({
          title: "Payment Processed",
          description: "Payment successful, but there was an issue adding credits. Please contact support.",
          variant: "destructive",
        });
      }
    }

    setIsProcessing(false);
  };

  const totalCredits = packageData.credits + (packageData.bonus || 0);

  return (
    <div className="max-w-4xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
      {/* Package Summary */}
      <Card className="h-fit">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-yellow-500" />
            Order Summary
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="border rounded-lg p-4 bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950 dark:to-pink-950">
            <h3 className="font-semibold text-lg text-purple-800 dark:text-purple-200">
              {packageData.name}
            </h3>
            <div className="mt-2 space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-300">Base Credits:</span>
                <span className="font-medium">{packageData.credits.toLocaleString()}</span>
              </div>
              {packageData.bonus && (
                <div className="flex justify-between text-green-600">
                  <span>Bonus Credits:</span>
                  <span className="font-medium">+{packageData.bonus.toLocaleString()}</span>
                </div>
              )}
              <div className="border-t pt-2 flex justify-between text-lg font-bold">
                <span>Total Credits:</span>
                <span className="text-purple-600 dark:text-purple-400">
                  {totalCredits.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
          
          <div className="flex justify-between items-center text-2xl font-bold">
            <span>Total:</span>
            <span className="text-purple-600 dark:text-purple-400">
              ${packageData.price.toFixed(2)}
            </span>
          </div>
          
          {packageData.savings && (
            <div className="text-center">
              <span className="inline-block bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 px-3 py-1 rounded-full text-sm font-medium">
                You save {packageData.savings}
              </span>
            </div>
          )}

          <div className="space-y-2 text-sm text-gray-600 dark:text-gray-300">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>Credits never expire</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>Access to all AI models</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span>Instant activation</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <PaymentElement />
            
            <Button 
              type="submit" 
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              disabled={!stripe || isProcessing}
            >
              {isProcessing ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full" />
                  Processing...
                </div>
              ) : (
                `Complete Purchase - $${packageData.price.toFixed(2)}`
              )}
            </Button>
            
            <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
              Your payment is secured by Stripe. We do not store your payment information.
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default function CheckoutPage() {
  const [, setLocation] = useLocation();
  const [clientSecret, setClientSecret] = useState("");
  const [packageData, setPackageData] = useState<CreditPackage | null>(null);

  useEffect(() => {
    // Get package data from URL params or localStorage
    const urlParams = new URLSearchParams(window.location.search);
    const packageId = urlParams.get('package');
    
    if (!packageId) {
      setLocation('/credits');
      return;
    }

    // Define the packages (this should match the packages in dreamcredits.tsx)
    const packages: Record<string, CreditPackage> = {
      starter: {
        id: "starter",
        name: "Honey Starter",
        credits: 100,
        price: 1.00
      },
      creative: {
        id: "creative",
        name: "Creative Hive",
        credits: 550,
        price: 5.00,
        bonus: 50,
        savings: "9% off"
      },
      professional: {
        id: "professional",
        name: "Queen Bee Pro",
        credits: 1200,
        price: 10.00,
        bonus: 200,
        savings: "17% off"
      },
      enterprise: {
        id: "enterprise",
        name: "Royal Swarm",
        credits: 2800,
        price: 22.00,
        bonus: 300,
        savings: "21% off"
      }
    };

    const selectedPackage = packages[packageId];
    if (!selectedPackage) {
      setLocation('/credits');
      return;
    }

    setPackageData(selectedPackage);

    // Create PaymentIntent
    apiRequest("POST", "/api/create-payment-intent", { 
      amount: selectedPackage.price, 
      packageId: selectedPackage.id 
    })
      .then((res) => res.json())
      .then((data) => {
        setClientSecret(data.clientSecret);
      })
      .catch((error) => {
        console.error("Error creating payment intent:", error);
        setLocation('/credits');
      });
  }, [setLocation]);

  if (!clientSecret || !packageData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 dark:from-purple-950 dark:via-pink-950 dark:to-yellow-950">
        <NavigationHeader activeItem="credits"  />
        <div className="container mx-auto px-4 py-16">
          <div className="flex items-center justify-center">
            <div className="animate-spin w-8 h-8 border-4 border-purple-500 border-t-transparent rounded-full" />
            <span className="ml-3 text-lg">Loading checkout...</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 dark:from-purple-950 dark:via-pink-950 dark:to-yellow-950">
      <NavigationHeader activeItem="credits"  />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => setLocation('/credits')}
            className="mb-4"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Credit Packages
          </Button>
          
          <div className="text-center">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Complete Your Purchase
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Secure checkout powered by Stripe
            </p>
          </div>
        </div>

        {/* Checkout Form */}
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm packageData={packageData} />
        </Elements>
      </div>
    </div>
  );
}