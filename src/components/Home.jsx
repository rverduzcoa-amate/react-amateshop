


import React, { useState, useRef, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { products } from '../data/products';
import { videosHome } from '../data/videos';

function Home() {
    const { category } = useParams();

    // Simple cart add logic using localStorage (must be before any return)
    const [, setCart] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('cart') || '[]');
        } catch {
            return [];
        }
    });

    const addToCart = (id) => {
        setCart(prev => {
            const exists = prev.find(item => item.id === id);
            const updated = exists
                ? prev.map(item => item.id === id ? { ...item, qty: (item.qty || 1) + 1 } : item)
                : [...prev, { id, qty: 1 }];
            localStorage.setItem('cart', JSON.stringify(updated));
            return updated;
        });
    };

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
                    v.play().catch(() => {});
                } else {
                    v.pause();
                    v.currentTime = 0;
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

    if (category) {
        return (
            <section id="view-home" className="view">
                <h2>Catálogo: {category.toUpperCase()}</h2>
                <div>Próximamente: grilla de productos para {category}</div>
            </section>
        );
    }

    // Selecciona algunos productos destacados de varias categorías
    const featured = [
        ...products.pulseras.slice(0, 2),
        ...products.cadenas.slice(0, 2),
        ...products.anillos.slice(0, 2),
        ...products.aretes.slice(0, 2)
    ];
    return (
        <section id="view-home" className="view active-view">
            {/* Carrusel de reels (videos) */}
            <div style={{height: 320, marginBottom: 16}} className="vertical-carousel-container">
                <div id="videoSlides" style={{position: 'relative', width: '100%', height: '100%'}}>
                    {videosHome && videosHome.length > 0 ? (
                        videosHome.map((v, i) => (
                            <div key={v.id} className={`video-slide-item ${i === currentVideo ? 'active' : ''}`} style={{width: '100%', height: '100%', position: 'absolute', top: 0, left: 0}}>
                                <video
                                    src={v.src}
                                    muted
                                    playsInline
                                    loop
                                    preload="metadata"
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

            <section className="section-title-wrapper">
                <h2>CATÁLOGO INTERACTIVO</h2>
            </section>

            {/* Grid de productos destacados */}
            <div className="products-container" id="products">
                {featured.map((prod) => (
                    <div key={prod.id} className="card show">
                        <Link to={`/products/${prod.id}`} className="product-link">
                            <img
                                src={Array.isArray(prod.img) ? prod.img[0] : prod.img}
                                alt={prod.nombre}
                                className="product-img"
                                loading="lazy"
                                onError={e => { e.target.style.display = 'none'; }}
                            />
                            <h3>{prod.nombre}</h3>
                            <div className="precio">{prod.precio}</div>
                        </Link>
                        <button className="add-to-cart-btn" onClick={() => addToCart(prod.id)}>
                            Añadir al carrito
                        </button>
                    </div>
                ))}
            </div>

            {/* Placeholder para carrusel de categorías */}
            <div style={{height: '100px', background: '#ddd', display: 'flex', alignItems: 'center', justifyContent: 'center', marginTop: '1rem'}}>
                Próximamente: carrusel de categorías
            </div>
        </section>
    );
}

export default Home;