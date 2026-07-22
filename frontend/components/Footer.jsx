export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="mt-auto border-t border-emerald-800/20 bg-gradient-to-r from-emerald-50 via-[var(--card-bg)] to-emerald-50">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-center sm:flex-row sm:text-left">
                <div className="flex items-center gap-2">
                    <span className="heartbeat-hover flex h-8 w-8 items-center justify-center rounded-full brand-gradient text-sm text-white shadow-[0_0_10px_1px_rgba(139,92,246,0.30)]">
                        🏦
                    </span>
                    <p className="font-heading text-sm text-gray-700">
                        Bank Management System
                    </p>
                </div>

                <p className="text-xs text-emerald-700/70">
                    &copy; {year} Bank Management System. All rights reserved.
                </p>

                <p className="text-xs font-medium text-emerald-600">
                    Secure Digital Banking Portal
                </p>
            </div>
        </footer>
    );
}