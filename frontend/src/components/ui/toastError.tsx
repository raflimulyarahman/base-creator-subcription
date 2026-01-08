"use client";
import { useEffect } from "react";

export default function toastError({ message, show, onClose }) {
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
            className="fixed top-4 left-1/2 transform -translate-x-1/2 max-w-xs bg-white border border-gray-200 rounded-xl shadow-lg  z-50"
            role="alert"
            tabIndex={-1}
            aria-labelledby="hs-toast-error-example-label"
        >
            <div className="flex p-2">
                <div className="shrink-0">
                    <svg
                        className="shrink-0 size-4 text-red-500 mt-0.5"
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        viewBox="0 0 16 16"
                    >
                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0zM5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293 5.354 4.646z" />
                    </svg>
                </div>

                <div className="ms-3">
                    <p
                        id="hs-toast-error-example-label"
                        className="text-sm text-gray-600"
                    >
                        {message}
                    </p>
                </div>
            </div>
        </div>
    );
}
