import { Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Role } from '../types/auth';
import { Activity, PlayCircle, ArrowRight, Shield, CheckCircle2 } from 'lucide-react';

const Home = () => {
  const { user } = useAuth();

  // Redirect to respective dashboard based on role if logged in
  if (user) {
    switch (user.role) {
      case Role.PATIENT:
        return <Navigate to="/patient-dashboard" replace />;
      case Role.DOCTOR:
        return <Navigate to="/doctor-dashboard" replace />;
      case Role.ADMIN:
        return <Navigate to="/admin-dashboard" replace />;
      default:
        // Fallback
        return (
          <div className="text-center py-12">
            <h1 className="text-3xl font-bold">Welcome, {user.name}</h1>
            <p className="text-gray-600 mt-2">Invalid user role detected.</p>
          </div>
        );
    }
  }

  // Unauthenticated Landing Page (Aushadhi Spectra Style)
  return (
    <div className="min-h-screen bg-[#fafafa] font-sans text-zinc-900 border-x max-w-[1400px] mx-auto border-zinc-200/50 shadow-2xl">
      
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-6 bg-white/50 backdrop-blur-md sticky top-0 z-50 border-b border-zinc-100">
        <div className="flex items-center gap-2 text-primary font-bold text-xl cursor-pointer">
          <Activity className="h-6 w-6" />
          <span className="text-zinc-900">Aushadhi.</span>
        </div>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-zinc-600">
          <Link to="#" className="hover:text-primary transition-colors">Home</Link>
          <Link to="#" className="hover:text-primary transition-colors">About</Link>
          <Link to="#" className="hover:text-primary transition-colors">Product</Link>
          <Link to="#" className="text-zinc-400 cursor-not-allowed">Pricing</Link>
        </div>
        <div className="flex items-center gap-4">
          <Link to="/login" className="text-sm font-semibold text-zinc-700 hover:text-primary hidden sm:block">Log in</Link>
          <Link to="/register" className="bg-primary text-white px-5 py-2.5 rounded-full text-sm font-semibold hover:bg-orange-600 transition-all shadow-md shadow-primary/20">Sign up for free</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="px-8 pt-20 pb-32 relative overflow-hidden">
        
        {/* Subtle dot grid pattern in background */}
        <div className="absolute inset-0 z-0 opacity-[0.03] select-none" 
             style={{ backgroundImage: 'radial-gradient(circle at center, #000 1.5px, transparent 1.5px)', backgroundSize: '32px 32px' }} />

        <div className="relative z-10 grid lg:grid-cols-2 gap-16 items-center">
          
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-100/50 text-primary text-xs font-bold uppercase tracking-wider mb-6 border border-orange-200/50">
              <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
              Aushadhi Product Overview
            </div>
            <h1 className="text-[4rem] leading-[1.1] font-extrabold tracking-tight mb-6">
              The Future of<br />Decision - Making<br />Made Simple <span className="text-primary italic font-serif">∗</span>
            </h1>
            <p className="text-lg text-zinc-600 mb-10 w-4/5 leading-relaxed">
              Crafted for doctors and patients alike, Aushadhi offers an unrivaled innovative platform.
            </p>
            
            <div className="flex items-center gap-4">
              <Link to="/register" className="h-14 px-8 border-2 border-zinc-900 rounded-full flex items-center justify-center font-bold text-zinc-900 hover:bg-zinc-900 hover:text-white transition-all">
                See all Reviews →
              </Link>
              <Link to="#" className="h-14 px-8 bg-primary rounded-full flex items-center justify-center font-bold text-white hover:bg-orange-600 shadow-xl shadow-primary/20 transition-all gap-2 group">
                <PlayCircle className="h-5 w-5 fill-white/20 group-hover:scale-110 transition-transform" /> Watch Video (1:30)
              </Link>
            </div>
          </div>

          {/* Abstract UI Mockup */}
          <div className="relative hidden lg:block h-[500px]">
             {/* Decorative wheel */}
             <div className="absolute top-[50%] left-[-10%] w-16 h-16 border-2 border-zinc-900 rounded-full flex items-center justify-center animate-[spin_10s_linear_infinite]">
                <div className="w-10 h-10 border border-zinc-900 rounded-full flex gap-1 items-center justify-center">
                   <div className="w-1.5 h-1.5 bg-primary rounded-full"/>
                   <div className="w-1.5 h-1.5 bg-primary rounded-full"/>
                </div>
             </div>
             
             {/* Back Card */}
             <div className="absolute right-0 top-0 w-[400px] h-[300px] bg-white rounded-3xl border-2 border-zinc-100 shadow-xl p-6 transform translate-x-12 -translate-y-8 rotate-3">
               <h3 className="font-bold text-sm mb-4">Patient Overview</h3>
               <div className="flex gap-4 items-end h-32 border-b border-zinc-100 pb-2">
                 <div className="w-1/6 bg-orange-200 rounded-t-md h-[40%]" />
                 <div className="w-1/6 bg-primary rounded-t-md h-[80%]" />
                 <div className="w-1/6 bg-orange-200 rounded-t-md h-[60%]" />
                 <div className="w-1/6 bg-orange-200 rounded-t-md h-[30%]" />
                 <div className="w-1/6 bg-primary rounded-t-md h-[100%]" />
               </div>
             </div>

             {/* Front Card */}
             <div className="absolute right-20 top-20 w-[320px] h-[400px] bg-white rounded-3xl border border-zinc-200 shadow-2xl p-6 transform -rotate-6">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="font-bold text-zinc-900">Appointments</h3>
                  <div className="h-8 w-8 bg-zinc-100 rounded-full flex items-center justify-center">
                    <div className="w-1 h-1 bg-zinc-400 rounded-full mr-0.5" />
                    <div className="w-1 h-1 bg-zinc-400 rounded-full" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex gap-4 p-3 rounded-2xl border border-zinc-100 bg-zinc-50/50 hover:bg-zinc-50 transition-colors">
                      <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-primary font-bold">
                        <CheckCircle2 className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="text-sm font-bold text-zinc-900">Dr. Sarah Jenkins</p>
                        <p className="text-xs text-zinc-500">Today, {9 + i}:00 AM</p>
                      </div>
                    </div>
                  ))}
                </div>
             </div>
          </div>
        </div>
      </main>

      {/* Social Proof Banner */}
      <section className="bg-[#f0ece6] border-y border-zinc-200 py-16 px-8">
        <div className="flex flex-col md:flex-row items-center justify-between max-w-6xl mx-auto gap-8">
          <div className="flex-shrink-0">
            <h2 className="text-2xl font-bold bg-clip-text text-zinc-900">More than <span className="text-primary">25,000</span> teams use Aushadhi</h2>
            <Link to="#" className="text-sm font-bold mt-2 flex items-center gap-1 hover:text-primary transition-colors">
              Learn More <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="flex gap-4 overflow-x-auto w-full justify-end pb-2 md:pb-0 hide-scrollbar">
             {['Apollo', 'Fortis', 'Max', 'AIMS'].map(logo => (
               <div key={logo} className="bg-white border-2 border-zinc-900 rounded-xl px-8 py-4 font-bold text-sm min-w-[140px] text-center shadow-[4px_4px_0px_rgba(24,24,27,1)] hover:translate-y-1 hover:shadow-none transition-all cursor-default">
                 {logo}
               </div>
             ))}
          </div>
        </div>
      </section>

      {/* Feature Blocks */}
      <section className="py-24 px-8 max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-16 mb-16">
           <div>
             <div className="text-xs font-bold text-primary tracking-widest uppercase mb-4">Content Section</div>
             <h2 className="text-4xl font-extrabold leading-tight mb-4">Provide powerful solutions at all times.</h2>
             <p className="text-zinc-600 mb-8 leading-relaxed max-w-md">Embrace a world of endless possibilities as you immerse yourself in powerful solutions. Build a powerful clinical database effortlessly.</p>
             
             <div className="grid grid-cols-2 gap-8">
               <div>
                  <div className="flex items-center gap-2 text-primary font-bold mb-1">
                    <Activity className="h-5 w-5" /> 98%
                  </div>
                  <p className="text-xs text-zinc-500 font-medium">With Aushadhi's responsive design, your creations will shine on any device.</p>
               </div>
               <div>
                  <div className="flex items-center gap-2 text-primary font-bold mb-1">
                    <Shield className="h-5 w-5 fill-primary text-white" /> 24K+
                  </div>
                  <p className="text-xs text-zinc-500 font-medium">Aushadhi is here to make the process of building stunning medical workflows easier.</p>
               </div>
             </div>
           </div>
           
           <div className="relative">
             <div className="absolute inset-0 bg-primary/5 rounded-3xl rotate-3" />
             <div className="bg-white border border-zinc-200 rounded-3xl p-8 relative shadow-xl">
               <div className="h-16 w-16 bg-orange-100 text-primary rounded-full flex items-center justify-center mb-6">
                 <Activity className="h-8 w-8" />
               </div>
               <p className="text-sm font-bold text-zinc-500 mb-1">Unique Patients</p>
               <h3 className="text-5xl font-extrabold tracking-tight mb-12">32,8276 <span className="text-lg text-primary">↑ 14%</span></h3>
               <Link to="/register" className="block text-center py-4 bg-zinc-50 hover:bg-zinc-100 rounded-xl font-bold transition-colors">
                 Visit Dashboard
               </Link>
             </div>
           </div>
        </div>
      </section>

    </div>
  );
};

export default Home;
