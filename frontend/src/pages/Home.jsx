import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { createShortUrl, getMyUrls, deleteUrl } from '../services/api';
import Navbar from '../components/Navbar/Navbar';
import URLForm from '../components/URLForm/URLForm';
import URLCard from '../components/URLCard/URLCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, ListFilter, Search, Info, TrendingUp, Sparkles } from 'lucide-react';
import { cn } from '../utils/cn';

const Home = () => {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUrls();
  }, []);

  const fetchUrls = async () => {
    try {
      const res = await getMyUrls();
      setUrls(res.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateUrl = async (formData) => {
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await createShortUrl(formData);
      setSuccess('Short URL created successfully!');
      fetchUrls();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create URL');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (shortCode) => {
    if (!window.confirm('Are you sure you want to delete this link?')) return;
    try {
      await deleteUrl(shortCode);
      fetchUrls();
    } catch (err) {
      alert('Failed to delete link');
    }
  };

  const handleCopy = (shortCode) => {
    const baseUrl = 'http://localhost:5001/';
    navigator.clipboard.writeText(baseUrl + shortCode);
  };

  const filteredUrls = urls.filter(url => 
    url.shortCode.toLowerCase().includes(searchTerm.toLowerCase()) || 
    url.originalUrl.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (url.tags && url.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  return (
    <div className="min-h-screen bg-[#F7FAFC] font-sans text-text selection:bg-primary/30 pb-20">
      <Navbar />

      <main className="mx-auto max-w-5xl px-4 pt-16 sm:px-6 lg:px-8">
        <header className="mb-16">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2 text-primary font-black text-xs uppercase tracking-[0.2em] mb-4"
          >
            <Layers className="h-4 w-4" /> Link Dashboard
          </motion.div>
          <motion.h1 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl font-black tracking-tight text-text mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <span>Your <span className="text-primary">Link</span> Manager</span>
            <Link to="/bulk-shorten" className="btn-secondary h-11 px-5 text-xs font-black uppercase tracking-widest flex items-center gap-2 self-start sm:self-auto shrink-0 shadow-sm border-2">
              <Sparkles className="h-4 w-4 text-primary" /> Bulk Shortener
            </Link>
          </motion.h1>
          <motion.p 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-muted text-xl font-medium max-w-3xl leading-relaxed"
          >
            Create and track all your shortened links in one place. 
            All links are optimized for fast delivery.
          </motion.p>
        </header>

        <div className="space-y-16">
          {/* Creation Section */}
          <section className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-primary to-primary-soft rounded-2xl blur opacity-10" />
            <div className="relative">
              <URLForm
                onSubmit={handleCreateUrl}
                loading={loading}
                error={error}
                success={success}
              />
            </div>
          </section>

          {/* List Section */}
          <section className="space-y-8">
            <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between border-b-2 border-border pb-8">
              <div className="space-y-1">
                <h2 className="text-2xl font-black text-text">Your Links</h2>
                <p className="text-sm font-bold text-muted flex items-center gap-2">
                   <TrendingUp className="h-4 w-4 text-green-600" /> You have {urls.length} links active
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div className="relative group">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted group-focus-within:text-primary transition-colors">
                    <Search className="h-4 w-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="Search links..."
                    className="input-field h-12 pl-12 text-sm min-w-[280px]"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                <button className="btn-secondary h-12 w-12 p-0 flex items-center justify-center">
                  <ListFilter className="h-5 w-5" />
                </button>
              </div>
            </div>

            {urls.length === 0 ? (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="bg-white border-2 border-dashed border-border rounded-2xl py-24 flex flex-col items-center justify-center text-center px-6"
              >
                <div className="h-20 w-20 rounded-2xl bg-secondary flex items-center justify-center mb-8 border-2 border-border shadow-sm">
                  <Layers className="h-10 w-10 text-muted" />
                </div>
                <h3 className="text-2xl font-black mb-3 text-text">No links found</h3>
                  You haven't created any links yet. Use the form above to start shortening your URLs.
              </motion.div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredUrls.map((url) => (
                    <URLCard
                      key={url._id}
                      url={url}
                      onCopy={handleCopy}
                      onDelete={handleDelete}
                    />
                  ))}
                </AnimatePresence>
                
                {filteredUrls.length === 0 && (
                  <div className="py-20 text-center font-bold text-muted italic bg-white rounded-2xl border-2 border-border">
                    No links match your search.
                  </div>
                )}
              </div>
            )}
          </section>

          {/* Footer Info */}
          <section className="flex items-center gap-4 rounded-2xl border-2 border-green-accent bg-green-accent/20 p-6 text-sm font-bold text-green-800 shadow-sm">
            <div className="h-10 w-10 shrink-0 rounded-full bg-green-accent flex items-center justify-center border-2 border-white shadow-sm">
              <Info className="h-5 w-5" />
            </div>
            <div>
              <p className="leading-relaxed">
                <strong className="text-green-900 uppercase tracking-wider">Status:</strong> All systems are working perfectly. 
                Your links are live and tracking stats in real-time.
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
};

export default Home;