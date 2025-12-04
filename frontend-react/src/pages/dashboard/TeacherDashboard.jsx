import { useState, useEffect } from 'react';
import DashboardLayout, { StatCard, Card, Table, Badge, ProgressBar } from '../../components/DashboardLayout';
import { apiGet } from '../../services/api';

const menuItems = [
  { id: 'dashboard', icon: 'tachometer-alt', label: 'Dashboard' },
  { id: 'myClasses', icon: 'chalkboard', label: 'My Classes' },
  { id: 'attendance', icon: 'clipboard-check', label: 'Attendance' },
  { id: 'students', icon: 'user-graduate', label: 'Students' },
  { id: 'assignments', icon: 'tasks', label: 'Assignments' },
  { id: 'grades', icon: 'chart-line', label: 'Grades' },
  { id: 'schedule', icon: 'calendar-alt', label: 'Schedule' },
  { id: 'resources', icon: 'book', label: 'Resources' },
];

const TeacherDashboard = () => {
  const [stats, setStats] = useState({ students: 0, classes: 0, pendingAssignments: 0, classesToday: 0 });
  const [schedule, setSchedule] = useState([]);
  const [activities, setActivities] = useState([]);
  const [classes, setClasses] = useState([]);
  const [students, setStudents] = useState([]);
  const [attendanceData, setAttendanceData] = useState({});
  const [selectedClass, setSelectedClass] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await apiGet('/dashboard/teacher');
      if (data.success) {
        const dashData = data.data || {};
        setStats({
          students: dashData.totalStudents || 0,
          classes: (dashData.courses || []).length,
          pendingAssignments: 0,
          classesToday: 2
        });

        // Set courses as classes
        const coursesData = dashData.courses || [];
        setClasses(coursesData.map((c, i) => ({
          name: c.name || `Course ${i+1}`,
          students: c.enrolledStudents || 0,
          schedule: c.schedule || 'TBD',
          icon: 'book-open',
          color: ['primary', 'success', 'warning', 'info', 'danger', 'secondary'][i % 6]
        })));

        // Sample schedule data
        setSchedule([
          { time: '09:00 - 10:00', class: 'Quran Level 2', subject: 'Quran Recitation', room: 'Room 101', status: 'Completed' },
          { time: '11:00 - 12:00', class: 'Arabic Level 1', subject: 'Arabic Grammar', room: 'Room 102', status: 'Upcoming' },
        ]);

        setActivities([]);
        setStudents([]);
      }
    } catch (error) {
      console.error('Error loading teacher dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const types = { Completed: 'success', Upcoming: 'primary', Later: 'secondary', Submitted: 'success', 'Pending Review': 'warning', Noted: 'info', Present: 'success', Absent: 'danger', Late: 'warning' };
    return <Badge type={types[status] || 'secondary'}>{status}</Badge>;
  };

  const setAttendance = (studentId, status) => {
    setAttendanceData(prev => ({ ...prev, [studentId]: status }));
  };

  const saveAttendance = () => {
    console.log('Saving attendance:', attendanceData);
    alert('Attendance saved successfully!');
  };

  return (
    <DashboardLayout title="Teacher Dashboard" menuItems={menuItems}>
      {(activeSection) => (
        <>
          {activeSection === 'dashboard' && (
            <>
              <div className="stats-cards">
                <StatCard icon="user-graduate" value={stats.students} label="My Students" color="52, 152, 219" />
                <StatCard icon="chalkboard" value={stats.classes} label="Active Classes" color="40, 167, 69" />
                <StatCard icon="tasks" value={stats.pendingAssignments} label="Pending Assignments" color="255, 193, 7" />
                <StatCard icon="clock" value={stats.classesToday} label="Classes Today" color="220, 53, 69" />
              </div>
              <div className="row">
                <div className="col-md-8">
                  <Card title="Today's Schedule" action={<button className="btn btn-sm btn-primary">View Full Schedule</button>}>
                    <Table headers={['Time', 'Class', 'Subject', 'Room', 'Status']}>
                      {schedule.map((s, i) => (<tr key={i}><td>{s.time}</td><td>{s.class}</td><td>{s.subject}</td><td>{s.room}</td><td>{getStatusBadge(s.status)}</td></tr>))}
                    </Table>
                  </Card>
                  <Card title="Recent Student Activities">
                    <Table headers={['Student', 'Activity', 'Date', 'Status']}>
                      {activities.map((a, i) => (<tr key={i}><td>{a.student}</td><td>{a.activity}</td><td>{a.date}</td><td>{getStatusBadge(a.status)}</td></tr>))}
                    </Table>
                  </Card>
                </div>
                <div className="col-md-4">
                  <Card title="Quick Actions">
                    <div className="quick-actions">
                      <button className="btn btn-primary"><i className="fas fa-clipboard-check"></i> Take Attendance</button>
                      <button className="btn btn-outline-primary"><i className="fas fa-tasks"></i> Create Assignment</button>
                      <button className="btn btn-outline-primary"><i className="fas fa-chart-line"></i> Record Grades</button>
                      <button className="btn btn-outline-primary"><i className="fas fa-book"></i> Upload Resources</button>
                      <button className="btn btn-outline-primary"><i className="fas fa-comments"></i> Send Message</button>
                    </div>
                  </Card>
                  <Card title="Upcoming Events">
                    <div className="event-item"><strong>Parent-Teacher Meeting</strong><div className="text-muted small">15 Nov 2023, 10:00 AM</div></div>
                    <div className="event-item success"><strong>Quran Competition</strong><div className="text-muted small">20 Nov 2023, 09:00 AM</div></div>
                    <div className="event-item warning"><strong>Monthly Test</strong><div className="text-muted small">25 Nov 2023, 11:00 AM</div></div>
                  </Card>
                </div>
              </div>
            </>
          )}

          {activeSection === 'myClasses' && (
            <div className="row">
              {classes.map((c, i) => (
                <div className="col-md-4 mb-3" key={i}>
                  <div className="dashboard-card course-card">
                    <i className={`fas fa-${c.icon} text-${c.color}`}></i>
                    <h5>{c.name}</h5>
                    <p className="text-muted">{c.students} Students</p>
                    <p>{c.schedule}</p>
                    <button className="btn btn-primary btn-sm">View Class</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeSection === 'attendance' && (
            <>
              <Card title="Student Attendance Management" action={
                <div className="d-flex gap-2">
                  <select className="form-select w-auto" value={selectedClass} onChange={(e) => setSelectedClass(e.target.value)}>
                    <optgroup label="Primary (1-5)">{[1,2,3,4,5].map(n => <option key={n} value={`Class ${n}`}>Class {n}</option>)}</optgroup>
                    <optgroup label="Middle (6-8)">{[6,7,8].map(n => <option key={n} value={`Class ${n}`}>Class {n}</option>)}</optgroup>
                    <optgroup label="Secondary (9-10)">{[9,10].map(n => <option key={n} value={`Class ${n}`}>Class {n}</option>)}</optgroup>
                    <optgroup label="Islamic Studies">
                      {['Quran Studies', 'Hadith Studies', 'Fiqh & Islamic Law', 'Arabic Language'].map(s => <option key={s} value={s}>{s}</option>)}
                    </optgroup>
                  </select>
                  <input type="date" className="form-control w-auto" defaultValue={new Date().toISOString().split('T')[0]} />
                  <button className="btn btn-primary" onClick={saveAttendance}>Save Attendance</button>
                </div>
              }>
                <Table headers={['Student ID', 'Student Name', 'Status', 'Actions', 'Remarks']}>
                  {students.map((s, i) => (
                    <tr key={i}>
                      <td>{s.id}</td><td>{s.name}</td>
                      <td>{getStatusBadge(attendanceData[s.id] || 'Present')}</td>
                      <td>
                        <div className="btn-group btn-group-sm">
                          <button className={`btn btn-outline-success ${attendanceData[s.id] === 'Present' || !attendanceData[s.id] ? 'active' : ''}`} onClick={() => setAttendance(s.id, 'Present')}>Present</button>
                          <button className={`btn btn-outline-danger ${attendanceData[s.id] === 'Absent' ? 'active' : ''}`} onClick={() => setAttendance(s.id, 'Absent')}>Absent</button>
                          <button className={`btn btn-outline-warning ${attendanceData[s.id] === 'Late' ? 'active' : ''}`} onClick={() => setAttendance(s.id, 'Late')}>Late</button>
                        </div>
                      </td>
                      <td><input type="text" className="form-control form-control-sm" placeholder="Remarks" /></td>
                    </tr>
                  ))}
                </Table>
                <div className="mt-3"><h6>Legend:</h6>
                  <div className="d-flex gap-3">
                    <span><span className="attendance-status present me-1"></span> Present</span>
                    <span><span className="attendance-status absent me-1"></span> Absent</span>
                    <span><span className="attendance-status late me-1"></span> Late</span>
                  </div>
                </div>
              </Card>
              <Card title="Attendance Summary">
                <div className="row text-center">
                  <div className="col-md-3"><div className="p-3 border rounded"><h3 className="text-success">85%</h3><p>Overall Attendance</p></div></div>
                  <div className="col-md-3"><div className="p-3 border rounded"><h3 className="text-primary">42</h3><p>Total Students</p></div></div>
                  <div className="col-md-3"><div className="p-3 border rounded"><h3 className="text-danger">3</h3><p>Absent Today</p></div></div>
                  <div className="col-md-3"><div className="p-3 border rounded"><h3 className="text-warning">2</h3><p>Late Today</p></div></div>
                </div>
              </Card>
            </>
          )}

          {activeSection === 'students' && (
            <Card title="My Students">
              <Table headers={['ID', 'Name', 'Class', 'Attendance', 'Grade', 'Actions']}>
                {students.map((s, i) => (
                  <tr key={i}><td>{s.id}</td><td>{s.name}</td><td>{s.class}</td><td><Badge type="success">92%</Badge></td><td><Badge type="primary">A-</Badge></td>
                    <td><button className="btn btn-sm btn-outline-primary me-1">View</button><button className="btn btn-sm btn-outline-secondary">Message</button></td>
                  </tr>
                ))}
              </Table>
            </Card>
          )}

          {activeSection === 'assignments' && (
            <Card title="Assignments" action={<button className="btn btn-primary"><i className="fas fa-plus"></i> Create Assignment</button>}>
              <Table headers={['Title', 'Class', 'Due Date', 'Submissions', 'Status']}>
                <tr><td>Surah Memorization</td><td>Quran Level 2</td><td>15 Nov 2023</td><td>18/25</td><td><Badge type="warning">In Progress</Badge></td></tr>
                <tr><td>Arabic Grammar Quiz</td><td>Arabic Level 1</td><td>18 Nov 2023</td><td>0/22</td><td><Badge type="info">Upcoming</Badge></td></tr>
                <tr><td>Tajweed Practice</td><td>Quran Level 3</td><td>10 Nov 2023</td><td>18/18</td><td><Badge type="success">Completed</Badge></td></tr>
              </Table>
            </Card>
          )}

          {activeSection === 'grades' && (
            <Card title="Grade Management" action={<button className="btn btn-primary"><i className="fas fa-plus"></i> Add Grades</button>}>
              <Table headers={['Student', 'Assignment', 'Score', 'Grade', 'Date', 'Actions']}>
                <tr><td>Ahmed Khan</td><td>Surah Memorization</td><td>85/100</td><td><Badge type="success">A</Badge></td><td>10 Nov</td><td><button className="btn btn-sm btn-outline-primary">Edit</button></td></tr>
                <tr><td>Fatima Ahmed</td><td>Arabic Quiz</td><td>78/100</td><td><Badge type="primary">B+</Badge></td><td>08 Nov</td><td><button className="btn btn-sm btn-outline-primary">Edit</button></td></tr>
              </Table>
            </Card>
          )}

          {activeSection === 'schedule' && (
            <Card title="My Teaching Schedule">
              <Table headers={['Day', 'Time', 'Class', 'Subject', 'Room']}>
                <tr><td>Monday</td><td>09:00 - 10:00</td><td>Class 5</td><td>Quran Recitation</td><td>Room 101</td></tr>
                <tr><td>Monday</td><td>14:00 - 15:00</td><td>Class 10</td><td>Tajweed</td><td>Room 103</td></tr>
                <tr><td>Tuesday</td><td>11:00 - 12:00</td><td>Class 8</td><td>Arabic Grammar</td><td>Room 102</td></tr>
              </Table>
            </Card>
          )}

          {activeSection === 'resources' && (
            <Card title="Teaching Resources" action={<button className="btn btn-primary"><i className="fas fa-upload"></i> Upload Resource</button>}>
              <div className="row">
                <div className="col-md-4 mb-3"><div className="p-3 border rounded text-center"><i className="fas fa-file-pdf fa-2x text-danger mb-2"></i><p>Tajweed Rules Guide</p><small className="text-muted">Uploaded: 10 Nov 2023</small></div></div>
                <div className="col-md-4 mb-3"><div className="p-3 border rounded text-center"><i className="fas fa-file-word fa-2x text-primary mb-2"></i><p>Arabic Worksheet</p><small className="text-muted">Uploaded: 08 Nov 2023</small></div></div>
              </div>
            </Card>
          )}
        </>
      )}
    </DashboardLayout>
  );
};

export default TeacherDashboard;

