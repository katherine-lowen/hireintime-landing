import { LineChart, Line, BarChart, Bar, ResponsiveContainer, XAxis, YAxis } from 'recharts';
import { TrendingUp, Users, Clock, CheckCircle, Calendar, Award } from 'lucide-react';

const hiringData = [
  { month: 'Mar', hires: 4 },
  { month: 'Apr', hires: 6 },
  { month: 'May', hires: 5 },
  { month: 'Jun', hires: 8 },
  { month: 'Jul', hires: 12 },
  { month: 'Aug', hires: 10 },
];

const timeToFillData = [
  { week: 'W1', days: 28 },
  { week: 'W2', days: 24 },
  { week: 'W3', days: 22 },
  { week: 'W4', days: 18 },
];

export function DashboardMockup() {
  return (
    <div className="w-full bg-gradient-to-br from-gray-50 to-white rounded-2xl p-8 border border-gray-200/80 shadow-xl"
         style={{
           boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08), 0 0 60px rgba(99, 102, 241, 0.06)'
         }}>
      
      {/* Header */}
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-gray-200/60">
        <div>
          <h3 className="text-2xl text-white font-bold mb-1">Hiring Dashboard</h3>
          <p className="text-sm text-gray-500">Last updated: September 2025</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-sm text-gray-600 hover:text-white transition-colors rounded-lg hover:bg-gray-100">
            This Month
          </button>
          <button className="px-4 py-2 text-sm text-white bg-gray-100 rounded-lg">
            This Quarter
          </button>
          <button className="px-4 py-2 text-sm text-gray-600 hover:text-white transition-colors rounded-lg hover:bg-gray-100">
            This Year
          </button>
        </div>
      </div>

      {/* Key Metrics Grid */}
      <div className="grid grid-cols-4 gap-6 mb-8">
        
        {/* Open Roles */}
        <div className="relative rounded-xl bg-white p-6 border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none"
               style={{
                 background: 'radial-gradient(circle, rgba(99, 102, 241, 0.08), transparent 70%)',
                 transform: 'translate(30%, -30%)',
                 filter: 'blur(20px)'
               }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50">
                <Users className="w-4 h-4 text-indigo-600" strokeWidth={2} />
              </div>
              <span className="text-sm text-gray-600">Open Roles</span>
            </div>
            <div className="text-3xl text-white font-bold">12</div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              <span className="text-xs text-emerald-600">+3 this week</span>
            </div>
          </div>
        </div>

        {/* Hires This Month */}
        <div className="relative rounded-xl bg-white p-6 border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none"
               style={{
                 background: 'radial-gradient(circle, rgba(139, 92, 246, 0.08), transparent 70%)',
                 transform: 'translate(30%, -30%)',
                 filter: 'blur(20px)'
               }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50">
                <CheckCircle className="w-4 h-4 text-purple-600" strokeWidth={2} />
              </div>
              <span className="text-sm text-gray-600">Hires This Month</span>
            </div>
            <div className="text-3xl text-white font-bold">10</div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              <span className="text-xs text-emerald-600">+25% vs last month</span>
            </div>
          </div>
        </div>

        {/* Time to Fill */}
        <div className="relative rounded-xl bg-white p-6 border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none"
               style={{
                 background: 'radial-gradient(circle, rgba(59, 130, 246, 0.08), transparent 70%)',
                 transform: 'translate(30%, -30%)',
                 filter: 'blur(20px)'
               }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-blue-50 to-cyan-50">
                <Clock className="w-4 h-4 text-blue-600" strokeWidth={2} />
              </div>
              <span className="text-sm text-gray-600">Avg Time to Fill</span>
            </div>
            <div className="text-3xl text-white font-bold">18d</div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              <span className="text-xs text-emerald-600">-10 days improved</span>
            </div>
          </div>
        </div>

        {/* Offer Accept Rate */}
        <div className="relative rounded-xl bg-white p-6 border border-gray-200/60 shadow-sm hover:shadow-md transition-shadow">
          <div className="absolute top-0 right-0 w-24 h-24 rounded-full pointer-events-none"
               style={{
                 background: 'radial-gradient(circle, rgba(168, 85, 247, 0.08), transparent 70%)',
                 transform: 'translate(30%, -30%)',
                 filter: 'blur(20px)'
               }} />
          <div className="relative">
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-lg bg-gradient-to-br from-violet-50 to-purple-50">
                <Award className="w-4 h-4 text-violet-600" strokeWidth={2} />
              </div>
              <span className="text-sm text-gray-600">Offer Accept Rate</span>
            </div>
            <div className="text-3xl text-white font-bold">92%</div>
            <div className="flex items-center gap-1 mt-2">
              <TrendingUp className="w-3 h-3 text-emerald-600" />
              <span className="text-xs text-emerald-600">+7% vs target</span>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-2 gap-6">
        
        {/* Hiring Trend */}
        <div className="rounded-xl bg-white p-6 border border-gray-200/60 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-white font-bold mb-1">Hiring Trend</h4>
              <p className="text-sm text-gray-500">Monthly hires over time</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
              <span className="text-xs text-gray-600">Hires</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={hiringData}>
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
              />
              <Line 
                type="monotone" 
                dataKey="hires" 
                stroke="url(#colorGradient)" 
                strokeWidth={3}
                dot={{ fill: '#6366F1', strokeWidth: 2, r: 4 }}
              />
              <defs>
                <linearGradient id="colorGradient" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#6366F1" />
                  <stop offset="100%" stopColor="#8B5CF6" />
                </linearGradient>
              </defs>
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Time to Fill Progress */}
        <div className="rounded-xl bg-white p-6 border border-gray-200/60 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h4 className="text-white font-bold mb-1">Time to Fill Progress</h4>
              <p className="text-sm text-gray-500">Average days per week</p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-indigo-500 to-blue-600"></div>
              <span className="text-xs text-gray-600">Days</span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={timeToFillData}>
              <XAxis 
                dataKey="week" 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#9CA3AF', fontSize: 12 }}
              />
              <Bar 
                dataKey="days" 
                fill="url(#barGradient)" 
                radius={[8, 8, 0, 0]}
              />
              <defs>
                <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#6366F1" />
                  <stop offset="100%" stopColor="#3B82F6" />
                </linearGradient>
              </defs>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Timeline Preview */}
      <div className="mt-6 rounded-xl bg-white p-6 border border-gray-200/60 shadow-sm">
        <div className="flex items-center gap-2 mb-5">
          <Calendar className="w-5 h-5 text-gray-600" strokeWidth={2} />
          <h4 className="text-white font-bold">Recent Activity</h4>
        </div>
        <div className="space-y-3">
          <div className="flex items-center gap-4 p-3 rounded-lg bg-gradient-to-r from-blue-50/50 to-purple-50/50 border border-blue-100/50">
            <div className="w-2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
            <div className="flex-1">
              <p className="text-sm text-white font-medium">Sarah Chen started as Senior Designer</p>
              <p className="text-xs text-gray-500">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-50/50 border border-gray-100/50">
            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
            <div className="flex-1">
              <p className="text-sm text-gray-700">Offer sent to Marcus Rodriguez</p>
              <p className="text-xs text-gray-500">5 hours ago</p>
            </div>
          </div>
          <div className="flex items-center gap-4 p-3 rounded-lg bg-gray-50/50 border border-gray-100/50">
            <div className="w-2 h-2 rounded-full bg-gray-400"></div>
            <div className="flex-1">
              <p className="text-sm text-gray-700">Interview scheduled: Frontend Engineer role</p>
              <p className="text-xs text-gray-500">Yesterday</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
