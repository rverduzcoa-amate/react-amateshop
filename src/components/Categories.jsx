
import React from 'react';
import resolvePublicPath from '../utils/resolvePublicPath';
import { useNavigate, Link, useParams } from 'react-router-dom';
import { products } from '../data/products';

function Categories() {
    const navigate = useNavigate();
    const { categoryId } = useParams();
    const categories = [
        { key: 'pulseras', name: 'Pulseras', icon: require('../assets/img/icons/pulseras.png') },
        { key: 'cadenas', name: 'Cadenas', icon: require('../assets/img/icons/cadenas.png') },
        { key: 'anillos', name: 'Anillos', icon: require('../assets/img/icons/anillos.png') },
        { key: 'aretes', name: 'Aretes', icon: require('../assets/img/icons/aretes.png') },
        { key: 'layers', name: 'Layers', icon: require('../assets/img/icons/layers.png') },
        { key: 'piercings', name: 'Piercings', icon: require('../assets/img/icons/piercings.png') },
        { key: 'relojes', name: 'Relojes', icon: require('../assets/img/icons/relojes.png') },
    ];

    if (categoryId && products[categoryId]) {
        const catProducts = products[categoryId];
        const category = categories.find(c => c.key === categoryId);
        // Static mapping for poster images
        // Only require poster images if they exist, otherwise fallback to null
        const posters = {};
        [
            'pulseras',
            'cadenas',
            'anillos',
            'aretes',
            'layers',
            'piercings',
            'relojes',
        ].forEach(key => {
            try {
                posters[key] = require(`../assets/img/${key}.jpg`);
            } catch (e) {
                posters[key] = null;
            }
        });
        const bannerImg = category && posters[category.key];
        return (
            <section id="view-categories" className="view">
                <header className="header-view">
                    <button onClick={() => navigate(-1)}>&larr; Volver</button>
                    <h1>{category?.name || categoryId}</h1>
                </header>
                {bannerImg && (
                    <div style={{ width: '100%', marginBottom: 24 }}>
                        <img src={bannerImg} alt={category?.name + ' banner'} style={{ width: '100%', maxHeight: 220, objectFit: 'cover', borderRadius: 12, boxShadow: '0 2px 12px rgba(199,161,106,0.10)' }} />
                    </div>
                )}
                <div className="products-container" id="products">
                    {catProducts.length === 0 && <div className="no">No hay productos en esta categoría.</div>}
                    {catProducts.map(prod => (
                        <Link to={`/products/${prod.id}`} className="card show product-link" key={prod.id}>
                            <img
                                src={resolvePublicPath(Array.isArray(prod.img) ? prod.img[0] : prod.img)}
                                alt={prod.nombre}
                                className="product-img"
                                loading="lazy"
                                onError={e => { e.target.style.display = 'none'; }}
                            />
                            <h3>{prod.nombre}</h3>
                            <div className="precio">{prod.precio}</div>
                        </Link>
                    ))}
                </div>
            </section>
        );
    }

    // Default: show category grid
    return (
        <section id="view-categories" className="view">
            <header className="header-view">
                <button onClick={() => navigate(-1)}>&larr; Back</button>
                <h1>CATÁLOGO COMPLETO</h1>
            </header>
            <div className="categories-grid" id="categoriesGrid">
                {categories.map(cat => (
                    <Link to={`/categories/${cat.key}`} className="category-card" key={cat.key}>
                        <img src={cat.icon} alt={cat.name} />
                        <p>{cat.name}</p>
                    </Link>
                ))}
            </div>
        </section>
    );
}

export default Categories;
