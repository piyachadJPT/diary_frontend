import React, { useState } from 'react';
import { Box, IconButton, TextField, Button } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';
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
      <Box
         sx={{
            backgroundColor: '#ffffff',
            width: '100%',
            position: 'relative',
            p: 2,
            borderRadius: 2,
         }}
      >
         <IconButton
            onClick={onClose}
            sx={{
               position: 'absolute',
               right: 4,
               top: 4,
               color: '#666',
               padding: '4px'
            }}
         >
            <CloseIcon fontSize="small" />
         </IconButton>

         <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, pt: 3 }}>
            <TextField
               fullWidth
               label="อีเมล์สำหรับนิสิต"
               type="email"
               value={email}
               onChange={(e) => setEmail(e.target.value)}
               placeholder="student@up.ac.th"
               variant="outlined"
               size="small"
               sx={{ mb: 3 }}
               disabled={loading}
            />

            <Box sx={{ display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
               <Button
                  variant="outlined"
                  onClick={onClose}
                  disabled={loading}
                  size="small"
               >
                  ยกเลิก
               </Button>
               <Button
                  type="submit"
                  variant="contained"
                  disabled={loading || !email}
                  size="small"
               >
                  {loading ? 'กำลังเพิ่ม...' : 'เพิ่มนิสิต'}
               </Button>
            </Box>
         </Box>
      </Box>
   );
}