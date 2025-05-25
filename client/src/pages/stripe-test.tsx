import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { NavigationHeader } from "@/components/navigation/NavigationHeader";

export default function StripeTestPage() {
  const [response, setResponse] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const testStripeConnection = async () => {
    setLoading(true);
    setResponse('Testing...');
    
    try {
      const res = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: 1.00,
          packageId: 'starter'
        })
      });
      
      const text = await res.text();
      console.log('Raw response:', text);
      
      try {
        const data = JSON.parse(text);
        setResponse(`Success! Client Secret: ${data.clientSecret ? 'Generated' : 'Not found'}`);
      } catch (e) {
        setResponse(`Error: Received HTML instead of JSON. Response: ${text.substring(0, 200)}...`);
      }
    } catch (error) {
      setResponse(`Error: ${error}`);
    }
    
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-yellow-50 dark:from-purple-950 dark:via-pink-950 dark:to-yellow-950">
      <NavigationHeader activeItem="credits" credits={1250} />
      
      <div className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Stripe Connection Test</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={testStripeConnection}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Testing...' : 'Test Stripe Connection'}
            </Button>
            
            {response && (
              <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded text-sm">
                <pre className="whitespace-pre-wrap">{response}</pre>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}