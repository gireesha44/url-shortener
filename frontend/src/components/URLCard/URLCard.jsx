import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Copy, BarChart3, Trash2, QrCode, ExternalLink, 
  Tag, MousePointer2, Calendar, Clock, CheckCircle2 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { cn } from '../../utils/cn';

const URLCard = ({ url, onCopy, onDelete }) => {
  const [copied, setCopied] = useState(false);
  const [showQR, setShowQR] = useState(false);

  const handleCopy = () => {
    onCopy(url.shortCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const baseUrl = 'http://localhost:5001/';
  const fullShortUrl = baseUrl + url.shortCode;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="glass-card bg-white group hover:border-primary/40 transition-all duration-300"
    >
      <div className="flex flex-col sm:flex-row">
        {/* Main Content Area */}
        <div className="flex-1 p-6 sm:p-8">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-2xl font-black text-text tracking-tight group-hover:text-primary transition-colors">
                  /{url.shortCode}
                </span>
                <div className="flex flex-wrap gap-2">
                  <div className="badge-pink">Live</div>
                  {url.tags && url.tags.map((tag, i) => (
                    <div key={i} className="px-2 py-0.5 rounded-md bg-secondary border border-border text-[9px] font-black uppercase tracking-wider text-text/60">
                      {tag}
                    </div>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-muted mt-1 max-w-md truncate">
                <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                <span className="truncate">{url.originalUrl}</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={handleCopy}
                className={cn(
                  "btn-secondary h-10 px-4 text-xs",
                  copied && "bg-green-accent/30 border-green-accent text-green-700"
                )}
              >
                {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? 'Copied' : 'Copy'}
              </button>
              <Link to={`/analytics/${url.shortCode}`} className="btn-primary h-10 px-4 text-xs font-bold">
                <BarChart3 className="h-4 w-4" /> Analytics
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t-2 border-border/50">
            {[
              { icon: MousePointer2, label: 'Clicks', value: url.clicks, color: 'text-primary' },
              { icon: Calendar, label: 'Created', value: new Date(url.createdAt).toLocaleDateString(), color: 'text-text' },
              { icon: Clock, label: 'Status', value: 'Live', color: 'text-green-600' },
              { icon: QrCode, label: 'QR Code', value: 'Ready', color: 'text-primary-soft', onClick: () => setShowQR(!showQR) },
            ].map((item, i) => (
              <div 
                key={i} 
                className={cn(
                  "flex flex-col gap-1",
                  item.onClick && "cursor-pointer hover:opacity-70 transition-opacity"
                )}
                onClick={item.onClick}
              >
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-muted">
                  <item.icon className={cn("h-3 w-3", item.color)} /> {item.label}
                </div>
                <div className="text-sm font-bold text-text">{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Sidebar */}
        <div className="sm:w-16 border-t sm:border-t-0 sm:border-l-2 border-border flex sm:flex-col items-center justify-center p-3 gap-3 bg-secondary/30">
          <button 
            onClick={() => setShowQR(!showQR)}
            className="p-3 rounded-xl hover:bg-white transition-colors text-muted hover:text-primary"
            title="Show QR Code"
          >
            <QrCode className="h-5 w-5" />
          </button>
          <button 
            onClick={() => onDelete(url.shortCode)}
            className="p-3 rounded-xl hover:bg-red-50 transition-colors text-muted hover:text-red-500"
            title="Delete Route"
          >
            <Trash2 className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* QR Code Overlay */}
      <AnimatePresence>
        {showQR && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t-2 border-border bg-white p-8 flex flex-col items-center justify-center gap-6"
          >
            <div className="p-4 bg-white rounded-2xl border-4 border-primary-soft/30 shadow-xl">
              <QRCodeSVG value={fullShortUrl} size={160} />
            </div>
            <div className="text-center">
              <p className="text-sm font-black text-text">Link QR Code</p>
              <p className="text-xs font-bold text-muted mt-1">Scan to open the destination link</p>
            </div>
            <button 
              onClick={() => setShowQR(false)}
              className="text-xs font-black uppercase tracking-widest text-muted hover:text-primary transition-colors"
            >
              Close Overlay
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default URLCard;
