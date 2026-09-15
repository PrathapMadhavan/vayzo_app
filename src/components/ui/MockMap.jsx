import { MapPin } from "lucide-react";

export default function MockMap({ className = "", city = "Madurai", address = "" }) {
  return (
    <div className={`bg-border/20 relative overflow-hidden flex items-center justify-center group cursor-grab active:cursor-grabbing ${className}`}>
      {/* Map Background Pattern */}
      <div 
        className="absolute inset-0 opacity-20" 
        style={{ 
          backgroundImage: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%239C92AC\' fill-opacity=\'1\'%3E%3Cpath d=\'M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' 
        }}
      />
      
      {/* City Label */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-0 font-bold text-3xl text-foreground/40 text-center pointer-events-none">
        {city}<br/>
        {address && <span className="text-sm font-medium text-foreground/60">{address}</span>}
      </div>

      {/* North Zone */}
      <div className="absolute top-[10%] left-[30%] right-[20%] bottom-[50%] bg-info/20 border-2 border-info rounded-[30px] rounded-br-[100px] flex items-center justify-center transition-transform hover:scale-[1.02]">
        <span className="bg-info text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg whitespace-nowrap">North Zone</span>
        <MapPin size={24} className="text-info absolute top-[20%] right-[30%] drop-shadow-md" fill="white" />
      </div>

      {/* West Zone */}
      <div className="absolute top-[40%] left-[10%] right-[55%] bottom-[20%] bg-warning/20 border-2 border-warning rounded-[40px] rounded-tl-[80px] flex items-center justify-center transition-transform hover:scale-[1.02]">
        <span className="bg-warning text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg whitespace-nowrap">West Zone</span>
        <MapPin size={24} className="text-warning absolute top-[30%] left-[20%] drop-shadow-md" fill="white" />
      </div>

      {/* East Zone */}
      <div className="absolute top-[45%] left-[55%] right-[10%] bottom-[25%] bg-success/20 border-2 border-success rounded-[30px] rounded-tr-[90px] flex items-center justify-center transition-transform hover:scale-[1.02]">
        <span className="bg-success text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg whitespace-nowrap">East Zone</span>
        <MapPin size={24} className="text-success absolute bottom-[30%] right-[20%] drop-shadow-md" fill="white" />
      </div>

      {/* South Zone */}
      <div className="absolute top-[70%] left-[25%] right-[30%] bottom-[5%] bg-danger/20 border-2 border-danger rounded-[20px] rounded-bl-[60px] flex items-center justify-center transition-transform hover:scale-[1.02]">
        <span className="bg-danger text-white text-xs font-bold px-2 py-1 rounded-full shadow-lg whitespace-nowrap">South Zone</span>
        <MapPin size={24} className="text-danger absolute top-[10%] left-[30%] drop-shadow-md" fill="white" />
      </div>

      {/* Map Controls */}
      <div className="absolute right-4 bottom-4 flex flex-col gap-1 z-10 bg-surface shadow-md rounded-lg overflow-hidden border border-border">
        <button className="h-8 w-8 flex items-center justify-center hover:bg-muted/10 text-foreground text-lg font-bold">+</button>
        <div className="h-px w-full bg-border" />
        <button className="h-8 w-8 flex items-center justify-center hover:bg-muted/10 text-foreground text-lg font-bold">-</button>
      </div>
      
      <div className="absolute right-4 bottom-24 bg-surface shadow-md rounded-lg p-2 border border-border text-foreground hover:bg-muted/10 cursor-pointer">
        <MapPin size={18} />
      </div>
    </div>
  );
}
