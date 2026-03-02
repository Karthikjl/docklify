import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Header() {
    return (
        <header className="glass-strong border-b border-slate-200/50 dark:border-white/10 px-4 md:px-6 py-3 flex flex-wrap items-center justify-between gap-4 slide-in-down">
            <div className="flex items-center gap-6">
                {/* Logo */}
                <div className="flex items-center gap-3 animate-in">
                    <img
                        src="/logo.svg"
                        alt="Doclify"
                        className="w-8 h-8 logo-spin cursor-pointer"
                        style={{ transition: 'transform 0.3s cubic-bezier(0.34,1.56,0.64,1)' }}
                    />
                    <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent"
                        style={{ animation: 'fadeSlideUp 0.4s 0.05s cubic-bezier(0.16,1,0.3,1) both' }}>
                        Doclify
                    </h1>
                </div>

                {/* Nav */}
                <nav
                    className="flex items-center gap-1 bg-dark-100/50 dark:bg-dark-800/50 p-1 rounded-lg border border-white/10"
                    style={{ animation: 'fadeSlideUp 0.4s 0.1s cubic-bezier(0.16,1,0.3,1) both' }}
                >
                    {['/', '/html', '/json'].map((path, i) => {
                        const labels = { '/': 'Markdown', '/html': 'HTML', '/json': 'JSON' };
                        return (
                            <NavLink
                                key={path}
                                to={path}
                                end={path === '/'}
                                className={({ isActive }) =>
                                    `nav-indicator px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${
                                        isActive
                                            ? 'bg-white dark:bg-dark-700 text-primary-600 dark:text-primary-400 shadow-sm scale-in'
                                            : 'text-dark-500 dark:text-dark-400 hover:text-dark-700 dark:hover:text-dark-200'
                                    }`
                                }
                                style={{ animationDelay: `${0.12 + i * 0.05}s` }}
                            >
                                {labels[path]}
                            </NavLink>
                        );
                    })}
                </nav>
            </div>
        </header>
    );
}
