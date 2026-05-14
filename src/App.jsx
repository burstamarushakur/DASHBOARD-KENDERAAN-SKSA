import { useState } from 'react';
import { LayoutDashboard, GraduationCap, BookOpenText, Wrench, Users, Search, Menu, X } from 'lucide-react';
import DashboardHome from './components/DashboardHome';
import VehicleModule from './components/VehicleModule';
import VisitorModule from './components/VisitorModule';
import SearchModule from './components/SearchModule';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const tabs = [
    { id: 'dashboard', label: 'Laman Utama', icon: LayoutDashboard },
    { id: 'guru', label: 'Kenderaan Guru', icon: GraduationCap },
    { id: 'akp', label: 'Kenderaan AKP', icon: BookOpenText },
    { id: 'sokongan', label: 'Staf Sokongan', icon: Wrench },
    { id: 'pelawat', label: 'Log Pelawat', icon: Users },
    { id: 'carian', label: 'Carian Plat', icon: Search },
  ];

  const currentDate = new Date().toLocaleDateString('ms-MY', {
    day: 'numeric',
    month: 'long', 
    year: 'numeric'
  });

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard': return <DashboardHome />;
      case 'guru': return <VehicleModule title="Senarai Kenderaan Guru" kategori="GURU" key="GURU" />;
      case 'akp': return <VehicleModule title="Senarai Kenderaan AKP" kategori="AKP" key="AKP"/>;
      case 'sokongan': return <VehicleModule title="Senarai Kakitangan Sokongan" kategori="SOKONGAN" key="SOKONGAN" />;
      case 'pelawat': return <VisitorModule />;
      case 'carian': return <SearchModule />;
      default: return <DashboardHome />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* Mobile Backdrop */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`
        fixed lg:sticky top-0 left-0 z-50 h-screen
        w-64 bg-slate-900/50 border-r border-slate-800 flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Mobile close btn */}
        <button 
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden absolute top-4 right-4 text-slate-400 hover:text-white p-2"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 flex flex-col items-center border-b border-slate-800">
          <img 
            src="https://i.postimg.cc/3RF9M05N/Logo-SKSA.png" 
            alt="SKSA Logo" 
            className="h-20 w-auto mb-4"
          />
          <div className="text-center">
            <h1 className="text-[10px] font-bold tracking-widest text-cyan-400 uppercase">Dashboard Kenderaan</h1>
            <p className="text-[9px] text-slate-400 leading-tight mt-1">SK Sungai Abong, Muar</p>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSidebarOpen(false); }}
                className={`
                  w-full flex items-center gap-3 p-3 rounded-lg transition-colors
                  ${isActive 
                    ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                    : 'hover:bg-slate-800 text-slate-400'
                  }
                `}
              >
                <Icon className="w-5 h-5" />
                <span className="text-sm font-medium">{tab.label}</span>
              </button>
            )
          })}
        </nav>
        
        <div className="p-6 border-t border-slate-800">
          <div className="bg-gradient-to-br from-slate-800 to-slate-900 p-4 rounded-xl border border-slate-700">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">Status Sistem</p>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></div>
              <span className="text-xs font-medium text-slate-300">Berhubung ke GAS</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
        {/* Header */}
        <header className="h-16 border-b border-slate-800 bg-slate-900/30 flex items-center justify-between px-4 lg:px-8 shrink-0">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 -ml-2 text-slate-400 hover:text-white rounded-lg"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-semibold text-white hidden sm:block">{tabs.find(t => t.id === activeTab)?.label}</h2>
            <span className="text-[11px] bg-slate-800 px-3 py-1 rounded-full text-slate-400 border border-slate-700 hidden md:block">{currentDate}</span>
          </div>
          <div className="flex items-center gap-6">
            <div className="relative hidden md:block">
              <input type="text" placeholder="Carian No. Plat (e.g. JNB 4432)" className="bg-slate-800 border border-slate-700 text-xs rounded-lg py-2 px-10 w-64 focus:outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all text-slate-200" />
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <p className="text-xs font-semibold text-slate-200">Admin Utama</p>
                <p className="text-[10px] text-cyan-400">Log Masuk: 08:30 AM</p>
              </div>
              <div className="w-9 h-9 rounded-full bg-cyan-500 flex items-center justify-center font-bold text-slate-950 shrink-0">AD</div>
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <div className="flex-1 p-4 lg:p-8 overflow-y-auto space-y-6">
          {/* Dynamic Content */}
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 h-full">
            {renderContent()}
          </div>
          
          {/* Footer Status Bar */}
          <footer className="flex items-center justify-between text-[10px] text-slate-500 bg-slate-900/20 p-4 rounded-xl border border-slate-800 mt-auto shrink-0">
            <div className="flex gap-2 sm:gap-6 uppercase tracking-widest flex-wrap">
              <span>Vercel API Node v18</span>
              <span className="hidden sm:inline">|</span>
              <span>GAS Protocol Active</span>
              <span className="hidden md:inline">|</span>
              <span className="hidden md:inline">Last Sync: 10:45:22 AM</span>
            </div>
            <div className="font-semibold text-right max-w-[50%]">
              &copy; 2024 UNIT ICT SKSA - SISTEM PENDAFTARAN KENDERAAN
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}

