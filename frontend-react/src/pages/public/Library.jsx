import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import WhatsAppButton from '../../components/WhatsAppButton';
import { apiGet } from '../../services/api';

const Library = () => {
  const [materials, setMaterials] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ category: 'all', class: 'all', search: '' });

  useEffect(() => {
    fetchMaterials();
  }, []);

  const fetchMaterials = async () => {
    try {
      const response = await apiGet('/library/materials');
      setMaterials(response.data || []);
    } catch (error) {
      console.error('Failed to fetch materials:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredMaterials = materials.filter(m => {
    if (filters.category !== 'all' && m.category !== filters.category) return false;
    if (filters.class !== 'all' && m.class !== filters.class) return false;
    if (filters.search && !m.title?.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  return (
    <>
      <Header />
      <section className="page-hero">
        <div className="container">
          <h1>Digital Library</h1>
          <p>Access study materials, PDF books, and educational resources</p>
        </div>
      </section>

      <section className="library-section">
        <div className="container">
          <div className="library-filters">
            <div className="filter-group">
              <label htmlFor="categoryFilter">Category:</label>
              <select id="categoryFilter" value={filters.category} onChange={e => setFilters({...filters, category: e.target.value})}>
                <option value="all">All Categories</option>
                <option value="quran">Quran & Tajweed</option>
                <option value="hadith">Hadith Studies</option>
                <option value="fiqh">Fiqh & Aqeedah</option>
                <option value="seerah">Seerah</option>
                <option value="modern">Modern Subjects</option>
              </select>
            </div>
            <div className="filter-group">
              <label htmlFor="classFilter">Class:</label>
              <select id="classFilter" value={filters.class} onChange={e => setFilters({...filters, class: e.target.value})}>
                <option value="all">All Classes</option>
                {[1,2,3,4,5,6,7,8,9,10].map(c => <option key={c} value={c}>Class {c}</option>)}
              </select>
            </div>
            <div className="search-box">
              <input type="text" placeholder="Search materials..." value={filters.search} onChange={e => setFilters({...filters, search: e.target.value})} />
              <button className="btn btn-primary"><i className="fas fa-search"></i></button>
            </div>
          </div>

          <div className="materials-grid">
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px', width: '100%' }}>
                <i className="fas fa-spinner fa-spin" style={{ fontSize: '48px', color: '#0891b2' }}></i>
                <p style={{ marginTop: '20px', color: '#666' }}>Loading materials...</p>
              </div>
            ) : filteredMaterials.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '40px', width: '100%' }}>
                <i className="fas fa-book-open" style={{ fontSize: '48px', color: '#ccc' }}></i>
                <p style={{ marginTop: '20px', color: '#666' }}>No materials found. Check back later!</p>
              </div>
            ) : (
              filteredMaterials.map((material, idx) => (
                <div className="material-card" key={idx}>
                  <div className="material-icon">
                    <i className={`fas fa-${material.type === 'pdf' ? 'file-pdf' : material.type === 'video' ? 'video' : 'book'}`}></i>
                  </div>
                  <div className="material-info">
                    <h4>{material.title}</h4>
                    <p>{material.description}</p>
                    <div className="material-meta">
                      <span><i className="fas fa-folder"></i> {material.category}</span>
                      <span><i className="fas fa-graduation-cap"></i> Class {material.class}</span>
                    </div>
                  </div>
                  <a href={material.url} target="_blank" rel="noopener noreferrer" className="btn btn-primary btn-sm">
                    <i className="fas fa-download"></i> Download
                  </a>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </>
  );
};

export default Library;

