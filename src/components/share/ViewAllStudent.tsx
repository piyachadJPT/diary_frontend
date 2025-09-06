import { fetchWithBase } from '@/app/unit/fetchWithUrl';
import { withBasePath } from '@/app/unit/imageSrc';
import { Dialog, Tooltip, Box, Avatar, Typography, IconButton, DialogContent, Divider } from '@mui/material';
import React, { useEffect, useState } from 'react';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import CloseIcon from '@mui/icons-material/Close';
import ViewDiaryDate from './ViewDiaryDate';
import PeopleIcon from '@mui/icons-material/People';

interface AllStudentProps {
   userId: number | null;
   open: boolean;
   onClose: () => void;
}

interface AllStudent {
   ID: number;
   Name: string | null;
   Email: string;
   Image: string | null;
}

export default function ViewAllStudent({ userId, open, onClose }: AllStudentProps) {
   const [students, setStudents] = useState<AllStudent[]>([]);
   const [selectedId, setSelectedId] = useState<number | null>(null);
   const [openDiary, setOpenDiary] = useState(false);

   const fetchAllStudent = async () => {
      try {
         const res = await fetchWithBase('/api/students');
         const data = await res.json();
         setStudents(data);
      } catch (error) {
         console.log('Fetch All Student :', error);
      }
   };

   useEffect(() => {
      fetchAllStudent();
   }, []);

   const handleOpenDiary = (id: number) => {
      setSelectedId(id);
      setOpenDiary(true);
   };

   const handleCloseDiary = () => {
      setOpenDiary(false);
      setSelectedId(null);
   };

   return (
      <>
         <Dialog
            open={open}
            onClose={onClose}
            PaperProps={{
               sx: {
                  borderRadius: 4,
                  width: "90vw",
                  maxWidth: "900px",
                  p: 0,
                  overflow: "hidden",
                  height: "80vh",
               },
            }}
         >
            <DialogContent
               sx={{
                  p: 0,
                  height: "100%",
                  display: "flex",
                  flexDirection: "column"
               }}
            >
               <Box
                  sx={{
                     display: "flex",
                     alignItems: "center",
                     justifyContent: "space-between",
                     px: 3,
                     py: 2,
                     backgroundColor: "white",
                     position: "sticky",
                     top: 0,
                     zIndex: 1,
                     borderBottom: "1px solid rgba(0, 0, 0, 0.05)"
                  }}
               >
                  <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', color: '#1a1a1a' }}>
                     <Box sx={{
                        p: 1,
                        backgroundColor: 'rgba(126, 87, 194, 0.1)',
                        borderRadius: 2,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        mr: 1.5,
                        transition: 'all 0.3s ease',
                     }}>
                        <PeopleIcon sx={{ color: '#7E57C2', fontSize: 20 }} />
                     </Box>
                     นิสิตทั้งหมด {students.length} คน
                  </Typography>
                  <IconButton onClick={onClose}>
                     <CloseIcon />
                  </IconButton>
               </Box>

               <Divider
                  sx={{
                     borderColor: 'rgba(126, 87, 194, 0.2)',
                     borderWidth: '1px',
                     mx: 1
                  }}
               />

               <Box
                  sx={{
                     flex: 1,
                     overflowY: 'auto',
                     px: 3,
                     py: 2,
                     '&::-webkit-scrollbar': {
                        width: '8px',
                     },
                     '&::-webkit-scrollbar-track': {
                        background: '#f1f1f1',
                        borderRadius: '4px',
                     },
                     '&::-webkit-scrollbar-thumb': {
                        background: '#c1c1c1',
                        borderRadius: '4px',
                        '&:hover': {
                           background: '#a1a1a1',
                        },
                     },
                  }}
               >
                  {students.map((student) => (
                     <Box
                        key={student.ID}
                        sx={{
                           display: 'flex',
                           alignItems: 'center',
                           p: 2,
                           mb: 1,
                           borderRadius: 2,
                           backgroundColor: 'rgba(0, 0, 0, 0.02)',
                           border: '1px solid rgba(0, 0, 0, 0.04)',
                           transition: 'all 0.2s ease',
                           '&:hover': {
                              backgroundColor: 'rgba(126, 87, 194, 0.05)',
                              borderColor: 'rgba(126, 87, 194, 0.2)',
                           },
                        }}
                     >
                        <Avatar
                           src={student.Image || withBasePath("/default-avatar.png")}
                           alt={student.Name || ''}
                           sx={{ width: 40, height: 40, mr: 2, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}
                        />
                        <Box sx={{ flex: 1 }}>
                           <Typography variant="body2" fontWeight={600} sx={{ color: '#1a1a1a' }}>
                              {student.Name || 'ยังไม่ได้เคยเข้าสู่ระบบ'}
                           </Typography>
                           <Typography variant="caption" color="text.secondary">
                              {student.Email}
                           </Typography>
                        </Box>
                        <Tooltip title="ดูบันทึก">
                           <IconButton
                              size="small"
                              onClick={() => handleOpenDiary(student.ID)}
                              sx={{
                                 color: '#673ab7',
                                 borderRadius: 2,
                                 p: 1,
                                 transition: 'all 0.2s ease',
                                 '&:hover': {
                                    backgroundColor: 'rgba(103, 58, 183, 0.08)',
                                    transform: 'scale(1.1)',
                                 },
                              }}
                           >
                              <RemoveRedEyeIcon fontSize="small" />
                           </IconButton>
                        </Tooltip>
                     </Box>
                  ))}
               </Box>
            </DialogContent>
         </Dialog>

         <Dialog
            open={openDiary}
            onClose={handleCloseDiary}
            maxWidth="md"
            fullWidth
            sx={{
               borderRadius: 4,
            }}
         >
            <Box sx={{ display: 'flex', justifyContent: 'flex-end', p: 1 }}>
               <IconButton onClick={handleCloseDiary}>
                  <CloseIcon />
               </IconButton>
            </Box>
            <DialogContent>
               {selectedId && <ViewDiaryDate studentId={selectedId} userId={userId} />}
            </DialogContent>
         </Dialog>
      </>
   );
}