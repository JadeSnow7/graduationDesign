/**
 * Drawer - Slide-in panel component
 * 
 * Features:
 * - Right-side slide-in animation
 * - Backdrop overlay with click-to-close
 * - ESC key to close
 * - Body scroll lock when open
 * - Responsive width options
 */

import { useEffect, useCallback } from 'react';
import { X } from 'lucide-react';
import clsx from 'clsx';
import './Drawer.css';

interface DrawerProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: React.ReactNode;
    width?: 'sm' | 'md' | 'lg';
}

const widthClasses = {
    sm: 'drawer-width-sm',
    md: 'drawer-width-md',
    lg: 'drawer-width-lg',
};

export function Drawer({ isOpen, onClose, title, children, width = 'md' }: DrawerProps) {
    // Handle ESC key
    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') {
            onClose();
        }
    }, [onClose]);

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        }
        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = '';
        };
    }, [isOpen, handleKeyDown]);

    if (!isOpen) return null;

    return (
        <div className="drawer-container">
            {/* Backdrop */}
            <div
                className="drawer-backdrop"
                onClick={onClose}
                aria-hidden="true"
            />

            {/* Panel */}
            <div className={clsx('drawer-panel', widthClasses[width])}>
                {/* Header */}
                <div className="drawer-header">
                    <h2 className="drawer-title">{title}</h2>
                    <button
                        onClick={onClose}
                        className="drawer-close-btn"
                        aria-label="Close drawer"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Content */}
                <div className="drawer-content">
                    {children}
                </div>
            </div>
        </div>
    );
}
