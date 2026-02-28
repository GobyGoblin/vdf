import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, ChevronDown, User, Building2, Shield, Settings, LayoutDashboard, Bell, LogOut } from 'lucide-react';
import { authAPI } from '@/lib/api';
// Use the logo from public folder
const logo = '/logo.png';

const navigation = [
    { name: 'About', href: '/about' },
    {
        name: 'Solutions',
        href: '/solutions',
        children: [
            { name: 'For Companies', href: '/for-companies', icon: Building2 },
            { name: 'For Workers', href: '/for-workers', icon: User },
        ]
    },
    { name: 'Insights', href: '/insights' },
    { name: 'Contact', href: '/contact' },
];

const mockUser = {
    role: null as 'candidate' | 'employer' | 'staff' | 'admin' | null,
};

export const Navbar = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [userMenuOpen, setUserMenuOpen] = useState(false);
    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
    const location = useLocation();
    const navigate = useNavigate();

    const isActive = (href: string) => location.pathname === href || location.pathname.startsWith(href + '/');

    const [user, setUser] = useState<any>(null);
    const [borderRadius, setBorderRadius] = useState(0);
    const [shadowAlpha, setShadowAlpha] = useState(0);

    useEffect(() => {
        const checkAuth = async () => {
            try {
                const { user: userData } = await authAPI.getMe();
                setUser(userData);
            } catch (err) {
                setUser(null);
            }
        };
        checkAuth();

        const handleScroll = () => {
            const scrollY = window.scrollY;

            // Radius goes from 0 to 30 over 100px of scroll
            const newRadius = Math.min(30, scrollY / 3);
            setBorderRadius(newRadius);

            // Shadow alpha from 0 to 0.1 over 100px
            const newAlpha = Math.min(0.1, scrollY / 1000);
            setShadowAlpha(newAlpha);
        };

        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        authAPI.logout();
        setUser(null);
        setUserMenuOpen(false);
        navigate('/');
    };

    return (
        <motion.nav
            className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-gray-100"
            animate={{
                borderBottomLeftRadius: `${borderRadius}px`,
                borderBottomRightRadius: `${borderRadius}px`,
                boxShadow: `0 10px 30px rgba(0,0,0,${shadowAlpha})`
            }}
            transition={{
                type: "tween",
                duration: 0.4,
                ease: "easeOut"
            }}
        >
            <div className="container-premium">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center gap-3">
                        <img src={logo} alt="German Business Portal" className="h-20 w-auto" />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden lg:flex items-center gap-8">
                        {navigation.map((item) => (
                            <div
                                key={item.name}
                                className="relative"
                                onMouseEnter={() => item.children && setActiveDropdown(item.name)}
                                onMouseLeave={() => setActiveDropdown(null)}
                            >
                                <Link
                                    to={item.href}
                                    className={`flex items-center gap-1 text-sm font-bold transition-colors duration-200 ${isActive(item.href) ? 'text-gold' : 'text-navy/80 hover:text-navy'
                                        }`}
                                >
                                    {item.name}
                                    {item.children && <ChevronDown className="w-4 h-4" />}
                                </Link>

                                {/* Dropdown */}
                                <AnimatePresence>
                                    {item.children && activeDropdown === item.name && (
                                        <motion.div
                                            initial={{ opacity: 0, y: 8 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            exit={{ opacity: 0, y: 8 }}
                                            transition={{ duration: 0.2 }}
                                            className="absolute top-full left-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
                                        >
                                            {item.children.map((child) => (
                                                <Link
                                                    key={child.name}
                                                    to={child.href}
                                                    className="flex items-center gap-3 px-4 py-3 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                                                >
                                                    <child.icon className="w-5 h-5 text-gold" />
                                                    {child.name}
                                                </Link>
                                            ))}
                                        </motion.div>
                                    )}
                                </AnimatePresence>
                            </div>
                        ))}
                    </div>

                    {/* CTA Buttons */}
                    <div className="hidden lg:flex items-center gap-4">
                        {user ? (
                            <div className="flex items-center gap-3 relative">
                                <button className="relative p-2 text-navy/70 hover:text-navy transition-colors">
                                    <Bell className="w-5 h-5" />
                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gold rounded-full border-2 border-white" />
                                </button>
                                <div className="relative">
                                    <button
                                        onClick={() => setUserMenuOpen(!userMenuOpen)}
                                        className="w-10 h-10 rounded-full bg-gold/10 text-gold hover:bg-gold/20 flex items-center justify-center transition-colors overflow-hidden border border-gold/20"
                                        title="User Menu"
                                    >
                                        <User className="w-5 h-5" />
                                    </button>

                                    {/* User Dropdown Menu */}
                                    <AnimatePresence>
                                        {userMenuOpen && (
                                            <motion.div
                                                initial={{ opacity: 0, scale: 0.95, y: 10 }}
                                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                                exit={{ opacity: 0, scale: 0.95, y: 10 }}
                                                className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-100 overflow-hidden"
                                            >
                                                <div className="px-4 py-3 border-b border-gray-50 flex flex-col">
                                                    <span className="text-sm font-bold text-navy truncate">{user.firstName} {user.lastName}</span>
                                                    <span className="text-[10px] uppercase tracking-wider text-navy/40 font-bold">{user.role}</span>
                                                </div>
                                                <div className="py-1">
                                                    <Link
                                                        to={user?.role ? `/${user.role}/dashboard` : '/login'}
                                                        className="flex items-center gap-3 px-4 py-2 text-sm text-navy/70 hover:text-navy hover:bg-gray-50 transition-colors"
                                                        onClick={() => setUserMenuOpen(false)}
                                                    >
                                                        <LayoutDashboard className="w-4 h-4" />
                                                        Dashboard
                                                    </Link>
                                                    {user?.role === 'candidate' && (
                                                        <>
                                                            <Link
                                                                to="/candidate/profile"
                                                                className="flex items-center gap-3 px-4 py-2 text-sm text-navy/70 hover:text-navy hover:bg-gray-50 transition-colors"
                                                                onClick={() => setUserMenuOpen(false)}
                                                            >
                                                                <User className="w-4 h-4" />
                                                                Profile Information
                                                            </Link>
                                                            <Link
                                                                to="/candidate/documents"
                                                                className="flex items-center gap-3 px-4 py-2 text-sm text-navy/70 hover:text-navy hover:bg-gray-50 transition-colors"
                                                                onClick={() => setUserMenuOpen(false)}
                                                            >
                                                                <Settings className="w-4 h-4" />
                                                                My Documents
                                                            </Link>
                                                        </>
                                                    )}
                                                </div>
                                                <div className="border-t border-gray-50 py-1">
                                                    <button
                                                        onClick={handleLogout}
                                                        className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-500 hover:bg-red-50/50 transition-colors"
                                                    >
                                                        <LogOut className="w-4 h-4" />
                                                        Sign Out
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>
                                </div>
                            </div>
                        ) : (
                            <>
                                <Link
                                    to="/login"
                                    className="text-sm font-medium text-navy/70 hover:text-navy transition-colors"
                                >
                                    Sign In
                                </Link>
                                <Link
                                    to="/register"
                                    className="px-5 py-2.5 rounded-lg btn-gold text-sm font-semibold"
                                >
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>

                    {/* Mobile Menu Button */}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className="lg:hidden p-2 text-navy"
                    >
                        {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="lg:hidden bg-white border-t border-gray-100 shadow-xl"
                    >
                        <div className="container-premium py-4 space-y-2">
                            {navigation.map((item) => (
                                <div key={item.name}>
                                    <Link
                                        to={item.href}
                                        onClick={() => setIsOpen(false)}
                                        className={`block px-4 py-3 rounded-lg text-sm font-medium ${isActive(item.href) ? 'text-gold bg-gold/5' : 'text-navy/80 hover:text-navy'
                                            }`}
                                    >
                                        {item.name}
                                    </Link>
                                    {item.children && (
                                        <div className="ml-4 mt-1 space-y-1">
                                            {item.children.map((child) => (
                                                <Link
                                                    key={child.name}
                                                    to={child.href}
                                                    onClick={() => setIsOpen(false)}
                                                    className="flex items-center gap-2 px-4 py-2 text-sm text-navy/60 hover:text-navy"
                                                >
                                                    <child.icon className="w-4 h-4" />
                                                    {child.name}
                                                </Link>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                            <div className="pt-4 border-t border-gray-100 space-y-2">
                                {user ? (
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between px-4 py-3 bg-gray-50 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-gold/10 text-gold flex items-center justify-center border border-gold/20">
                                                    <User className="w-5 h-5" />
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-sm font-bold text-navy">{user.firstName} {user.lastName}</span>
                                                    <span className="text-[10px] uppercase tracking-wider text-navy/40 font-bold">{user.role}</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <button className="relative p-2 text-navy/70">
                                                    <Bell className="w-5 h-5" />
                                                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-gold rounded-full border-2 border-white" />
                                                </button>
                                                <Link
                                                    to={user?.role ? `/${user.role}/dashboard` : '/login'}
                                                    onClick={() => setIsOpen(false)}
                                                    className="p-2 text-gold"
                                                >
                                                    <LayoutDashboard className="w-5 h-5" />
                                                </Link>
                                            </div>
                                        </div>
                                        <div className="py-2 space-y-1">
                                            {user?.role === 'candidate' && (
                                                <>
                                                    <Link
                                                        to="/candidate/profile"
                                                        onClick={() => setIsOpen(false)}
                                                        className="flex items-center gap-3 px-4 py-2 text-sm text-navy/70 hover:text-navy"
                                                    >
                                                        <User className="w-4 h-4" />
                                                        Profile Information
                                                    </Link>
                                                    <Link
                                                        to="/candidate/documents"
                                                        onClick={() => setIsOpen(false)}
                                                        className="flex items-center gap-3 px-4 py-2 text-sm text-navy/70 hover:text-navy"
                                                    >
                                                        <Settings className="w-4 h-4" />
                                                        My Documents
                                                    </Link>
                                                </>
                                            )}
                                            <button
                                                onClick={handleLogout}
                                                className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-500"
                                            >
                                                <LogOut className="w-4 h-4" />
                                                Sign Out
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <>
                                        <Link
                                            to="/login"
                                            onClick={() => setIsOpen(false)}
                                            className="block px-4 py-3 text-sm font-medium text-navy/80"
                                        >
                                            Sign In
                                        </Link>
                                        <Link
                                            to="/register"
                                            onClick={() => setIsOpen(false)}
                                            className="block px-4 py-3 rounded-lg btn-gold text-sm font-semibold text-center"
                                        >
                                            Get Started
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
};
