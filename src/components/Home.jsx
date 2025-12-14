


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
    // helper to reliably attempt play() multiple times
    const playWithRetries = (v, retries = 6, delay = 300) => {
        if (!v) return;
        try { v.muted = true; } catch (e) {}
        let attempt = 0;
        const tryPlay = () => {
            attempt += 1;
            v.play().then(() => {}).catch(() => {
                if (attempt < retries) setTimeout(tryPlay, delay);
            });
        };
        tryPlay();
    };

    // Play only the active carousel video; advance when it ends.
    useEffect(() => {
        if (!videosHome || videosHome.length === 0) return;

        const cleanup = [];

        videoRefs.current.forEach((v, idx) => {
            try {
                if (!v) return;

                // remove any previous ended listener we stored
                if (v._onEnded) {
                    try { v.removeEventListener('ended', v._onEnded); } catch (e) {}
                    v._onEnded = null;
                }

                // attach ended listener to advance to next slide
                const onEnded = () => setCurrentVideo(prev => (prev + 1) % videosHome.length);
                v._onEnded = onEnded;
                v.addEventListener('ended', onEnded);
                cleanup.push(() => { try { v.removeEventListener('ended', onEnded); } catch (e) {} });
                if (idx === currentVideo) {
                    // try playing with retries to handle slow/blocked loads
                    playWithRetries(v);
                } else {
                    // pause and reset non-active videos
                    try { v.pause(); } catch (e) {}
                    try { v.currentTime = 0; } catch (e) {}
                }
            } catch (e) {}
        });

        return () => cleanup.forEach(fn => fn());
    }, [currentVideo]);

    // IntersectionObserver to pause videos that are offscreen (performance)
    useEffect(() => {
        if (typeof IntersectionObserver === 'undefined') return;

        const obs = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                const el = entry.target;
                if (!el) return;

                // main carousel videos
                const mainIdx = videoRefs.current.findIndex(v => v === el);
                if (mainIdx !== -1) {
                    if (entry.intersectionRatio < 0.35) {
                        try { el.pause(); } catch (e) {}
                    } else {
                        // if this is the active slide, ensure it plays
                        if (mainIdx === currentVideo) playWithRetries(el);
                    }
                    return;
                }

                // category videos
                const catIdx = catVideoRefs.current ? catVideoRefs.current.findIndex(v => v === el) : -1;
                if (catIdx !== -1) {
                    if (entry.intersectionRatio < 0.25) {
                        try { el.pause(); } catch (e) {}
                    } else {
                        try { el.muted = true; el.play().catch(() => {}); } catch (e) {}
                    }
                }
            });
        }, { threshold: [0, 0.25, 0.35, 0.6] });

        // observe known refs
        videoRefs.current.forEach(v => { if (v) try { obs.observe(v); } catch (e) {} });
        if (catVideoRefs.current) catVideoRefs.current.forEach(v => { if (v) try { obs.observe(v); } catch (e) {} });

        return () => { try { obs.disconnect(); } catch (e) {} };
    }, [currentVideo]);
    
    // Category carousel hooks (must be unconditional)
    const catContainerRef = useRef(null);
    const catItemRefs = useRef([]);
    const catVideoRefs = useRef([]);
    const navigate = useNavigate();
    const [currentCatIndex, setCurrentCatIndex] = useState(0);
    const touchStartX = useRef(null);
    const touchDeltaX = useRef(0);

    // Play the active category video, pause/reset others. Advance on ended.
    useEffect(() => {
        if (!categoryVideoBanners || categoryVideoBanners.length === 0) return;

        const cleanup = [];

        catVideoRefs.current.forEach((v, idx) => {
            if (!v) return;

            if (v._onEnded) {
                try { v.removeEventListener('ended', v._onEnded); } catch (e) {}
                v._onEnded = null;
            }

            const onEnded = () => setCurrentCatIndex(prev => (prev + 1) % categoryVideoBanners.length);
            v._onEnded = onEnded;
            v.addEventListener('ended', onEnded);
            cleanup.push(() => { try { v.removeEventListener('ended', onEnded); } catch (e) {} });

            if (idx === currentCatIndex) {
                try { v.muted = true; } catch (e) {}
                playWithRetries(v);
            } else {
                try { v.pause(); v.currentTime = 0; } catch (e) {}
            }
        });

        // scroll active into view for visual feedback
        const activeEl = catItemRefs.current[currentCatIndex];
        if (activeEl && activeEl.scrollIntoView) {
            try { activeEl.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }); } catch (e) {}
        }

        return () => cleanup.forEach(fn => fn());
    }, [currentCatIndex]);

    // touch/swipe handlers for category carousel
    const onCatTouchStart = (e) => {
        touchStartX.current = e.touches[0].clientX;
        touchDeltaX.current = 0;
    };
    const onCatTouchMove = (e) => {
        if (touchStartX.current == null) return;
        touchDeltaX.current = e.touches[0].clientX - touchStartX.current;
    };
    const onCatTouchEnd = () => {
        const delta = touchDeltaX.current || 0;
        const threshold = 40; // px
        if (Math.abs(delta) > threshold) {
            if (delta < 0) {
                setCurrentCatIndex(prev => (prev + 1) % categoryVideoBanners.length);
            } else {
                setCurrentCatIndex(prev => (prev - 1 + categoryVideoBanners.length) % categoryVideoBanners.length);
            }
        }
        touchStartX.current = null;
        touchDeltaX.current = 0;
    };

    // pointer (mouse) handlers for desktop swiping/drags
    const onCatPointerDown = (e) => {
        // only handle primary button
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        touchStartX.current = e.clientX;
        touchDeltaX.current = 0;
        // capture pointer to continue receiving move/end even if cursor leaves element
        try { e.target.setPointerCapture && e.target.setPointerCapture(e.pointerId); } catch (err) {}
    };
    const onCatPointerMove = (e) => {
        if (touchStartX.current == null) return;
        touchDeltaX.current = e.clientX - touchStartX.current;
    };
    const onCatPointerUp = (e) => {
        onCatTouchEnd();
        try { e.target.releasePointerCapture && e.target.releasePointerCapture(e.pointerId); } catch (err) {}
    };

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
            <div className="vertical-carousel-container">
                <div id="videoSlides" style={{position: 'relative', width: '100%', height: '100%'}}>
                    {videosHome && videosHome.length > 0 ? (
                        videosHome.map((v, i) => (
                            <div key={v.id} className={`video-slide-item ${i === currentVideo ? 'active' : ''}`} style={{width: '100%', height: '100%', position: 'absolute', top: 13, left: 0}}>
                                <video
                                    src={resolvePublicPath(v.src)}
                                    muted
                                    playsInline
                                    /* do not loop here: we want ended event to advance slide */
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
                    
            {/* category video banners - rectangular carousel with swipe and per-video playback */}
            <div className="categories-section">
                <div className="categories-header">
                    <div className="categories-title">CATALAGO</div>
                </div>
                <div className="categories-carousel-container"
                    onTouchStart={onCatTouchStart}
                    onTouchMove={onCatTouchMove}
                    onTouchEnd={onCatTouchEnd}
                    onPointerDown={onCatPointerDown}
                    onPointerMove={onCatPointerMove}
                    onPointerUp={onCatPointerUp}
                >
                    <div className="categories-track" ref={catContainerRef} style={{position: 'relative', width: '100%', height: '100%'}}>
                        {categoryVideoBanners && categoryVideoBanners.length > 0 ? (
                            categoryVideoBanners.map((item, idx) => (
                                <div
                                    key={item.id}
                                    ref={el => catItemRefs.current[idx] = el}
                                    className={`category-slide-item ${idx === currentCatIndex ? 'active' : ''}`}
                                    style={{width: '100%', height: '100%', position: 'absolute', top: 0, left: 0}}
                                >
                                    <button type="button" onClick={() => { navigate(`/categories/${item.category}`); try { window.scrollTo(0,0); } catch(e){} }} style={{all: 'unset', display: 'block', width: '100%', height: '100%', cursor: 'pointer'}}>
                                        <video
                                            ref={el => catVideoRefs.current[idx] = el}
                                            src={resolvePublicPath(item.src)}
                                            muted
                                            playsInline
                                            preload="auto"
                                            poster={item.poster ? resolvePublicPath(item.poster) : undefined}
                                            style={{width: '100%', height: '100%', objectFit: 'cover', display: 'block'}}
                                        />
                                        <div style={{position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#fff', textAlign: 'center', pointerEvents: 'none'}}>
                                                <div style={{fontWeight: 700, fontSize: 16, textShadow: '0 1px 3px rgba(0,0,0,0.6)'}}>{item.titulo}</div>
                                                <div style={{marginTop:8, fontSize:12, background:'rgba(0,0,0,0.35)', padding:'6px 10px', borderRadius:20, display:'inline-flex', alignItems:'center', gap:8}}>👆 Touch to view</div>
                                            </div>
                                    </button>
                                </div>
                            ))
                        ) : (
                            <div style={{height:'100px', background:'#eee', display:'flex', alignItems:'center', justifyContent:'center', width:'100%'}}>Próximamente: carrusel de categorías</div>
                        )}
                    </div>
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