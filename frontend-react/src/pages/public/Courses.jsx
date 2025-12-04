import { useState } from 'react';
import { Link } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import WhatsAppButton from '../../components/WhatsAppButton';

const coursesData = {
  primary: {
    title: 'Primary Education (Classes 1-5)',
    classes: [
      { name: 'Class 1', subjects: ['Quran: Noorani Qaida & Basic Tajweed', 'Islamic Studies: Basic Aqeedah & Manners', 'Mathematics: Numbers 1-100, Addition, Subtraction', 'English: Alphabet, Basic Words & Sentences', 'Urdu/Hindi: Reading & Writing Basics', 'General Knowledge: About Family, Animals, Plants'] },
      { name: 'Class 2', subjects: ['Quran: Short Surahs (Al-Fatihah, Ikhlas)', 'Islamic Studies: Pillars of Islam & Stories of Prophets', 'Mathematics: Multiplication, Division, Time', 'English: Simple Grammar, Reading Comprehension', 'Urdu/Hindi: Paragraph Writing, Poetry', 'Science: Living & Non-living Things'] },
      { name: 'Class 3', subjects: ['Quran: Juz Amma (Short Surahs)', 'Islamic Studies: Seerah of Prophet Muhammad (PBUH)', 'Mathematics: Fractions, Measurements, Money', 'English: Tenses, Composition Writing', 'Urdu/Hindi: Story Writing, Grammar', 'Social Studies: Our Community & Environment'] },
      { name: 'Class 4', subjects: ['Quran: Reading with Tajweed Rules', 'Islamic Studies: Fiqh (Basic Islamic Law)', 'Mathematics: Geometry, Decimals, Area', 'English: Letter Writing, Advanced Grammar', 'Urdu/Hindi: Essay Writing, Comprehension', 'Science: Human Body, Plants, Animals'] },
      { name: 'Class 5', subjects: ['Quran: Memorization of Selected Surahs', 'Islamic Studies: Islamic History & Civilization', 'Mathematics: Percentage, Average, Volume', 'English: Story Writing, Public Speaking', 'Urdu/Hindi: Creative Writing, Drama', 'Computer Basics: Introduction to Computers'] }
    ]
  },
  middle: {
    title: 'Middle Education (Classes 6-8)',
    classes: [
      { name: 'Class 6', subjects: ['Quran: Tajweed Rules & Practical Application', 'Islamic Studies: Life of Prophet Muhammad (PBUH)', 'Mathematics: Algebra, Ratio & Proportion', 'English: Grammar, Composition, Literature', 'Science: Physics, Chemistry, Biology Basics', 'Social Studies: History & Geography'] },
      { name: 'Class 7', subjects: ['Quran: Memorization & Tafsir (Explanation)', 'Islamic Studies: Hadith Studies & Fiqh', 'Mathematics: Geometry, Statistics, Equations', 'English: Advanced Grammar, Essay Writing', 'Science: Light, Sound, Heat, Living Organisms', 'Computer: MS Office, Basic Programming'] },
      { name: 'Class 8', subjects: ['Quran: Complete Juz 30 with Translation', 'Islamic Studies: Islamic Civilization & Ethics', 'Mathematics: Trigonometry, Mensuration', 'English: Comprehension, Creative Writing', 'Science: Force, Energy, Reproduction', 'Preparation for Board Exams'] }
    ]
  },
  secondary: {
    title: 'Secondary Education (Classes 9-10)',
    classes: [
      { name: 'Class 9', subjects: ['Quran: Selected Surahs with Detailed Tafsir', 'Islamic Studies: Comparative Religion', 'Mathematics: Algebra, Geometry, Statistics', 'English: Literature, Advanced Composition', 'Science: Physics, Chemistry, Biology', 'Computer Science: Programming Fundamentals'] },
      { name: 'Class 10', subjects: ['Quran: Revision & Advanced Tajweed', 'Islamic Studies: Contemporary Islamic Issues', 'Mathematics: Advanced Algebra & Calculus', 'English: Board Exam Preparation', 'Science: Complete Syllabus Revision', 'Career Guidance & Counseling'] }
    ]
  },
  islamic: {
    title: 'Islamic Studies Program',
    classes: [
      { name: 'Quran Studies', subjects: ['Noorani Qaida & Basic Reading', 'Tajweed Rules & Practical Application', 'Quran Memorization (Hifz)', 'Tafsir (Quran Explanation)', 'Quran Translation & Understanding', 'Tajweed Certification Course'] },
      { name: 'Hadith Studies', subjects: ['Introduction to Hadith Sciences', '40 Hadith of Imam Nawawi', 'Riyad us Saliheen Study', 'Hadith Terminology', 'Authentication of Hadith', 'Practical Application of Hadith'] },
      { name: 'Fiqh & Islamic Law', subjects: ['Basic Fiqh of Worship', 'Purification & Salah', 'Fasting & Zakat', 'Hajj & Umrah', 'Islamic Family Law', 'Contemporary Fiqh Issues'] },
      { name: 'Seerah & History', subjects: ['Life of Prophet Muhammad (PBUH)', 'History of Prophets', 'Islamic Civilization', 'Rightly Guided Caliphs', 'Muslim Scientists & Scholars', 'Contemporary Muslim World'] },
      { name: 'Islamic Ethics & Character', subjects: ['Building Islamic Personality', 'Good Manners & Morals', 'Islamic Etiquette', 'Dawah & Community Service', 'Time Management in Islam', 'Islamic Finance Basics'] },
      { name: 'Arabic Language', subjects: ['Arabic Alphabet & Reading', 'Basic Arabic Grammar', 'Conversational Arabic', 'Quranic Arabic', 'Arabic Writing Skills', 'Advanced Arabic Studies'] }
    ]
  }
};

const Courses = () => {
  const [activeTab, setActiveTab] = useState('primary');

  return (
    <>
      <Header />
      <section className="page-hero">
        <div className="container">
          <h1>Our Courses & Classes</h1>
          <p>Comprehensive Islamic and modern education from Class 1 to 10</p>
        </div>
      </section>

      <section className="courses-section">
        <div className="container">
          <div className="classes-tabs">
            <div className="tab-buttons">
              {Object.keys(coursesData).map(key => (
                <button key={key} className={`tab-btn ${activeTab === key ? 'active' : ''}`} onClick={() => setActiveTab(key)}>
                  {key === 'primary' ? 'Primary (1-5)' : key === 'middle' ? 'Middle (6-8)' : key === 'secondary' ? 'Secondary (9-10)' : 'Islamic Studies'}
                </button>
              ))}
            </div>

            <div className="tab-content active">
              <h3>{coursesData[activeTab].title}</h3>
              <div className="courses-grid">
                {coursesData[activeTab].classes.map((cls, idx) => (
                  <div className="course-card" key={idx}>
                    <h4>{cls.name}</h4>
                    <ul>
                      {cls.subjects.map((subject, i) => <li key={i}>{subject}</li>)}
                    </ul>
                    <Link to="/admission" className="btn btn-primary">Enroll Now</Link>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </>
  );
};

export default Courses;

