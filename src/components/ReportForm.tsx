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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      mahilas: parseInt(formData.mahilas as string) || 0,
      gents: parseInt(formData.gents as string) || 0,
      bv_girls: parseInt(formData.bv_girls as string) || 0,
      bv_boys: parseInt(formData.bv_boys as string) || 0,
      beneficiary_count: parseInt(formData.beneficiary_count as string) || 0,
      photos
    };

    try {
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
