import { useState } from "react";
import {
  ChevronRight,
  MapPin,
  CreditCard,
  Flame,
  BarChart2,
  MessageSquare,
  Mail,
  Image as ImageIcon,
  Boxes,
  Cpu,
  ShieldCheck,
  Layers,
  PlusCircle,
  FileText,
  Activity,
  BookOpen,
  HeadphonesIcon
} from "lucide-react";
import Button from "../../components/ui/button";

const integrations = [
  {
    id: 1,
    name: "Google Maps",
    description: "Enable Google Maps for location services, distance calculation and place autocomplete.",
    status: "Active",
    icon: <MapPin className="text-green-500" size={24} />,
    iconBg: "bg-green-50",
    action: "Configure"
  },
  {
    id: 2,
    name: "Razorpay",
    description: "Payment gateway for secure online payments and transactions.",
    status: "Active",
    icon: <CreditCard className="text-blue-600" size={24} />,
    iconBg: "bg-blue-50",
    action: "Configure"
  },
  {
    id: 3,
    name: "Firebase",
    description: "Firebase for push notifications and real-time database.",
    status: "Active",
    icon: <Flame className="text-orange-500" size={24} />,
    iconBg: "bg-orange-50",
    action: "Configure"
  },
  {
    id: 4,
    name: "Google Analytics",
    description: "Track website and app analytics to understand user behavior.",
    status: "Active",
    icon: <BarChart2 className="text-yellow-500" size={24} />,
    iconBg: "bg-yellow-50",
    action: "Configure"
  },
  {
    id: 5,
    name: "Twilio",
    description: "SMS gateway for sending SMS notifications and alerts.",
    status: "Inactive",
    icon: <MessageSquare className="text-red-500" size={24} />,
    iconBg: "bg-red-50",
    action: "Enable"
  },
  {
    id: 6,
    name: "SendGrid",
    description: "Email delivery service for transactional and marketing emails.",
    status: "Inactive",
    icon: <Mail className="text-cyan-500" size={24} />,
    iconBg: "bg-cyan-50",
    action: "Enable"
  },
  {
    id: 7,
    name: "Cloudinary",
    description: "Image and video management and optimization.",
    status: "Inactive",
    icon: <ImageIcon className="text-blue-500" size={24} />,
    iconBg: "bg-blue-50",
    action: "Enable"
  }
];

function ThirdPartyIntegrations() {
  const [activeTab, setActiveTab] = useState("All Integrations");

  const filteredIntegrations = integrations.filter((item) => {
    if (activeTab === "All Integrations") return true;
    return item.status === activeTab;
  });

  const handleAction = (item) => {
    alert(`${item.action} action triggered for ${item.name}`);
  };

  const renderTabButton = (name, count, countColor, countBg) => {
    const isActive = activeTab === name;
    return (
      <button 
        onClick={() => setActiveTab(name)}
        className={`pb-3 text-sm flex items-center gap-2 whitespace-nowrap transition-colors ${isActive ? "border-b-2 border-primary font-semibold text-primary" : "font-medium text-muted hover:text-foreground"}`}
      >
        {name} 
        {count !== undefined && (
          <span className={`rounded-full px-2 py-0.5 text-xs ${countColor} ${countBg}`}>
            {count}
          </span>
        )}
      </button>
    );
  };

  return (
    <div className="flex-1 space-y-6">
      <div className="grid gap-6 xl:grid-cols-[2.5fr_1fr]">
        
        {/* Left Column */}
        <div className="flex flex-col gap-6 min-w-0">
          {/* Banner */}
          <div className="rounded-2xl border border-border bg-surface p-6 shadow-sm flex items-center justify-between overflow-hidden relative">
             <div className="flex items-center gap-4 z-10 w-2/3">
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Boxes className="text-primary" size={32} />
                </div>
                <div>
                    <h2 className="text-xl font-bold text-foreground">Third Party Integrations</h2>
                    <p className="text-sm text-muted mt-1 leading-relaxed">Connect and manage third party services<br/>to extend your platform capabilities.</p>
                </div>
             </div>
             {/* Decorative Elements - matching the illustration vibe */}
             <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-gradient-to-l from-primary/5 to-transparent pointer-events-none flex items-center justify-end pr-8">
                 <div className="flex items-center justify-center h-24 w-24 shrink-0 border-2 border-primary/20 rounded-2xl rotate-12 opacity-50 relative">
                    <span className="absolute -top-3 -left-3 h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-xs">G</span>
                    <span className="absolute -bottom-3 -right-3 h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-600"><MapPin size={14}/></span>
                 </div>
             </div>
          </div>

          {/* Integrations List Container */}
          <div className="rounded-2xl border border-border bg-surface shadow-sm overflow-hidden flex flex-col h-full min-w-0">
            {/* Tabs */}
            <div className="flex items-center gap-6 border-b border-border px-6 pt-4 overflow-x-auto scrollbar-hide">
              {renderTabButton("All Integrations")}
              {renderTabButton("Active", 5, "text-green-700", "bg-green-100")}
              {renderTabButton("Inactive", 2, "text-gray-700", "bg-gray-100")}
            </div>

            {/* List */}
            <div className="flex flex-col min-w-0">
              {filteredIntegrations.map((item, index) => (
                <div key={item.id} className={`flex items-center justify-between p-5 hover:bg-muted/10 transition-colors ${index !== filteredIntegrations.length - 1 ? 'border-b border-border' : ''}`}>
                  <div className="flex items-center gap-4 min-w-0">
                    <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${item.iconBg}`}>
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-sm font-semibold text-foreground truncate">{item.name}</h4>
                      <p className="text-xs text-muted mt-0.5 truncate">{item.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 ml-4">
                    {item.status === 'Active' ? (
                        <span className="hidden sm:flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-600 border border-green-100">
                            <span className="h-1.5 w-1.5 rounded-full bg-green-500"></span> Active
                        </span>
                    ) : (
                        <span className="hidden sm:flex items-center gap-1.5 rounded-full bg-red-50 px-2.5 py-1 text-xs font-medium text-red-600 border border-red-100">
                            <span className="h-1.5 w-1.5 rounded-full bg-red-500"></span> Inactive
                        </span>
                    )}
                    
                    <Button onClick={() => handleAction(item)} variant="outline" size="sm" className="rounded-lg border-primary/20 text-primary hover:bg-primary-light">
                      {item.action}
                    </Button>
                    <button className="text-muted hover:text-foreground">
                        <ChevronRight size={18} />
                    </button>
                  </div>
                </div>
              ))}
              {filteredIntegrations.length === 0 && (
                <div className="p-8 text-center text-muted">
                    <p>No integrations found.</p>
                </div>
              )}
            </div>
            <div className="border-t border-border p-4 text-center">
                <span className="text-xs text-muted flex items-center justify-center gap-1.5">
                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                    More integrations coming soon...
                </span>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          
          {/* Integration Overview */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm min-w-0">
            <h3 className="mb-6 text-base font-semibold text-foreground">Integration Overview</h3>
            <div className="flex items-center gap-6">
                {/* Donut Chart Mock */}
                <div className="relative flex h-24 w-24 shrink-0 items-center justify-center rounded-full border-8 border-gray-100">
                    <div className="absolute inset-0 rounded-full border-8 border-green-500" style={{ clipPath: 'polygon(0 0, 100% 0, 100% 100%, 0 50%)' }}></div>
                    <div className="absolute inset-0 rounded-full border-8 border-orange-500" style={{ clipPath: 'polygon(0 50%, 100% 100%, 0 100%)' }}></div>
                    
                    <div className="flex flex-col items-center justify-center bg-surface h-full w-full rounded-full z-10 relative">
                        <span className="text-xl font-bold text-foreground">7</span>
                        <span className="text-[10px] text-muted">Total</span>
                    </div>
                </div>
                
                <div className="flex-1 space-y-3 min-w-0">
                    <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-foreground truncate"><span className="h-2 w-2 shrink-0 rounded-full bg-green-500"></span> Active</span>
                        <span className="font-semibold text-foreground">5</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-foreground truncate"><span className="h-2 w-2 shrink-0 rounded-full bg-red-500"></span> Inactive</span>
                        <span className="font-semibold text-foreground">2</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-2 text-foreground truncate"><span className="h-2 w-2 shrink-0 rounded-full bg-orange-500"></span> Not Configured</span>
                        <span className="font-semibold text-foreground">0</span>
                    </div>
                </div>
            </div>
          </div>

          {/* Integration Benefits */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm min-w-0">
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
                <span className="text-primary">★</span> Integration Benefits
            </h3>
            <div className="space-y-4">
                <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-light/30 text-primary">
                        <Layers size={16} />
                    </div>
                    <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-foreground truncate">Enhance platform functionality</h4>
                        <p className="text-[10px] text-muted mt-0.5 leading-tight truncate">Integrate powerful third party services</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-light/30 text-primary">
                        <Cpu size={16} />
                    </div>
                    <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-foreground truncate">Automate business processes</h4>
                        <p className="text-[10px] text-muted mt-0.5 leading-tight truncate">Save time and reduce manual work</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-light/30 text-primary">
                        <ShieldCheck size={16} />
                    </div>
                    <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-foreground truncate">Secure & reliable connections</h4>
                        <p className="text-[10px] text-muted mt-0.5 leading-tight truncate">Enterprise-grade security & support</p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-light/30 text-primary">
                        <Boxes size={16} />
                    </div>
                    <div className="min-w-0">
                        <h4 className="text-sm font-semibold text-foreground truncate">Seamless user experience</h4>
                        <p className="text-[10px] text-muted mt-0.5 leading-tight truncate">Better performance and engagement</p>
                    </div>
                </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="rounded-2xl border border-border bg-surface p-5 shadow-sm min-w-0">
            <h3 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
                <span className="text-primary">⚡</span> Quick Actions
            </h3>
            <div className="space-y-1">
                <a href="#" className="flex items-center justify-between rounded-lg p-2 hover:bg-muted/10 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                            <PlusCircle size={16} />
                        </div>
                        <div className="min-w-0">
                            <h4 className="text-sm font-semibold text-foreground truncate">Add New Integration</h4>
                            <p className="text-[10px] text-muted leading-tight truncate">Request a new third party integration</p>
                        </div>
                    </div>
                    <ChevronRight size={16} className="text-muted shrink-0 ml-2" />
                </a>
                <a href="#" className="flex items-center justify-between rounded-lg p-2 hover:bg-muted/10 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                            <Activity size={16} />
                        </div>
                        <div className="min-w-0">
                            <h4 className="text-sm font-semibold text-foreground truncate">View Integration Logs</h4>
                            <p className="text-[10px] text-muted leading-tight truncate">Check API logs and connection status</p>
                        </div>
                    </div>
                    <ChevronRight size={16} className="text-muted shrink-0 ml-2" />
                </a>
                <a href="#" className="flex items-center justify-between rounded-lg p-2 hover:bg-muted/10 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                            <FileText size={16} />
                        </div>
                        <div className="min-w-0">
                            <h4 className="text-sm font-semibold text-foreground truncate">Test All Integrations</h4>
                            <p className="text-[10px] text-muted leading-tight truncate">Run test to check all active integrations</p>
                        </div>
                    </div>
                    <ChevronRight size={16} className="text-muted shrink-0 ml-2" />
                </a>
                <a href="#" className="flex items-center justify-between rounded-lg p-2 hover:bg-muted/10 transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                            <BookOpen size={16} />
                        </div>
                        <div className="min-w-0">
                            <h4 className="text-sm font-semibold text-foreground truncate">Integration Documentation</h4>
                            <p className="text-[10px] text-muted leading-tight truncate">View setup guides and API docs</p>
                        </div>
                    </div>
                    <ChevronRight size={16} className="text-muted shrink-0 ml-2" />
                </a>
            </div>
          </div>

          {/* Need Help */}
          <div className="rounded-2xl bg-primary-light/20 p-5 flex items-center justify-between min-w-0">
            <div className="flex-1 pr-4 min-w-0">
                <h3 className="text-sm font-semibold text-foreground truncate">Need Help with Integrations?</h3>
                <p className="text-[10px] text-muted mt-1 mb-3 truncate">Our support team is here to help you integrate and configure services.</p>
                <Button size="sm" className="bg-primary text-white w-fit text-xs px-3">
                    <HeadphonesIcon size={12} className="mr-1.5" /> Contact Support
                </Button>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <HeadphonesIcon size={20} />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default ThirdPartyIntegrations;
