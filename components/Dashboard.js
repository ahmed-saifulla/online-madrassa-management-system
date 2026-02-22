import { useEffect, useState, useMemo } from 'react'
import { useRouter } from 'next/router'

export default function Dashboard() {
  const router = useRouter()
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeStudents: 0,
    totalTeachers: 0,
    activeTeachers: 0,
    totalSubjects: 0,
    totalClasses: 0,
    studentsPaid: 0,
    studentsPending: 0,
    teachersPaid: 0,
    teachersPending: 0,
    totalFeesPaid: 0,
    totalFeesPending: 0,
    totalSalariesPaid: 0,
    totalSalariesPending: 0,
    institutionBalance: 0,
    collectedThisMonth: 0,
    collectedThisYear: 0,
    toPaidThisMonth: 0,
  })

  useEffect(() => {
    // Load data from localStorage
    try {
      const students = JSON.parse(localStorage.getItem('madrassa_students') || '[]')
      const teachers = JSON.parse(localStorage.getItem('madrassa_teachers') || '[]')
      const subjects = JSON.parse(localStorage.getItem('madrassa_subjects') || '[]')
      const classes = JSON.parse(localStorage.getItem('madrassa_classes') || '[]')
      const fees = JSON.parse(localStorage.getItem('madrassa_fees') || '[]')
      const salaries = JSON.parse(localStorage.getItem('madrassa_salaries') || '[]')

      const activeStudents = students.filter(s => s.active).length
      const activeTeachers = teachers.filter(t => t.active).length

      // Fee calculations
      const studentsPaid = students.filter(s => {
        const studentFees = fees.filter(f => f.studentId === s.id)
        return studentFees.length > 0 && studentFees.some(f => f.status === 'paid')
      }).length
      const studentsPending = students.filter(s => {
        const studentFees = fees.filter(f => f.studentId === s.id)
        return studentFees.some(f => f.status === 'pending')
      }).length

      let totalFeesPaid = 0
      let totalFeesPending = 0
      let collectedThisMonth = 0
      let collectedThisYear = 0

      const now = new Date()
      const currentMonth = now.getMonth()
      const currentYear = now.getFullYear()

      fees.forEach(f => {
        if (f.status === 'paid') {
          totalFeesPaid += parseFloat(f.amount || 0)
          const feeDate = new Date(f.paidDate || f.date || '')
          if (feeDate.getMonth() === currentMonth && feeDate.getFullYear() === currentYear) {
            collectedThisMonth += parseFloat(f.amount || 0)
          }
          if (feeDate.getFullYear() === currentYear) {
            collectedThisYear += parseFloat(f.amount || 0)
          }
        } else if (f.status === 'pending') {
          totalFeesPending += parseFloat(f.amount || 0)
        }
      })

      // Salary calculations
      const teachersPaid = teachers.filter(t => {
        const teacherSalaries = salaries.filter(s => s.teacherId === t.id)
        return teacherSalaries.some(s => s.status === 'paid')
      }).length
      const teachersPending = teachers.filter(t => {
        const teacherSalaries = salaries.filter(s => s.teacherId === t.id)
        return teacherSalaries.some(s => s.status === 'pending')
      }).length

      let totalSalariesPaid = 0
      let totalSalariesPending = 0
      let toPaidThisMonth = 0

      salaries.forEach(s => {
        if (s.status === 'paid') {
          totalSalariesPaid += parseFloat(s.amount || 0)
        } else if (s.status === 'pending') {
          totalSalariesPending += parseFloat(s.amount || 0)
          const salaryDate = new Date(s.dueDate || s.date || '')
          if (salaryDate.getMonth() === currentMonth && salaryDate.getFullYear() === currentYear) {
            toPaidThisMonth += parseFloat(s.amount || 0)
          }
        }
      })

      const institutionBalance = totalFeesPaid - totalSalariesPaid

      setStats({
        totalStudents: students.length,
        activeStudents,
        totalTeachers: teachers.length,
        activeTeachers,
        totalSubjects: subjects.length,
        totalClasses: classes.length,
        studentsPaid,
        studentsPending,
        teachersPaid,
        teachersPending,
        totalFeesPaid,
        totalFeesPending,
        totalSalariesPaid,
        totalSalariesPending,
        institutionBalance,
        collectedThisMonth,
        collectedThisYear,
        toPaidThisMonth,
      })
    } catch (e) {
      console.error('Error loading dashboard stats:', e)
    }
  }, [])

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-PK', {
      style: 'currency',
      currency: 'PKR',
      minimumFractionDigits: 0,
    }).format(amount)
  }

  const MetricCard = ({ title, value, subtitle, color, icon }) => (
    <div className={`bg-white rounded-lg shadow-md p-6 border-l-4 ${color}`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-gray-600 text-sm font-medium">{title}</p>
          <p className="text-3xl font-bold text-gray-800 mt-2">{value}</p>
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
        </div>
        <div className={`text-2xl ${color.replace('border-l-4', 'text')}`}>{icon}</div>
      </div>
    </div>
  )

  return (
    <div className="space-y-8">
      {/* Quick Actions - Top */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <button
            onClick={() => router.push('/students')}
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="text-2xl mb-2">➕</div>
            <div className="font-semibold">New Admission</div>
            <div className="text-sm opacity-90">Add a new student</div>
          </button>
          <button
            onClick={() => router.push('/teachers')}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="text-2xl mb-2">👨‍🏫</div>
            <div className="font-semibold">Add Teacher</div>
            <div className="text-sm opacity-90">Hire a new teacher</div>
          </button>
          <button
            onClick={() => router.push('/classes')}
            className="bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="text-2xl mb-2">🏫</div>
            <div className="font-semibold">Manage Classes</div>
            <div className="text-sm opacity-90">View all classes</div>
          </button>
          <button
            onClick={() => router.push('/subjects')}
            className="bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="text-2xl mb-2">📚</div>
            <div className="font-semibold">Manage Subjects</div>
            <div className="text-sm opacity-90">View all subjects</div>
          </button>
          <button
            onClick={() => router.push('/admin/academic-years')}
            className="bg-gradient-to-r from-indigo-500 to-indigo-600 text-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="text-2xl mb-2">📅</div>
            <div className="font-semibold">Academic Years</div>
            <div className="text-sm opacity-90">Manage years</div>
          </button>
          <button
            onClick={() => router.push('/divisions')}
            className="bg-gradient-to-r from-red-500 to-red-600 text-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
          >
            <div className="text-2xl mb-2">📋</div>
            <div className="font-semibold">Divisions</div>
            <div className="text-sm opacity-90">Manage divisions</div>
          </button>
        </div>
      </div>

      {/* Top Stats */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Institution Overview</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Active Students"
            value={stats.activeStudents}
            subtitle={`out of ${stats.totalStudents} total`}
            color="border-l-4 border-blue-500"
            icon="👥"
          />
          <MetricCard
            title="Active Teachers"
            value={stats.activeTeachers}
            subtitle={`out of ${stats.totalTeachers} total`}
            color="border-l-4 border-green-500"
            icon="👨‍🏫"
          />
          <MetricCard
            title="Total Subjects"
            value={stats.totalSubjects}
            color="border-l-4 border-purple-500"
            icon="📚"
          />
          <MetricCard
            title="Total Classes"
            value={stats.totalClasses}
            color="border-l-4 border-orange-500"
            icon="🏫"
          />
        </div>
      </div>

      {/* Fee & Collection Stats */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Fees & Collections</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Students Paid"
            value={stats.studentsPaid}
            subtitle={`vs ${stats.studentsPending} pending`}
            color="border-l-4 border-green-600"
            icon="✅"
          />
          <MetricCard
            title="Total Fees Collected"
            value={formatCurrency(stats.totalFeesPaid)}
            subtitle={`Pending: ${formatCurrency(stats.totalFeesPending)}`}
            color="border-l-4 border-emerald-500"
            icon="💰"
          />
          <MetricCard
            title="Collected This Month"
            value={formatCurrency(stats.collectedThisMonth)}
            color="border-l-4 border-cyan-500"
            icon="📈"
          />
          <MetricCard
            title="Collected This Year"
            value={formatCurrency(stats.collectedThisYear)}
            color="border-l-4 border-teal-500"
            icon="📊"
          />
        </div>
      </div>

      {/* Salary & Payroll Stats */}
      <div>
        <h2 className="text-xl font-semibold text-gray-800 mb-4">Payroll & Salaries</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Teachers Paid"
            value={stats.teachersPaid}
            subtitle={`vs ${stats.teachersPending} pending`}
            color="border-l-4 border-green-600"
            icon="✅"
          />
          <MetricCard
            title="Total Salaries Paid"
            value={formatCurrency(stats.totalSalariesPaid)}
            subtitle={`Pending: ${formatCurrency(stats.totalSalariesPending)}`}
            color="border-l-4 border-red-500"
            icon="💸"
          />
          <MetricCard
            title="To Pay This Month"
            value={formatCurrency(stats.toPaidThisMonth)}
            color="border-l-4 border-red-600"
            icon="⏰"
          />
          <MetricCard
            title="Institution Balance"
            value={formatCurrency(stats.institutionBalance)}
            subtitle={stats.institutionBalance >= 0 ? 'Positive' : 'Deficit'}
            color={`border-l-4 ${stats.institutionBalance >= 0 ? 'border-green-700' : 'border-red-700'}`}
            icon={stats.institutionBalance >= 0 ? '📈' : '📉'}
          />
        </div>
      </div>
    </div>
  )
}
