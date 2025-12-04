import { useState, useEffect } from 'react';
import DashboardLayout, { StatCard, Card, Table, Badge, ProgressBar } from '../../components/DashboardLayout';
import { apiGet } from '../../services/api';

const menuItems = [
  { id: 'dashboard', icon: 'tachometer-alt', label: 'Dashboard' },
  { id: 'myCourses', icon: 'book', label: 'My Courses' },
  { id: 'attendance', icon: 'clipboard-check', label: 'Attendance' },
  { id: 'assignments', icon: 'tasks', label: 'Assignments' },
  { id: 'grades', icon: 'chart-line', label: 'Grades' },
  { id: 'schedule', icon: 'calendar-alt', label: 'Schedule' },
  { id: 'resources', icon: 'file-download', label: 'Resources' },
];

const StudentDashboard = () => {
  const [stats, setStats] = useState({ courses: 0, attendance: 0, pendingAssignments: 0, grade: '-' });
  const [schedule, setSchedule] = useState([]);
  const [assignments, setAssignments] = useState([]);
  const [courses, setCourses] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [materials, setMaterials] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState('november');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await apiGet('/dashboard/student');
      if (data.success) {
        const dashData = data.data || {};

        // Set courses
        const coursesData = dashData.courses || [];
        setCourses(coursesData.map((c, i) => ({
          name: c.name || `Course ${i+1}`,
          teacher: c.instructor || 'TBD',
          progress: Math.floor(Math.random() * 50) + 50,
          icon: ['quran', 'language', 'mosque'][i % 3],
          color: ['primary', 'success', 'warning'][i % 3]
        })));

        // Set stats
        setStats({
          courses: coursesData.length,
          attendance: 92,
          pendingAssignments: 2,
          grade: 'A-'
        });

        // Set materials
        setMaterials(dashData.materials || []);

        // Sample schedule
        setSchedule([
          { time: '09:00 - 10:00', subject: 'Quran Recitation', teacher: 'Mr. Rizwan', room: 'Room 101', status: 'Completed' },
          { time: '11:00 - 12:00', subject: 'Arabic Grammar', teacher: 'Ms. Ayesha', room: 'Room 102', status: 'Upcoming' },
        ]);

        // Sample assignments
        setAssignments([
          { name: 'Surah Al-Fatiha Memorization', subject: 'Quran', dueDate: '15 Dec 2024', status: 'Pending' },
          { name: 'Arabic Verbs Exercise', subject: 'Arabic', dueDate: '18 Dec 2024', status: 'Submitted' },
        ]);

        // Sample attendance
        setAttendance([
          { date: '02 Dec 2024', subject: 'Quran Recitation', status: 'Present', remarks: '-' },
          { date: '01 Dec 2024', subject: 'Arabic Grammar', status: 'Present', remarks: '-' },
        ]);
      }
    } catch (error) {
      console.error('Error loading student dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const types = { Completed: 'success', Upcoming: 'primary', Pending: 'warning', Submitted: 'success', Present: 'success', Absent: 'danger', Late: 'warning', Later: 'secondary' };
    return <Badge type={types[status] || 'secondary'}>{status}</Badge>;
  };

  return (
    <DashboardLayout title="Student Dashboard" menuItems={menuItems}>
      {(activeSection) => (
        <>
          {activeSection === 'dashboard' && (
            <>
              <div className="stats-cards">
                <StatCard icon="book" value={stats.courses} label="Active Courses" color="52, 152, 219" />
                <StatCard icon="clipboard-check" value={`${stats.attendance}%`} label="Attendance" color="40, 167, 69" />
                <StatCard icon="tasks" value={stats.pendingAssignments} label="Pending Assignments" color="255, 193, 7" />
                <StatCard icon="chart-line" value={stats.grade} label="Overall Grade" color="220, 53, 69" />
              </div>
              <div className="row">
                <div className="col-md-8">
                  <Card title="Today's Schedule" action={<button className="btn btn-sm btn-primary">View Full Schedule</button>}>
                    <Table headers={['Time', 'Subject', 'Teacher', 'Room', 'Status']}>
                      {schedule.map((s, i) => (
                        <tr key={i}><td>{s.time}</td><td>{s.subject}</td><td>{s.teacher}</td><td>{s.room}</td><td>{getStatusBadge(s.status)}</td></tr>
                      ))}
                    </Table>
                  </Card>
                  <Card title="Recent Assignments">
                    <Table headers={['Assignment', 'Subject', 'Due Date', 'Status', 'Action']}>
                      {assignments.map((a, i) => (
                        <tr key={i}><td>{a.name}</td><td>{a.subject}</td><td>{a.dueDate}</td><td>{getStatusBadge(a.status)}</td>
                          <td><button className={`btn btn-sm ${a.status === 'Submitted' ? 'btn-outline-secondary' : 'btn-primary'}`} disabled={a.status === 'Submitted'}>{a.status === 'Submitted' ? 'Submitted' : a.status === 'Upcoming' ? 'Start' : 'Submit'}</button></td>
                        </tr>
                      ))}
                    </Table>
                  </Card>
                </div>
                <div className="col-md-4">
                  <Card title="Course Progress">
                    {courses.map((c, i) => <ProgressBar key={i} label={c.name} value={c.progress} color={c.color} />)}
                  </Card>
                  <Card title="Upcoming Events">
                    <div className="event-item"><strong>Monthly Test</strong><div className="text-muted small">15 Nov 2023, 10:00 AM</div></div>
                    <div className="event-item success"><strong>Quran Competition</strong><div className="text-muted small">20 Nov 2023, 09:00 AM</div></div>
                    <div className="event-item warning"><strong>Parent-Teacher Meeting</strong><div className="text-muted small">25 Nov 2023, 11:00 AM</div></div>
                  </Card>
                </div>
              </div>
            </>
          )}

          {activeSection === 'myCourses' && (
            <div className="row">
              {courses.map((c, i) => (
                <div className="col-md-4" key={i}>
                  <div className="dashboard-card course-card">
                    <i className={`fas fa-${c.icon} text-${c.color}`}></i>
                    <h5>{c.name}</h5>
                    <p className="text-muted">{c.teacher}</p>
                    <ProgressBar value={c.progress} color={c.color} />
                    <p>{c.progress}% Complete</p>
                    <button className="btn btn-primary btn-sm">Continue Learning</button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeSection === 'attendance' && (
            <Card title="My Attendance Record" action={
              <select className="form-select w-auto" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                <option value="november">November 2023</option><option value="october">October 2023</option><option value="september">September 2023</option>
              </select>
            }>
              <Table headers={['Date', 'Subject', 'Status', 'Remarks']}>
                {attendance.map((a, i) => (<tr key={i}><td>{a.date}</td><td>{a.subject}</td><td>{getStatusBadge(a.status)}</td><td>{a.remarks}</td></tr>))}
              </Table>
              <div className="mt-4"><h6>Attendance Summary:</h6>
                <div className="row text-center">
                  <div className="col-md-3"><div className="p-3 border rounded"><h3 className="text-success">92%</h3><p>Overall</p></div></div>
                  <div className="col-md-3"><div className="p-3 border rounded"><h3 className="text-primary">18</h3><p>Present</p></div></div>
                  <div className="col-md-3"><div className="p-3 border rounded"><h3 className="text-danger">1</h3><p>Absent</p></div></div>
                  <div className="col-md-3"><div className="p-3 border rounded"><h3 className="text-warning">1</h3><p>Late</p></div></div>
                </div>
              </div>
            </Card>
          )}

          {activeSection === 'assignments' && (
            <Card title="All Assignments">
              <Table headers={['Assignment', 'Subject', 'Due Date', 'Status', 'Action']}>
                {assignments.map((a, i) => (
                  <tr key={i}><td>{a.name}</td><td>{a.subject}</td><td>{a.dueDate}</td><td>{getStatusBadge(a.status)}</td>
                    <td><button className={`btn btn-sm ${a.status === 'Submitted' ? 'btn-outline-secondary' : 'btn-primary'}`} disabled={a.status === 'Submitted'}>{a.status === 'Submitted' ? 'Submitted' : 'Submit'}</button></td>
                  </tr>
                ))}
              </Table>
            </Card>
          )}

          {activeSection === 'grades' && (
            <Card title="My Grades">
              <Table headers={['Subject', 'Assignment', 'Score', 'Grade', 'Date']}>
                <tr><td>Quran</td><td>Surah Memorization</td><td>85/100</td><td><Badge type="success">A</Badge></td><td>10 Nov 2023</td></tr>
                <tr><td>Arabic</td><td>Grammar Test</td><td>78/100</td><td><Badge type="primary">B+</Badge></td><td>08 Nov 2023</td></tr>
                <tr><td>Islamic Studies</td><td>History Quiz</td><td>92/100</td><td><Badge type="success">A+</Badge></td><td>05 Nov 2023</td></tr>
              </Table>
            </Card>
          )}

          {activeSection === 'schedule' && (
            <Card title="Weekly Schedule">
              <Table headers={['Day', 'Time', 'Subject', 'Teacher', 'Room']}>
                <tr><td>Monday</td><td>09:00 - 10:00</td><td>Quran Recitation</td><td>Mr. Rizwan</td><td>Room 101</td></tr>
                <tr><td>Monday</td><td>11:00 - 12:00</td><td>Arabic Grammar</td><td>Ms. Ayesha</td><td>Room 102</td></tr>
                <tr><td>Tuesday</td><td>09:00 - 10:00</td><td>Islamic Studies</td><td>Mr. Mohammed</td><td>Room 103</td></tr>
                <tr><td>Wednesday</td><td>09:00 - 10:00</td><td>Quran Recitation</td><td>Mr. Rizwan</td><td>Room 101</td></tr>
              </Table>
            </Card>
          )}

          {activeSection === 'resources' && (
            <Card title="Learning Resources">
              <div className="row">
                <div className="col-md-4 mb-3"><div className="p-3 border rounded text-center"><i className="fas fa-file-pdf fa-2x text-danger mb-2"></i><p>Tajweed Rules PDF</p><button className="btn btn-sm btn-outline-primary">Download</button></div></div>
                <div className="col-md-4 mb-3"><div className="p-3 border rounded text-center"><i className="fas fa-video fa-2x text-primary mb-2"></i><p>Arabic Lesson Videos</p><button className="btn btn-sm btn-outline-primary">Watch</button></div></div>
                <div className="col-md-4 mb-3"><div className="p-3 border rounded text-center"><i className="fas fa-book fa-2x text-success mb-2"></i><p>Islamic History Book</p><button className="btn btn-sm btn-outline-primary">Read</button></div></div>
              </div>
            </Card>
          )}
        </>
      )}
    </DashboardLayout>
  );
};

export default StudentDashboard;

