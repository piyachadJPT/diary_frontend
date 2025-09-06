import React, { useState } from 'react';
import { Box, IconButton, TextField, Button, Typography, Fade } from '@mui/material';
import { Close as CloseIcon, PersonAdd as PersonAddIcon } from '@mui/icons-material';
import Swal from 'sweetalert2';
import { fetchWithBase } from '@/app/unit/fetchWithUrl';

interface NewStudentProps {
   onClose?: () => void;
   advisorId: number | null;
   onStudentAdvisorSave?: () => void;
}

export interface StudentAdvisor {
   AdvisorID: number;
   StudentID: number;
   Student: {
      ID: number;
      Name: string;
      Email: string;
      Role: string;
      Image: string;
      CreatedAt: string;
   };
   Advisor: {
      Name: string;
      Email: string;
      Image: string;
      Role: string;
   }
}

export default function AddNewStudent({ onClose, advisorId, onStudentAdvisorSave }: NewStudentProps) {
   const [email, setEmail] = useState<string>('');
   const [loading, setLoading] = useState<boolean>(false);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!email) {
         Swal.fire({
            icon: "error",
            text: "กรุณากรอกอีเมล์",
            showConfirmButton: false,
            timer: 2500,
         });
         setEmail('');
         onClose?.();
         return;
      }

      const emailRegex = /^[^\s@]+@up\.ac\.th$/;
      if (!emailRegex.test(email)) {
         Swal.fire({
            icon: "error",
            text: "รูปแบบอีเมล์ไม่ถูกต้อง",
            showConfirmButton: false,
            timer: 2500,
         });
         setEmail('');
         onClose?.();
         return;
      }

      setLoading(true);

      try {
         console.log('Sending data:', {
            email,
            advisorId,
         });
         const response = await fetchWithBase('/api/student', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, advisor_id: advisorId }),
         });

         if (response.ok) {
            setEmail('');
            onClose?.();
            onStudentAdvisorSave?.();

            Swal.fire({
               icon: 'success',
               text: 'เพิ่มนิสิตเรียบร้อยแล้ว',
               showConfirmButton: false,
               timer: 2500,
            })
         } else {
            onClose?.();
            const errorData = await response.json();
            Swal.fire({
               icon: 'error',
               text: errorData.message || 'เกิดข้อผิดพลาดในการเพิ่มนิสิต',
               showConfirmButton: false,
               timer: 2500,
            });
         }
      } catch (error) {
         onClose?.();
         Swal.fire({
            icon: 'error',
            text: 'เกิดข้อผิดพลาดในการเพิ่มนิสิต',
            showConfirmButton: false,
            timer: 2500,
         });
         console.log(error)
      } finally {
         setLoading(false);
      }
   };

   return (
      <Fade in timeout={200}>
         <Box
            sx={{
               width: '100%',
               p: 2,
               position: 'relative',
            }}
         >
            <Box sx={{
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'space-between',
               mb: 3,
               pb: 2,
               borderBottom: '1px solid rgba(0, 0, 0, 0.06)'
            }}>
               <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box sx={{
                     p: 1.5,
                     backgroundColor: 'rgba(156, 39, 176, 0.08)',
                     borderRadius: 2,
                     display: 'flex',
                     alignItems: 'center',
                     justifyContent: 'center'
                  }}>
                     <PersonAddIcon sx={{ color: '#7E57C2', fontSize: 20 }} />
                  </Box>
                  <Typography
                     variant="h6"
                     sx={{
                        fontWeight: 600,
                        color: '#1a1a1a',
                        fontSize: '1.1rem',
                        lineHeight: 1.2
                     }}
                  >
                     เพิ่มนิสิตใหม่
                  </Typography>
               </Box>

               <IconButton
                  onClick={onClose}
                  sx={{
                     color: '#666',
                     padding: '8px',
                     borderRadius: 2,
                     transition: 'all 0.2s ease',
                     '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.04)',
                        color: '#333'
                     }
                  }}
               >
                  <CloseIcon fontSize="small" />
               </IconButton>
            </Box>

            <Box component="form" onSubmit={handleSubmit}>
               <TextField
                  fullWidth
                  label="อีเมล์สำหรับนิสิต"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@up.ac.th"
                  variant="outlined"
                  disabled={loading}
                  sx={{
                     mb: 4,
                     '& .MuiOutlinedInput-root': {
                        borderRadius: 2.5,
                        transition: 'all 0.3s ease',
                        backgroundColor: 'rgba(0, 0, 0, 0.02)',
                        '&:hover': {
                           backgroundColor: 'rgba(0, 0, 0, 0.03)',
                        },
                     },
                     '& .MuiInputLabel-root': {
                        color: '#666',
                        fontWeight: 500,
                        '&.Mui-focused': {
                           color: '#7E57C2',
                           fontWeight: 600,
                        }
                     },
                     '& .MuiOutlinedInput-input': {
                        padding: '14px 16px',
                        fontSize: '0.95rem',
                     }
                  }}
               />

               <Box sx={{
                  display: 'flex',
                  gap: 2,
                  justifyContent: 'flex-end',
                  pt: 1
               }}>
                  <Button
                     variant="outlined"
                     onClick={onClose}
                     disabled={loading}
                     sx={{
                        borderRadius: 2.5,
                        px: 3,
                        py: 1.2,
                        fontWeight: 500,
                        textTransform: 'none',
                        fontSize: '0.9rem',
                        color: '#666',
                        borderColor: 'rgba(0, 0, 0, 0.12)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                        '&:hover': {
                           backgroundColor: 'rgba(0, 0, 0, 0.04)',
                           borderColor: 'rgba(0, 0, 0, 0.2)',
                           transform: 'translateY(-1px)',
                        },
                        '&:disabled': {
                           opacity: 0.6,
                        }
                     }}
                  >
                     ยกเลิก
                  </Button>
                  <Button
                     type="submit"
                     variant="contained"
                     disabled={loading || !email}
                     sx={{
                        borderRadius: 2.5,
                        px: 4,
                        py: 1.2,
                        fontWeight: 600,
                        textTransform: 'none',
                        fontSize: '0.9rem',
                        backgroundColor: '#7E57C2',
                        boxShadow: '0 2px 12px rgba(156, 39, 176, 0.25)',
                        transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                        '&:hover': {
                           backgroundColor: '#673ab7',
                           boxShadow: '0 4px 20px rgba(156, 39, 176, 0.4)',
                           transform: 'translateY(-2px)',
                        },
                        '&:active': {
                           transform: 'translateY(0px)',
                        },
                        '&:disabled': {
                           backgroundColor: 'rgba(0, 0, 0, 0.12)',
                           color: 'rgba(0, 0, 0, 0.26)',
                           boxShadow: 'none',
                           transform: 'none',
                        }
                     }}
                  >
                     {loading ? 'กำลังเพิ่ม...' : 'เพิ่มนิสิต'}
                  </Button>
               </Box>
            </Box>
         </Box>
      </Fade>
   );
}