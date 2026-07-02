import { useState, useMemo, FormEvent, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  ChevronDown, 
  Plus, 
  Edit, 
  UserMinus, 
  UserCheck, 
  Phone, 
  MapPin, 
  Briefcase, 
  Calendar, 
  X, 
  MoreHorizontal,
  Trash2,
  ChevronUp
} from 'lucide-react';

interface UserRecord {
  id: string;
  name: string;
  phone: string;
  role: string;
  location: string;
  dateAdded: string;
  status: 'Active' | 'Inactive';
}

const INITIAL_USERS: UserRecord[] = [
  { id: 'U001', name: 'Adaeze Okonkwo', phone: '+234 801 234 5678', role: 'National Officer', location: 'FMOH — National', dateAdded: 'Jan 12, 2026', status: 'Active' },
  { id: 'U002', name: 'Emeka Nwosu', phone: '+234 802 345 6789', role: 'State Store Officer', location: 'Kaduna State', dateAdded: 'Feb 3, 2026', status: 'Active' },
  { id: 'U003', name: 'Fatima Aliyu', phone: '+234 803 456 7890', role: 'MCCO', location: 'Kano State', dateAdded: 'Feb 14, 2026', status: 'Active' },
  { id: 'U004', name: 'Chukwudi Obi', phone: '+234 804 567 8901', role: '3PL Officer', location: 'Rivers State', dateAdded: 'Mar 1, 2026', status: 'Active' },
  { id: 'U005', name: 'Amina Bello', phone: '+234 805 678 9012', role: 'LGA Store Officer', location: 'Borno State', dateAdded: 'Mar 15, 2026', status: 'Active' },
  { id: 'U006', name: 'Taiwo Adeleke', phone: '+234 806 789 0123', role: 'EHF In-Charge', location: 'Oyo State', dateAdded: 'Apr 2, 2026', status: 'Active' },
  { id: 'U007', name: 'Musa Ibrahim', phone: '+234 807 890 1234', role: 'UHF In-Charge', location: 'Plateau State', dateAdded: 'Apr 20, 2026', status: 'Inactive' },
  { id: 'U008', name: 'Ngozi Eze', phone: '+234 808 901 2345', role: 'SLWG Member', location: 'FMOH — National', dateAdded: 'May 5, 2026', status: 'Active' }
];

const ROLES_LIST = ['National Officer', 'State Store Officer', 'MCCO', '3PL Officer', 'LGA Store Officer', 'EHF In-Charge', 'UHF In-Charge', 'SLWG Member'];
const LOCATIONS_LIST = ['FMOH — National', 'Kaduna State', 'Kano State', 'Rivers State', 'Borno State', 'Oyo State', 'Plateau State', 'Lagos State', 'Anambra State', 'Delta State'];

interface UsersViewProps {
  isNewUserModalOpen: boolean;
  setIsNewUserModalOpen: (open: boolean) => void;
}

export function UsersView({ isNewUserModalOpen, setIsNewUserModalOpen }: UsersViewProps) {
  const [users, setUsers] = useState<UserRecord[]>(INITIAL_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedLocation, setSelectedLocation] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [isEditingUserModalOpen, setIsEditingUserModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserRecord | null>(null);
  const [newUser, setNewUser] = useState({ name: '', phone: '', role: 'National Officer', location: 'FMOH — National', status: 'Active' as 'Active' | 'Inactive' });
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [expandedMobileUserId, setExpandedMobileUserId] = useState<string | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const itemsPerPage = 8;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpenMenuId(null);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const stats = useMemo(() => {
    const total = users.length;
    const active = users.filter(u => u.status === 'Active').length;
    const inactive = total - active;
    const uniqueRoles = new Set(users.map(u => u.role)).size;
    return { total, active, inactive, roles: uniqueRoles };
  }, [users]);

  const getInitials = (name: string) => name.split(' ').map(n => n[0]).join('').toUpperCase().substring(0, 2);

  const getAvatarBg = (name: string) => {
    const colors = ['bg-blue-50 text-blue-700 border-blue-150', 'bg-emerald-50 text-emerald-700 border-emerald-150', 'bg-indigo-50 text-indigo-700 border-indigo-150', 'bg-purple-50 text-purple-700 border-purple-150', 'bg-amber-50 text-amber-700 border-amber-150', 'bg-rose-50 text-rose-700 border-rose-150', 'bg-teal-50 text-teal-700 border-teal-150'];
    let sum = 0;
    for (let i = 0; i < name.length; i++) sum += name.charCodeAt(i);
    return colors[sum % colors.length];
  };

  const handleToggleStatus = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, status: u.status === 'Active' ? 'Inactive' : 'Active' } : u));
    setOpenMenuId(null);
  };

  const handleDelete = (id: string) => {
    setUsers(prev => prev.filter(u => u.id !== id));
    setOpenMenuId(null);
  };

  const handleEditSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setUsers(prev => prev.map(u => u.id === editingUser.id ? editingUser : u));
    setIsEditingUserModalOpen(false);
    setEditingUser(null);
  };

  const handleAddSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (!newUser.name.trim() || !newUser.phone.trim()) return;
    const addedUser: UserRecord = {
      id: `U00${users.length + 100}`,
      name: newUser.name,
      phone: newUser.phone,
      role: newUser.role,
      location: newUser.location,
      dateAdded: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
      status: newUser.status
    };
    setUsers(prev => [addedUser, ...prev]);
    setIsNewUserModalOpen(false);
    setNewUser({ name: '', phone: '', role: 'National Officer', location: 'FMOH — National', status: 'Active' });
  };

  const filteredUsers = useMemo(() => users.filter(user => {
    const matchSearch = user.name.toLowerCase().includes(searchQuery.toLowerCase()) || user.phone.includes(searchQuery);
    const matchRole = selectedRole === 'all' || user.role === selectedRole;
    const matchLocation = selectedLocation === 'all' || user.location === selectedLocation;
    const matchStatus = selectedStatus === 'all' || user.status === selectedStatus;
    return matchSearch && matchRole && matchLocation && matchStatus;
  }), [users, searchQuery, selectedRole, selectedLocation, selectedStatus]);

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return filteredUsers.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredUsers, currentPage]);

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / itemsPerPage));

  const ActionMenu = ({ user }: { user: UserRecord }) => (
    <div className="relative" ref={openMenuId === user.id ? menuRef : null}>
      <button onClick={() => setOpenMenuId(openMenuId === user.id ? null : user.id)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-400 hover:text-slate-600">
        <MoreHorizontal className="w-5 h-5" />
      </button>
      <AnimatePresence>
        {openMenuId === user.id && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="absolute right-0 top-full mt-1 w-40 bg-white border border-slate-100 rounded-xl shadow-lg z-50 py-1">
            <button onClick={() => { setEditingUser({ ...user }); setIsEditingUserModalOpen(true); setOpenMenuId(null); }} className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2"><Edit className="w-3.5 h-3.5" /> Edit</button>
            <button onClick={() => handleToggleStatus(user.id)} className="w-full text-left px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 flex items-center gap-2">{user.status === 'Active' ? <UserMinus className="w-3.5 h-3.5" /> : <UserCheck className="w-3.5 h-3.5" />} {user.status === 'Active' ? 'Deactivate' : 'Reactivate'}</button>
            <button onClick={() => handleDelete(user.id)} className="w-full text-left px-4 py-2 text-xs font-bold text-red-600 hover:bg-red-50 flex items-center gap-2"><Trash2 className="w-3.5 h-3.5" /> Delete</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <div className="flex flex-col gap-4 w-full" id="user-management-view">
      <div className="flex flex-row gap-3 overflow-x-auto pb-2 -mb-2" id="user-stats-grid">
        {[
          { label: 'TOTAL USERS', val: stats.total + 240, color: '#3b82f6' },
          { label: 'ACTIVE USERS', val: stats.active + 240, color: '#10b981' },
          { label: 'INACTIVE USERS', val: stats.inactive, color: '#64748b' },
          { label: 'ROLES', val: stats.roles + 15, color: '#0f766e' }
        ].map((card, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-slate-100 border-l-4 shadow-3xs flex flex-col gap-1 select-none min-w-[160px] flex-1" style={{ borderLeftColor: card.color }}>
            <span className="text-[9px] font-extrabold text-slate-400 tracking-wider font-display uppercase">{card.label}</span>
            <span className="text-2xl font-bold text-slate-800 font-display mt-1">{card.val}</span>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs p-4 flex flex-col gap-3" id="user-filters-card">
        <div className="relative">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400"><Search className="w-4 h-4" /></span>
          <input type="text" placeholder="Search..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} className="w-full bg-slate-50 border border-slate-200 focus:border-teal-500 focus:bg-white text-slate-800 text-xs rounded-xl pl-9 pr-4 py-2 outline-none transition-all min-h-[40px] font-medium" />
        </div>
        <div className="grid grid-cols-12 gap-3">
          <div className="col-span-4 relative">
            <select value={selectedRole} onChange={(e) => setSelectedRole(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-teal-500 appearance-none min-h-[40px]"><option value="all">Role</option>{ROLES_LIST.map(role => <option key={role} value={role}>{role}</option>)}</select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>
          <div className="col-span-4 relative">
            <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-teal-500 appearance-none min-h-[40px]"><option value="all">Location</option>{LOCATIONS_LIST.map(loc => <option key={loc} value={loc}>{loc}</option>)}</select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>
          <div className="col-span-4 relative">
            <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 outline-none focus:border-teal-500 appearance-none min-h-[40px]"><option value="all">Status</option><option value="Active">Active</option><option value="Inactive">Inactive</option></select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-xs overflow-hidden" id="users-data-panel">
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full min-w-[950px] border-collapse text-left text-xs text-slate-600 bg-white">
            <thead className="bg-slate-50/50 text-[9px] font-bold text-slate-400 uppercase tracking-wider font-display border-b border-slate-150">
              <tr>
                <th className="py-3 px-4 font-bold">Name</th>
                <th className="py-3 px-4 font-bold">Phone Number</th>
                <th className="py-3 px-4 font-bold">Role</th>
                <th className="py-3 px-4 font-bold">State / Location</th>
                <th className="py-3 px-4 font-bold">Date Added</th>
                <th className="py-3 px-4 font-bold">Status</th>
                <th className="py-3 px-4 text-right font-bold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {paginatedUsers.map(user => (
                <tr key={user.id} className="hover:bg-slate-50/50">
                  <td className="py-3 px-4"><div className="flex items-center gap-3"><div className={`w-8 h-8 rounded-full border flex items-center justify-center font-bold text-[11px] ${getAvatarBg(user.name)}`}>{getInitials(user.name)}</div><span className="font-bold text-slate-800">{user.name}</span></div></td>
                  <td className="py-3 px-4 font-medium">{user.phone}</td>
                  <td className="py-3 px-4"><span className="bg-slate-50 border border-slate-100 rounded-lg px-2 py-1">{user.role}</span></td>
                  <td className="py-3 px-4">{user.location}</td>
                  <td className="py-3 px-4">{user.dateAdded}</td>
                  <td className="py-3 px-4"><span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${user.status === 'Active' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-slate-50 text-slate-400 border-slate-200'}`}>{user.status}</span></td>
                  <td className="py-3 px-4 text-right"><ActionMenu user={user} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="md:hidden divide-y divide-slate-100">
          {paginatedUsers.map(user => (
            <div key={user.id} className="p-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full border flex items-center justify-center font-bold text-xs ${getAvatarBg(user.name)}`}>{getInitials(user.name)}</div>
                  <div className="flex flex-col"><span className="font-bold text-slate-800 text-sm">{user.name}</span><button onClick={() => setExpandedMobileUserId(expandedMobileUserId === user.id ? null : user.id)} className="flex items-center text-[10px] text-slate-400 font-bold uppercase">{expandedMobileUserId === user.id ? 'Hide Details' : 'View Details'} {expandedMobileUserId === user.id ? <ChevronUp className="w-3 h-3 ml-1" /> : <ChevronDown className="w-3 h-3 ml-1" />}</button></div>
                </div>
                <ActionMenu user={user} />
              </div>
              <AnimatePresence>
                {expandedMobileUserId === user.id && (
                  <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                    <div className="grid grid-cols-2 gap-2 text-[11px] bg-slate-50 rounded-xl p-2.5 mt-2">
                      <div className="col-span-2"><strong>Role:</strong> {user.role}</div>
                      <div><strong>Location:</strong> {user.location}</div>
                      <div><strong>Status:</strong> {user.status}</div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
