'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/layout/DashboardLayout';
import PageHeader from '@/components/PageHeader';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, Camera, ShieldCheck, AlertCircle, RefreshCw, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ScanPage() {
  const router = useRouter();
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [active, setActive] = useState(false);
  const html5QrCodeRef = useRef<any>(null);

  useEffect(() => {
    let scannerInstance: any;

    async function startScanner() {
      try {
        const { Html5Qrcode } = await import('html5-qrcode');
        
        // Ensure the element exists in DOM before initializing
        const element = document.getElementById('qr-reader');
        if (!element) return;

        scannerInstance = new Html5Qrcode('qr-reader');
        html5QrCodeRef.current = scannerInstance;

        const qrConfig = { 
          fps: 15, 
          qrbox: { width: 250, height: 250 },
          aspectRatio: 1.0 
        };

        // Attempt to start the camera
        await scannerInstance.start(
          { facingMode: "environment" }, 
          qrConfig,
          (decodedText: string) => {
            // Success callback
            let id = decodedText;
            if (decodedText.includes('/trace/')) {
              id = decodedText.split('/trace/')[1];
            }
            
            scannerInstance.stop().then(() => {
              toast.success('Cargo Tag identified!');
              router.push(`/trace/${id}`);
            }).catch(() => {
              router.push(`/trace/${id}`);
            });
          },
          () => {
            // Failure is called many times while searching, we ignore it
          }
        );
        
        setHasPermission(true);
        setIsInitializing(false);
        setActive(true);
      } catch (err: any) {
        console.error("Scanner Initialization Error:", err);
        setIsInitializing(false);
        
        // Handle explicit permission denial
        if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError' || err.toString().includes("Permission denied")) {
          setHasPermission(false);
        } else {
          // General error (e.g. no camera found)
          setHasPermission(null);
        }
      }
    }

    // Delay initialization slightly to ensure DOM is ready and any previous instances are cleared
    const timer = setTimeout(() => {
      startScanner();
    }, 500);

    return () => {
      clearTimeout(timer);
      if (html5QrCodeRef.current && html5QrCodeRef.current.isScanning) {
        html5QrCodeRef.current.stop().catch((e: any) => console.warn("Stop error:", e));
      }
    };
  }, [router]);

  return (
    <DashboardLayout>
      <PageHeader 
        title="Tag Scanner" 
        subtitle="Point your camera at a physical AgriOx label to pull its immutable verification record." 
      />

      <div className="max-w-xl mx-auto flex flex-col gap-6">
        
        {/* Status Header */}
        <div className="flex items-center justify-between px-5 py-3 bg-white border border-border shadow-sm rounded-xl">
           <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-emerald-50 flex items-center justify-center text-emerald-600 border border-emerald-100">
                 <ShieldCheck size={18} />
              </div>
              <div>
                 <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest leading-none mb-1">Security Mode</p>
                 <p className="text-sm font-bold text-foreground">Verified Hardware</p>
              </div>
           </div>
           
           <AnimatePresence mode="wait">
            {active ? (
              <motion.div 
                key="active" 
                initial={{ opacity: 0, scale: 0.9 }} 
                animate={{ opacity: 1, scale: 1 }}
                className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-100"
              >
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-emerald-700 uppercase tracking-tighter">Live Lens</span>
              </motion.div>
            ) : (
              <motion.div 
                key="idle" 
                initial={{ opacity: 0 }} 
                animate={{ opacity: 1 }}
                className="flex items-center gap-2 px-2.5 py-1 rounded-full bg-secondary border border-border"
              >
                <span className="text-[10px] font-black text-muted-foreground uppercase tracking-tighter">Initializing...</span>
              </motion.div>
            )}
           </AnimatePresence>
        </div>

        {/* Scanner Viewfinder Area */}
        <div className="relative aspect-square w-full bg-slate-900 rounded-3xl border-4 border-white shadow-2xl overflow-hidden group">
          
          {/* Overlay logic based on states */}
          <div className="absolute inset-0 pointer-events-none z-10 flex flex-col items-center justify-center">
             
             {isInitializing && (
               <div className="flex flex-col items-center gap-3">
                  <Loader2 size={32} className="text-primary animate-spin" />
                  <p className="text-xs font-bold text-white uppercase tracking-widest">Accessing Camera...</p>
               </div>
             )}

             {hasPermission === false && (
               <div className="flex flex-col items-center text-center p-8 bg-black/80 backdrop-blur-md inset-0 absolute pointer-events-auto justify-center">
                  <div className="w-16 h-16 rounded-3xl bg-red-500/20 flex items-center justify-center text-red-500 mb-4 border border-red-500/30">
                    <AlertCircle size={32} />
                  </div>
                  <h3 className="text-lg font-black text-white tracking-tight mb-2">Camera Access Blocked</h3>
                  <p className="text-sm text-gray-300 leading-relaxed mb-6">
                    AgriOx requires camera permissions to scan supply chain tags. Please enable camera access in your browser settings and try again.
                  </p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="btn-primary flex items-center gap-2 px-6 py-2 rounded-xl text-sm"
                  >
                    <RefreshCw size={16} /> Grant Access
                  </button>
               </div>
             )}

             {active && (
               <>
                 {/* Guide Frame */}
                 <div className="w-64 h-64 border-2 border-white/40 rounded-3xl relative">
                    <div className="absolute -top-1 -left-1 w-8 h-8 border-t-4 border-l-4 border-primary rounded-tl-xl" />
                    <div className="absolute -top-1 -right-1 w-8 h-8 border-t-4 border-r-4 border-primary rounded-tr-xl" />
                    <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-4 border-l-4 border-primary rounded-bl-xl" />
                    <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-4 border-r-4 border-primary rounded-br-xl" />
                    
                    <motion.div 
                      initial={{ top: '0%' }}
                      animate={{ top: '100%' }}
                      transition={{ duration: 2.5, repeat: Infinity, ease: 'linear' }}
                      className="absolute left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/50 to-transparent shadow-[0_0_15px_rgba(var(--primary),0.5)] z-20"
                    />
                 </div>

                 <div className="mt-8 px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border border-white/20">
                    <p className="text-[10px] font-black text-white uppercase tracking-[0.2em] flex items-center gap-2">
                       <Camera size={14} className="text-primary" /> Point Lens at Tag
                    </p>
                 </div>
               </>
             )}
          </div>

          {/* Actual Video Element Hook */}
          <div id="qr-reader" className="w-full h-full scale-x-[-1]" />
          
        </div>

        {/* Informational Guidance */}
        <div className="bg-white border border-border shadow-sm rounded-2xl p-6 flex items-start gap-4">
           <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center shrink-0">
              <QrCode size={20} className="text-muted-foreground" />
           </div>
           <div>
              <h3 className="text-sm font-black text-foreground tracking-tight mb-1">Scanning Guidelines</h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Ensure you are in a well-lit environment. Hold the cargo steady and position the tag inside the illuminated guide box for real-time provenance tracking.
              </p>
           </div>
        </div>

      </div>

      <style jsx global>{`
        #qr-reader {
          border: none !important;
          background: #0f172a !important;
        }
        #qr-reader__scan_region {
           background: transparent !important;
           display: flex !important;
           align-items: center !important;
           justify-content: center !important;
        }
        /* Hide all library generated UI */
        #qr-reader__dashboard, 
        #qr-reader img[alt="Info icon"], 
        #qr-reader img[alt="Camera menu icon"] {
          display: none !important;
        }
        #qr-reader video {
          width: 100% !important;
          height: 100% !important;
          object-fit: cover !important;
        }
      `}</style>
    </DashboardLayout>
  );
}
