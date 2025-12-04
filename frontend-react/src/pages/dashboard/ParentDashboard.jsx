import { useState, useEffect } from 'react';
import DashboardLayout, { StatCard, Card, Table, Badge, ProgressBar } from '../../components/DashboardLayout';
import { apiGet } from '../../services/api';

const menuItems = [
  { id: 'dashboard', icon: 'tachometer-alt', label: 'Dashboard' },
  { id: 'myChildren', icon: 'child', label: 'My Children' },
  { id: 'attendance', icon: 'clipboard-check', label: 'Attendance' },
  { id: 'progress', icon: 'chart-line', label: 'Progress' },
  { id: 'fee', icon: 'money-bill-wave', label: 'Fee Payment' },
  { id: 'schedule', icon: 'calendar-alt', label: 'Schedule' },
  { id: 'messages', icon: 'comments', label: 'Messages' },
];

const ParentDashboard = () => {
  const [stats, setStats] = useState({ children: 0, avgAttendance: 0, pendingAssignments: 0, feeDue: '₹0' });
  const [children, setChildren] = useState([]);
  const [activities, setActivities] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedChild, setSelectedChild] = useState('all');
  const [selectedMonth, setSelectedMonth] = useState('november');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await apiGet('/dashboard/parent');
      if (data.success) {
        // For now, show sample data since parent-child linking is not implemented
        setStats({ children: 2, avgAttendance: 94, pendingAssignments: 3, feeDue: '₹2,500' });
        setChildren([
          { id: 'STU001', name: 'Ahmed Khan', class: 'Quran Level 2', teacher: 'Mr. Rizwan Ahmed', attendance: 92, grade: 'A-', avatar: 'A', color: 'success' },
          { id: 'STU002', name: 'Fatima Khan', class: 'Arabic Level 1', teacher: 'Ms. Ayesha Khan', attendance: 96, grade: 'A', avatar: 'F', color: 'primary' },
        ]);
        setActivities([
          { date: '02 Dec 2024', child: 'Ahmed Khan', activity: 'Assignment Submitted', status: 'Completed' },
          { date: '01 Dec 2024', child: 'Fatima Khan', activity: 'Quiz Attempted', status: 'Pending Review' },
        ]);
        setAttendance([
          { date: '02 Dec 2024', child: 'Ahmed Khan', subject: 'Quran Recitation', status: 'Present', remarks: '-' },
          { date: '02 Dec 2024', child: 'Fatima Khan', subject: 'Arabic Grammar', status: 'Present', remarks: '-' },
        ]);
      }
    } catch (error) {
      console.error('Error loading parent dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const types = { Completed: 'success', 'Pending Review': 'warning', Paid: 'success', Scheduled: 'info', Present: 'success', Absent: 'danger', Late: 'warning', Due: 'danger' };
    return <Badge type={types[status] || 'secondary'}>{status}</Badge>;
  };

  return (
    <DashboardLayout title="Parent Dashboard" menuItems={menuItems}>
      {(activeSection) => (
        <>
          {activeSection === 'dashboard' && (
            <>
              <div className="stats-cards">
                <StatCard icon="child" value={stats.children} label="Children Enrolled" color="52, 152, 219" />
                <StatCard icon="clipboard-check" value={`${stats.avgAttendance}%`} label="Average Attendance" color="40, 167, 69" />
                <StatCard icon="tasks" value={stats.pendingAssignments} label="Pending Assignments" color="255, 193, 7" />
                <StatCard icon="money-bill-wave" value={stats.feeDue} label="Fee Due" color="220, 53, 69" />
              </div>
              <div className="row">
                <div className="col-md-8">
                  <Card title="My Children" action={<button className="btn btn-sm btn-primary">View All</button>}>
                    <div className="row">
                      {children.map((c, i) => (
                        <div className="col-md-6" key={i}>
                          <div className="dashboard-card child-card" style={{ borderLeftColor: `var(--${c.color})` }}>
                            <div className="card-body">
                              <div className="d-flex align-items-center mb-3">
                                <div className="user-avatar me-3" style={{ background: `var(--${c.color})` }}>{c.avatar}</div>
                                <div><h5 className="mb-0">{c.name}</h5><p className="text-muted mb-0">{c.class}</p></div>
                              </div>
                              <ProgressBar label="Attendance" value={c.attendance} color="success" />
                              <div className="d-flex justify-content-between mt-2"><span>Overall Grade</span><span>{c.grade}</span></div>
                              <button className="btn btn-sm btn-outline-primary w-100 mt-2">View Details</button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                  <Card title="Recent Activities">
                    <Table headers={['Date', 'Child', 'Activity', 'Status']}>
                      {activities.map((a, i) => (<tr key={i}><td>{a.date}</td><td>{a.child}</td><td>{a.activity}</td><td>{getStatusBadge(a.status)}</td></tr>))}
                    </Table>
                  </Card>
                </div>
                <div className="col-md-4">
                  <Card title="Quick Actions">
                    <div className="quick-actions">
                      <button className="btn btn-primary"><i className="fas fa-eye"></i> View Progress Reports</button>
                      <button className="btn btn-outline-primary"><i className="fas fa-money-bill"></i> Pay Fees</button>
                      <button className="btn btn-outline-primary"><i className="fas fa-calendar-plus"></i> Schedule Meeting</button>
                      <button className="btn btn-outline-primary"><i className="fas fa-comments"></i> Message Teacher</button>
                      <button className="btn btn-outline-primary"><i className="fas fa-download"></i> Download Reports</button>
                    </div>
                  </Card>
                  <Card title="Upcoming Events">
                    <div className="event-item"><strong>Parent-Teacher Meeting</strong><div className="text-muted small">15 Nov 2023, 10:00 AM</div></div>
                    <div className="event-item success"><strong>Quran Competition</strong><div className="text-muted small">20 Nov 2023, 09:00 AM</div></div>
                    <div className="event-item warning"><strong>Monthly Test</strong><div className="text-muted small">25 Nov 2023, 11:00 AM</div></div>
                  </Card>
                  <Card title="Fee Status">
                    {children.map((c, i) => (
                      <div className="mb-3" key={i}>
                        <div className="d-flex justify-content-between"><span>{c.name}</span><span className={i === 0 ? 'text-success' : 'text-danger'}>{i === 0 ? 'Paid' : 'Due'}</span></div>
                        <div className="text-muted small">{i === 0 ? 'Next due: 10 Dec 2023' : 'Due: 15 Nov 2023'}</div>
                      </div>
                    ))}
                    <button className="btn btn-sm btn-primary w-100">Pay Now</button>
                  </Card>
                </div>
              </div>
            </>
          )}

          {activeSection === 'myChildren' && (
            <div className="row">
              {children.map((c, i) => (
                <div className="col-md-6" key={i}>
                  <Card title={`${c.name} - Details`}>
                    <div className="row mb-3"><div className="col-md-4 fw-bold">Student ID:</div><div className="col-md-8">{c.id}</div></div>
                    <div className="row mb-3"><div className="col-md-4 fw-bold">Class:</div><div className="col-md-8">{c.class}</div></div>
                    <div className="row mb-3"><div className="col-md-4 fw-bold">Teacher:</div><div className="col-md-8">{c.teacher}</div></div>
                    <div className="row mb-3"><div className="col-md-4 fw-bold">Attendance:</div><div className="col-md-8"><Badge type="success">{c.attendance}%</Badge></div></div>
                    <div className="row mb-3"><div className="col-md-4 fw-bold">Overall Grade:</div><div className="col-md-8"><Badge type="primary">{c.grade}</Badge></div></div>
                    <button className="btn btn-primary">View Full Report</button>
                  </Card>
                </div>
              ))}
            </div>
          )}

          {activeSection === 'attendance' && (
            <Card title="Children Attendance" action={
              <div className="d-flex gap-2">
                <select className="form-select w-auto" value={selectedChild} onChange={(e) => setSelectedChild(e.target.value)}>
                  <option value="all">All Children</option>
                  {children.map((c, i) => <option key={i} value={c.name.toLowerCase().replace(' ', '')}>{c.name}</option>)}
                </select>
                <select className="form-select w-auto" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                  <option value="november">November 2023</option><option value="october">October 2023</option><option value="september">September 2023</option>
                </select>
              </div>
            }>
              <Table headers={['Date', 'Child', 'Subject', 'Status', 'Remarks']}>
                {attendance.map((a, i) => (<tr key={i}><td>{a.date}</td><td>{a.child}</td><td>{a.subject}</td><td>{getStatusBadge(a.status)}</td><td>{a.remarks}</td></tr>))}
              </Table>
              <div className="mt-4"><h6>Attendance Summary:</h6>
                <div className="row text-center">
                  <div className="col-md-3"><div className="p-3 border rounded"><h3 className="text-success">94%</h3><p>Overall</p></div></div>
                  <div className="col-md-3"><div className="p-3 border rounded"><h3 className="text-primary">35</h3><p>Present</p></div></div>
                  <div className="col-md-3"><div className="p-3 border rounded"><h3 className="text-danger">1</h3><p>Absent</p></div></div>
                  <div className="col-md-3"><div className="p-3 border rounded"><h3 className="text-warning">1</h3><p>Late</p></div></div>
                </div>
              </div>
            </Card>
          )}

          {activeSection === 'progress' && (
            <div className="row">
              {children.map((c, i) => (
                <div className="col-md-6" key={i}>
                  <Card title={`${c.name} - Progress`}>
                    <ProgressBar label="Quran" value={75} color="success" />
                    <ProgressBar label="Arabic" value={60} color="primary" />
                    <ProgressBar label="Islamic Studies" value={80} color="warning" />
                    <div className="mt-3"><h6>Recent Grades:</h6>
                      <Table headers={['Subject', 'Test', 'Score', 'Grade']}>
                        <tr><td>Quran</td><td>Memorization</td><td>85/100</td><td><Badge type="success">A</Badge></td></tr>
                        <tr><td>Arabic</td><td>Grammar Quiz</td><td>78/100</td><td><Badge type="primary">B+</Badge></td></tr>
                      </Table>
                    </div>
                  </Card>
                </div>
              ))}
            </div>
          )}

          {activeSection === 'fee' && (
            <Card title="Fee Payment">
              <Table headers={['Child', 'Fee Type', 'Amount', 'Due Date', 'Status', 'Action']}>
                <tr><td>Ahmed Khan</td><td>Monthly Fee</td><td>₹2,000</td><td>10 Dec 2023</td><td><Badge type="success">Paid</Badge></td><td><button className="btn btn-sm btn-outline-secondary" disabled>Paid</button></td></tr>
                <tr><td>Fatima Khan</td><td>Monthly Fee</td><td>₹2,500</td><td>15 Nov 2023</td><td><Badge type="danger">Due</Badge></td><td><button className="btn btn-sm btn-primary">Pay Now</button></td></tr>
              </Table>
              <div className="mt-3"><h6>Payment History:</h6>
                <Table headers={['Date', 'Child', 'Amount', 'Method', 'Receipt']}>
                  <tr><td>10 Nov 2023</td><td>Ahmed Khan</td><td>₹2,000</td><td>Online</td><td><button className="btn btn-sm btn-outline-primary">Download</button></td></tr>
                  <tr><td>10 Oct 2023</td><td>Fatima Khan</td><td>₹2,500</td><td>Cash</td><td><button className="btn btn-sm btn-outline-primary">Download</button></td></tr>
                </Table>
              </div>
            </Card>
          )}

          {activeSection === 'schedule' && (
            <Card title="Children's Schedule">
              {children.map((c, i) => (
                <div key={i} className="mb-4">
                  <h6>{c.name} - {c.class}</h6>
                  <Table headers={['Day', 'Time', 'Subject', 'Teacher', 'Room']}>
                    <tr><td>Monday</td><td>09:00 - 10:00</td><td>Quran Recitation</td><td>{c.teacher}</td><td>Room 101</td></tr>
                    <tr><td>Wednesday</td><td>11:00 - 12:00</td><td>Arabic Grammar</td><td>{c.teacher}</td><td>Room 102</td></tr>
                  </Table>
                </div>
              ))}
            </Card>
          )}

          {activeSection === 'messages' && (
            <Card title="Messages" action={<button className="btn btn-primary"><i className="fas fa-plus"></i> New Message</button>}>
              <div className="list-group">
                <div className="list-group-item"><div className="d-flex justify-content-between"><strong>Mr. Rizwan Ahmed</strong><small className="text-muted">12 Nov 2023</small></div><p className="mb-0 text-muted">Ahmed is doing great in Quran recitation...</p></div>
                <div className="list-group-item"><div className="d-flex justify-content-between"><strong>Ms. Ayesha Khan</strong><small className="text-muted">10 Nov 2023</small></div><p className="mb-0 text-muted">Fatima needs to practice Arabic grammar more...</p></div>
              </div>
            </Card>
          )}
        </>
      )}
    </DashboardLayout>
  );
};

export default ParentDashboard;

