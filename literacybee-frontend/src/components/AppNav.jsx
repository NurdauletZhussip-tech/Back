import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { FaAward, FaChartLine, FaHome, FaSignOutAlt, FaTrophy } from 'react-icons/fa';
import { logout } from '../store/authSlice';

const roleHome = {
  child: '/child/dashboard',
  parent: '/parent/dashboard',
  admin: '/admin'
};

export default function AppNav({ title = 'LiteracyBee' }) {
  const dispatch = useDispatch();
  const location = useLocation();
  const { role, user } = useSelector((state) => state.auth);
  const homePath = roleHome[role] || '/';

  const links = [
    { to: homePath, label: 'Главная', icon: <FaHome /> },
    { to: '/leaderboard', label: 'Лидерборд', icon: <FaTrophy /> },
    { to: '/badges', label: 'Бейджи', icon: <FaAward /> }
  ];

  if (role === 'admin') {
    links.push({ to: '/admin/badges', label: 'Админ', icon: <FaChartLine /> });
  }

  return (
    <div className="app-nav">
      <Link to={homePath} className="app-nav-brand">
        <span className="brand-mark">LB</span>
        <span>{title}</span>
      </Link>

      <div className="app-nav-links">
        {links.map(link => (
          <Link
            key={link.to}
            to={link.to}
            className={`app-nav-link ${location.pathname === link.to ? 'active' : ''}`}
          >
            {link.icon}
            <span>{link.label}</span>
          </Link>
        ))}
      </div>

      <div className="app-nav-user">
        <span className="app-nav-name">{user?.name || role || 'user'}</span>
        <button className="app-nav-logout" onClick={() => dispatch(logout())} title="Выйти">
          <FaSignOutAlt />
        </button>
      </div>
    </div>
  );
}
