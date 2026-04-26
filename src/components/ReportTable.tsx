'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Trash2, Share2, FileSpreadsheet, X, Check } from 'lucide-react';
import ExcelJS from 'exceljs';
import { saveAs } from 'file-saver';
import CollageGenerator from './CollageGenerator';

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

interface ReportTableProps {
  reports: Report[];
  onDelete: (id: number) => void;
}

export default function ReportTable({ reports, onDelete }: ReportTableProps) {
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [shareReport, setShareReport] = useState<Report | null>(null);

  const downloadExcel = async () => {
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Butter Milk Reports');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Date', key: 'date', width: 15 },
      { header: 'Day', key: 'day', width: 10 },
      { header: 'Mahilas', key: 'mahilas', width: 10 },
      { header: 'Gents', key: 'gents', width: 10 },
      { header: 'BV Girls', key: 'bv_girls', width: 10 },
      { header: 'BV Boys', key: 'bv_boys', width: 10 },
      { header: 'Beneficiaries', key: 'beneficiary_count', width: 15 },
    ];

    reports.forEach(report => {
      worksheet.addRow({
        ...report,
        date: new Date(report.date).toLocaleDateString()
      });
    });

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    saveAs(blob, `ButterMilkReports_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleShare = (report: Report) => {
    setShareReport(report);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="glass-card"
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.5rem' }}>Reports History</h2>
        <button className="btn btn-report" onClick={downloadExcel}>
          <FileSpreadsheet size={18} /> Download Excel
        </button>
      </div>

      <div className="table-container">
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Day</th>
              <th>Counts (M/G/BG/BB)</th>
              <th>Beneficiaries</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence>
              {reports.map((report) => (
                <motion.tr 
                  key={report.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <td>{new Date(report.date).toLocaleDateString()}</td>
                  <td>Day {report.day}</td>
                  <td>{report.mahilas}/{report.gents}/{report.bv_girls}/{report.bv_boys}</td>
                  <td style={{ fontWeight: 600 }}>{report.beneficiary_count}</td>
                  <td>
                    <div className="actions">
                      <button 
                        className="btn btn-share" 
                        style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                        onClick={() => handleShare(report)}
                      >
                        <Share2 size={14} /> SSSPN
                      </button>
                      
                      {deleteId === report.id ? (
                        <div style={{ display: 'flex', gap: '0.25rem' }}>
                          <button 
                            className="btn btn-danger" 
                            style={{ padding: '0.4rem', borderRadius: '0.5rem' }}
                            onClick={() => { onDelete(report.id); setDeleteId(null); }}
                          >
                            <Check size={14} />
                          </button>
                          <button 
                            className="btn btn-secondary" 
                            style={{ padding: '0.4rem', borderRadius: '0.5rem' }}
                            onClick={() => setDeleteId(null)}
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <button 
                          className="btn btn-danger" 
                          style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                          onClick={() => setDeleteId(report.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
            {reports.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', paddingTop: '3rem', paddingBottom: '3rem', color: 'var(--text-muted)' }}>
                  No reports found. Start by adding one!
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {shareReport && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3>SSSPN Share Collage</h3>
              <button onClick={() => setShareReport(null)} style={{ border: 'none', background: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>
            
            <CollageGenerator report={shareReport} onClose={() => setShareReport(null)} />
          </div>
        </div>
      )}
    </motion.div>
  );
}
