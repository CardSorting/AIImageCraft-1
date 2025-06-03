/**
 * Privacy Policy Page for Dream Bees Art
 * Comprehensive privacy policy compliant with GDPR, CCPA, and other regulations
 */

import { useEffect } from 'react';
import { Link } from 'wouter';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Shield, Eye, Database, Lock, Mail, Globe, UserCheck, FileText } from 'lucide-react';
import EnhancedSEO from '@/components/EnhancedSEO';

export default function PrivacyPolicy() {
  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0);
  }, []);

  const lastUpdated = "January 2, 2025";

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-primary/5">
      <EnhancedSEO 
        pageType="privacy-policy"
        dynamicContent="Dream Bees Art Privacy Policy - GDPR and CCPA compliant data protection practices"
      />
      
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
              Privacy Policy
            </h1>
          </div>
          <p className="text-lg text-muted-foreground mb-4">
            Your privacy is fundamental to how we operate Dream Bees Art
          </p>
          <Badge variant="outline" className="text-sm">
            Last Updated: {lastUpdated}
          </Badge>
        </div>

        {/* Quick Summary */}
        <Card className="mb-8 border-primary/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-primary" />
              Privacy at a Glance
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-green-600">What We Do</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Protect your personal data with encryption</li>
                  <li>• Use data only to improve your AI art experience</li>
                  <li>• Give you control over your information</li>
                  <li>• Comply with GDPR, CCPA, and privacy laws</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-blue-600">What We Don't Do</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Sell your personal information to third parties</li>
                  <li>• Share your artwork without permission</li>
                  <li>• Use your data for unrelated advertising</li>
                  <li>• Store payment information on our servers</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Table of Contents */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Table of Contents
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-2 text-sm">
              <a href="#information-collection" className="text-primary hover:underline">1. Information We Collect</a>
              <a href="#information-use" className="text-primary hover:underline">2. How We Use Information</a>
              <a href="#information-sharing" className="text-primary hover:underline">3. Information Sharing</a>
              <a href="#data-security" className="text-primary hover:underline">4. Data Security</a>
              <a href="#your-rights" className="text-primary hover:underline">5. Your Privacy Rights</a>
              <a href="#cookies" className="text-primary hover:underline">6. Cookies and Tracking</a>
              <a href="#third-party" className="text-primary hover:underline">7. Third-Party Services</a>
              <a href="#international" className="text-primary hover:underline">8. International Transfers</a>
              <a href="#children" className="text-primary hover:underline">9. Children's Privacy</a>
              <a href="#changes" className="text-primary hover:underline">10. Policy Changes</a>
              <a href="#contact" className="text-primary hover:underline">11. Contact Information</a>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <div className="space-y-8">
          
          {/* Introduction */}
          <Card>
            <CardContent className="pt-6">
              <div className="prose prose-gray dark:prose-invert max-w-none">
                <p className="text-muted-foreground leading-relaxed">
                  Dream Bees Art ("we," "our," or "us") operates an AI-powered art generation platform at dreambeesart.com. 
                  This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our service.
                </p>
                <p className="text-muted-foreground leading-relaxed">
                  We are committed to protecting your privacy and ensuring transparency about our data practices. 
                  This policy complies with the General Data Protection Regulation (GDPR), California Consumer Privacy Act (CCPA), 
                  and other applicable privacy laws.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Information We Collect */}
          <Card id="information-collection">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5 text-primary" />
                1. Information We Collect
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Account Information</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Email address (required for account creation)</li>
                    <li>• Username and display name</li>
                    <li>• Profile information you choose to provide</li>
                    <li>• Authentication data from third-party providers (Google, Discord)</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Usage Data</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• AI art prompts and generated images</li>
                    <li>• Model preferences and settings</li>
                    <li>• Credit usage and purchase history</li>
                    <li>• Platform interaction patterns</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Technical Information</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• IP address and device information</li>
                    <li>• Browser type and version</li>
                    <li>• Operating system</li>
                    <li>• Access times and referring URLs</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">Payment Information</h4>
                  <ul className="space-y-2 text-muted-foreground">
                    <li>• Payment transaction details (processed by Stripe)</li>
                    <li>• Billing address</li>
                    <li>• Purchase history</li>
                    <li className="text-sm italic">Note: Credit card information is processed securely by Stripe and never stored on our servers</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* How We Use Information */}
          <Card id="information-use">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5 text-primary" />
                2. How We Use Your Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Service Provision</h4>
                  <p className="text-muted-foreground">
                    To provide and improve our AI art generation service, process your requests, 
                    and deliver the features you expect from our platform.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Account Management</h4>
                  <p className="text-muted-foreground">
                    To create and manage your account, authenticate your identity, 
                    and provide customer support when needed.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Platform Improvement</h4>
                  <p className="text-muted-foreground">
                    To analyze usage patterns, improve our AI models, enhance user experience, 
                    and develop new features based on user feedback.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Communication</h4>
                  <p className="text-muted-foreground">
                    To send important service updates, respond to inquiries, 
                    and provide technical support. Marketing communications are sent only with your consent.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Legal Compliance</h4>
                  <p className="text-muted-foreground">
                    To comply with legal obligations, protect our rights, 
                    and ensure the safety and security of our platform and users.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Information Sharing */}
          <Card id="information-sharing">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5 text-primary" />
                3. Information Sharing and Disclosure
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Third-Party Service Providers</h4>
                  <p className="text-muted-foreground mb-2">
                    We share limited data with trusted service providers who help us operate our platform:
                  </p>
                  <ul className="space-y-1 text-muted-foreground ml-4">
                    <li>• <strong>Runware/FAL AI:</strong> AI model processing and image generation</li>
                    <li>• <strong>Stripe:</strong> Payment processing and subscription management</li>
                    <li>• <strong>Auth0:</strong> Authentication and user management</li>
                    <li>• <strong>Neon Database:</strong> Secure data storage</li>
                    <li>• <strong>Replit:</strong> Application hosting and infrastructure</li>
                  </ul>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Public Content</h4>
                  <p className="text-muted-foreground">
                    Images you choose to share publicly in our gallery are visible to other users. 
                    You maintain control over the privacy settings of your generated artwork.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Legal Requirements</h4>
                  <p className="text-muted-foreground">
                    We may disclose your information when required by law, to protect our rights, 
                    or to comply with legal processes such as court orders or government requests.
                  </p>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Business Transfers</h4>
                  <p className="text-muted-foreground">
                    In the event of a merger, acquisition, or sale of assets, 
                    your information may be transferred as part of the business transaction.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Data Security */}
          <Card id="data-security">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lock className="h-5 w-5 text-primary" />
                4. Data Security
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  We implement industry-standard security measures to protect your personal information:
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold mb-2">Technical Safeguards</h4>
                    <ul className="space-y-1 text-muted-foreground text-sm">
                      <li>• SSL/TLS encryption for data transmission</li>
                      <li>• Encrypted data storage</li>
                      <li>• Regular security audits</li>
                      <li>• Access controls and authentication</li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold mb-2">Operational Safeguards</h4>
                    <ul className="space-y-1 text-muted-foreground text-sm">
                      <li>• Limited employee access to personal data</li>
                      <li>• Regular security training</li>
                      <li>• Incident response procedures</li>
                      <li>• Data retention policies</li>
                    </ul>
                  </div>
                </div>

                <div className="bg-amber-50 dark:bg-amber-950/20 p-4 rounded-lg border border-amber-200 dark:border-amber-800">
                  <p className="text-sm text-amber-800 dark:text-amber-200">
                    <strong>Important:</strong> While we implement robust security measures, 
                    no method of transmission over the internet is 100% secure. 
                    We cannot guarantee absolute security of your information.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Your Rights */}
          <Card id="your-rights">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <UserCheck className="h-5 w-5 text-primary" />
                5. Your Privacy Rights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h4 className="font-semibold mb-3">Universal Rights</h4>
                  <div className="space-y-2">
                    <p className="text-muted-foreground"><strong>Access:</strong> Request a copy of your personal data</p>
                    <p className="text-muted-foreground"><strong>Correction:</strong> Update or correct inaccurate information</p>
                    <p className="text-muted-foreground"><strong>Deletion:</strong> Request deletion of your account and data</p>
                    <p className="text-muted-foreground"><strong>Portability:</strong> Export your data in a machine-readable format</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">GDPR Rights (EU Residents)</h4>
                  <div className="space-y-2">
                    <p className="text-muted-foreground"><strong>Restriction:</strong> Limit how we process your data</p>
                    <p className="text-muted-foreground"><strong>Objection:</strong> Object to certain types of data processing</p>
                    <p className="text-muted-foreground"><strong>Withdrawal:</strong> Withdraw consent for data processing</p>
                    <p className="text-muted-foreground"><strong>Complaint:</strong> File a complaint with your local data protection authority</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-3">CCPA Rights (California Residents)</h4>
                  <div className="space-y-2">
                    <p className="text-muted-foreground"><strong>Know:</strong> Right to know what personal information is collected</p>
                    <p className="text-muted-foreground"><strong>Delete:</strong> Right to delete personal information</p>
                    <p className="text-muted-foreground"><strong>Opt-Out:</strong> Right to opt-out of the sale of personal information</p>
                    <p className="text-muted-foreground"><strong>Non-Discrimination:</strong> Right to equal service regardless of privacy choices</p>
                  </div>
                </div>

                <div className="bg-blue-50 dark:bg-blue-950/20 p-4 rounded-lg border border-blue-200 dark:border-blue-800">
                  <p className="text-sm text-blue-800 dark:text-blue-200">
                    To exercise your privacy rights, contact us at privacy@dreambeesart.com. 
                    We will respond to your request within 30 days.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contact Information */}
          <Card id="contact">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5 text-primary" />
                Contact Information
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <p className="text-muted-foreground">
                  If you have any questions about this Privacy Policy or our data practices, please contact us:
                </p>
                
                <div className="bg-gray-50 dark:bg-gray-900/50 p-4 rounded-lg">
                  <div className="space-y-2">
                    <p><strong>Email:</strong> privacy@dreambeesart.com</p>
                    <p><strong>Data Protection Officer:</strong> dpo@dreambeesart.com</p>
                    <p><strong>General Support:</strong> support@dreambeesart.com</p>
                    <p><strong>Website:</strong> <Link href="/" className="text-primary hover:underline">https://dreambeesart.com</Link></p>
                  </div>
                </div>

                <div className="text-sm text-muted-foreground">
                  <p>
                    For urgent privacy concerns or data breaches, please mark your email as "URGENT - PRIVACY" 
                    and we will respond within 24 hours.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>

        <Separator className="my-8" />

        {/* Footer */}
        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground">
            This Privacy Policy is part of our Terms of Service and is effective as of {lastUpdated}.
          </p>
          <div className="flex justify-center gap-4 text-sm">
            <Link href="/terms" className="text-primary hover:underline">Terms of Service</Link>
            <Link href="/cookie-policy" className="text-primary hover:underline">Cookie Policy</Link>
            <Link href="/support" className="text-primary hover:underline">Contact Support</Link>
          </div>
        </div>
      </div>
    </div>
  );
}