/**
 * Support Error Page
 *
 * Public error page for support-related errors
 */

"use client";

import { useSearchParams } from "next/navigation";

const errorMessages: Record<string, { title: string; description: string }> = {
  MISSING_TOKEN: {
    title: "Missing Token",
    description: "No access token provided. Please use the link from your application.",
  },
  TOKEN_EXPIRED: {
    title: "Token Expired",
    description: "Your access token has expired. Please request a new link from your application.",
  },
  INVALID_TOKEN: {
    title: "Invalid Token",
    description: "The access token is invalid. Please use the link from your application.",
  },
  CHANNEL_NOT_FOUND: {
    title: "Channel Not Found",
    description: "The support channel is not available. Please contact support.",
  },
  UNKNOWN: {
    title: "Something Went Wrong",
    description: "An error occurred. Please try again later or contact support.",
  },
};

export default function SupportErrorPage() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error") || "UNKNOWN";
  const errorInfo = errorMessages[error] || errorMessages.UNKNOWN;

  const handleGoBack = () => {
    window.history.back();
  };

  const handleClose = () => {
    window.close();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 text-center border border-slate-200 dark:border-slate-700">
          {/* Error Icon */}
          <div className="w-16 h-16 rounded-full bg-red-100 dark:bg-red-950 flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          {/* Error Message */}
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            {errorInfo.title}
          </h1>
          <p className="text-slate-600 dark:text-slate-400 mb-6">
            {errorInfo.description}
          </p>

          {/* Error Code */}
          {error !== "UNKNOWN" && (
            <div className="bg-slate-100 dark:bg-slate-900 rounded-lg px-4 py-2 mb-6">
              <code className="text-sm text-slate-500 dark:text-slate-400">{error}</code>
            </div>
          )}

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={handleGoBack}
              className="px-6 py-2.5 bg-slate-900 dark:bg-slate-700 text-white rounded-lg hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors"
            >
              Go Back
            </button>
            <button
              onClick={handleClose}
              className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
            >
              Close Window
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
