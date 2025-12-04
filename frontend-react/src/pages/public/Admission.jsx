import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import WhatsAppButton from '../../components/WhatsAppButton';
import { API_BASE } from '../../config/config';

const Admission = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: '', dob: '', gender: '', className: '', birthPlace: '', nationality: 'Indian',
    motherTongue: '', religion: 'Islam', previousSchool: '', lastClass: '',
    fatherName: '', fatherOccupation: '', motherName: '', motherOccupation: '',
    parentPhone: '', parentEmail: '', guardianName: '', guardianRelation: '',
    address: '', city: '', state: '', pincode: '', country: 'India',
    emergencyName: '', emergencyPhone: '', emergencyRelation: '',
    medicalConditions: '', bloodGroup: '',
    declaration1: false, declaration2: false, declaration3: false, declaration4: false
  });
  const [files, setFiles] = useState({});

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleFileChange = (e) => {
    const { name, files: fileList } = e.target;
    setFiles(prev => ({ ...prev, [name]: fileList[0] }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.declaration1 || !formData.declaration2 || !formData.declaration3 || !formData.declaration4) {
      alert('Please accept all declarations');
      return;
    }
    setLoading(true);
    try {
      // Send as JSON instead of FormData for now (file upload can be added later)
      const res = await fetch(`${API_BASE}/admission/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.fullName,
          dateOfBirth: formData.dob,
          gender: formData.gender,
          className: formData.className,
          fatherName: formData.fatherName,
          motherName: formData.motherName,
          parentPhone: formData.parentPhone,
          parentEmail: formData.parentEmail,
          address: formData.address,
          city: formData.city,
          state: formData.state,
          pincode: formData.pincode,
          country: formData.country
        })
      });
      const result = await res.json();
      if (result.success) {
        const viewReceipt = window.confirm(
          `✅ Admission Submitted Successfully!\n\nAdmission No: ${result.admissionNo}\n\nYour application is pending approval.\n\nClick OK to view/print your receipt.`
        );
        if (viewReceipt && result.data?.id) {
          navigate(`/admission/receipt/${result.data.id}`);
        }
        e.target.reset();
        setFormData({ fullName: '', dob: '', gender: '', className: '', birthPlace: '', nationality: 'Indian', motherTongue: '', religion: 'Islam', previousSchool: '', lastClass: '', fatherName: '', fatherOccupation: '', motherName: '', motherOccupation: '', parentPhone: '', parentEmail: '', guardianName: '', guardianRelation: '', address: '', city: '', state: '', pincode: '', country: 'India', emergencyName: '', emergencyPhone: '', emergencyRelation: '', medicalConditions: '', bloodGroup: '', declaration1: false, declaration2: false, declaration3: false, declaration4: false });
        setFiles({});
      } else {
        alert('❌ Error: ' + (result.message || 'Failed to submit admission'));
      }
    } catch (error) {
      console.error('Admission error:', error);
      alert('❌ Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const classOptions = [
    { group: 'Primary (1-5)', options: ['Class 1', 'Class 2', 'Class 3', 'Class 4', 'Class 5'] },
    { group: 'Middle (6-8)', options: ['Class 6', 'Class 7', 'Class 8'] },
    { group: 'Secondary (9-10)', options: ['Class 9', 'Class 10'] },
    { group: 'Islamic Studies', options: ['Quran Studies', 'Hadith Studies', 'Fiqh & Islamic Law', 'Seerah & History', 'Islamic Ethics & Character', 'Arabic Language'] }
  ];

  return (
    <>
      <Header />
      <section className="page-hero">
        <div className="container">
          <h1>Student Admission Form</h1>
          <p>Fill up the form below to enroll your child in Madarsa Imdadul Uloom for Classes 1-10</p>
        </div>
      </section>

      <section className="admission-form">
        <div className="container">
          <div className="admission-info">
            <div className="info-card">
              <h3><i className="fas fa-info-circle"></i> Admission Process</h3>
              <ul>
                <li>Fill the admission form completely</li>
                <li>Submit documents (optional)</li>
                <li>Entrance test (if applicable)</li>
                <li>Interview with parents</li>
                <li>Fee payment and confirmation</li>
              </ul>
            </div>
            <div className="info-card">
              <h3><i className="fas fa-file-alt"></i> Documents (Optional)</h3>
              <ul>
                <li>Student photograph (if available)</li>
                <li>Birth certificate (if available)</li>
                <li>Previous school marksheet (if available)</li>
                <li>Aadhar card (if available)</li>
                <li>Parent's ID proof (if available)</li>
              </ul>
            </div>
            <div className="info-card">
              <h3><i className="fas fa-money-bill-wave"></i> Fee Structure</h3>
              <ul>
                <li>Class 1-5: ₹500 per Month</li>
                <li>Class 6-8: ₹600 per Month</li>
                <li>Class 9-10: ₹700 per Month</li>
                <li>Quran Course: ₹300 per Month</li>
              </ul>
            </div>
          </div>

          <div className="form-container">
            <form id="admissionForm" onSubmit={handleSubmit}>
              <h3>Student Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Full Name of Student *</label>
                  <input type="text" name="fullName" value={formData.fullName} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Date of Birth *</label>
                  <input type="date" name="dob" value={formData.dob} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Gender *</label>
                  <select name="gender" value={formData.gender} onChange={handleChange} required>
                    <option value="">Select Gender</option>
                    <option value="male">Male</option>
                    <option value="female">Female</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Class Applying For *</label>
                  <select name="className" value={formData.className} onChange={handleChange} required>
                    <option value="">Select Class</option>
                    {classOptions.map(g => (
                      <optgroup key={g.group} label={g.group}>
                        {g.options.map(o => <option key={o} value={o}>{o}</option>)}
                      </optgroup>
                    ))}
                  </select>
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Place of Birth</label>
                  <input type="text" name="birthPlace" value={formData.birthPlace} onChange={handleChange} />
                </div>
                <div className="form-group">
                  <label>Nationality</label>
                  <input type="text" name="nationality" value={formData.nationality} onChange={handleChange} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Mother Tongue</label>
                  <input type="text" name="motherTongue" value={formData.motherTongue} onChange={handleChange} placeholder="e.g., Urdu, Hindi" />
                </div>
                <div className="form-group">
                  <label>Religion</label>
                  <input type="text" name="religion" value={formData.religion} onChange={handleChange} />
                </div>
              </div>
              <div className="form-group">
                <label>Previous School (if any)</label>
                <input type="text" name="previousSchool" value={formData.previousSchool} onChange={handleChange} />
              </div>

              <h3>Parent/Guardian Information</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Father's Name *</label>
                  <input type="text" name="fatherName" value={formData.fatherName} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Father's Occupation</label>
                  <input type="text" name="fatherOccupation" value={formData.fatherOccupation} onChange={handleChange} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Mother's Name *</label>
                  <input type="text" name="motherName" value={formData.motherName} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Mother's Occupation</label>
                  <input type="text" name="motherOccupation" value={formData.motherOccupation} onChange={handleChange} />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Parent's Phone Number *</label>
                  <input type="tel" name="parentPhone" value={formData.parentPhone} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Parent's Email Address</label>
                  <input type="email" name="parentEmail" value={formData.parentEmail} onChange={handleChange} />
                </div>
              </div>

              <h3>Contact Information</h3>
              <div className="form-group">
                <label>Residential Address *</label>
                <textarea name="address" value={formData.address} onChange={handleChange} rows="3" required></textarea>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>City *</label>
                  <input type="text" name="city" value={formData.city} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>State *</label>
                  <input type="text" name="state" value={formData.state} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>PIN Code *</label>
                  <input type="text" name="pincode" value={formData.pincode} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Country *</label>
                  <input type="text" name="country" value={formData.country} onChange={handleChange} required />
                </div>
              </div>

              <h3>Emergency Contact</h3>
              <div className="form-row">
                <div className="form-group">
                  <label>Emergency Contact Name *</label>
                  <input type="text" name="emergencyName" value={formData.emergencyName} onChange={handleChange} required />
                </div>
                <div className="form-group">
                  <label>Emergency Phone Number *</label>
                  <input type="tel" name="emergencyPhone" value={formData.emergencyPhone} onChange={handleChange} required />
                </div>
              </div>
              <div className="form-group">
                <label>Relationship with Student *</label>
                <select name="emergencyRelation" value={formData.emergencyRelation} onChange={handleChange} required>
                  <option value="">Select Relationship</option>
                  <option value="father">Father</option>
                  <option value="mother">Mother</option>
                  <option value="brother">Brother</option>
                  <option value="sister">Sister</option>
                  <option value="uncle">Uncle</option>
                  <option value="aunt">Aunt</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <h3>Medical Information</h3>
              <div className="form-group">
                <label>Any Medical Conditions or Allergies</label>
                <textarea name="medicalConditions" value={formData.medicalConditions} onChange={handleChange} rows="2"></textarea>
              </div>
              <div className="form-group">
                <label>Blood Group</label>
                <select name="bloodGroup" value={formData.bloodGroup} onChange={handleChange}>
                  <option value="">Select Blood Group</option>
                  <option value="A+">A+</option><option value="A-">A-</option>
                  <option value="B+">B+</option><option value="B-">B-</option>
                  <option value="O+">O+</option><option value="O-">O-</option>
                  <option value="AB+">AB+</option><option value="AB-">AB-</option>
                </select>
              </div>

              <h3>Documents Upload</h3>
              <div className="documents-grid">
                {[
                  { name: 'studentPhoto', icon: 'camera', title: 'Student Photograph', desc: 'Recent passport size photo' },
                  { name: 'birthCertificate', icon: 'certificate', title: 'Birth Certificate', desc: 'Scanned copy' },
                  { name: 'previousMarksheet', icon: 'file-alt', title: 'Previous Marksheet', desc: 'Last class marksheet' },
                  { name: 'aadharCard', icon: 'id-card', title: 'Aadhar Card', desc: "Student's Aadhar card" },
                  { name: 'transferCertificate', icon: 'file-contract', title: 'Transfer Certificate', desc: 'From previous school' },
                  { name: 'parentIdProof', icon: 'id-badge', title: "Parent's ID Proof", desc: 'Any government ID' }
                ].map(doc => (
                  <div className="document-item" key={doc.name}>
                    <div className="document-icon"><i className={`fas fa-${doc.icon}`}></i></div>
                    <div className="document-info"><h4>{doc.title}</h4><p>{doc.desc} (Optional)</p></div>
                    <div className="document-upload">
                      <input type="file" id={doc.name} name={doc.name} onChange={handleFileChange} accept="image/*,.pdf" />
                      <label htmlFor={doc.name} className="btn btn-outline">Choose File</label>
                    </div>
                  </div>
                ))}
              </div>

              <h3>Declaration</h3>
              <div className="declaration-section">
                <div className="form-group checkbox-group">
                  <input type="checkbox" name="declaration1" checked={formData.declaration1} onChange={handleChange} required />
                  <label>I hereby declare that all the information provided is true and correct.</label>
                </div>
                <div className="form-group checkbox-group">
                  <input type="checkbox" name="declaration2" checked={formData.declaration2} onChange={handleChange} required />
                  <label>I understand that false information may lead to cancellation of admission.</label>
                </div>
                <div className="form-group checkbox-group">
                  <input type="checkbox" name="declaration3" checked={formData.declaration3} onChange={handleChange} required />
                  <label>I agree to abide by the rules and regulations of Madarsa Imdadul Uloom.</label>
                </div>
                <div className="form-group checkbox-group">
                  <input type="checkbox" name="declaration4" checked={formData.declaration4} onChange={handleChange} required />
                  <label>I understand that admission is subject to availability and eligibility.</label>
                </div>
              </div>

              <div className="form-actions">
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  <i className={loading ? "fas fa-spinner fa-spin" : "fas fa-paper-plane"}></i> {loading ? 'Submitting...' : 'Submit Application'}
                </button>
                <button type="reset" className="btn btn-outline"><i className="fas fa-redo"></i> Reset Form</button>
              </div>
              <div className="form-note">
                <p><strong>Note:</strong> Fields marked with * are mandatory. After submission, you will receive a confirmation with your application reference number.</p>
              </div>
            </form>
          </div>
        </div>
      </section>

      <Footer />
      <WhatsAppButton />
    </>
  );
};

export default Admission;

