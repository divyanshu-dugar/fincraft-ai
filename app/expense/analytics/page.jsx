"use client";

import { useState, useEffect } from "react";
import { LineChart, BarChart3, MessageSquare, TrendingUp, Calendar, Zap, Sparkles, Clock, Target, PieChart } from "lucide-react";
import { motion } from "framer-motion";

export default function ExpenseAnalyticsPage() {
  const [progress, setProgress] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      setProgress(75); // Simulating 75% development progress
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  const features = [
    {
      icon: <LineChart className="w-6 h-6" />,
      title: "Spending Trends Analysis",
      description: "Visualize your financial patterns with interactive charts and graphs",
      status: "In Development",
      color: "from-blue-500 to-cyan-500",
      emoji: "📈"
    },
    {
      icon: <MessageSquare className="w-6 h-6" />,
      title: "AI Financial Assistant",
      description: "Chat with your finances using advanced RAG technology",
      status: "Coming Soon",
      color: "from-purple-500 to-pink-500",
      emoji: "🤖"
    },
    {
      icon: <Calendar className="w-6 h-6" />,
      title: "Custom Date Analytics",
      description: "Compare spending across any time period with intelligent insights",
      status: "Planned",
      color: "from-green-500 to-emerald-500",
      emoji: "📊"
    },
    {
      icon: <Target className="w-6 h-6" />,
      title: "Goal-based Insights",
      description: "Get personalized recommendations based on your financial goals",
      status: "Planned",
      color: "from-orange-500 to-red-500",
      emoji: "🎯"
    },
    {
      icon: <PieChart className="w-6 h-6" />,
      title: "Category Breakdown",
      description: "Deep dive into spending patterns by category and merchant",
      status: "In Development",
      color: "from-indigo-500 to-blue-500",
      emoji: "🧮"
    },
    {
      icon: <Zap className="w-6 h-6" />,
      title: "Real-time Alerts",
      description: "Get notified about unusual spending and saving opportunities",
      status: "Coming Soon",
      color: "from-yellow-500 to-amber-500",
      emoji: "⚡"
    }
  ];
  
  const timeline = [
    { month: "Jan 2024", milestone: "Basic Analytics Dashboard", status: "completed" },
    { month: "Mar 2024", milestone: "Spending Trend Analysis", status: "completed" },
    { month: "May 2024", milestone: "AI Assistant Integration", status: "current" },
    { month: "Jul 2024", milestone: "Predictive Analytics", status: "upcoming" },
    { month: "Sep 2024", milestone: "Mobile Insights", status: "upcoming" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50/10 to-indigo-50/5 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-12 pt-8"
        >
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-6 shadow-xl">
            <TrendingUp className="w-10 h-10 text-white" />
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
            Expense Analytics
          </h1>
          
          <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
            Transforming raw data into actionable financial intelligence
          </p>
          
          <div className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-full font-medium">
            <Sparkles className="w-5 h-5 mr-2" />
            Coming Soon • {progress}% Complete
          </div>
        </motion.div>

        {/* Progress Bar */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="max-w-2xl mx-auto mb-16"
        >
          <div className="flex justify-between text-sm text-gray-500 mb-2">
            <span>Development Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full"
            />
          </div>
        </motion.div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-16">
          {/* Left Column - Features */}
          <div className="lg:col-span-2">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 shadow-xl p-8">
              <div className="flex items-center mb-8">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mr-4">
                  <Zap className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">Powerful Features in Development</h2>
                  <p className="text-gray-600">Everything you need to master your finances</p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {features.map((feature, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-gradient-to-br from-white to-gray-50/50 border border-gray-200/50 rounded-2xl p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                  >
                    <div className="flex items-start mb-4">
                      <div className={`p-3 rounded-xl bg-gradient-to-br ${feature.color} mr-4`}>
                        <div className="text-white">{feature.icon}</div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-gray-900">{feature.title}</h3>
                          <span className="text-2xl">{feature.emoji}</span>
                        </div>
                        <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                          feature.status === "In Development" ? "bg-blue-100 text-blue-700" :
                          feature.status === "Coming Soon" ? "bg-purple-100 text-purple-700" :
                          "bg-green-100 text-green-700"
                        }`}>
                          {feature.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
                    
                    {/* Example insights for the first feature */}
                    {index === 0 && (
                      <div className="mt-4 p-4 bg-blue-50/50 rounded-xl border border-blue-100">
                        <p className="text-sm text-blue-800 font-medium">Example Insight:</p>
                        <p className="text-sm text-blue-600 mt-1">
                          "You're spending 34% more on food than last month. Consider meal planning to save ~$120/month."
                        </p>
                      </div>
                    )}
                    
                    {index === 1 && (
                      <div className="mt-4 p-4 bg-purple-50/50 rounded-xl border border-purple-100">
                        <p className="text-sm text-purple-800 font-medium">Example Query:</p>
                        <p className="text-sm text-purple-600 mt-1">
                          "How can I save more?" → "Based on your spending patterns, reducing restaurant expenses by 20% could save you $180/month."
                        </p>
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Timeline & Info */}
          <div className="space-y-8">
            {/* Timeline */}
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl border border-gray-200/50 shadow-xl p-8">
              <div className="flex items-center mb-6">
                <div className="w-12 h-12 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-2xl flex items-center justify-center mr-4">
                  <Clock className="w-6 h-6 text-indigo-600" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">Development Timeline</h2>
              </div>
              
              <div className="relative">
                <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-400 via-purple-400 to-pink-400" />
                
                {timeline.map((item, index) => (
                  <div key={index} className="relative pl-12 pb-6 last:pb-0">
                    <div className={`absolute left-4 top-1 w-4 h-4 rounded-full border-4 ${
                      item.status === "completed" 
                        ? "bg-green-500 border-green-100" 
                        : item.status === "current"
                        ? "bg-gradient-to-r from-blue-500 to-purple-500 border-blue-100 animate-pulse"
                        : "bg-gray-300 border-gray-100"
                    }`} />
                    
                    <div className={`text-sm font-medium ${
                      item.status === "completed" ? "text-green-600" :
                      item.status === "current" ? "text-blue-600" : "text-gray-400"
                    }`}>
                      {item.month}
                    </div>
                    <div className="font-semibold text-gray-900 mt-1">{item.milestone}</div>
                    <div className={`text-xs font-medium px-2 py-1 rounded-full inline-block mt-2 ${
                      item.status === "completed" ? "bg-green-100 text-green-700" :
                      item.status === "current" ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600"
                    }`}>
                      {item.status === "current" ? "In Progress" : item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Stats Preview */}
            <div className="bg-gradient-to-br from-blue-50/50 to-indigo-50/30 rounded-3xl border border-blue-200/50 shadow-xl p-8">
              <h3 className="font-bold text-gray-900 mb-4 text-lg">Analytics Preview</h3>
              
              <div className="space-y-4">
                <div className="bg-white/70 rounded-xl p-4 border border-gray-200/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Monthly Comparison</span>
                    <BarChart3 className="w-5 h-5 text-blue-500" />
                  </div>
                  <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full" style={{ width: "65%" }} />
                  </div>
                </div>
                
                <div className="bg-white/70 rounded-xl p-4 border border-gray-200/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm text-gray-600">Savings Potential</span>
                    <TrendingUp className="w-5 h-5 text-green-500" />
                  </div>
                  <div className="text-2xl font-bold text-green-600">$245/mo</div>
                  <div className="text-xs text-gray-500">Identified through spending patterns</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          className="text-center py-12"
        >
          <div className="max-w-3xl mx-auto">
            <div className="bg-gradient-to-r from-blue-600/10 via-purple-600/10 to-pink-600/10 rounded-3xl p-8 border border-gray-200/50 backdrop-blur-sm">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                Ready to transform your financial insights?
              </h2>
              <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
                Join our waitlist to be the first to experience AI-powered expense analytics
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email"
                  className="flex-grow px-6 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
                />
                <button className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-semibold rounded-xl hover:shadow-lg transition-shadow">
                  Join Waitlist
                </button>
              </div>
              
              <p className="text-sm text-gray-500 mt-4">
                We'll notify you when Expense Analytics launches
              </p>
            </div>
            
            {/* Decorative elements */}
            <div className="relative -z-10">
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-gradient-to-r from-blue-400/20 to-purple-400/20 blur-3xl rounded-full" />
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-gradient-to-r from-pink-400/20 to-orange-400/20 blur-3xl rounded-full" />
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

// export default function expenseAnalyticsPage() {
//     return (
//         <>
//             <h1>Expense Analytics Page - Coming Soon</h1>
//                 <ul>
//                     <li>Spending Insights (REALISTIC) - eg. “You are spending 34% more on food than last month…”</li>
//                     <li>Chat with your finances (RAG) - How can I save more?</li>
//                     <li>Line Graph - Monely/Yearly Spending comparison (/custom date filter)</li>
//                 </ul>
//         </>
//     )
// }