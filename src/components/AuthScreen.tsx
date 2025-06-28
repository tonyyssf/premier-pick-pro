
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

export const AuthScreen: React.FC = () => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    username: '',
    name: ''
  });
  
  const { signIn, signUp } = useAuth();
  const { toast } = useToast();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (isSignUp) {
        if (!formData.email || !formData.password || !formData.username || !formData.name) {
          toast({
            title: "Error",
            description: "Please fill in all fields",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        await signUp(formData.email, formData.password, {
          username: formData.username,
          name: formData.name
        });
      } else {
        if (!formData.email || !formData.password) {
          toast({
            title: "Error",
            description: "Please fill in all fields",
            variant: "destructive",
          });
          setLoading(false);
          return;
        }

        await signIn(formData.email, formData.password);
      }
    } catch (error) {
      console.error('Auth error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialAuth = (provider: 'google' | 'apple') => {
    toast({
      title: "Coming Soon",
      description: `${provider} authentication will be available soon`,
    });
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col px-8 py-12">
      {/* Logo */}
      <div className="flex justify-center mb-12">
        <div className="w-20 h-20 rounded-full bg-plpe-purple flex items-center justify-center">
          <span className="text-white text-2xl font-bold">PL</span>
        </div>
      </div>

      {/* Title */}
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold mb-2">
          {isSignUp ? 'Create your account' : 'Welcome back'}
        </h1>
        <p className="text-gray-400">
          {isSignUp ? 'Join Premier League Pick\'em today' : 'Sign in to continue playing'}
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6 mb-8">
        {isSignUp && (
          <>
            <div className="space-y-2">
              <Label htmlFor="name" className="text-white text-base">Full Name</Label>
              <Input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your full name"
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 h-14 text-base rounded-xl focus:border-plpe-purple focus:ring-plpe-purple"
                required={isSignUp}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="username" className="text-white text-base">Display Name</Label>
              <Input
                id="username"
                type="text"
                value={formData.username}
                onChange={(e) => handleInputChange('username', e.target.value)}
                placeholder="Pick'Em Pro"
                className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 h-14 text-base rounded-xl focus:border-plpe-purple focus:ring-plpe-purple"
                required={isSignUp}
              />
            </div>
          </>
        )}
        
        <div className="space-y-2">
          <Label htmlFor="email" className="text-white text-base">Email</Label>
          <Input
            id="email"
            type="email"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            placeholder="your@email.com"
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 h-14 text-base rounded-xl focus:border-plpe-purple focus:ring-plpe-purple"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="password" className="text-white text-base">Password</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            placeholder="••••••••"
            className="bg-gray-800 border-gray-700 text-white placeholder-gray-400 h-14 text-base rounded-xl focus:border-plpe-purple focus:ring-plpe-purple"
            required
          />
        </div>

        <Button
          type="submit"
          disabled={loading}
          className="w-full bg-plpe-purple hover:bg-purple-700 h-14 text-lg font-semibold rounded-xl mt-8"
        >
          {loading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
          {isSignUp ? 'Sign Up' : 'Sign In'}
        </Button>
      </form>

      {/* Social Auth Divider */}
      <div className="flex items-center mb-8">
        <div className="flex-1 border-t border-gray-700"></div>
        <span className="px-4 text-gray-500 text-sm">or continue with</span>
        <div className="flex-1 border-t border-gray-700"></div>
      </div>

      {/* Social Auth Buttons */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Button
          type="button"
          variant="outline"
          onClick={() => handleSocialAuth('google')}
          className="bg-transparent border-gray-700 text-white hover:bg-gray-800 h-14 rounded-xl"
        >
          <span className="mr-2">G</span>
          Google
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => handleSocialAuth('apple')}
          className="bg-transparent border-gray-700 text-white hover:bg-gray-800 h-14 rounded-xl"
        >
          <span className="mr-2">🍎</span>
          Apple
        </Button>
      </div>

      {/* Switch Auth Mode */}
      <div className="text-center">
        <span className="text-gray-400">
          {isSignUp ? 'Already have an account?' : "Don't have an account?"}
        </span>
        <Button
          type="button"
          variant="link"
          onClick={() => setIsSignUp(!isSignUp)}
          className="text-plpe-purple hover:text-purple-400 ml-2 p-0 h-auto font-semibold"
        >
          {isSignUp ? 'Sign In' : 'Sign Up'}
        </Button>
      </div>
    </div>
  );
};
