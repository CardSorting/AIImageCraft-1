/**
 * Terms of Service Page for Dream Bees Art
 * Comprehensive terms covering AI art generation, user responsibilities, and platform usage
 */

import { useEffect } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Scale, Users, Zap, Shield, AlertTriangle, FileText } from 'lucide-react';
import EnhancedSEO from '@/components/EnhancedSEO';

export default function Terms() {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  const lastUpdated = "January 2, 2025";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <EnhancedSEO 
        pageType="terms"
        dynamicContent="Dream Bees Art Terms of Service - User rights, AI art ownership, and platform usage guidelines"
      />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Scale className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Terms of Service
            </h1>
          </div>
          <p className="text-lg text-muted-foreground mb-4">
            The rules and guidelines for using Dream Bees Art platform
          </p>
          <Badge variant="outline" className="text-sm">
            Last Updated: {lastUpdated}
          </Badge>
        </div>

        {/* Quick Summary */}
        <Card className="mb-8 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-primary" />
              Terms Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-green-600">Your Rights</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Own the AI artwork you generate</li>
                  <li>• Use artwork for commercial purposes</li>
                  <li>• Access to all platform features you've paid for</li>
                  <li>• Cancel subscription anytime</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-600">Your Responsibilities</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Use platform responsibly and legally</li>
                  <li>• Respect intellectual property rights</li>
                  <li>• Follow content guidelines</li>
                  <li>• Maintain account security</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="space-y-8">
          
          {/* Acceptance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5 text-primary" />
                1. Acceptance of Terms
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  By accessing or using Dream Bees Art ("the Service"), you agree to be bound by these Terms of Service ("Terms"). 
                  If you disagree with any part of these terms, you may not access the Service.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  These Terms apply to all users of the Service, including without limitation users who are browsers, 
                  contributors of content, or customers.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Service Description */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5 text-primary" />
                2. Description of Service
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Dream Bees Art is an AI-powered platform that allows users to generate digital artwork using 
                  machine learning models. Our service includes:
                </p>
                <ul className="space-y-2 text-muted-foreground">
                  <li>• Access to 69+ professional AI art generation models</li>
                  <li>• Text-to-image generation capabilities</li>
                  <li>• Image gallery and community features</li>
                  <li>• Credit-based usage system</li>
                  <li>• Account management and history tracking</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* User Accounts */}
          <Card>
            <CardHeader>
              <CardTitle>3. User Accounts and Registration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Account Creation</h4>
                  <p className="text-muted-foreground">
                    To access certain features, you must create an account. You are responsible for 
                    maintaining the confidentiality of your account credentials and for all activities 
                    that occur under your account.
                  </p>
                </div>
                
                <div>
                  <h4 className="font-semibold mb-2">Eligibility</h4>
                  <p className="text-muted-foreground">
                    You must be at least 13 years old to use this Service. If you are under 18, 
                    you confirm that you have your parent or guardian's consent to use the Service.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Account Security</h4>
                  <p className="text-muted-foreground">
                    You agree to notify us immediately of any unauthorized use of your account. 
                    We are not liable for any loss or damage arising from your failure to comply 
                    with these security obligations.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* AI Art Ownership */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                4. AI-Generated Content and Ownership
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Content Ownership</h4>
                  <p className="text-muted-foreground">
                    You retain ownership of AI-generated images created through our platform. 
                    You may use, modify, and distribute your generated content for any lawful purpose, 
                    including commercial use.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Platform License</h4>
                  <p className="text-muted-foreground">
                    By using our Service, you grant us a non-exclusive, worldwide license to host, 
                    display, and distribute content you choose to make public on our platform for 
                    the purpose of operating and promoting the Service.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">AI Model Training</h4>
                  <p className="text-muted-foreground">
                    Generated images may be used to improve our AI models and platform functionality. 
                    Personal information and private content are not used for training purposes.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Prohibited Uses */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-destructive" />
                5. Prohibited Uses
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  You agree not to use the Service for any of the following prohibited activities:
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2 text-destructive">Content Restrictions</h4>
                    <ul className="space-y-1 text-muted-foreground text-sm">
                      <li>• Adult or sexually explicit content</li>
                      <li>• Violence, harassment, or hate speech</li>
                      <li>• Illegal activities or content</li>
                      <li>• Impersonation or identity theft</li>
                      <li>• Copyright or trademark infringement</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2 text-destructive">Technical Restrictions</h4>
                    <ul className="space-y-1 text-muted-foreground text-sm">
                      <li>• Automated scraping or data mining</li>
                      <li>• Attempting to hack or disrupt the service</li>
                      <li>• Circumventing usage limits or restrictions</li>
                      <li>• Sharing account credentials</li>
                      <li>• Reverse engineering our AI models</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-red-50 dark:bg-red-950/20 p-4 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-sm text-red-800 dark:text-red-200">
                    <strong>Violation of these terms may result in account suspension or termination.</strong> 
                    We reserve the right to remove content and take appropriate action at our discretion.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Payment Terms */}
          <Card>
            <CardHeader>
              <CardTitle>6. Payment and Billing</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Credit System</h4>
                  <p className="text-muted-foreground">
                    Our Service operates on a credit-based system. Credits are required to generate AI artwork. 
                    Credits are non-refundable and do not expire.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Payment Processing</h4>
                  <p className="text-muted-foreground">
                    Payments are processed securely through Stripe. We do not store your payment information on our servers. 
                    All charges are final and non-refundable except as required by law.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Pricing Changes</h4>
                  <p className="text-muted-foreground">
                    We reserve the right to modify our pricing at any time. Price changes will be communicated 
                    via email and will not affect credits already purchased.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Limitation of Liability */}
          <Card>
            <CardHeader>
              <CardTitle>7. Limitation of Liability</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  The Service is provided "as is" without warranties of any kind. To the maximum extent 
                  permitted by law, we disclaim all warranties and shall not be liable for any indirect, 
                  incidental, special, or consequential damages.
                </p>
                
                <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>AI Technology Notice:</strong> AI-generated content may occasionally produce 
                    unexpected results. Users are responsible for reviewing all generated content before use.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Termination */}
          <Card>
            <CardHeader>
              <CardTitle>8. Termination</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  Either party may terminate this agreement at any time. Upon termination, your right to 
                  use the Service will cease immediately. Unused credits will be forfeited unless 
                  termination is due to our breach of these Terms.
                </p>
                
                <p className="text-muted-foreground">
                  We may suspend or terminate your account if you violate these Terms or engage in 
                  activities that could harm the Service or other users.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Contact */}
          <Card>
            <CardHeader>
              <CardTitle>9. Contact Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  If you have any questions about these Terms of Service, please contact us:
                </p>
                
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                  <div className="space-y-2">
                    <p><strong>Email:</strong> legal@dreambeesart.com</p>
                    <p><strong>Support:</strong> support@dreambeesart.com</p>
                    <p><strong>Website:</strong> <Link href="/" className="text-primary hover:underline">https://dreambeesart.com</Link></p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        <Separator className="my-8" />

        {/* Footer */}
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            These Terms of Service are effective as of {lastUpdated} and govern your use of Dream Bees Art.
          </p>
          <div className="flex justify-center gap-4 text-sm">
            <Link href="/privacy-policy" className="text-primary hover:underline">Privacy Policy</Link>
            <Link href="/support" className="text-primary hover:underline">Contact Support</Link>
          </div>
        </div>
      </div>
    </div>
  );
}