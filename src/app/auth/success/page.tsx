'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardBody } from "@nextui-org/react";
import { CheckCircle } from "lucide-react";

export default function AuthSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home after a short delay to show success message
    const timer = setTimeout(() => {
      router.push('/');
    }, 2000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <Card className="shadow-lg">
          <CardBody className="text-center py-12">
            <CheckCircle size={64} className="text-success mx-auto mb-6" />
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Authentication Successful!
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              You have been successfully authenticated. Redirecting you to the home page...
            </p>
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mx-auto" />
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
