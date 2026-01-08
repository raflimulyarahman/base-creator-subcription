"use client";
import { useEffect } from "react";

export default function ToastSuccess({ message, show, onClose }) {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onClose();
            }, 3000);
            return () => clearTimeout(timer);
        }
    }, [show, onClose]);

    if (!show) return null;

    return (
        <div
            className="fixed top-4 left-1/2 transform -translate-x-1/2 max-w-xs bg-white border border-green-200 rounded-xl shadow-lg z-50"
            role="alert"
            tabIndex={-1}
            aria-labelledby="hs-toast-success-example-label"
        >
            <div className="flex p-2">
                <div className="shrink-0">
                    <svg
                        className="shrink-0 w-4 h-4 text-green-500 mt-0.5"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                    >
                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM6.97 11.03a.75.75 0 0 0 1.08 0l3.992-3.993a.75.75 0 1 0-1.06-1.06L7.5 9.439 5.998 7.937a.75.75 0 1 0-1.06 1.06l2.032 2.033z" />
                    </svg>
                </div>

                <div className="ms-3">
                    <p
                        id="hs-toast-success-example-label"
                        className="text-sm text-gray-600"
                    >
                        {message}
                    </p>
                </div>
            </div>
        </div>

    );
}
