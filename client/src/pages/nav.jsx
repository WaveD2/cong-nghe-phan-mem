import { useState, useEffect, useRef } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/authContext';
import { useLocation } from 'react-router-dom';
import { Menu, X, User, LogOut, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function Nav() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
    const { isAuthenticated, user, logout } = useAuth();
    const location = useLocation();
    const userMenuRef = useRef(null);

    useEffect(() => {
        setIsMobileMenuOpen(false);
        setIsUserMenuOpen(false);
    }, [isAuthenticated, location.pathname]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (userMenuRef.current && !userMenuRef.current.contains(event.target)) {
                setIsUserMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleMobileMenu = () => {
        setIsMobileMenuOpen(!isMobileMenuOpen);
        setIsUserMenuOpen(false);
    };

    const toggleUserMenu = () => {
        setIsUserMenuOpen(!isUserMenuOpen);
    };

    const navItems = [
        { name: 'Trang chủ', path: '/' },
        { name: 'Cửa hàng', path: '/store' },
        { name: 'Liên hệ', path: '/contact' },
    ];

    if (isAuthenticated) {
        navItems.push({ name: 'Giỏ hàng', path: '/cart' });
    }

    const navClass = "text-gray-700 hover:text-purple-600 transition-colors duration-300 font-medium";

    const navLinkVariants = {
        hidden: { opacity: 0, y: -10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
    };

    const mobileMenuVariants = {
        closed: { opacity: 0, x: "-100%" },
        open: { opacity: 1, x: 0, transition: { duration: 0.3, ease: 'easeInOut' } },
    };

    const dropdownVariants = {
        hidden: { opacity: 0, scaleY: 0 },
        visible: { opacity: 1, scaleY: 1, transition: { duration: 0.2, ease: 'easeOut' } },
    };

    return (
        <motion.nav
            className="bg-white shadow-lg sticky top-0 z-50"
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <NavLink to="/" className="flex-shrink-0 flex items-center">
                        <motion.span
                            className="text-2xl font-bold text-purple-600"
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            WaveD
                        </motion.span>
                    </NavLink>

                    {/* Desktop Menu */}
                    <div className="hidden sm:flex sm:items-center sm:space-x-6">
                        {navItems.map((item, index) => (
                            <motion.div
                                key={item.name}
                                variants={navLinkVariants}
                                initial="hidden"
                                animate="visible"
                                transition={{ delay: index * 0.1 }}
                            >
                                <NavLink
                                    to={item.path}
                                    className={({ isActive }) =>
                                        `${navClass} ${isActive ? 'text-purple-600 border-b-2 border-purple-600' : ''} px-3 py-2`
                                    }
                                >
                                    {item.name}
                                </NavLink>
                            </motion.div>
                        ))}
                        <div className="relative" ref={userMenuRef}>
                            <motion.button
                                onClick={toggleUserMenu}
                                className="flex items-center space-x-2 text-gray-700 hover:text-purple-600 transition-colors duration-300"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {isAuthenticated ? (
                                    <>
                                        <img
                                            src={user.avatar || 'https://via.placeholder.com/32'}
                                            alt="User Avatar"
                                            className="w-8 h-8 rounded-full object-cover"
                                        />
                                        <span className="font-medium">{user.name || 'User'}</span>
                                    </>
                                ) : (
                                    <>
                                        <User className="w-5 h-5" />
                                        <span>Tài khoản</span>
                                    </>
                                )}
                            </motion.button>
                            <AnimatePresence>
                                {isUserMenuOpen && (
                                    <motion.div
                                        className="absolute right-0 mt-2 w-max bg-white rounded-lg shadow-xl py-2 z-50"
                                        variants={dropdownVariants}
                                        initial="hidden"
                                        animate="visible"
                                        exit="hidden"
                                        style={{ transformOrigin: 'top' }}
                                    >
                                        {isAuthenticated ? (
                                            <>
                                                {
                                                    user.role === 'admin' &&
                                                    <NavLink
                                                        to={user.role === 'admin' ? '/dashboard' : '/dashboard/customer'}
                                                        className="flex items-center px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                                                        onClick={() => setIsUserMenuOpen(false)}
                                                    >
                                                        <Settings className="w-4 h-4 mr-2" />
                                                        {'Admin Dashboard'}
                                                    </NavLink>
                                                }
                                                <NavLink
                                                    to={`/user/${user._id}`}
                                                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                                                    onClick={() => {
                                                        console.log("user::", user);
                                                        setIsUserMenuOpen(false)
                                                    }}
                                                >
                                                    <User className="w-4 h-4 mr-2" />
                                                    Thông tin cá nhân
                                                </NavLink>
                                                <NavLink
                                                    to="/"
                                                    className="flex items-center px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                                                    onClick={() => logout()}
                                                >
                                                    <LogOut className="w-4 h-4 mr-2" />
                                                    Đăng xuất
                                                </NavLink>
                                            </>
                                        ) : (
                                            <>
                                                <NavLink
                                                    to="/login"
                                                    className="block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                >
                                                    Đăng nhập
                                                </NavLink>
                                                <NavLink
                                                    to="/register"
                                                    className="block px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                                                    onClick={() => setIsUserMenuOpen(false)}
                                                >
                                                    Đăng ký
                                                </NavLink>
                                            </>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </div>

                    {/* Mobile Menu Button */}
                    <div className="flex items-center sm:hidden">
                        <motion.button
                            onClick={toggleMobileMenu}
                            className="p-2 rounded-md text-gray-700 hover:text-purple-600 focus:outline-none"
                            whileTap={{ scale: 0.95 }}
                        >
                            {isMobileMenuOpen ? (
                                <X className="h-6 w-6" aria-hidden="true" />
                            ) : (
                                <Menu className="h-6 w-6" aria-hidden="true" />
                            )}
                        </motion.button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            <AnimatePresence>
                {isMobileMenuOpen && (
                    <motion.div
                        className="sm:hidden bg-white border-t"
                        initial="closed"
                        animate="open"
                        exit="closed"
                        variants={mobileMenuVariants}
                    >
                        <div className="pt-4 pb-3 space-y-1">
                            {navItems.map((item, index) => (
                                <motion.div
                                    key={item.name}
                                    variants={navLinkVariants}
                                    initial="hidden"
                                    animate="visible"
                                    transition={{ delay: index * 0.1 }}
                                >
                                    <NavLink
                                        to={item.path}
                                        className={({ isActive }) =>
                                            `${navClass} ${isActive ? 'text-purple-600 bg-purple-50' : ''} block px-4 py-2 text-base`
                                        }
                                        onClick={() => setIsMobileMenuOpen(false)}
                                    >
                                        {item.name}
                                    </NavLink>
                                </motion.div>
                            ))}
                            <motion.div
                                variants={navLinkVariants}
                                initial="hidden"
                                animate="visible"
                                transition={{ delay: navItems.length * 0.1 }}
                            >
                                {isAuthenticated ? (
                                    <div className="space-y-1">
                                        <div className="flex items-center px-4 py-2">
                                            <img
                                                src={user.avatar || 'https://via.placeholder.com/32'}
                                                alt="User Avatar"
                                                className="w-8 h-8 rounded-full object-cover mr-2"
                                            />
                                            <span className="font-medium text-gray-700">{user.name || 'User'}</span>
                                        </div>
                                        <NavLink
                                            to={user.role === 'admin' ? '/dashboard' : '/dashboard/customer'}
                                            className="flex items-center px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <Settings className="w-4 h-4 mr-2" />
                                            {user.role === 'admin' ? 'Admin Dashboard' : 'Hồ sơ'}
                                        </NavLink>
                                        <NavLink
                                            to="/logout"
                                            className="flex items-center px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <LogOut className="w-4 h-4 mr-2" />
                                            Đăng xuất
                                        </NavLink>
                                    </div>
                                ) : (
                                    <div className="space-y-1">
                                        <NavLink
                                            to="/login"
                                            className="flex items-center px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <User className="w-4 h-4 mr-2" />
                                            Đăng nhập
                                        </NavLink>
                                        <NavLink
                                            to="/register"
                                            className="flex items-center px-4 py-2 text-gray-700 hover:bg-purple-50 hover:text-purple-600"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <User className="w-4 h-4 mr-2" />
                                            Đăng ký
                                        </NavLink>
                                    </div>
                                )}
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.nav>
    );
}