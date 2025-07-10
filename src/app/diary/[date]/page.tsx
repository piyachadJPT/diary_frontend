'use client'

import React, { useState, useEffect } from "react";
import dynamic from 'next/dynamic';
import DiatyLayout from '../../../components/layouts/DiatyLayout';
import { useSession } from 'next-auth/react';
import { fetchWithBase } from "@/app/unit/fetchWithUrl"
import {
   Box,
   Paper,
   Typography,
   Avatar,
   IconButton,
   Stack,
   Chip,
   CircularProgress,
   Tooltip
} from '@mui/material';
import {
   Language,
   Edit,
   Delete,
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
import Swal from 'sweetalert2';
import Connent from '@/components/share/Comment'

const NewDiary = dynamic(() => import('@/components/share/NewDiary'), {
   ssr: false,
   loading: () => <CircularProgress size={24} />
});

interface Diary {
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

export default function DiaryPage({ params }: { params: Promise<{ date: string }> }) {
   const { date } = React.use(params);
   const { data: session, status } = useSession();
   const [userId, setUserId] = useState<number | null>(null);
   const [diaries, setDiaries] = useState<Diary[]>([]);
   const [isLoading, setIsLoading] = useState<boolean>(true);
   const [error, setError] = useState<string | null>(null);

   const [editingDiary, setEditingDiary] = useState<Diary | null>(null);

   const statusIcons = {
      veryHappy: {
         icon: <SentimentVerySatisfiedIcon />,
         label: 'มีความสุข',
         color: '#2e7d32',
      },
      happy: {
         icon: <SentimentSatisfiedAltIcon />,
         label: 'พอใจ',
         color: '#9ccc65',
      },
      neutral: {
         icon: <SentimentNeutralIcon />,
         label: 'เฉยๆ',
         color: '#5c6bc0',
      },
      stressed: {
         icon: <SentimentDissatisfiedIcon />,
         label: 'เครียด',
         color: '#ff9800',
      },
      burnedOut: {
         icon: <SentimentVeryDissatisfiedIcon />,
         label: 'หมดไฟ',
         color: '#f44336',
      },
   };

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

   useEffect(() => {
      if (status === 'authenticated' && session?.user?.email) {
         const fetchUser = async () => {
            try {
               const res = await fetchWithBase(`/api/user?email=${encodeURIComponent(session?.user?.email)}`);
               if (!res.ok) throw new Error('Failed to fetch user');
               const data = await res.json();
               setUserId(data.ID);
            } catch (error) {
               console.error('Error fetching user:', error);
               setError('ไม่สามารถดึงข้อมูลผู้ใช้ได้');
               setIsLoading(false);
            }
         };
         fetchUser();
      }
   }, [session, status]);

   const fetchDiaries = async () => {
      if (!userId || !date) return;
      try {
         setIsLoading(true);
         const res = await fetchWithBase(`/api/diary?DiaryDate=${encodeURIComponent(date)}&StudentID=${userId}`);
         if (!res.ok) throw new Error('Failed to fetch diaries');
         const response = await res.json();
         setDiaries(Array.isArray(response.data) ? response.data : []);
      } catch (err) {
         console.error('Error fetching diaries:', err);
         setError('ไม่สามารถดึงข้อมูลบันทึกได้');
         setDiaries([]);
      } finally {
         setIsLoading(false);
      }
   };

   useEffect(() => {
      fetchDiaries();
   }, [userId, date]);

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

   const handleEdit = (diary: Diary) => {
      setEditingDiary(diary);
   };

   const handleEditComplete = () => {
      setEditingDiary(null);
      fetchDiaries();
   };

   const handleDelete = async (id: number) => {
      const result = await Swal.fire({
         text: "คุณต้องการลบบันทึกนี้ใช่หรือไม่?",
         icon: 'warning',
         showCancelButton: true,
         confirmButtonColor: "#d33",
         cancelButtonColor: "#899499",
         cancelButtonText: "ยกเลิก",
         confirmButtonText: "ยืนยัน",
      });

      if (result.isConfirmed) {
         try {
            const response = await fetchWithBase(`/api/diary/${id}`, {
               method: 'DELETE',
            });

            if (!response.ok) throw new Error('Delete failed');

            const deleteResult = await response.json();

            if (deleteResult.ok) {
               Swal.fire({
                  icon: "success",
                  text: "ลบบันทึกสำเร็จ",
                  showConfirmButton: false,
                  timer: 1500
               });
               fetchDiaries();
            } else {
               Swal.fire({
                  icon: "error",
                  text: "ไม่สามารถลบบันทึกได้",
                  showConfirmButton: false,
                  timer: 1500
               });
            }
         } catch (error) {
            console.log('error', error)
            Swal.fire({
               icon: "error",
               text: "เกิดข้อผิดพลาดในการลบบันทึก",
               showConfirmButton: false,
               timer: 1500
            });
         }
      }
   };

   if (status === 'loading' || isLoading) {
      return (
         <DiatyLayout>
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
               <CircularProgress />
            </Box>
         </DiatyLayout>
      );
   }

   return (
      <DiatyLayout>
         <Box sx={{ width: '100%', mx: 'auto', p: 2, mt: 1.5 }}>
            {diaries.length > 0 ? (
               diaries.map((diary) => (
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
                           src={diary.Student?.Image || '/default-avatar.png'}
                           alt={diary.Student?.Name || 'Unknown User'}
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
                                 <Tooltip title={statusIcons[diary.Status]?.label ?? 'ไม่ระบุ'}>
                                    <IconButton
                                       sx={{
                                          width: 40,
                                          height: 40,
                                          borderRadius: '50%',
                                          transition: 'all 0.2s ease-in-out',
                                          '&:hover': {
                                             backgroundColor: '#f5f5f5',
                                          },
                                       }}
                                    >
                                       {statusIcons[diary.Status]?.icon ?? null}
                                    </IconButton>
                                 </Tooltip>
                              </Box>
                           </Box>
                        </Box>
                        <Stack direction="row" spacing={1} alignItems="center">
                           {/* แก้ไข IconButton สำหรับแก้ไข */}
                           <Tooltip title="แก้ไข">
                              <IconButton
                                 size="small"
                                 sx={{ color: '#616161' }}
                                 onClick={() => handleEdit(diary)}
                              >
                                 <Edit fontSize="small" />
                              </IconButton>
                           </Tooltip>
                           <Tooltip title="ลบ">
                              <IconButton
                                 size="small"
                                 sx={{ color: '#e53935' }}
                                 onClick={() => handleDelete(diary.ID)}
                              >
                                 <Delete fontSize="small" />
                              </IconButton>
                           </Tooltip>
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
                                    onDelete={() => window.open(`diary/${date}/${attachment.ID}`, '_blank')}
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
                        <Connent diary_Id={diary.ID} user_Id={diary.Student.ID} />
                     </Box>
                  </Paper>
               ))
            ) : (
               <Typography variant="body1" sx={{ textAlign: 'center' }}>
                  ไม่พบบันทึกสำหรับวันนี้
               </Typography>
            )}

            <NewDiary
               onDiarySaved={fetchDiaries}
               editDiary={editingDiary}
               onEditComplete={handleEditComplete}
            />
         </Box>
      </DiatyLayout>
   );
}