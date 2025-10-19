"use client";

import { api } from '@/convex/_generated/api';
import { useUser } from '@clerk/nextjs';
import { useMutation, useQuery } from 'convex/react';
import { useRouter } from 'next/navigation';
import React, { useEffect } from 'react';

const OnboardingPage = () => {
  const { user } = useUser();
  const router = useRouter();

  const checkUser = useQuery(
    api.user.checkUser,
    user ? { email: user.primaryEmailAddress?.emailAddress! } : "skip"
  );
  const createUser = useMutation(api.user.createUser);

  useEffect(() => {
    if (!user || checkUser === undefined) return;

    if (!checkUser) {
      createUser({
        name: user.firstName + " " + user.lastName,
        email: user.primaryEmailAddress?.emailAddress!,
      });
    }

    router.push("/");
  }, [checkUser, createUser, router, user]);

  return <div>Loading...</div>;
};

export default OnboardingPage;