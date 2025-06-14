
import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { HelpCircle, Search, Book, MessageCircle, Video, ExternalLink } from "lucide-react";

export const HelpSystem = () => {
  const [searchQuery, setSearchQuery] = useState("");

  const helpCategories = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: <Book className="h-4 w-4" />,
      articles: [
        { title: "Welcome to RelationshipDebt AI", description: "Learn the basics of tracking relationship balance" },
        { title: "Adding Your First Relationship", description: "Step-by-step guide to adding relationships" },
        { title: "Recording Favors", description: "How to track given and received favors" },
        { title: "Understanding Balance Scores", description: "How we calculate relationship balance" }
      ]
    },
    {
      id: "features",
      title: "Features & Tools",
      icon: <MessageCircle className="h-4 w-4" />,
      articles: [
        { title: "AI Insights & Recommendations", description: "Understanding AI-generated insights" },
        { title: "Analytics Dashboard", description: "Reading your relationship analytics" },
        { title: "Gamification System", description: "Achievements and progress tracking" },
        { title: "Export & Import Data", description: "Managing your data backups" }
      ]
    },
    {
      id: "troubleshooting",
      title: "Troubleshooting",
      icon: <HelpCircle className="h-4 w-4" />,
      articles: [
        { title: "Common Issues", description: "Solutions to frequent problems" },
        { title: "Data Sync Problems", description: "Fixing synchronization issues" },
        { title: "Performance Optimization", description: "Making the app run smoother" },
        { title: "Contact Support", description: "How to get help from our team" }
      ]
    }
  ];

  const quickActions = [
    { title: "Video Tutorials", icon: <Video className="h-4 w-4" />, description: "Watch step-by-step guides" },
    { title: "Community Forum", icon: <MessageCircle className="h-4 w-4" />, description: "Connect with other users" },
    { title: "Feature Requests", icon: <ExternalLink className="h-4 w-4" />, description: "Suggest new features" },
    { title: "Report Bug", icon: <HelpCircle className="h-4 w-4" />, description: "Help us improve the app" }
  ];

  const filteredCategories = helpCategories.map(category => ({
    ...category,
    articles: category.articles.filter(article =>
      searchQuery === "" ||
      article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      article.description.toLowerCase().includes(searchQuery.toLowerCase())
    )
  })).filter(category => category.articles.length > 0);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Help & Support</h2>
        <p className="text-gray-600">Find answers and learn how to make the most of RelationshipDebt AI</p>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search help articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Get help fast with these popular resources</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => (
              <Button
                key={index}
                variant="outline"
                className="h-auto p-4 flex flex-col items-center gap-2"
              >
                {action.icon}
                <div className="text-center">
                  <div className="font-medium">{action.title}</div>
                  <div className="text-xs text-gray-500">{action.description}</div>
                </div>
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Help Categories */}
      <div className="space-y-4">
        {filteredCategories.map(category => (
          <Card key={category.id}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                {category.icon}
                {category.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                {category.articles.map((article, index) => (
                  <AccordionItem key={index} value={`${category.id}-${index}`}>
                    <AccordionTrigger className="text-left">
                      <div>
                        <div className="font-medium">{article.title}</div>
                        <div className="text-sm text-gray-500 mt-1">{article.description}</div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className="prose prose-sm max-w-none">
                        <p>This is where the detailed help content would go for "{article.title}". 
                        In a real implementation, this would contain step-by-step instructions, 
                        screenshots, and detailed explanations.</p>
                        
                        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                          <h4 className="font-medium text-blue-900">💡 Quick Tip</h4>
                          <p className="text-blue-700 text-sm mt-1">
                            Use the search function to quickly find specific topics or features you need help with.
                          </p>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Contact Support */}
      <Card className="bg-green-50 border-green-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-green-900">
            <MessageCircle className="h-5 w-5" />
            Still Need Help?
          </CardTitle>
          <CardDescription className="text-green-700">
            Our support team is here to help you succeed with RelationshipDebt AI
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button className="bg-green-600 hover:bg-green-700">
              Contact Support
            </Button>
            <Button variant="outline" className="border-green-300 text-green-700">
              Schedule Demo
            </Button>
            <Button variant="outline" className="border-green-300 text-green-700">
              Join Community
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
