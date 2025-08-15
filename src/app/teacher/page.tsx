/* eslint-disable @typescript-eslint/no-unused-vars */

'use client'

import TeacherLayout from '@/components/layouts/TeacherLayout'
import React, { useState, useEffect, Suspense } from 'react'
import { Box, useMediaQuery, useTheme } from '@mui/material';
import Student from '@/components/share/Student'
import Mood from '@/components/share/Mood'
import Warn from '@/components/share/Warn';
import { useSession } from 'next-auth/react';
import { fetchWithBase } from "@/app/unit/fetchWithUrl"


export default function Page() {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
    const [userId, setUserId] = useState<number | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const { data: session, status } = useSession();

    // console.log("userId :", userId)

    // useEffect(() => {
    //     if (status === 'authenticated' && session?.user?.email) {
    //         const fetchUser = async () => {
    //             try {
    //                 const res = await fetchWithBase(`/api/user?email=${encodeURIComponent(session?.user?.email || '')}`);
    //                 if (!res.ok) throw new Error('Failed to fetch user');
    //                 const data = await res.json();
    //                 setUserId(data.ID);
    //             } catch (error) {
    //                 console.error('Error fetching user:', error);
    //                 setError('ไม่สามารถดึงข้อมูลผู้ใช้ได้');
    //             } finally {
    //                 setIsLoading(false);
    //             }
    //         };
    //         fetchUser();
    //     }
    // }, [session, status]);

    async function getProfileFromToken() {
        const token = localStorage.getItem('token');
        if (!token) return null;

        try {
            const res = await fetchWithBase('/api/profile', {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!res.ok) {
                localStorage.removeItem('token');
                return null;
            }

            const data = await res.json();
            return data;
        } catch (error) {
            console.error('Error fetching profile:', error);
            localStorage.removeItem('token');
            return null;
        }
    }

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const profile = await getProfileFromToken();
                if (profile) {
                    setUserId(profile.id || profile.ID);
                    return;
                }

                if (status === 'authenticated' && session?.user?.email) {
                    const res = await fetchWithBase(`/api/user?email=${encodeURIComponent(session?.user?.email || '')}`);
                    if (!res.ok) throw new Error('Failed to fetch user');
                    const data = await res.json();
                    setUserId(data.ID);
                } else if (status === 'unauthenticated') {
                    const token = localStorage.getItem('token');
                    if (!token) {
                        window.location.href = '/';
                        return;
                    }
                }
            } catch (error) {
                console.error('Error fetching user:', error);
                setError('ไม่สามารถดึงข้อมูลผู้ใช้ได้');
                setIsLoading(false);
            }
        };

        fetchUser();
    }, [session, status]);

    return (
        <Suspense fallback={null}>
            <TeacherLayout>
                {isMobile ? (
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'column',
                        bgcolor: 'background.default',
                        gap: 2,
                        p: 2
                    }}>
                        <Box sx={{ height: '250px' }}>
                            <Student advisorId={userId} />
                        </Box>

                        <Box sx={{ height: '100px' }}>
                            <Mood advisorId={userId} />
                        </Box>

                        <Box sx={{ height: '400px' }}>
                            <Warn advisorId={userId} />
                        </Box>
                    </Box>
                ) : (
                    <Box sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        height: '100vh',
                        bgcolor: 'background.default',
                        gap: 3,
                        py: 3,
                        px: 1
                    }}>
                        <Box sx={{ width: '450px', flexShrink: 0 }}>
                            <Student advisorId={userId} />
                        </Box>

                        <Box sx={{
                            flex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            gap: 3
                        }}>
                            <Box sx={{ flexShrink: 0 }}>
                                <Mood advisorId={userId} />
                            </Box>

                            <Box sx={{ flex: 1 }}>
                                <Warn advisorId={userId} />
                            </Box>
                        </Box>
                    </Box>
                )}
            </TeacherLayout>
        </Suspense>
    )
}