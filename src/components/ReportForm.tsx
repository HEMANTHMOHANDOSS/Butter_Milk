'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Users, Camera, Send, Plus, X } from 'lucide-react';

interface ReportFormProps {
  onSuccess: () => void;
}

export default function ReportForm({ onSuccess }: ReportFormProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    day: '1',
    mahilas: '',
    gents: '',
    bv_girls: '',
    bv_boys: '',
    beneficiary_count: ''
  });
  const [photos, setPhotos] = useState<string[]>([]);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    if (photos.length + files.length > 5) {
      alert('Maximum 5 photos allowed');
      return;
    }

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          // Max resolution 1280px
          const MAX_WIDTH = 1280;
          const MAX_HEIGHT = 1280;

          if (width > height) {
            if (width > MAX_WIDTH) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            }
          } else {
            if (height > MAX_HEIGHT) {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Compress to 0.7 quality
          const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
          setPhotos(prev => [...prev, dataUrl]);
        };
        img.src = event.target?.result as string;
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    setPhotos(prev => prev.filter((_, i) => i !== index));
  };

  const generateCollage = async (images: string[], date: string): Promise<string> => {
    return new Promise((resolve) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      if (!ctx) return resolve('');

      const width = 1080;
      const height = 1350;
      canvas.width = width;
      canvas.height = height;

      // Background
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, width, height);

      const drawImage = (src: string, x: number, y: number, w: number, h: number) => {
        return new Promise<void>((res) => {
          const img = new Image();
          img.onload = () => {
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
            res();
          };
          img.src = src;
        });
      };

      const photoCount = images.length;
      const run = async () => {
        if (photoCount === 1) await drawImage(images[0], 0, 100, width, height - 200);
        else if (photoCount === 2) {
          await drawImage(images[0], 0, 100, width / 2 - 2, height - 200);
          await drawImage(images[1], width / 2 + 2, 100, width / 2 - 2, height - 200);
        } else if (photoCount === 3) {
          await drawImage(images[0], 0, 100, width, (height - 200) / 2 - 2);
          await drawImage(images[1], 0, 100 + (height - 200) / 2 + 2, width / 2 - 2, (height - 200) / 2 - 2);
          await drawImage(images[2], width / 2 + 2, 100 + (height - 200) / 2 + 2, width / 2 - 2, (height - 200) / 2 - 2);
        } else if (photoCount === 4) {
          await drawImage(images[0], 0, 100, width / 2 - 2, (height - 200) / 2 - 2);
          await drawImage(images[1], width / 2 + 2, 100, width / 2 - 2, (height - 200) / 2 - 2);
          await drawImage(images[2], 0, 100 + (height - 200) / 2 + 2, width / 2 - 2, (height - 200) / 2 - 2);
          await drawImage(images[3], width / 2 + 2, 100 + (height - 200) / 2 + 2, width / 2 - 2, (height - 200) / 2 - 2);
        } else if (photoCount === 5) {
          const topH = (height - 200) * 0.6;
          const botH = (height - 200) * 0.4;
          await drawImage(images[0], 0, 100, width / 2 - 2, topH - 2);
          await drawImage(images[1], width / 2 + 2, 100, width / 2 - 2, topH - 2);
          await drawImage(images[2], 0, 100 + topH + 2, width / 3 - 2, botH - 2);
          await drawImage(images[3], width / 3 + 2, 100 + topH + 2, width / 3 - 2, botH - 2);
          await drawImage(images[4], (width / 3) * 2 + 2, 100 + topH + 2, width / 3 - 2, botH - 2);
        }

        // Branding
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
        ctx.fillText(new Date(date).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }), width / 2, height - 30);

        resolve(canvas.toDataURL('image/jpeg', 0.8));
      };
      run();
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (photos.length === 0) {
      alert('Please upload at least one photo');
      return;
    }
    setLoading(true);

    try {
      const collage = await generateCollage(photos, formData.date);

      const payload = {
        ...formData,
        mahilas: parseInt(formData.mahilas as string) || 0,
        gents: parseInt(formData.gents as string) || 0,
        bv_girls: parseInt(formData.bv_girls as string) || 0,
        bv_boys: parseInt(formData.bv_boys as string) || 0,
        beneficiary_count: parseInt(formData.beneficiary_count as string) || 0,
        photos: [collage] // Store only the collage
      };

      const res = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        alert('Report submitted successfully!');
        setFormData({
            date: new Date().toISOString().split('T')[0],
            day: '1',
            mahilas: '',
            gents: '',
            bv_girls: '',
            bv_boys: '',
            beneficiary_count: ''
        });
        setPhotos([]);
        onSuccess();
      } else {
        alert('Failed to submit report');
      }
    } catch (err) {
      console.error(err);
      alert('Error submitting report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <div style={{ background: 'var(--primary)', color: 'white', padding: '0.5rem', borderRadius: '0.5rem', display: 'flex' }}>
          <Plus size={20} />
        </div>
        <h2 style={{ fontSize: '1.5rem' }}>New Distribution Report</h2>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-grid">
          <div className="input-group">
            <label><Calendar size={14} style={{ marginRight: '4px' }} /> Date</label>
            <input 
              type="date" 
              required 
              value={formData.date}
              onChange={e => setFormData({ ...formData, date: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label>Day Number</label>
            <select 
              value={formData.day}
              onChange={e => setFormData({ ...formData, day: e.target.value })}
            >
              {[...Array(50)].map((_, i) => (
                <option key={i+1} value={i+1}>Day {i+1}</option>
              ))}
            </select>
          </div>

          <div className="input-group">
            <label>Mahilas</label>
            <input 
              type="number" 
              min="0"
              placeholder="e.g. 7"
              value={formData.mahilas}
              onChange={e => setFormData({ ...formData, mahilas: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label>Gents</label>
            <input 
              type="number" 
              min="0"
              placeholder="e.g. 1"
              value={formData.gents}
              onChange={e => setFormData({ ...formData, gents: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label>BV Girls</label>
            <input 
              type="number" 
              min="0"
              placeholder="e.g. 0"
              value={formData.bv_girls}
              onChange={e => setFormData({ ...formData, bv_girls: e.target.value })}
            />
          </div>

          <div className="input-group">
            <label>BV Boys</label>
            <input 
              type="number" 
              min="0"
              placeholder="e.g. 2"
              value={formData.bv_boys}
              onChange={e => setFormData({ ...formData, bv_boys: e.target.value })}
            />
          </div>

          <div className="input-group" style={{ gridColumn: 'span 1' }}>
            <label><Users size={14} style={{ marginRight: '4px' }} /> Total Beneficiaries</label>
            <input 
              type="number" 
              min="0"
              required
              placeholder="e.g. 50"
              value={formData.beneficiary_count}
              onChange={e => setFormData({ ...formData, beneficiary_count: e.target.value })}
            />
          </div>
        </div>

        <div className="input-group">
          <label><Camera size={14} style={{ marginRight: '4px' }} /> Photos (up to 5)</label>
          <div className="photo-upload" onClick={() => document.getElementById('photo-input')?.click()}>
            <Plus size={24} style={{ color: 'var(--primary)', marginBottom: '0.5rem' }} />
            <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>Click to upload distribution photos</p>
            <input 
              id="photo-input"
              type="file" 
              accept="image/*" 
              multiple 
              hidden 
              onChange={handlePhotoUpload}
            />
          </div>

          {photos.length > 0 && (
            <div className="photo-previews">
              {photos.map((photo, index) => (
                <div key={index} style={{ position: 'relative' }}>
                  <img src={photo} alt="Preview" className="photo-preview-item" />
                  <button 
                    type="button"
                    onClick={() => removePhoto(index)}
                    style={{ 
                      position: 'absolute', 
                      top: '-5px', 
                      right: '-5px', 
                      background: 'var(--danger)', 
                      color: 'white', 
                      border: 'none', 
                      borderRadius: '50%', 
                      width: '20px', 
                      height: '20px', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      cursor: 'pointer'
                    }}
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div style={{ marginTop: '2rem' }}>
          <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', paddingTop: '1rem', paddingBottom: '1rem' }}>
            {loading ? 'Submitting...' : <><Send size={18} /> Submit Report</>}
          </button>
        </div>
      </form>
    </motion.div>
  );
}
