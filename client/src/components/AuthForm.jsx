import React from 'react';

export default function AuthForm({ title, children, onSubmit, error }) {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="w-full max-w-md p-8 space-y-4 bg-white dark:bg-gray-800 rounded-2xl shadow-xl">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">{title}</h2>
        <form onSubmit={onSubmit} className="space-y-4">
          {children}
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
        </form>
      </div>
    </div>
  );
}