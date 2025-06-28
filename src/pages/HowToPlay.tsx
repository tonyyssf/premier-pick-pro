
import React from 'react';
import { Layout } from '../components/Layout';
import { HeroSection } from '../components/HeroSection';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Trophy, Users, Target, Calendar, Star, Shield } from 'lucide-react';

const HowToPlay = () => {
  return (
    <Layout>
      <HeroSection />
      
      {/* How It Works Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">How Premier League Pick'em Works</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Simple rules, strategic choices, endless fun. Here's everything you need to know to start playing.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <Target className="h-8 w-8 text-plpe-purple mb-2" />
              <CardTitle>Pick One Team Per Week</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Each gameweek, choose one Premier League team to win their match. Your success depends on their performance!
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Shield className="h-8 w-8 text-plpe-purple mb-2" />
              <CardTitle>Limited Picks Per Team</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                You can only pick each team twice during the entire season. Choose your moments wisely - save the big teams for crucial weeks!
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Trophy className="h-8 w-8 text-plpe-purple mb-2" />
              <CardTitle>Simple Scoring</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Win = 3 points, Draw = 1 point, Loss = 0 points. Accumulate points throughout the season to climb the rankings.
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Users className="h-8 w-8 text-plpe-purple mb-2" />
              <CardTitle>Join Leagues</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Create private leagues with friends or join public leagues. Compete in multiple leagues simultaneously for maximum fun!
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Calendar className="h-8 w-8 text-plpe-purple mb-2" />
              <CardTitle>Weekly Deadlines</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Make your pick before the first match of each gameweek kicks off. Late picks aren't allowed - plan ahead!
              </CardDescription>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <Star className="h-8 w-8 text-plpe-purple mb-2" />
              <CardTitle>Season-Long Competition</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                The competition runs for the entire Premier League season. Consistency and smart choices will determine the ultimate winner!
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* Strategy Tips */}
        <div className="bg-gray-50 rounded-lg p-8 mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">Pro Strategy Tips</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-lg mb-2">💡 Save the Big Teams</h4>
              <p className="text-gray-600">Don't waste Manchester City or Arsenal picks on easy fixtures. Save them for tough weeks when you need guaranteed points.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">🏠 Consider Home Advantage</h4>
              <p className="text-gray-600">Teams typically perform better at home. Factor in venue when making your weekly picks.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">📊 Check Form & Injuries</h4>
              <p className="text-gray-600">Recent form matters more than league position. Keep an eye on team news and injury reports.</p>
            </div>
            <div>
              <h4 className="font-semibold text-lg mb-2">🎯 Plan Ahead</h4>
              <p className="text-gray-600">Look at upcoming fixtures when making picks. Sometimes it's worth taking a risk to save a better team for later.</p>
            </div>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <Card className="max-w-lg mx-auto">
            <CardHeader>
              <CardTitle>Ready to Start Playing?</CardTitle>
              <CardDescription>
                Join thousands of Premier League fans in the ultimate picking challenge
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button asChild size="lg" className="w-full">
                <Link to="/auth">Sign Up & Start Playing</Link>
              </Button>
              <p className="text-sm text-gray-500">
                Already have an account? <Link to="/auth" className="text-plpe-purple hover:underline">Sign in here</Link>
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </Layout>
  );
};

export default HowToPlay;
