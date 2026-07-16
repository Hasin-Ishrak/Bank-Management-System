export default function Footer() {
    const year = new Date().getFullYear();

    return (
        <footer className="mt-auto border-t border-green-900/10 bg-white">
            <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-6 py-6 text-center sm:flex-row sm:text-left">
                <div className="flex items-center gap-2">
                    <span className="flex h-8 w-8 items-center justify-center rounded-full bg-green-900 text-sm text-white">
                        🏦
                    </span>
                    <p className="text-sm font-semibold text-green-900">
                        Bank Management System
                    </p>
                </div>

                <p className="text-xs text-gray-500">
                    &copy; {year} Bank Management System. All rights reserved.
                </p>

                <p className="text-xs font-medium text-gray-400">
                    Secure Digital Banking Portal
                </p>
            </div>
        </footer>
    );
}
