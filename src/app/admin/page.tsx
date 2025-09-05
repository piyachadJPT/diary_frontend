/* eslint-disable @typescript-eslint/no-unused-vars */

'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { Box, useMediaQuery, useTheme } from '@mui/material';
import { useSession } from 'next-auth/react';
import { fetchWithBase } from "@/app/unit/fetchWithUrl"
import { getUrlWithBase } from '../unit/getUrlWithBase';
import AdminLayout from '@/components/layouts/AdminLayout';
import AllStudentByAdmin from '@/components/share/AllStudentByAdmin';
import AllAdvisorByAdmin from '@/components/share/AllAdvisorByAdmin';


export default function Page() {
   const theme = useTheme();
   const isMobile = useMediaQuery(theme.breakpoints.down('md'));
   const [userId, setUserId] = useState<number | null>(null);
   const [isLoading, setIsLoading] = useState<boolean>(true);
   const [error, setError] = useState<string | null>(null);
   const { data: session, status } = useSession();

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
                  window.location.href = `${getUrlWithBase('/')}`
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
         <AdminLayout>
            {isMobile ? (
               <Box
                  sx={{
                     display: "flex",
                     flexDirection: "column",
                     minHeight: "100vh",
                     bgcolor: "background.default",
                  }}
               >
                  <Box sx={{ flex: 1, p: 1 }}>
                     <AllStudentByAdmin userId={userId} />
                  </Box>
                  <Box sx={{ flex: 1, p: 1 }}>
                     <AllAdvisorByAdmin userId={userId} />
                  </Box>
               </Box>
            ) : (
               <Box
                  sx={{
                     display: "flex",
                     flexDirection: "row",
                     height: "calc(100vh - 120px)",
                     bgcolor: "background.default",
                     gap: 2,
                     pt: 2,
                     mt: 0.5,
                     overflow: "hidden",
                  }}
               >
                  <Box sx={{ flex: 1, height: "100%" }}>
                     <AllStudentByAdmin userId={userId} />
                  </Box>

                  <Box sx={{ flex: 1, height: "100%" }}>
                     <AllAdvisorByAdmin userId={userId} />
                  </Box>
               </Box>
            )}
         </AdminLayout>

      </Suspense>
   )
}