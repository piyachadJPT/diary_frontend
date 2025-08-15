'use client'

import React, { useState, useEffect, useCallback } from "react";
import { fetchWithBase } from '@/app/unit/fetchWithUrl';
import { useSession } from 'next-auth/react';
import TeacherLayout from '@/components/layouts/TeacherLayout';
import {
   Box,
   Paper,
   Typography,
   Avatar,
   Stack,
   Chip,
   CircularProgress,
   Tooltip
} from '@mui/material';
import {
   Language,
   Group,
   AttachFile,
   Lock,
   School
} from '@mui/icons-material';
import SearchIcon from '@mui/icons-material/Search';
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import Comment from '@/components/share/Comment';

interface DiaryEntry {
   ID: number;
   StudentID: number;
   ContentHTML: string;
   ContentDelta: string;
   IsShared: string;
   AllowComment: boolean;
   Status: string;
   DiaryDate: string;
   CreatedAt: string;
   UpdatedAt: string;
   Student: {
      ID: number;
      Name: string;
      Email: string;
      Role: string;
      Image: string;
      CreatedAt: string;
   };
   Attachments: {
      ID: number;
      DiaryID: number;
      FileURL: string;
      FileName: string;
   }[];
}

interface TeacherDiaryPageProps {
   params: Promise<{ date: string }>;
}

const TeacherDiaryPage = ({ params }: TeacherDiaryPageProps) => {
   const [date, setDate] = useState<string>('');
   const [diaryData, setDiaryData] = useState<DiaryEntry[]>([]);
   const [isLoading, setIsLoading] = useState<boolean>(true);
   const [error, setError] = useState<string | null>(null);
   const { data: session, status } = useSession();
   const [userId, setUserId] = useState<number | null>(null);
   const [studentId, setStudentId] = useState<string | null>(null);

   useEffect(() => {
      const resolveParams = async () => {
         try {
            const resolvedParams = await params;
            setDate(resolvedParams.date);
         } catch (error) {
            console.error('Error resolving params:', error);
            setError('ไม่สามารถโหลดข้อมูลได้');
         }
      };

      resolveParams();
   }, [params]);

   const statusIcons = {
      veryHappy: {
         icon: SentimentVerySatisfiedIcon,
         label: 'มีความสุข',
         color: '#2e7d32',
      },
      happy: {
         icon: SentimentSatisfiedAltIcon,
         label: 'พอใจ',
         color: '#9ccc65',
      },
      neutral: {
         icon: SentimentNeutralIcon,
         label: 'เฉยๆ',
         color: '#5c6bc0',
      },
      stressed: {
         icon: SentimentDissatisfiedIcon,
         label: 'เครียด',
         color: '#ff9800',
      },
      burnedOut: {
         icon: SentimentVeryDissatisfiedIcon,
         label: 'หมดไฟ',
         color: '#f44336',
      },
   };

   type StatusKey = keyof typeof statusIcons;

   const getShareText = (IsShared: string) => {
      switch (IsShared) {
         case 'everyone': return 'สาธารณะ';
         case 'someone': return 'เจาะจง';
         case 'teacher': return 'อาจารย์เท่านั้น';
         case 'personal': return 'เฉพาะฉัน';
         default: return 'แชร์สาธารณะ';
      }
   };

   const getShareIcon = (IsShared: string) => {
      switch (IsShared) {
         case 'everyone': return <Language fontSize="small" />;
         case 'someone': return <Group fontSize="small" />;
         case 'teacher': return <School fontSize="small" />;
         case 'personal': return <Lock fontSize="small" />;
         default: return <Language fontSize="small" />;
      }
   };

   const getStatusKey = (status: string): StatusKey | null => {
      const statusNormalized = status?.trim();
      if (statusNormalized && statusNormalized in statusIcons) {
         return statusNormalized as StatusKey;
      }
      return null;
   };

   // useEffect(() => {
   //    if (status === 'authenticated' && session?.user?.email) {
   //       const fetchUser = async () => {
   //          try {
   //             const res = await fetchWithBase(`/api/user?email=${encodeURIComponent(session?.user?.email || '')}`);
   //             if (!res.ok) {
   //                throw new Error('ไม่สามารถดึงข้อมูลผู้ใช้ได้');
   //             }
   //             const data = await res.json();
   //             setUserId(data.ID);
   //          } catch (error) {
   //             console.error('Error fetching user:', error);
   //             setError('ไม่สามารถดึงข้อมูลผู้ใช้ได้');
   //             setIsLoading(false);
   //          }
   //       };
   //       fetchUser();
   //    } else if (status === 'unauthenticated') {
   //       setError('กรุณาเข้าสู่ระบบ');
   //       setIsLoading(false);
   //    }
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

   useEffect(() => {
      const storedId = sessionStorage.getItem('studentId');
      if (storedId) {
         setStudentId(storedId);
         console.log('รับ id จาก sessionStorage:', storedId);
      }
   }, []);

   const fetchDiaryData = useCallback(async () => {
      if (userId === null || !date || !/^\d{4}-\d{2}-\d{2}$/.test(date) || !studentId) {
         return;
      }

      setIsLoading(true);
      try {
         const res = await fetchWithBase(`/api/diary?DiaryDate=${encodeURIComponent(date)}&StudentID=${studentId}`);

         if (!res.ok) {
            throw new Error('ไม่สามารถดึงข้อมูล diary ได้');
         }

         const data = await res.json();
         console.log('data :', data);
         setDiaryData(Array.isArray(data.data) ? data.data : []);
      } catch (err) {
         console.error('Error fetching diary:', err);
         setError('ไม่สามารถดึงข้อมูล diary ได้');
         setDiaryData([]);
      } finally {
         setIsLoading(false);
      }
   }, [date, userId, studentId]);

   useEffect(() => {
      fetchDiaryData();
   }, [fetchDiaryData]);

   const formatDate = (dateString: string): string => {
      try {
         return new Date(dateString).toLocaleDateString('th-TH', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
         });
      } catch {
         return 'วันที่ไม่ถูกต้อง';
      }
   };

   const formatTime = (dateString: string): string => {
      try {
         return new Date(dateString).toLocaleTimeString('th-TH', {
            hour: '2-digit',
            minute: '2-digit'
         });
      } catch {
         return 'เวลาไม่ถูกต้อง';
      }
   };

   if (status === 'loading' || isLoading) {
      return (
         <TeacherLayout>
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
               <CircularProgress />
            </Box>
         </TeacherLayout>
      );
   }

   if (error) {
      return (
         <TeacherLayout>
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
               <Typography color="error">{error}</Typography>
            </Box>
         </TeacherLayout>
      );
   }

   return (
      <TeacherLayout>
         <Box sx={{ width: '100%', mx: 'auto', p: 2, mt: 1.5 }}>
            {diaryData.length > 0 ? (
               [...diaryData]
                  .sort((a, b) => new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime())
                  .map((diary) => {
                     const statusKey = getStatusKey(diary.Status);

                     return (
                        <Paper
                           key={diary.ID}
                           sx={{
                              borderRadius: 4,
                              mb: 2.5,
                              border: '1px solid rgba(0, 0, 0, 0.12)',
                              boxShadow: 'none',
                           }}
                        >
                           <Box sx={{
                              p: 4,
                              display: 'flex',
                              alignItems: 'center',
                           }}>
                              <Avatar
                                 src={diary.Student?.Image || '/default-avatar.svg'}
                                 alt={diary.Student?.Name || 'ไม่ระบุชื่อ'}
                                 sx={{ width: 55, height: 55, mr: 2 }}
                              />
                              <Box sx={{ flex: 1 }}>
                                 <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                    <Box sx={{ display: 'flex', flexDirection: 'column', mr: 1 }}>
                                       <Typography
                                          variant="subtitle1"
                                          fontWeight="bold"
                                          sx={{ mb: 0, lineHeight: 1 }}
                                       >
                                          {diary.Student?.Name || 'ไม่ระบุชื่อ'}
                                       </Typography>
                                       <Typography
                                          variant="caption"
                                          color="text.secondary"
                                          sx={{ mt: 0, lineHeight: 1 }}
                                       >
                                          {formatDate(diary.CreatedAt)} {formatTime(diary.CreatedAt)}
                                       </Typography>
                                    </Box>
                                    <Box>
                                       <Tooltip title={statusKey ? statusIcons[statusKey].label : 'ไม่ระบุ'}>
                                          <Box
                                             sx={{
                                                width: 40,
                                                height: 40,
                                                borderRadius: '50%',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                backgroundColor: '#f5f5f5',
                                             }}
                                          >
                                             {statusKey
                                                ? React.createElement(statusIcons[statusKey].icon, { htmlColor: statusIcons[statusKey].color })
                                                : null}
                                          </Box>
                                       </Tooltip>
                                    </Box>
                                 </Box>
                              </Box>
                              <Stack direction="row" spacing={1} alignItems="center">
                                 <Chip
                                    icon={getShareIcon(diary.IsShared)}
                                    label={getShareText(diary.IsShared)}
                                    size="small"
                                    sx={{ fontSize: '0.75rem' }}
                                 />
                              </Stack>
                           </Box>

                           <Box sx={{ px: 4 }}>
                              <Box
                                 dangerouslySetInnerHTML={{ __html: diary.ContentHTML }}
                                 sx={{
                                    ml: 1,
                                    mb: 2,
                                    '& img': { maxWidth: '100%', height: 'auto' },
                                    '& p': { mb: 1 }
                                 }}
                              />

                              {diary.Attachments?.length > 0 && (
                                 <Box sx={{ mb: 2 }}>
                                    {diary.Attachments.map((attachment) => (
                                       <Chip
                                          key={attachment.ID}
                                          icon={<AttachFile sx={{ color: 'text.secondary' }} />}
                                          label={attachment.FileName || 'ไฟล์ไม่มีชื่อ'}
                                          variant="outlined"
                                          onDelete={() => window.open(`/diary/${date}/${attachment.ID}`, '_blank')}
                                          deleteIcon={<SearchIcon />}
                                          sx={{
                                             maxWidth: 300,
                                             mb: 1,
                                             '& .MuiChip-label': {
                                                overflow: 'hidden',
                                                textOverflow: 'ellipsis',
                                                whiteSpace: 'nowrap',
                                             },
                                             '& .MuiChip-deleteIcon': {
                                                color: 'primary.main',
                                                cursor: 'pointer',
                                             },
                                          }}
                                       />
                                    ))}
                                 </Box>
                              )}

                              {userId !== null && (
                                 <Comment diary_Id={diary.ID} user_Id={userId} />
                              )}
                           </Box>
                        </Paper>
                     );
                  })
            ) : (
               <Box sx={{ textAlign: 'center', py: 2 }}>
                  <CalendarTodayIcon
                     sx={{
                        fontSize: 28,
                        color: 'text.disabled',
                        mb: 1,
                        opacity: 0.6,
                        display: 'block',
                        mx: 'auto'
                     }}
                  />
                  <Typography variant="body1" sx={{ textAlign: 'center', color: 'text.secondary' }}>
                     ไม่พบบันทึกสำหรับวันนี้
                  </Typography>
               </Box>
            )}
         </Box>
      </TeacherLayout>
   );
};

export default TeacherDiaryPage;