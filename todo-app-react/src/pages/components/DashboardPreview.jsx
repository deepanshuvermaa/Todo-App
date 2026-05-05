import React from 'react';
import { TrendingUp, TrendingDown, ChevronDown, X } from 'lucide-react';
import Gauge from './Gauge';

export default function DashboardPreview() {
  return (
    <div className="px-3 sm:px-4 mt-8 sm:mt-12">
      <div className="bg-[#f5f2ee] rounded-3xl p-4 sm:p-6 w-full max-w-[880px] mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {/* Card 1 - Tasks Overview */}
          <div className="bg-white rounded-2xl p-5">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[#ef4d23] font-semibold text-sm">Tasks</span>
              <span className="text-neutral-400 text-xs">This Week</span>
            </div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[28px] font-bold">24</span>
              <span className="bg-green-50 text-green-600 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                <TrendingUp size={12} /> 8 completed
              </span>
            </div>
            <p className="text-xs text-neutral-400 mb-3">Compared to last week</p>
            <Gauge value={78} color="#ef4d23" showLabels min="Done" max="Total" />
            <div className="flex bg-neutral-100 rounded-full p-1 mt-3">
              <button className="flex-1 text-xs py-1.5 rounded-full bg-white shadow-sm font-medium">Active</button>
              <button className="flex-1 text-xs py-1.5 rounded-full text-neutral-500">Completed</button>
            </div>
          </div>

          {/* Card 2 - Quick Add */}
          <div className="bg-white rounded-2xl p-5 flex flex-col gap-3">
            <div>
              <label className="text-xs text-neutral-500 mb-1 block">Add item to</label>
              <button className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm flex items-center justify-between">
                <span>Tasks</span>
                <ChevronDown size={14} className="text-neutral-400" />
              </button>
            </div>
            <div>
              <label className="text-xs text-neutral-500 mb-1 block">Priority</label>
              <button className="w-full border border-neutral-200 rounded-lg px-3 py-2 text-sm flex items-center justify-between">
                <span>Medium</span>
                <ChevronDown size={14} className="text-neutral-400" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs text-neutral-500 mb-1 block"># Daily goal</label>
                <div className="border border-neutral-200 rounded-lg px-3 py-2 text-sm">5</div>
              </div>
              <div>
                <label className="text-xs text-neutral-500 mb-1 block"># Weekly target</label>
                <div className="border border-neutral-200 rounded-lg px-3 py-2 text-sm">25</div>
              </div>
            </div>
            <div className="flex items-center gap-3 mt-auto pt-2">
              <button className="bg-[#ef4d23] text-white text-xs font-medium px-4 py-1.5 rounded-lg">Save</button>
              <button className="text-xs text-neutral-600 underline">Cancel</button>
              <X size={14} className="ml-auto text-neutral-400" />
            </div>
          </div>

          {/* Card 3 - Expenses */}
          <div className="bg-white rounded-2xl p-5 sm:col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-[#ef4d23] font-semibold text-sm">Expenses</span>
              <span className="text-neutral-400 text-xs">today</span>
            </div>
            <div className="flex items-center gap-3 mb-1">
              <span className="text-[28px] font-bold">&#8377;1,250</span>
              <span className="bg-neutral-100 text-neutral-600 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                <TrendingDown size={12} /> -12%
              </span>
            </div>
            <p className="text-xs text-neutral-400 mb-3">Compared to yesterday</p>
            <Gauge value={45} color="#9ca3af" showLabels min="Spent" max="Budget" />
            <div className="flex bg-neutral-100 rounded-full p-1 mt-3">
              <button className="flex-1 text-xs py-1.5 rounded-full bg-white shadow-sm font-medium">This Month</button>
              <button className="flex-1 text-xs py-1.5 rounded-full text-neutral-500">This Week</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
