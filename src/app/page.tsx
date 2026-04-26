'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import ReportForm from '@/components/ReportForm';
import ReportTable from '@/components/ReportTable';
import { Droplet } from 'lucide-react';

interface Report {
  id: number;
  date: string;
  day: number;
  mahilas: number;
  gents: number;
  bv_girls: number;
  bv_boys: number;
  beneficiary_count: number;
  photos: string[];
}

export default function Home() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/reports');
      const data = await res.json();
      if (Array.isArray(data)) {
        setReports(data);
      }
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/reports/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setReports(prev => prev.filter((r: any) => r.id !== id));
      }
    } catch (err) {
      console.error('Failed to delete report:', err);
    }
  };

  return (
    <main className="container">
      <header className="title-section">
        <motion.div
           initial={{ scale: 0.8, opacity: 0 }}
           animate={{ scale: 1, opacity: 1 }}
           transition={{ duration: 0.5 }}
           style={{ display: 'inline-flex', background: 'white', padding: '1rem', borderRadius: '1.5rem', marginBottom: '1.5rem', boxShadow: 'var(--shadow)' }}
        >
          <Droplet size={40} color="var(--primary)" />
        </motion.div>
        <h1>Butter Milk Report</h1>
        <p>Sri Sathya Sai Butter Milk Distribution - Parvathy Nagar</p>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <ReportForm onSuccess={fetchReports} />
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <p style={{ color: 'var(--text-muted)' }}>Loading reports...</p>
          </div>
        ) : (
          <ReportTable reports={reports} onDelete={handleDelete} />
        )}
      </div>

      <footer style={{ marginTop: '4rem', textAlign: 'center', paddingBottom: '2rem', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        <p>Made with Love for Seva 🙏</p>
        <p style={{ marginTop: '0.5rem' }}>© {new Date().getFullYear()} Parvathy Nagar Samithi</p>
      </footer>
    </main>
  );
}
