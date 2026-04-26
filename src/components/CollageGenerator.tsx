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

  const shareText = `Sairam 🙏 By Swami’s grace, ${getOrdinal(report.day)} day of buttermilk distribution at Parvathy Nagar bus stop, served around ${report.beneficiary_count} people.
${new Date(report.date).toLocaleDateString()}
Sevadhals participated
Mahilas - ${report.mahilas} 
Gents - ${report.gents} 
Balvikas boys - ${report.bv_boys} 

May Swami shower His blessings on all 🎊`;

  useEffect(() => {
    const generateCollage = async () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const width = 1080;
      const height = 1350; // Instagram Portrait Aspect Ratio
      canvas.width = width;
      canvas.height = height;

      // Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      // Draw Photos
      const photos = report.photos.slice(0, 5);
      const photoCount = photos.length;

      const drawImage = (src: string, x: number, y: number, w: number, h: number) => {
        return new Promise<void>((resolve) => {
          const img = new Image();
          img.onload = () => {
             // Center crop
             const imgRatio = img.width / img.height;
             const targetRatio = w / h;
             let sx, sy, sw, sh;
             if (imgRatio > targetRatio) {
               sh = img.height;
               sw = img.height * targetRatio;
               sx = (img.width - sw) / 2;
               sy = 0;
             } else {
               sw = img.width;
               sh = img.width / targetRatio;
               sx = 0;
               sy = (img.height - sh) / 2;
             }
             ctx.drawImage(img, sx, sy, sw, sh, x, y, w, h);
             resolve();
          };
          img.src = src;
        });
      };

      // Layouts based on count
      if (photoCount === 1) {
        await drawImage(photos[0], 0, 100, width, height - 200);
      } else if (photoCount === 2) {
        await drawImage(photos[0], 0, 100, width / 2 - 2, height - 200);
        await drawImage(photos[1], width / 2 + 2, 100, width / 2 - 2, height - 200);
      } else if (photoCount === 3) {
        await drawImage(photos[0], 0, 100, width, (height - 200) / 2 - 2);
        await drawImage(photos[1], 0, 100 + (height - 200) / 2 + 2, width / 2 - 2, (height - 200) / 2 - 2);
        await drawImage(photos[2], width / 2 + 2, 100 + (height - 200) / 2 + 2, width / 2 - 2, (height - 200) / 2 - 2);
      } else if (photoCount === 4) {
        await drawImage(photos[0], 0, 100, width / 2 - 2, (height - 200) / 2 - 2);
        await drawImage(photos[1], width / 2 + 2, 100, width / 2 - 2, (height - 200) / 2 - 2);
        await drawImage(photos[2], 0, 100 + (height - 200) / 2 + 2, width / 2 - 2, (height - 200) / 2 - 2);
        await drawImage(photos[3], width / 2 + 2, 100 + (height - 200) / 2 + 2, width / 2 - 2, (height - 200) / 2 - 2);
      } else if (photoCount === 5) {
        const topH = (height - 200) * 0.6;
        const botH = (height - 200) * 0.4;
        await drawImage(photos[0], 0, 100, width / 2 - 2, topH - 2);
        await drawImage(photos[1], width / 2 + 2, 100, width / 2 - 2, topH - 2);
        await drawImage(photos[2], 0, 100 + topH + 2, width / 3 - 2, botH - 2);
        await drawImage(photos[3], width / 3 + 2, 100 + topH + 2, width / 3 - 2, botH - 2);
        await drawImage(photos[4], (width / 3) * 2 + 2, 100 + topH + 2, width / 3 - 2, botH - 2);
      }

      // Add Headers & Footers
      ctx.fillStyle = 'rgba(92, 98, 214, 0.9)';
      ctx.fillRect(0, 0, width, 100);
      
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 36px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('Sri Sathya Sai Butter Milk Distribution', width / 2, 45);
      ctx.font = '30px Arial';
      ctx.fillText('Parvathy Nagar Samithi', width / 2, 85);

      ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
      ctx.fillRect(0, height - 80, width, 80);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 32px Arial';
      ctx.textAlign = 'center';
      ctx.fillText(new Date(report.date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), width / 2, height - 30);

      setGenerating(false);
    };

    generateCollage();
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
