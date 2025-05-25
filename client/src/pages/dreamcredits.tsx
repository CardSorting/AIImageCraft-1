import { useState } from "react";
import { useLocation } from "wouter";
import { Sparkles, Zap, Crown, Star, Check, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NavigationHeader } from "@/components/navigation/NavigationHeader";

interface CreditPackage {
  id: string;
  name: string;
  credits: number;
  price: number;
  pricePerImage: number;
  popular?: boolean;
  bonus?: number;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
  savings?: string;
}

const creditPackages: CreditPackage[] = [
  {
    id: "starter",
    name: "Honey Starter",
    credits: 100,
    price: 1.00,
    pricePerImage: 0.01,
    icon: Sparkles,
    features: [
      "100 DreamBee Credits",
      "All AI models included",
      "High-quality generations",
      "Perfect for beginners"
    ]
  },
  {
    id: "creative",
    name: "Creative Hive",
    credits: 550,
    price: 5.00,
    pricePerImage: 0.0091,
    bonus: 50,
    popular: true,
    icon: Zap,
    savings: "9% off",
    features: [
      "550 DreamBee Credits",
      "50 bonus credits",
      "Priority generation",
      "Great for creators"
    ]
  },
  {
    id: "professional",
    name: "Queen Bee Pro",
    credits: 1200,
    price: 10.00,
    pricePerImage: 0.0083,
    bonus: 200,
    icon: Crown,
    savings: "17% off",
    features: [
      "1,200 DreamBee Credits",
      "200 bonus credits",
      "Fastest speeds",
      "Best for professionals"
    ]
  },
  {
    id: "enterprise",
    name: "Royal Swarm",
    credits: 2800,
    price: 22.00,
    pricePerImage: 0.0079,
    bonus: 300,
    icon: Star,
    savings: "21% off",
    features: [
      "2,800 DreamBee Credits",
      "300 bonus credits",
      "Enterprise access",
      "Priority support"
    ]
  }
];

export default function DreamCreditsPage() {
  const [, setLocation] = useLocation();
  const [selectedPackage, setSelectedPackage] = useState<string | null>(null);

  const handlePurchase = (packageId: string) => {
    setSelectedPackage(packageId);
    // Here you would integrate with payment processing
    console.log(`Purchasing package: ${packageId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 dark:from-purple-950 dark:via-pink-950 dark:to-yellow-950">
      {/* Desktop Navigation */}
      <NavigationHeader activeItem="credits" credits={1250} />
      
      <div className="container mx-auto px-4 py-8 md:py-16">
        {/* Header Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-yellow-500" />
            <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
              DreamBee Credits
            </h1>
            <Sparkles className="h-8 w-8 text-yellow-500" />
          </div>
          <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            Fuel your creativity with DreamBee Credits. Generate stunning AI artwork at just $0.01 per image with our premium credit packages.
          </p>
          <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <Check className="h-4 w-4 text-green-500" />
            <span>No expiration • All models included • Instant activation</span>
          </div>
        </div>

        {/* Credit Packages Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {creditPackages.map((pkg) => {
            const Icon = pkg.icon;
            const totalCredits = pkg.credits + (pkg.bonus || 0);
            
            return (
              <Card 
                key={pkg.id}
                className={`relative h-full flex flex-col transition-all duration-300 hover:scale-105 cursor-pointer ${
                  pkg.popular 
                    ? 'ring-2 ring-purple-500 shadow-lg shadow-purple-500/25' 
                    : 'hover:shadow-lg'
                } ${
                  selectedPackage === pkg.id ? 'ring-2 ring-blue-500' : ''
                }`}
                onClick={() => setSelectedPackage(pkg.id)}
              >
                {pkg.popular && (
                  <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                    Most Popular
                  </Badge>
                )}
                
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-3">
                    <div className={`p-3 rounded-full ${
                      pkg.popular 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500' 
                        : 'bg-gradient-to-r from-yellow-400 to-orange-500'
                    }`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-xl font-bold">{pkg.name}</CardTitle>
                  <div className="space-y-1">
                    <div className="text-3xl font-bold text-purple-600 dark:text-purple-400">
                      ${pkg.price.toFixed(2)}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      ${pkg.pricePerImage.toFixed(4)} per image
                    </div>
                    {pkg.savings && (
                      <Badge variant="secondary" className="text-green-600 bg-green-100 dark:bg-green-900">
                        {pkg.savings}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                
                <CardContent className="flex-1 flex flex-col">
                  <div className="text-center mb-4">
                    <div className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                      {totalCredits.toLocaleString()}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      DreamBee Credits
                    </div>
                    {pkg.bonus && (
                      <div className="text-sm text-green-600 font-medium">
                        +{pkg.bonus} bonus credits!
                      </div>
                    )}
                  </div>
                  
                  <ul className="space-y-2 text-sm flex-1 mb-6">
                    {pkg.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-2">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span className="text-gray-600 dark:text-gray-300">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  <Button 
                    className={`w-full mt-auto ${
                      pkg.popular 
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600' 
                        : ''
                    }`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handlePurchase(pkg.id);
                    }}
                  >
                    Get Credits
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Features Section */}
        <div className="bg-white/50 dark:bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-200 dark:border-gray-700">
          <h3 className="text-2xl font-bold text-center mb-8 text-gray-900 dark:text-gray-100">
            Why Choose DreamBee Credits?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-3 rounded-full w-fit mx-auto mb-4">
                <Zap className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Lightning Fast</h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Generate images in seconds with our optimized infrastructure
              </p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-r from-yellow-400 to-orange-500 p-3 rounded-full w-fit mx-auto mb-4">
                <Crown className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Premium Quality</h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Access to the latest AI models and highest quality outputs
              </p>
            </div>
            <div className="text-center">
              <div className="bg-gradient-to-r from-green-400 to-blue-500 p-3 rounded-full w-fit mx-auto mb-4">
                <Star className="h-6 w-6 text-white" />
              </div>
              <h4 className="font-semibold mb-2 text-gray-900 dark:text-gray-100">Best Value</h4>
              <p className="text-gray-600 dark:text-gray-300 text-sm">
                Industry-leading pricing with bonus credits and no hidden fees
              </p>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-12 text-center">
          <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
            Questions about DreamBee Credits?
          </h3>
          <p className="text-gray-600 dark:text-gray-300 mb-4">
            Credits never expire and work with all AI models. Need help choosing the right package?
          </p>
          <Button variant="outline" onClick={() => setLocation('/support')}>
            Contact Support
          </Button>
        </div>
      </div>
    </div>
  );
}