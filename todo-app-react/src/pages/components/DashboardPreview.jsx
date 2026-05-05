import React, { useState } from 'react';
import { TrendingUp, TrendingDown, ChevronDown, X, Check } from 'lucide-react';
import Gauge from './Gauge';

export default function DashboardPreview() {
  // Card 1 state
  const [taskTab, setTaskTab] = useState('active'); // 'active' | 'completed'
  const [taskData] = useState({
    active: { count: 24, completed: 8, gauge: 78 },
    completed: { count: 31, completed: 31, gauge: 100 }
  });
  const currentTaskData = taskData[taskTab];

  // Card 2 state
  const [addItemTo, setAddItemTo] = useState('Tasks');
  const [showAddDropdown, setShowAddDropdown] = useState(false);
  const [priority, setPriority] = useState('Medium');
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [dailyGoal, setDailyGoal] = useState(5);
  const [weeklyTarget, setWeeklyTarget] = useState(25);
  const [saveStatus, setSaveStatus] = useState('idle'); // 'idle' | 'saved'

  // Card 3 state
  const [expenseTab, setExpenseTab] = useState('month'); // 'month' | 'week'
  const [expenseData] = useState({
    month: { amount: '\u20B917,200', change: '-12%', down: true, gauge: 45 },
    week: { amount: '\u20B94,350', change: '+8%', down: false, gauge: 22 }
  });
  const currentExpenseData = expenseData[expenseTab];

  const addItemOptions = ['Tasks', 'Notes', 'Expenses', 'Journal', 'Habits'];
  const priorityOptions = ['Low', 'Medium', 'High', 'Urgent'];

  const handleSave = () => {
    setSaveStatus('saved');
    setTimeout(() => setSaveStatus('idle'), 2000);
  };

  return (
    <div className="px-3 sm:px-4 mt-8 sm:mt-12 w-full">
      <div className="bg-[#f5f2ee] rounded-3xl p-4 sm:p-6 w-full max-w-[880px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Card 1 - Tasks */}
          <div className="bg-white rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[#ef4d23] font-semibold text-sm">Tasks</span>
              <span className="text-neutral-400 text-xs">This Week</span>
            </div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[28px] font-bold">{currentTaskData.count}</span>
              <span className={`${taskTab === 'completed' ? 'bg-green-50 text-green-600' : 'bg-green-50 text-green-600'} text-xs px-2 py-0.5 rounded-full flex items-center gap-1`}>
                <TrendingUp size={12} /> {currentTaskData.completed} completed
              </span>
            </div>
            <p className="text-xs text-neutral-400 mb-3">Compared to last week</p>
            <Gauge value={currentTaskData.gauge} color="#ef4d23" showLabels min="Done" max="Total" />
            <div className="flex bg-neutral-100 rounded-full p-1 mt-3">
              <button
                onClick={() => setTaskTab('active')}
                className={`flex-1 text-xs py-1.5 rounded-full font-medium transition-all ${taskTab === 'active' ? 'bg-white shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
              >Active</button>
              <button
                onClick={() => setTaskTab('completed')}
                className={`flex-1 text-xs py-1.5 rounded-full font-medium transition-all ${taskTab === 'completed' ? 'bg-white shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
              >Completed</button>
            </div>
          </div>

          {/* Card 2 - Quick Add */}
          <div className="bg-white rounded-2xl p-5 flex flex-col gap-3">
            {/* Add item to dropdown */}
            <div className="relative">
              <label className="text-xs text-neutral-500 mb-1 block">Add item to</label>
              <button
                onClick={() => { setShowAddDropdown(!showAddDropdown); setShowPriorityDropdown(false); }}
                className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm flex items-center justify-between hover:border-neutral-300 transition"
              >
                <span>{addItemTo}</span>
                <ChevronDown size={14} className={`text-neutral-400 transition-transform ${showAddDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showAddDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg z-10 overflow-hidden">
                  {addItemOptions.map(opt => (
                    <button key={opt} onClick={() => { setAddItemTo(opt); setShowAddDropdown(false); }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-neutral-50 transition ${opt === addItemTo ? 'bg-[#ef4d23]/5 text-[#ef4d23] font-medium' : ''}`}
                    >{opt}</button>
                  ))}
                </div>
              )}
            </div>

            {/* Priority dropdown */}
            <div className="relative">
              <label className="text-xs text-neutral-500 mb-1 block">Priority</label>
              <button
                onClick={() => { setShowPriorityDropdown(!showPriorityDropdown); setShowAddDropdown(false); }}
                className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm flex items-center justify-between hover:border-neutral-300 transition"
              >
                <span className="flex items-center gap-2">
                  <span className={`w-2 h-2 rounded-full ${priority === 'Low' ? 'bg-green-400' : priority === 'Medium' ? 'bg-yellow-400' : priority === 'High' ? 'bg-orange-400' : 'bg-red-500'}`} />
                  {priority}
                </span>
                <ChevronDown size={14} className={`text-neutral-400 transition-transform ${showPriorityDropdown ? 'rotate-180' : ''}`} />
              </button>
              {showPriorityDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-neutral-200 rounded-lg shadow-lg z-10 overflow-hidden">
                  {priorityOptions.map(opt => (
                    <button key={opt} onClick={() => { setPriority(opt); setShowPriorityDropdown(false); }}
                      className={`w-full text-left px-3 py-2 text-sm hover:bg-neutral-50 transition flex items-center gap-2 ${opt === priority ? 'bg-[#ef4d23]/5 text-[#ef4d23] font-medium' : ''}`}
                    >
                      <span className={`w-2 h-2 rounded-full ${opt === 'Low' ? 'bg-green-400' : opt === 'Medium' ? 'bg-yellow-400' : opt === 'High' ? 'bg-orange-400' : 'bg-red-500'}`} />
                      {opt}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Goal inputs */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-neutral-500 mb-1 block"># Daily goal</label>
                <input type="number" value={dailyGoal} onChange={e => setDailyGoal(Number(e.target.value))}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#ef4d23] focus:border-[#ef4d23]" />
              </div>
              <div>
                <label className="text-xs text-neutral-500 mb-1 block"># Weekly target</label>
                <input type="number" value={weeklyTarget} onChange={e => setWeeklyTarget(Number(e.target.value))}
                  className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-[#ef4d23] focus:border-[#ef4d23]" />
              </div>
            </div>

            {/* Footer */}
            <div className="flex items-center gap-3 mt-auto pt-2">
              <button onClick={handleSave}
                className={`text-xs font-medium px-4 py-1.5 rounded-lg transition-all ${saveStatus === 'saved' ? 'bg-green-500 text-white' : 'bg-[#ef4d23] text-white hover:bg-[#d9431d]'}`}
              >
                {saveStatus === 'saved' ? <span className="flex items-center gap-1"><Check size={12} /> Saved!</span> : 'Save'}
              </button>
              <button className="text-xs text-neutral-600 underline">Cancel</button>
              <X size={14} className="ml-auto text-neutral-400 cursor-pointer hover:text-neutral-600" />
            </div>
          </div>

          {/* Card 3 - Expenses */}
          <div className="bg-white rounded-2xl p-5 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[#ef4d23] font-semibold text-sm">Expenses</span>
              <span className="text-neutral-400 text-xs">{expenseTab === 'month' ? 'this month' : 'this week'}</span>
            </div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[28px] font-bold">{currentExpenseData.amount}</span>
              <span className={`${currentExpenseData.down ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-600'} text-xs px-2 py-0.5 rounded-full flex items-center gap-1`}>
                {currentExpenseData.down ? <TrendingDown size={12} /> : <TrendingUp size={12} />} {currentExpenseData.change}
              </span>
            </div>
            <p className="text-xs text-neutral-400 mb-3">Compared to {expenseTab === 'month' ? 'last month' : 'last week'}</p>
            <Gauge value={currentExpenseData.gauge} color={currentExpenseData.down ? '#ef4444' : '#22c55e'} showLabels min="Spent" max="Budget" />
            <div className="flex bg-neutral-100 rounded-full p-1 mt-3">
              <button
                onClick={() => setExpenseTab('month')}
                className={`flex-1 text-xs py-1.5 rounded-full font-medium transition-all ${expenseTab === 'month' ? 'bg-white shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
              >This Month</button>
              <button
                onClick={() => setExpenseTab('week')}
                className={`flex-1 text-xs py-1.5 rounded-full font-medium transition-all ${expenseTab === 'week' ? 'bg-white shadow-sm' : 'text-neutral-500 hover:text-neutral-700'}`}
              >This Week</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
