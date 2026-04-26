'use client';

import { useEffect, useRef, useState } from 'react';
import { Download, Share2, Copy, Check } from 'lucide-react';

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

interface CollageGeneratorProps {
  report: Report;
  onClose: () => void;
}

export default function CollageGenerator({ report, onClose }: CollageGeneratorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [copied, setCopied] = useState(false);
  const [generating, setGenerating] = useState(true);

  // Helper for ordinal numbers
  const getOrdinal = (n: number) => {
    const s = ["th", "st", "nd", "rd"];
    const v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  };

  const sevadhalLines = [
    { label: '🌸 Mahilas', count: report.mahilas },
    { label: '👔 Gents', count: report.gents },
    { label: '👧 Balvikas Girls', count: report.bv_girls },
    { label: '👦 Balvikas Boys', count: report.bv_boys }
  ]
    .filter(item => item.count > 0)
    .map(item => `${item.label} - ${item.count}`)
    .join('\n');

  const shareText = `✨ Sairam – Buttermilk Distribution ✨
🗓 Date: ${new Date(report.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
📍 Location: Parvathy Nagar Bus Stop

By Swami’s grace, Day ${report.day} of seva completed, serving around ${report.beneficiary_count} people. 🙌

${sevadhalLines ? `👥 Sevadhals participated:\n${sevadhalLines}` : ''}

May Swami bless all 🙏🥛`;

  useEffect(() => {
    const loadCollage = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx || !report.photos[0]) return;

      const img = new Image();
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx.drawImage(img, 0, 0);
        setGenerating(false);
      };
      img.src = report.photos[0];
    };
    loadCollage();
  }, [report]);

  const downloadCollage = () => {
    const link = document.createElement('a');
    link.download = `SSSPN_Collage_Day_${report.day}.png`;
    link.href = canvasRef.current?.toDataURL('image/png') || '';
    link.click();
  };

  const copyText = () => {
    navigator.clipboard.writeText(shareText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareOnWhatsApp = async () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const blob = await new Promise<Blob | null>(resolve => canvas.toBlob(resolve, 'image/png'));
      if (!blob) return;

      const file = new File([blob], `SSSPN_Collage_Day_${report.day}.png`, { type: 'image/png' });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          text: shareText,
        });
      } else {
        // Fallback for desktop/unsupported browsers
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareText)}`;
        window.open(whatsappUrl, '_blank');
        alert('Sharing text to WhatsApp. Please attach the downloaded collage manually if on desktop.');
        downloadCollage();
      }
    } catch (err) {
      console.error('Error sharing:', err);
      // Fallback
      window.open(`https://wa.me/?text=${encodeURIComponent(shareText)}`, '_blank');
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ position: 'relative', width: '100%', aspectRatio: '1080/1350', background: '#f1f5f9', borderRadius: '0.5rem', overflow: 'hidden' }}>
        {generating && (
           <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
             <p>Generating Collage...</p>
           </div>
        )}
        <canvas ref={canvasRef} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
      </div>

      <div style={{ background: '#f8fafc', padding: '1rem', borderRadius: '0.5rem', fontSize: '0.9rem', whiteSpace: 'pre-wrap', border: '1px solid #e2e8f0' }}>
        {shareText}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <button className="btn btn-secondary" onClick={copyText}>
          {copied ? <><Check size={18} /> Copied</> : <><Copy size={18} /> Copy Text</>}
        </button>
        <button className="btn btn-primary" onClick={downloadCollage}>
          <Download size={18} /> Save Collage
        </button>
      </div>

      <button className="btn btn-share" style={{ width: '100%', background: '#25D366' }} onClick={shareOnWhatsApp}>
        <Share2 size={18} /> Share on WhatsApp
      </button>
    </div>
  );
}
