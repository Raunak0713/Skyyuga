"use client";

import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'next/navigation';
import React, { useEffect, useRef } from 'react';

const OnboardingPage = () => {
  const { user } = useUser();
  const router = useRouter();
  const hasProcessedRef = useRef(false);
  console.log("Arrived")

  const emailArg = user?.primaryEmailAddress?.emailAddress
    ? { email: user.primaryEmailAddress.emailAddress }
    : 'skip';

  const checkUser = useQuery(api.user.checkUser, emailArg);
  const createUser = useMutation(api.user.createUser);

  useEffect(() => {
    const handleOnboarding = async () => {
      if (!user) {
        return;
      }

      if (checkUser === undefined) {
        return;
      }

      if (hasProcessedRef.current) {
        return;
      }

      hasProcessedRef.current = true;

      const email = user.primaryEmailAddress?.emailAddress;
      const name = `${user.firstName || ''} ${user.lastName || ''}`.trim();


      if (!email) {
        router.push('/');
        return;
      }

      try {
        if (!checkUser) {
          const result = await createUser({ 
            name: name || 'User', 
            email 
          });
          await new Promise((resolve) => setTimeout(resolve, 1000));
        } else {
          console.log("");
        }

        router.push('/');
      } catch (err) {
        console.error("[Onboarding] Error:", err);
        setTimeout(() => {
          router.push('/');
        }, 2000);
      }
    };

    handleOnboarding();
  }, [checkUser, user, createUser, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-white to-yellow-50 flex items-center justify-center">
      <div className="text-center space-y-6">
        <div className="relative">
          <div className="w-20 h-20 border-4 border-yellow-400 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-yellow-200 border-b-transparent rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1s' }}></div>
          </div>
        </div>
        <div className="space-y-2">
          <p className="text-gray-900 text-xl font-semibold">Welcome aboard! 🎉</p>
          <p className="text-gray-600 text-lg">Setting up your account...</p>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;