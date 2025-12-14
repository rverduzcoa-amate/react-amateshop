

import React, { useState } from 'react';
import resolvePublicPath from '../utils/resolvePublicPath';
import { useParams } from 'react-router-dom';
import { products } from '../data/products';

function findProductById(productId) {
    for (const category of Object.values(products)) {
        const found = category.find((p) => p.id === productId);
        if (found) return found;
    }
    return null;
}

function Product() {
    const { productId } = useParams();
    // All hooks must be called unconditionally
    const [, setCart] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('cart') || '[]');
        } catch {
            return [];
        }
    });
    const product = findProductById(productId);
    // Soporta imágenes múltiples o una sola
    const images = Array.isArray(product?.img) ? product.img : [product?.img];
    const [mainImg, setMainImg] = useState(images[0]);

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

    if (!product) {
        return (
            <section id="view-product" className="view">
                <h1>Producto no encontrado</h1>
            </section>
        );
    }

    return (
        <section id="view-product" className="view">
            <h1>{product.nombre}</h1>
            <div className="product-main">
                <img
                    src={resolvePublicPath(mainImg)}
                    alt={product.nombre}
                    className="product-img"
                    style={{ width: 260, borderRadius: 10, objectFit: 'cover', background: '#f0f0f0', marginBottom: 8, boxShadow: '0 2px 12px rgba(199,161,106,0.10)' }}
                    loading="lazy"
                    onError={e => { e.target.style.display = 'none'; }}
                />
                {images.length > 1 && (
                    <div style={{ display: 'flex', gap: 10, marginBottom: 8 }}>
                        {images.map((src, i) => (
                            <img
                                key={i}
                                src={resolvePublicPath(src)}
                                alt={product.nombre + ' miniatura ' + (i+1)}
                                style={{ width: 54, height: 54, borderRadius: 6, objectFit: 'cover', background: '#f0f0f0', border: mainImg === src ? '2px solid #c7a16a' : '2px solid #eee', cursor: 'pointer', transition: 'border 0.2s' }}
                                onClick={() => setMainImg(src)}
                                loading="lazy"
                                onError={e => { e.target.style.display = 'none'; }}
                            />
                        ))}
                    </div>
                )}
            </div>
            <div className="precio" style={{ fontSize: 24, margin: '16px 0' }}>{product.precio}</div>
            <button onClick={() => addToCart(product.id)} className="add-to-cart-btn" style={{ background: '#c7a16a', color: '#fff', border: 'none', padding: '10px 24px', fontSize: 18, cursor: 'pointer', marginTop: 16 }}>
                Añadir al carrito
            </button>
        </section>
    );
}

export default Product;
