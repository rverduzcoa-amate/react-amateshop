import React, { useEffect, useRef } from 'react';
import resolvePublicPath from '../utils/resolvePublicPath';
import { useNavigate } from 'react-router-dom';
import { newArrivals } from '../data/newArrivals';
import { products } from '../data/products';

export default function NewArrivals({ limit = 8 }) {
  const containerRef = useRef(null);
  const itemRefs = useRef([]);
  const videoRefs = useRef([]);
  const indexRef = useRef(0);
  const navigate = useNavigate();

  // Prefer `products` flagged with `new: true`; fallback to data/newArrivals.js
  const productItems = Object.keys(products).reduce((acc, key) => {
    (products[key] || []).forEach(p => { if (p && p.new) acc.push({ ...p, category: key }); });
    return acc;
  }, []);
  const items = (productItems.length > 0 ? productItems : newArrivals).slice(0, limit);

  useEffect(() => {
    if (!items || items.length === 0) return;

    // build list of indices which have videos
    const videoIndices = items.map((it, i) => it.video ? i : -1).filter(i => i >= 0);
    if (videoIndices.length === 0) return;

    const playIndex = (idx) => {
      const el = itemRefs.current[idx];
      if (el && el.scrollIntoView) {
        try { el.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' }); } catch (e) {}
      }
      // pause all, play only the requested video
      videoRefs.current.forEach((v, i) => {
        try {
          if (!v) return;
          if (i === idx) {
            v.muted = true;
            try { v.load(); } catch (e) {}
            v.play().catch(() => {});
          } else {
            v.pause();
            try { v.currentTime = 0; } catch (e) {}
          }
        } catch (e) {}
      });
    };

    // start at first video index
    indexRef.current = 0;
    playIndex(videoIndices[indexRef.current]);

    const id = setInterval(() => {
      indexRef.current = (indexRef.current + 1) % videoIndices.length;
      playIndex(videoIndices[indexRef.current]);
    }, 4200);

    return () => clearInterval(id);
  }, [limit, /* items length changes will reset effect */ items.length]);

  // `items` is computed above in the effect section

  return (
    <div style={{height: 190, marginBottom: 20}} className="new-arrivals-carousel">
      <div ref={containerRef} style={{display: 'flex', gap: 12, alignItems: 'center', overflowX: 'auto', padding: '85px 1px'}}>
        {items.map((it, i) => (
          <div
            key={it.id || i}
            ref={el => itemRefs.current[i] = el}
            style={{width: 320, height: 170, borderRadius: 8, overflow: 'hidden', position: 'relative', background: '#000', boxShadow: '0 6px 18px rgba(0,0,0,0.12)'}}
          >
            <button onClick={() => navigate(`/products/${it.id}`)} style={{all: 'unset', display: 'block', width: '100%', height: '100%', cursor: 'pointer'}}>
              {it.video ? (
                <video
                  ref={el => videoRefs.current[i] = el}
                  src={resolvePublicPath(it.video)}
                  muted
                  playsInline
                  loop
                  preload="auto"
                  poster={it.poster ? resolvePublicPath(it.poster) : undefined}
                  style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}}
                />
              ) : (
                <img
                  src={it.poster ? resolvePublicPath(it.poster) : ''}
                  alt={it.nombre}
                  style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}}
                />
              )}

              <div style={{position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', textAlign: 'center', pointerEvents: 'none'}}>
                <div style={{background:'rgba(0,0,0,0.35)', padding:'8px 14px', borderRadius:24, fontWeight:700, display:'inline-flex', gap:8, alignItems:'center'}}>
                  <span style={{fontSize:14}}>👆</span>
                  <span style={{fontSize:13}}>Touch to view the category</span>
                </div>
              </div>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
