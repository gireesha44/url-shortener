import { useState } from 'react';
import { Link } from 'react-router-dom';
import { bulkCreateShortUrl } from '../services/api';
import Navbar from '../components/Navbar/Navbar';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Layers, Sparkles, AlertCircle, CheckCircle2, Download, Copy } from 'lucide-react';

const BulkShortener = () => {
  const [urlsInput, setUrlsInput] = useState('');
  const [password, setPassword] = useState('');
  const [expiresAt, setExpiresAt] = useState('');
  const [tags, setTags] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState('');
  const [results, setResults] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResults([]);
    
    const lines = urlsInput.split('\n').map(line => line.trim()).filter(line => line.length > 0);
    if (lines.length === 0) {
      setError('Please provide at least one URL');
      return;
    }

    if (lines.length > 100) {
      setError('Bulk creation is limited to 100 links per request');
      return;
    }

    setLoading(true);
    setProgress(10);

    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 80) {
          clearInterval(interval);
          return 80;
        }
        return prev + 15;
      });
    }, 150);

    try {
      const tagsArray = tags ? tags.split(',').map(t => t.trim()).filter(t => t.length > 0) : [];
      const res = await bulkCreateShortUrl({
        urls: lines,
        password: password || undefined,
        expiresAt: expiresAt || undefined,
        tags: tagsArray
      });

      clearInterval(interval);
      setProgress(100);

      setTimeout(() => {
        setResults(res.data.data);
        setLoading(false);
        setProgress(0);
      }, 300);

    } catch (err) {
      clearInterval(interval);
      setLoading(false);
      setProgress(0);
      setError(err.response?.data?.message || 'Bulk generation failed');
    }
  };

  const handleDownloadCSV = () => {
    if (results.length === 0) return;
    
    let csvContent = 'Original URL,Short URL,Short Code,Expires At\n';
    results.forEach(row => {
      const original = `"${row.originalUrl.replace(/"/g, '""')}"`;
      const short = `"${row.shortUrl}"`;
      const code = `"${row.shortCode}"`;
      const expiry = row.expiresAt ? `"${new Date(row.expiresAt).toLocaleDateString()}"` : '""';
      csvContent += `${original},${short},${code},${expiry}\n`;
    });

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `bulk_shortened_urls_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-[#F7FAFC] font-sans text-text selection:bg-primary/30 pb-20">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 pt-16 sm:px-6 lg:px-8">
        <header className="mb-12">
          <Link to="/" className="inline-flex items-center gap-2 text-xs font-black text-muted hover:text-primary transition-colors uppercase tracking-[0.2em] mb-4">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to Manager
          </Link>
          <div className="flex items-center gap-4 mb-3">
            <h1 className="text-5xl font-black tracking-tight text-text">Bulk Shortener</h1>
            <div className="badge-pink border-2">High Ingestion</div>
          </div>
          <p className="text-muted text-lg font-bold">Generate up to 100 short URLs concurrently in a single batch insert.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-white border-2 border-border rounded-3xl p-8 shadow-sm">
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-[0.25em] text-muted/80 ml-1">Paste Destination URLs (one per line)</label>
                  <textarea
                    rows={8}
                    value={urlsInput}
                    onChange={(e) => setUrlsInput(e.target.value)}
                    placeholder="https://example.com/page-1&#10;https://example.com/page-2&#10;https://example.com/page-3"
                    className="w-full bg-secondary border-2 border-border rounded-2xl p-5 text-sm font-medium focus:border-primary focus:ring-0 transition-all outline-none resize-y font-mono"
                    required
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted/80 ml-1">Password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Optional"
                      className="input-field w-full text-xs h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted/80 ml-1">Expires On</label>
                    <input
                      type="date"
                      value={expiresAt}
                      onChange={(e) => setExpiresAt(e.target.value)}
                      className="input-field w-full text-xs h-11"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted/80 ml-1">Tags</label>
                    <input
                      type="text"
                      value={tags}
                      onChange={(e) => setTags(e.target.value)}
                      placeholder="social, marketing"
                      className="input-field w-full text-xs h-11"
                    />
                  </div>
                </div>

                {error && (
                  <div className="flex items-center gap-3 rounded-xl bg-red-50 p-4 text-xs font-bold text-red-600 border border-red-100">
                    <AlertCircle className="h-5 w-5" />
                    {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full btn-primary h-12 text-xs font-bold flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <span>Processing Ingestion pipeline...</span>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" /> Shorten in Bulk
                    </>
                  )}
                </button>
              </form>

              <AnimatePresence>
                {loading && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 space-y-2 overflow-hidden"
                  >
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-muted">
                      <span>Ingestion Progress</span>
                      <span>{progress}%</span>
                    </div>
                    <div className="h-2 w-full bg-secondary border border-border rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-primary"
                        animate={{ width: `${progress}%` }}
                        transition={{ duration: 0.1 }}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border-2 border-border rounded-3xl p-8 shadow-sm h-full flex flex-col justify-between min-h-[420px]">
              {results.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
                  <div className="h-16 w-16 rounded-2xl bg-secondary flex items-center justify-center mb-6 border border-border">
                    <Layers className="h-8 w-8 text-muted" />
                  </div>
                  <h3 className="text-lg font-black text-text mb-2">Ingestion Output</h3>
                  <p className="text-xs text-muted font-bold leading-relaxed max-w-[280px]">Your shortened link directory output will appear here after bulk processing.</p>
                </div>
              ) : (
                <div className="space-y-6 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-4 border-b border-border mb-6">
                      <h3 className="text-sm font-black uppercase tracking-[0.2em] text-text/80">Batch Directory</h3>
                      <button
                        onClick={handleDownloadCSV}
                        className="btn-secondary h-9 px-3 text-[10px] font-black uppercase tracking-wider flex items-center gap-1.5"
                      >
                        <Download className="h-3.5 w-3.5" /> Download CSV
                      </button>
                    </div>

                    <div className="overflow-y-auto max-h-[300px] border border-border rounded-xl bg-secondary divide-y divide-border">
                      {results.map((url, i) => (
                        <div key={i} className="p-4 flex items-center justify-between gap-4 text-xs">
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-text truncate">{url.originalUrl}</div>
                            <div className="font-mono text-primary font-black mt-1">{url.shortUrl}</div>
                          </div>
                          <button
                            onClick={() => {
                              navigator.clipboard.writeText(url.shortUrl);
                              alert('Shortened link copied to clipboard!');
                            }}
                            className="p-2 hover:bg-white rounded border border-transparent hover:border-border text-muted hover:text-primary transition-colors"
                            title="Copy link"
                          >
                            <Copy className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 bg-green-50 border border-green-100 p-4 rounded-xl text-green-700 text-xs font-bold mt-4">
                    <CheckCircle2 className="h-5 w-5 shrink-0" />
                    <span>Successfully processed {results.length} URLs into active shortcuts!</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default BulkShortener;
