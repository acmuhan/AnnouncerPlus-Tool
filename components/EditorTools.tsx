
import React, { useState } from 'react';

interface ToolButtonProps {
  label: string;
  onClick: () => void;
  color?: string;
  icon?: React.ReactNode;
  className?: string;
  active?: boolean;
}

export const ToolButton: React.FC<ToolButtonProps> = ({ label, onClick, color = 'bg-white/5', icon, className, active }) => (
  <button
    onClick={onClick}
    className={`${color} ${active ? 'ring-1 ring-emerald-500 bg-emerald-500/10 text-emerald-400' : 'text-slate-300'} hover:bg-white/10 text-[11px] font-bold px-4 py-2.5 rounded-full transition-all flex items-center gap-2 border border-white/5 active:scale-95 shadow-sm shrink-0 uppercase tracking-widest ${className}`}
  >
    {icon}
    {label}
  </button>
);

export const ColorSwatch: React.FC<{ hex: string; onClick: () => void; label: string; active?: boolean }> = ({ hex, onClick, label, active }) => (
  <button
    onClick={onClick}
    title={label}
    className={`w-8 h-8 rounded-full border-2 ${active ? 'border-white scale-110 shadow-lg' : 'border-white/10'} hover:scale-110 active:scale-95 transition-all shadow-sm shrink-0`}
    style={{ backgroundColor: hex }}
  />
);

export const Accordion: React.FC<{ title: string; icon?: React.ReactNode; children: React.ReactNode; defaultOpen?: boolean }> = ({ title, icon, children, defaultOpen = true }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  return (
    <div className={`mb-3 rounded-[1.5rem] overflow-hidden border border-white/5 bg-slate-900/20 transition-all ${isOpen ? 'pb-4' : 'pb-0'}`}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-6 py-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          {icon && <span className="text-emerald-500">{icon}</span>}
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">{title}</h3>
        </div>
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"
          className={`text-slate-600 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>
      <div className={`px-6 space-y-4 transition-all duration-300 overflow-hidden ${isOpen ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
        {children}
      </div>
    </div>
  );
};

export const Input: React.FC<{
  label: string;
  value: string | number;
  onChange: (val: string) => void;
  type?: string;
  placeholder?: string;
  className?: string;
}> = ({ label, value, onChange, type = 'text', placeholder, className }) => (
  <div className={`flex flex-col gap-2 ${className}`}>
    <label className="text-[9px] font-black text-slate-600 ml-1 uppercase tracking-widest">{label}</label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="bg-black/20 border border-white/5 rounded-2xl px-5 py-3 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all placeholder:text-slate-800"
    />
  </div>
);

export const Select: React.FC<{
  label: string;
  value: string;
  onChange: (val: string) => void;
  options: { label: string; value: string }[];
}> = ({ label, value, onChange, options }) => (
  <div className="flex flex-col gap-2">
    <label className="text-[9px] font-black text-slate-600 ml-1 uppercase tracking-widest">{label}</label>
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-black/20 border border-white/5 rounded-2xl px-5 py-3 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-emerald-500/50 transition-all appearance-none cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-slate-900 text-slate-100">
            {opt.label}
          </option>
        ))}
      </select>
      <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-600">
        <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg>
      </div>
    </div>
  </div>
);
