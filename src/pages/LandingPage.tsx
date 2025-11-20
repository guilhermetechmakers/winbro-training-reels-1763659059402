import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Play, Check, ArrowRight } from "lucide-react";
import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";

export default function LandingPage() {
  const [showVideo, setShowVideo] = useState(false);

  const features = [
    {
      title: "Micro-Learning Reels",
      description: "20-30 second video reels for quick, focused training on machine setup and maintenance.",
      icon: Play,
    },
    {
      title: "Searchable Transcripts",
      description: "Time-synced transcripts make it easy to find exactly what you need.",
      icon: Check,
    },
    {
      title: "Course Builder",
      description: "Assemble reels into comprehensive courses with quizzes and certificates.",
      icon: ArrowRight,
    },
  ];

  const plans = [
    {
      name: "Starter",
      price: "$99",
      period: "month",
      features: [
        "Up to 50 users",
        "100 reels",
        "Basic analytics",
        "Email support",
      ],
    },
    {
      name: "Professional",
      price: "$299",
      period: "month",
      features: [
        "Up to 200 users",
        "Unlimited reels",
        "Advanced analytics",
        "Priority support",
        "Custom branding",
      ],
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "",
      features: [
        "Unlimited users",
        "Unlimited reels",
        "Full analytics suite",
        "Dedicated support",
        "SSO integration",
        "Custom integrations",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden border-b">
        <div className="container mx-auto px-4 py-24 md:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-4xl font-bold tracking-tight sm:text-6xl animate-fade-in-up">
              Micro-Learning for Manufacturing
            </h1>
            <p className="mt-6 text-lg leading-8 text-muted-foreground animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
              Short, focused training reels that capture machine setup, tooling, and troubleshooting in 20-30 seconds.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6 animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
              <Button size="lg" asChild>
                <Link to="/signup">Start Free Trial</Link>
              </Button>
              <Button size="lg" variant="outline" onClick={() => setShowVideo(true)}>
                <Play className="mr-2 h-4 w-4" />
                Watch Sample Reel
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 sm:py-32">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Everything you need for effective training
            </h2>
            <p className="mt-2 text-lg text-muted-foreground">
              Built specifically for manufacturing teams.
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              {features.map((feature, index) => (
                <div key={feature.title} className="flex flex-col animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <dt className="flex items-center gap-x-3 text-base font-semibold leading-7">
                    <feature.icon className="h-6 w-6 text-primary" />
                    {feature.title}
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-muted-foreground">
                    <p className="flex-auto">{feature.description}</p>
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-24 sm:py-32 bg-muted/50">
        <div className="container mx-auto px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
              Simple, transparent pricing
            </h2>
            <p className="mt-2 text-lg text-muted-foreground">
              Choose the plan that works for your team.
            </p>
          </div>
          <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-y-6 sm:mt-20 lg:max-w-4xl lg:grid-cols-3 lg:gap-x-8 lg:gap-y-0">
            {plans.map((plan, index) => (
              <Card key={plan.name} className="animate-fade-in-up" style={{ animationDelay: `${index * 0.1}s` }}>
                <CardHeader>
                  <CardTitle>{plan.name}</CardTitle>
                  <CardDescription>
                    <span className="text-2xl font-bold">{plan.price}</span>
                    {plan.period && <span className="text-muted-foreground">/{plan.period}</span>}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <Check className="mr-2 h-5 w-5 text-primary shrink-0 mt-0.5" />
                        <span className="text-sm">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button className="mt-6 w-full" variant={plan.name === "Professional" ? "default" : "outline"} asChild>
                    <Link to="/signup">Get Started</Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/50">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <h3 className="text-sm font-semibold">Product</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><Link to="/dashboard/help" className="hover:text-foreground">Features</Link></li>
                <li><Link to="/dashboard/help" className="hover:text-foreground">Pricing</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Company</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><Link to="/dashboard/help" className="hover:text-foreground">About</Link></li>
                <li><Link to="/dashboard/help" className="hover:text-foreground">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Legal</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><Link to="/dashboard/help" className="hover:text-foreground">Privacy</Link></li>
                <li><Link to="/dashboard/help" className="hover:text-foreground">Terms</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold">Support</h3>
              <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
                <li><Link to="/dashboard/help" className="hover:text-foreground">Help Center</Link></li>
                <li><Link to="/dashboard/help" className="hover:text-foreground">Documentation</Link></li>
              </ul>
            </div>
          </div>
        </div>
      </footer>

      {/* Video Modal */}
      <Dialog open={showVideo} onOpenChange={setShowVideo}>
        <DialogContent className="max-w-4xl">
          <div className="aspect-video bg-muted rounded-lg flex items-center justify-center">
            <p className="text-muted-foreground">Sample reel video player would go here</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
