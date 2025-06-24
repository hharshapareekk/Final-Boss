"use client";
import { CheckCircle } from 'lucide-react';
import Link from 'next/link';

export default function ThankYouPage() {
    return (
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col items-center justify-center text-center p-4">
            <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 md:p-12">
                <div className="flex justify-center mb-5">
                    <CheckCircle className="w-20 h-20 text-green-500" />
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-white">Thank You!</h1>
                <p className="mt-4 text-gray-600 dark:text-gray-400 text-lg">
                    Your feedback has been successfully submitted. We appreciate you taking the time to help us improve.
                </p>
                <div className="mt-8">
                    <Link href="/" legacyBehavior>
                        <a className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors duration-300">
                            Back to Home
                        </a>
                    </Link>
                </div>
            </div>
             <p className="text-xs text-gray-500 dark:text-gray-400 mt-6">
                Seva Sahayog Foundation
            </p>
        </div>
    );
}