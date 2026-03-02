import React from 'react';
import { NavLink } from 'react-router-dom';

export default function Header() {
    return (
        <header className="glass-strong border-b border-slate-200/50 dark:border-white/10 px-4 md:px-6 py-3 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                    <img src="/logo.svg" alt="Doclify" className="w-8 h-8" />
                    <h1 className="text-xl font-bold bg-gradient-to-r from-primary-600 to-primary-500 bg-clip-text text-transparent">
                        Doclify
                    </h1>
                </div>

                <nav className="flex items-center gap-1 bg-dark-100/50 dark:bg-dark-800/50 p-1 rounded-lg border border-white/10">
                    <NavLink
                        to="/"
                        end
                        className={({ isActive }) =>
                            `px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${isActive
                                ? 'bg-white dark:bg-dark-700 text-primary-600 dark:text-primary-400 shadow-sm'
                                : 'text-dark-500 dark:text-dark-400 hover:text-dark-700 dark:hover:text-dark-200'
                            }`
                        }
                    >
                        Markdown
                    </NavLink>
                    <NavLink
                        to="/html"
                        className={({ isActive }) =>
                            `px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${isActive
                                ? 'bg-white dark:bg-dark-700 text-primary-600 dark:text-primary-400 shadow-sm'
                                : 'text-dark-500 dark:text-dark-400 hover:text-dark-700 dark:hover:text-dark-200'
                            }`
                        }
                    >
                        HTML
                    </NavLink>
                    <NavLink
                        to="/json"
                        className={({ isActive }) =>
                            `px-4 py-1.5 rounded-md text-sm font-medium transition-all duration-200 ${isActive
                                ? 'bg-white dark:bg-dark-700 text-primary-600 dark:text-primary-400 shadow-sm'
                                : 'text-dark-500 dark:text-dark-400 hover:text-dark-700 dark:hover:text-dark-200'
                            }`
                        }
                    >
                        JSON
                    </NavLink>
                </nav>
            </div>

            {/* AI Status or other global indicators could go here */}
        </header>
    );
}
