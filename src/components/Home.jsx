


import React, { useState, useRef, useEffect } from 'react';
import resolvePublicPath from '../utils/resolvePublicPath';
import { useParams, useNavigate } from 'react-router-dom';
import { videosHome } from '../data/videos';
import { categoryVideoBanners } from '../data/category_videos';
import NewArrivals from './NewArrivals';

function Home() {
    const { category } = useParams();

    // (cart logic removed from Home — handled globally in Header/Cart)

    // Video carousel refs & autoplay (hooks must be called unconditionally)
    const videoRefs = useRef([]);
    const [currentVideo, setCurrentVideo] = useState(0);

    useEffect(() => {
        if (!videosHome || videosHome.length === 0) return;
        // Ensure only current video is playing
        videoRefs.current.forEach((v, idx) => {
            try {
                if (!v) return;
                if (idx === currentVideo) {
                    v.muted = true;
                    try { v.load(); } catch (e) {}
                    v.play().catch(() => {});
                } else {
                    v.pause();
                    try { v.currentTime = 0; } catch (e) {}
                }
            } catch (e) {}
        });
    }, [currentVideo]);

    useEffect(() => {
        if (!videosHome || videosHome.length === 0) return;
        const id = setInterval(() => {
            setCurrentVideo(prev => (prev + 1) % videosHome.length);
        }, 5000);
        return () => clearInterval(id);
    }, []);
    
    // Category carousel hooks (must be unconditional)
    const catContainerRef = useRef(null);
    const catItemRefs = useRef([]);
    const catVideoRefs = useRef([]);
    const currentCatIndexRef = useRef(0);
    const navigate = useNavigate();

    // autoplay: cycle category videos and scroll into view
    useEffect(() => {
        if (!categoryVideoBanners || categoryVideoBanners.length === 0) return;
        const playIndex = (idx) => {
            const el = catItemRefs.current[idx];
            if (el && el.scrollIntoView) {
                try { el.scrollIntoView({ inline: 'center', behavior: 'smooth', block: 'nearest' }); } catch (e) {}
            }
            // pause others
            catVideoRefs.current.forEach((v, i) => {
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

        playIndex(0);
        const id = setInterval(() => {
            const next = (currentCatIndexRef.current + 1) % categoryVideoBanners.length;
            currentCatIndexRef.current = next;
            playIndex(next);
        }, 4000);
        return () => clearInterval(id);
    }, []); // run once on mount

    if (category) {
        return (
            <section id="view-home" className="view">
                <h2>Catálogo: {category.toUpperCase()}</h2>
                <div>Próximamente: grilla de productos para {category}</div>
            </section>
        );
    }
    return (
        <section id="view-home" className="view active-view">
            {/* carousel reels (videos) */}
            <div style={{height: 500, marginBottom: 15}} className="vertical-carousel-container">
                <div id="videoSlides" style={{position: 'relative', width: '100%', height: '100%'}}>
                    {videosHome && videosHome.length > 0 ? (
                        videosHome.map((v, i) => (
                            <div key={v.id} className={`video-slide-item ${i === currentVideo ? 'active' : ''}`} style={{width: '100%', height: '100%', position: 'absolute', top: 13, left: 0}}>
                                <video
                                    src={resolvePublicPath(v.src)}
                                    muted
                                    playsInline
                                    loop
                                    preload="auto"
                                    poster={v.poster ? resolvePublicPath(v.poster) : undefined}
                                    ref={el => videoRefs.current[i] = el}
                                    style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}}
                                />
                            </div>
                        ))
                    ) : (
                        <div style={{background: '#eee', width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>Próximamente: carrusel de videos</div>
                    )}
                </div>
            </div>
                    
            {/* category video banners - autoplay small carousel */}
            <div style={{height: 100, marginBottom: 15, marginTop: '1rem'}} className="categories-carousel-container">
                <div ref={catContainerRef} style={{display: 'flex', gap: 12, alignItems: 'center', justifyContent: 'center', overflowX: 'auto', padding: '45px 1px'}}>
                    {categoryVideoBanners && categoryVideoBanners.length > 0 ? (
                        categoryVideoBanners.map((item, idx) => (
                            <div
                                key={item.id}
                                ref={el => catItemRefs.current[idx] = el}
                                style={{display: 'block', width: 2220, height: 100, borderRadius: 8, overflow: 'hidden', position: 'relative', background: '#000', boxShadow: '0 6px 14px rgba(0,0,0,0.12)'}}
                            >
                                <button onClick={() => navigate(`/categories/${item.category}`)} style={{all: 'unset', display: 'block', width: '100%', height: '100%', cursor: 'pointer'}}>
                                    <video
                                        ref={el => catVideoRefs.current[idx] = el}
                                        src={resolvePublicPath(item.src)}
                                        muted
                                        playsInline
                                        loop
                                        preload="auto"
                                        poster={item.poster ? resolvePublicPath(item.poster) : undefined}
                                        style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}}
                                    />
                                    <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', textAlign: 'center', pointerEvents: 'none'}}>
                                        <div style={{fontWeight: 700, fontSize: 13, textShadow: '0 1px 3px rgba(0,0,0,0.6)'}}>{item.titulo}</div>
                                        <div style={{marginTop:6, fontSize:12, background:'rgba(0,0,0,0.35)', padding:'6px 10px', borderRadius:20, display:'inline-flex', alignItems:'center', gap:8}}>👆 Touch to view</div>
                                    </div>
                                </button>
                            </div>
                        ))
                    ) : (
                        <div style={{height:'100px', background:'#eee', display:'flex', alignItems:'center', justifyContent:'center', width:'100%'}}>Próximamente: carrusel de categorías</div>
                    )}
                </div>
            </div>

            {/* new arrivals carousel videos */}
            <NewArrivals />
        </section>
    );
}

// Autoplay category carousel behavior: set up interval to cycle and play
// videos. Keep this logic outside the component render to avoid re-definitions.


export default Home;