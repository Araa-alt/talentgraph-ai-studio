import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, Search, User, BookmarkCheck, Building, PlusCircle, Users } from 'lucide-react';

export interface BottomNavProps {
  currentView: string;
  onNavigate: (view: string) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentView, onNavigate }) => {
  const { currentRole } = useAuth();

  const studentItems = [
    { id: 'dashboard', label: 'Home', icon: <Sparkles className="w-5 h-5" /> },
    { id: 'find-internships', label: 'Explore', icon: <Search className="w-5 h-5" /> },
    { id: 'applications', label: 'Applications', icon: <BookmarkCheck className="w-5 h-5" /> },
    { id: 'my-profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
  ];

  const recruiterItems = [
    { id: 'recruiter-dashboard', label: 'Dashboard', icon: <Building className="w-5 h-5" /> },
    { id: 'create-internship', label: 'Post', icon: <PlusCircle className="w-5 h-5" /> },
    { id: 'candidate-discovery', label: 'Candidates', icon: <Users className="w-5 h-5" /> },
    { id: 'shortlists', label: 'Shortlist', icon: <BookmarkCheck className="w-5 h-5" /> },
  ];

  const items = currentRole === 'student' ? studentItems : recruiterItems;

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200 safe-bottom">
      <div className="grid grid-cols-4 h-16">
        {items.map((item) => {
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center py-1 transition-colors ${
                isActive ? 'text-[#4285F4]' : 'text-slate-500 hover:text-slate-900'
              }`}
            >
              <span className="shrink-0">{item.icon}</span>
              <span className={`text-[10px] mt-1 font-medium ${isActive ? 'font-bold' : ''}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
