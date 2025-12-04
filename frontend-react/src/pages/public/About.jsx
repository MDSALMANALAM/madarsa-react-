import Header from '../../components/Header';
import Footer from '../../components/Footer';
import WhatsAppButton from '../../components/WhatsAppButton';

const About = () => {
  const teamMembers = [
    { name: "Qari Hasan Imam Saqbi", post: "Principal(Mohtamim) & Founder", bio: "Founder of Madarsa Imdadul Uloom with 20+ years of experience in Islamic education.", icon: "fa-user-tie" },
    { name: "Maulana Minhaj Rashidi", post: "Vice Principal(Nazim) and Founder Member", bio: "Aalim in Islamic Studies from Madarsa Raseedul uloom, Chatra.", icon: "fa-user-graduate" },
    { name: "Hafiz Tipu Sultan", post: "Ex Nazim and Founder Member", bio: "Quran Hafiz with Masters in Islamic Studies and 15 years teaching experience.", icon: "fa-chalkboard-teacher" },
    { name: "Qari Siqandar Shahab", post: "Quran(Hifz) Teacher", bio: "Specialized in Tajweed and Quran memorization, 10+ years experience.", icon: "fa-quran" },
    { name: "Molvi Mohd Alamgir Shahab", post: "Management and Teacher", bio: "Expert in Hadith sciences and Islamic jurisprudence.", icon: "fa-book" },
    { name: "Md Salman Alam", post: "Modern Education Head", bio: "Microsoft Certified Data Scientist/AI/ML Engineer", icon: "fa-laptop-code" },
    { name: "Sunil Kumar", post: "Tech Management", bio: "Web Development At Ascent Technology", icon: "fa-calculator" },
    { name: "Manoj Kumar", post: "Social Science Teacher", bio: "BA/D.EL.ED in History Literature with focus on language/Writing Skills development.", icon: "fa-language" },
    { name: "Syed Amir", post: "Teacher", bio: "Research Scholar at AMU", icon: "fa-hands-helping" },
    { name: "Shahid Afridi", post: "Student Counselor and Teacher", bio: "Provides guidance and support to students and parents.", icon: "fa-user-friends" }
  ];

  return (
    <>
      <Header />
      
      <section className="page-hero">
        <div className="container">
          <h1>About Madarsa Imdadul Uloom</h1>
          <p>Learn about our mission, vision, history, and dedicated team</p>
        </div>
      </section>

      <section className="about-section">
        <div className="container">
          <div className="about-content">
            {/* Intro */}
            <div className="about-intro">
              <h2>Our Journey Since 2012</h2>
              <p>Madarsa Imdadul Uloom was established in 2012 with a vision to provide quality Islamic education combined with modern curriculum. For over a decade, we have been committed to nurturing young minds with the teachings of Quran and Sunnah while equipping them with contemporary knowledge and skills.</p>
              
              <div className="achievement-stats">
                <StatItem number="13+" label="Years of Service" />
                <StatItem number="1000+" label="Students Educated" />
                <StatItem number="50+" label="Qualified Teachers" />
                <StatItem number="15+" label="Courses Offered" />
              </div>
            </div>

            {/* Mission & Vision */}
            <div className="mission-vision">
              <div className="mission">
                <h3><i className="fas fa-bullseye"></i> Our Mission</h3>
                <p>To develop well-rounded individuals who are grounded in Islamic values, possess strong moral character, and are capable of contributing positively to society through both Islamic and modern education.</p>
              </div>
              <div className="vision">
                <h3><i className="fas fa-eye"></i> Our Vision</h3>
                <p>To be a leading Islamic educational institution that combines traditional Islamic teachings with modern education, producing future leaders who excel in both religious and worldly matters.</p>
              </div>
            </div>

            {/* Team Section */}
            <div className="team-section">
              <h2>Our Dedicated Team</h2>
              <p>Meet the passionate individuals who make Madarsa Imdadul Uloom a center of excellence in Islamic education and skills based Education.</p>
              
              <div className="team-grid">
                {teamMembers.map((member, index) => (
                  <TeamMember key={index} {...member} />
                ))}
              </div>
            </div>

            {/* Core Values */}
            <div className="values-section">
              <h2>Our Core Values</h2>
              <div className="values-grid">
                <ValueItem icon="fa-quran" title="Quranic Guidance" desc="Following the teachings of Quran as our primary source of guidance." />
                <ValueItem icon="fa-graduation-cap" title="Quality Education" desc="Providing excellent education that combines Islamic and modern knowledge." />
                <ValueItem icon="fa-heart" title="Moral Development" desc="Focusing on character building and ethical values." />
                <ValueItem icon="fa-users" title="Community Service" desc="Serving the community and contributing to social welfare." />
              </div>
            </div>

            {/* Facilities */}
            <div className="facilities-section">
              <h2>Our Facilities</h2>
              <div className="facilities-grid">
                <FacilityItem icon="fa-book-reader" title="Library" desc="Well-stocked library with Islamic books and modern educational materials." />
                <FacilityItem icon="fa-laptop" title="Computer Lab" desc="Modern computer lab with internet access for digital learning." />
                <FacilityItem icon="fa-mosque" title="Prayer Hall" desc="Spacious prayer hall for daily prayers and religious activities." />
                <FacilityItem icon="fa-utensils" title="Dining Area" desc="Clean and hygienic dining facility for students." />
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

const StatItem = ({ number, label }) => (
  <div className="stat-item">
    <div className="stat-number">{number}</div>
    <div className="stat-label">{label}</div>
  </div>
);

const TeamMember = ({ name, post, bio, icon }) => (
  <div className="team-member">
    <div className="member-photo"><i className={`fas ${icon}`}></i></div>
    <h4>{name}</h4>
    <p className="member-post">{post}</p>
    <p className="member-bio">{bio}</p>
  </div>
);

const ValueItem = ({ icon, title, desc }) => (
  <div className="value-item">
    <i className={`fas ${icon}`}></i>
    <h4>{title}</h4>
    <p>{desc}</p>
  </div>
);

const FacilityItem = ({ icon, title, desc }) => (
  <div className="facility-item">
    <i className={`fas ${icon}`}></i>
    <h4>{title}</h4>
    <p>{desc}</p>
  </div>
);

export default About;

