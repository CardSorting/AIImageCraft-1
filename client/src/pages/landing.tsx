import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SEOHead } from "@/components/SEOHead";
import AdvancedSEO from "@/components/AdvancedSEO";
import SEOSitemap from "@/components/SEOSitemap";
import UltraAdvancedSEO from "@/components/UltraAdvancedSEO";
import MaximumSEOOptimization from "@/components/MaximumSEOOptimization";
import CuttingEdgeSEO from "@/components/CuttingEdgeSEO";
import SearchDominationSEO from "@/components/SearchDominationSEO";
import { 
  Sparkles, 
  Zap, 
  Shield, 
  Star, 
  ArrowRight, 
  Check, 
  Play,
  Users,
  Image,
  Palette,
  Crown,
  Bot,
  Infinity,
  ChevronRight
} from "lucide-react";

export default function Landing() {
  const [, navigate] = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [activeTestimonial, setActiveTestimonial] = useState(0);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const features = [
    {
      icon: <Bot className="w-6 h-6" />,
      title: "AI-Powered Generation",
      description: "Advanced neural networks create stunning visuals from your imagination"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Lightning Fast",
      description: "Generate high-quality images in seconds with our optimized pipeline"
    },
    {
      icon: <Palette className="w-6 h-6" />,
      title: "Unlimited Styles",
      description: "From cyberpunk to classical art - explore infinite creative possibilities"
    },
    {
      icon: <Shield className="w-6 h-6" />,
      title: "Commercial Rights",
      description: "Full ownership and commercial usage rights for all generated artwork"
    },
    {
      icon: <Users className="w-6 h-6" />,
      title: "Creative Community",
      description: "Join thousands of artists sharing and discovering amazing creations"
    },
    {
      icon: <Infinity className="w-6 h-6" />,
      title: "Endless Possibilities",
      description: "No limits on creativity - generate as much as your subscription allows"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Chen",
      role: "Digital Artist",
      content: "DreamBeesArt has revolutionized my creative workflow. The quality is incredible!",
      rating: 5
    },
    {
      name: "Marcus Rodriguez",
      role: "Brand Designer",
      content: "I've saved countless hours on concept art. This platform is a game-changer.",
      rating: 5
    },
    {
      name: "Elena Volkov",
      role: "Content Creator",
      content: "The cybernetic aesthetic options are exactly what my sci-fi project needed.",
      rating: 5
    }
  ];

  const pricingPlans = [
    {
      name: "Starter Hive",
      price: "$9",
      period: "/month",
      description: "Perfect for exploring AI art",
      features: [
        "100 generations per month",
        "Basic models access",
        "Standard quality",
        "Community support"
      ],
      popular: false
    },
    {
      name: "Creator Swarm",
      price: "$29",
      period: "/month",
      description: "For serious digital artists",
      features: [
        "500 generations per month",
        "Premium models access",
        "High quality outputs",
        "Priority support",
        "Commercial license",
        "Advanced editing tools"
      ],
      popular: true
    },
    {
      name: "Queen Bee Pro",
      price: "$99",
      period: "/month",
      description: "Ultimate creative freedom",
      features: [
        "Unlimited generations",
        "All models + early access",
        "4K quality outputs",
        "Priority processing",
        "API access",
        "Custom model training",
        "Dedicated support"
      ],
      popular: false
    }
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <SEOHead
        title="Dream Bees Art - AI Art Generator & Creative Community"
        description="Transform your imagination into stunning AI-generated artwork. Join thousands of artists creating beautiful images with advanced AI models. Free to start, premium features available."
        keywords="AI art generator, create AI art, artificial intelligence artwork, digital art creation, AI image generator, creative AI tools, art community, text to image, AI drawing"
        ogImage="https://dreambeesart.com/og-home.jpg"
        ogType="website"
        structuredData={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          "name": "Dream Bees Art",
          "description": "AI-powered art generation platform for creative professionals and enthusiasts",
          "url": "https://dreambeesart.com",
          "applicationCategory": "DesignApplication",
          "operatingSystem": "Web Browser",
          "offers": {
            "@type": "Offer",
            "price": "0",
            "priceCurrency": "USD",
            "availability": "https://schema.org/InStock"
          },
          "creator": {
            "@type": "Organization",
            "name": "Dream Bees Art"
          },
          "audience": {
            "@type": "Audience",
            "audienceType": "Artists, Designers, Content Creators"
          },
          "featureList": [
            "AI Image Generation",
            "Multiple Art Styles",
            "High-Quality Outputs",
            "Creative Community",
            "Easy-to-Use Interface"
          ]
        }}
        author="Dream Bees Art Team"
      />
      <AdvancedSEO pageType="landing" />
      <CuttingEdgeSEO pageType="landing" />
      <SearchDominationSEO pageType="landing" enableMaximumVisibility={true} />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-800 text-white overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 opacity-30">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,215,0,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,0,150,0.1),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(0,255,255,0.1),transparent_50%)]"></div>
        
        {/* Floating particles */}
        {Array.from({ length: 20 }).map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-ping"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 5}s`,
              animationDuration: `${3 + Math.random() * 4}s`
            }}
          />
        ))}
      </div>

      {/* Navigation */}
      <nav className="relative z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
              DreamBeesArt
            </span>
          </div>
          
          <div className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
            <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
            <a href="#testimonials" className="text-gray-300 hover:text-white transition-colors">Reviews</a>
          </div>

          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              onClick={() => navigate('/login')}
              className="text-gray-300 hover:text-white"
            >
              Sign In
            </Button>
            <Button 
              onClick={() => navigate('/generate')}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-semibold hover:from-yellow-500 hover:to-orange-600"
            >
              Start Creating
            </Button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className={`transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`}>
            <Badge className="bg-gradient-to-r from-yellow-400/20 to-orange-500/20 text-yellow-400 border-yellow-400/30 mb-6">
              <Zap className="w-4 h-4 mr-2" />
              Y2K Cybernetic AI Art Revolution
            </Badge>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 bg-clip-text text-transparent">
                Create Stunning
              </span>
              <br />
              <span className="bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent">
                AI Artwork
              </span>
            </h1>
            
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto leading-relaxed">
              Transform your imagination into breathtaking digital art with our cutting-edge AI. 
              Join the cybernetic renaissance where creativity meets artificial intelligence.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12">
              <Button 
                size="lg"
                onClick={() => navigate('/generate')}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold px-8 py-4 text-lg hover:from-yellow-500 hover:to-orange-600 transform hover:scale-105 transition-all"
              >
                <Play className="w-5 h-5 mr-2" />
                Start Creating for Free
              </Button>
              
              <Button 
                size="lg"
                variant="outline"
                onClick={() => navigate('/gallery')}
                className="border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black px-8 py-4 text-lg"
              >
                <Image className="w-5 h-5 mr-2" />
                View Gallery
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-bold text-yellow-400 mb-2">1M+</div>
                <div className="text-gray-400">Images Created</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-cyan-400 mb-2">50K+</div>
                <div className="text-gray-400">Happy Artists</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-pink-400 mb-2">99.9%</div>
                <div className="text-gray-400">Uptime</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="relative z-10 px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                Cybernetic Features
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Cutting-edge technology meets artistic expression in our comprehensive AI art platform
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700 hover:border-yellow-400/50 transition-all duration-300 group">
                <CardContent className="p-6">
                  <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold mb-3 text-white">{feature.title}</h3>
                  <p className="text-gray-400 leading-relaxed">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section id="testimonials" className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold mb-4">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              What Artists Say
            </span>
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Join thousands of creators who've transformed their artistic journey
          </p>

          <div className="relative">
            <Card className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 border-slate-700 p-8">
              <CardContent className="p-0">
                <div className="flex justify-center mb-4">
                  {Array.from({ length: testimonials[activeTestimonial].rating }).map((_, i) => (
                    <Star key={i} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <blockquote className="text-xl text-gray-300 mb-6 italic">
                  "{testimonials[activeTestimonial].content}"
                </blockquote>
                <div>
                  <div className="font-semibold text-white">{testimonials[activeTestimonial].name}</div>
                  <div className="text-gray-400">{testimonials[activeTestimonial].role}</div>
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-center mt-6 space-x-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setActiveTestimonial(index)}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === activeTestimonial ? 'bg-yellow-400' : 'bg-gray-600'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="relative z-10 px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">
              <span className="bg-gradient-to-r from-pink-400 to-purple-500 bg-clip-text text-transparent">
                Choose Your Hive
              </span>
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Select the perfect plan for your creative journey. Upgrade or downgrade anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {pricingPlans.map((plan, index) => (
              <Card 
                key={index} 
                className={`relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 border-slate-700 transition-all duration-300 hover:scale-105 ${
                  plan.popular ? 'border-yellow-400 ring-2 ring-yellow-400/20' : 'hover:border-yellow-400/50'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold">
                      <Crown className="w-4 h-4 mr-1" />
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <CardContent className="p-8">
                  <div className="text-center mb-8">
                    <h3 className="text-2xl font-bold mb-2 text-white">{plan.name}</h3>
                    <p className="text-gray-400 mb-4">{plan.description}</p>
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-white">{plan.price}</span>
                      <span className="text-gray-400">{plan.period}</span>
                    </div>
                  </div>

                  <ul className="space-y-3 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-gray-300">
                        <Check className="w-5 h-5 text-green-400 mr-3 flex-shrink-0" />
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <Button 
                    className={`w-full ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-yellow-400 to-orange-500 text-black hover:from-yellow-500 hover:to-orange-600' 
                        : 'bg-slate-700 text-white hover:bg-slate-600'
                    }`}
                    onClick={() => navigate('/dreamcredits')}
                  >
                    Get Started
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-2xl p-12 border border-slate-700">
            <h2 className="text-4xl font-bold mb-6">
              <span className="bg-gradient-to-r from-yellow-400 via-orange-500 to-pink-500 bg-clip-text text-transparent">
                Ready to Create Magic?
              </span>
            </h2>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Join the cybernetic art revolution today. Your first 10 generations are completely free!
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                size="lg"
                onClick={() => navigate('/generate')}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black font-bold px-8 py-4 text-lg hover:from-yellow-500 hover:to-orange-600"
              >
                Start Creating Now
                <ChevronRight className="w-5 h-5 ml-2" />
              </Button>
              <Button 
                size="lg"
                variant="outline"
                onClick={() => navigate('/models')}
                className="border-cyan-400 text-cyan-400 hover:bg-cyan-400 hover:text-black px-8 py-4 text-lg"
              >
                Explore Models
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-slate-800">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="w-8 h-8 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-black" />
                </div>
                <span className="text-xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
                  DreamBeesArt
                </span>
              </div>
              <p className="text-gray-400">
                Empowering creativity through cybernetic AI art generation.
              </p>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Product</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">API</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Community</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Gallery</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Discord</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold text-white mb-4">Support</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-slate-800 mt-12 pt-8 text-center text-gray-400">
            <p>&copy; 2024 DreamBeesArt. All rights reserved. Cybernetic creativity unleashed.</p>
          </div>
        </div>
      </footer>
      </div>
    </>
  );
}