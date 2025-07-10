import React, { useState, useEffect } from 'react';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import SendIcon from '@mui/icons-material/Send';
import { fetchWithBase } from "@/app/unit/fetchWithUrl"
import Swal from 'sweetalert2';
import {
   Box,
   Paper,
   Typography,
   Avatar,
   IconButton,
   Tooltip
} from '@mui/material';
import {
   Delete,
} from '@mui/icons-material';

interface CommentProps {
   diary_Id: number;
   user_Id: number;
}

interface Comment {
   DiaryID: number;
   AuthorID: number;
   Content: string;
}

interface CommentData {
   ID: number;
   AuthorID: number;
   Author: {
      Image: string;
      Name: string;
   };
   Content: string;
   CreatedAt: string;
}

export default function Comment({ diary_Id, user_Id }: CommentProps) {
   const [content, setContent] = useState('');
   const [comment, setComment] = useState<CommentData[]>([]);

   const fetchComment = async () => {
      try {
         const res = await fetchWithBase(`/api/comment?DiaryID=${diary_Id}`)
         if (!res.ok) throw new Error('Failed to fetch comment');
         const data = await res.json();
         setComment(data.data);
      } catch (err) {
         console.error('Error fetching user:', err);
      }
   }

   useEffect(() => {
      if (diary_Id) {
         fetchComment();
      }
   }, [diary_Id])

   const handleSend = async (e: React.FormEvent) => {
      e.preventDefault()

      if (!content.trim() || content === '<p><br></p>') {
         Swal.fire({
            icon: "warning",
            text: "กรุณาเพิ่มรายละเอียด",
            showConfirmButton: false,
            timer: 2500,
         });
         return;
      }

      if (!user_Id) {
         Swal.fire({
            icon: "error",
            text: "ไม่พบข้อมูลผู้ใช้",
            showConfirmButton: false,
            timer: 2500,
         });
         return;
      }

      try {
         const comment: Comment = {
            DiaryID: diary_Id,
            AuthorID: user_Id,
            Content: content
         }

         const res = await fetchWithBase('/api/comment', {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify(comment),
         })

         if (!res.ok) {
            const errorText = await res.text();
            console.error('Error response:', errorText);
            throw new Error(`HTTP ${res.status}: ${errorText || 'Failed to save comment'}`);
         }

         const responseData = await res.json();

         if (responseData) {
            Swal.fire({
               icon: "success",
               text: "เพิ่มความคิดเห็นสำเร็จ",
               showConfirmButton: false,
               timer: 2000,
            });
         }

         setContent('');
         fetchComment();
      } catch (err) {
         console.error("Error submitting comment:", err);

         const errorMessage = err instanceof Error ? err.message : "เกิดข้อผิดพลาดในการเพิ่มความคิดเห็น";
         Swal.fire({
            icon: "error",
            title: "เพิ่มความคิดเห็นไม่สำเร็จ",
            text: errorMessage,
            showConfirmButton: false,
         });
      }
   };

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

   const handleDelete = async (id: number) => {
      const result = await Swal.fire({
         text: "คุณต้องการลบความคิดเห็นนี้ใช่หรือไม่?",
         icon: 'warning',
         showCancelButton: true,
         confirmButtonColor: "#d33",
         cancelButtonColor: "#899499",
         cancelButtonText: "ยกเลิก",
         confirmButtonText: "ยืนยัน",
      });

      if (result.isConfirmed) {
         try {
            const response = await fetchWithBase(`/api/comment/${id}`, {
               method: 'DELETE',
            });

            if (!response.ok) throw new Error('Delete failed');

            const deleteResult = await response.json();

            if (deleteResult.ok || response.ok) {
               setComment(prevComments => prevComments.filter(comment => comment.ID !== id));

               Swal.fire({
                  icon: "success",
                  text: "ลบความคิดเห็นสำเร็จ",
                  showConfirmButton: false,
                  timer: 1500
               });
            } else {
               Swal.fire({
                  icon: "error",
                  text: "ไม่สามารถลบความคิดเห็นได้",
                  showConfirmButton: false,
                  timer: 1500
               });
            }
         } catch (error) {
            console.log('Delete error:', error);
            Swal.fire({
               icon: "error",
               text: "เกิดข้อผิดพลาดในการลบความคิดเห็น",
               showConfirmButton: false,
               timer: 1500
            });
         }
      }
   };

   return (
      <>
         {comment.length > 0 ? (
            comment.map((item) => (
               <Paper
                  key={item.ID}
                  elevation={0}
                  sx={{
                     ml: 4,
                     mb: 2,
                     boxShadow: 'none',
                     border: 'none',
                     backgroundColor: 'transparent',
                  }}
               >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mr: 3 }}>
                     <Box sx={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                           <Avatar
                              src={item.Author?.Image || '/default-avatar.png'}
                              alt={item.Author?.Name || 'ไม่ระบุชื่อ'}
                              sx={{ width: 42, height: 42, mr: 2 }}
                           />
                           <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                              <Typography
                                 variant="subtitle2"
                                 fontWeight="bold"
                                 sx={{ lineHeight: 1 }}
                              >
                                 {item.Author?.Name || 'ไม่ระบุชื่อ'}
                              </Typography>
                              <Typography
                                 variant="caption"
                                 color="text.secondary"
                                 sx={{ lineHeight: 1.3 }}
                              >
                                 {formatDate(item.CreatedAt)} {formatTime(item.CreatedAt)}
                              </Typography>
                           </Box>
                        </Box>

                        <Box sx={{ ml: '57px' }}>
                           <Typography variant="body1" color="text.secondary">
                              {item.Content || ''}
                           </Typography>
                        </Box>
                     </Box>

                     {user_Id === item.AuthorID && (
                        <Box sx={{ display: 'flex', alignItems: 'center', ml: 2 }}>
                           <Tooltip title="ลบ">
                              <IconButton
                                 size="small"
                                 sx={{ color: '#e53935' }}
                                 onClick={() => handleDelete(item.ID)}
                              >
                                 <Delete fontSize="small" />
                              </IconButton>
                           </Tooltip>
                        </Box>
                     )}
                  </Box>
               </Paper>
            ))
         ) : (
            <Typography variant="body1" sx={{ textAlign: 'center' }}>

            </Typography>
         )}

         <TextField
            placeholder="เพิ่มความคิดเห็น"
            variant="outlined"
            fullWidth
            size="small"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            InputProps={{
               endAdornment: (
                  <InputAdornment position="end">
                     <SendIcon
                        sx={{ cursor: 'pointer', color: content.trim() ? '#673ab7' : 'gray' }}
                        onClick={handleSend}
                     />
                  </InputAdornment>
               ),
               sx: {
                  borderRadius: '10px',
                  border: 'rgba(0, 0, 0, 0.12)',
                  fontSize: '0.75rem',
                  py: 0.35,
               },
            }}
            sx={{ pb: 3 }}
         />
      </>
   );
}