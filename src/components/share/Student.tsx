import {
   Paper,
   Box,
   Button,
   Dialog,
   Avatar,
   DialogContent,
   Typography,
   IconButton,
   Tooltip
} from '@mui/material';
import AddNewStudent from './AddNewStudent';
import React, { useState, useEffect, useCallback } from 'react'
import { fetchWithBase } from "@/app/unit/fetchWithUrl"
import DeleteIcon from '@mui/icons-material/Delete';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import Swal from 'sweetalert2';
import ViewDiaryDate from '@/components/share/ViewDiaryDate'
import CloseIcon from '@mui/icons-material/Close'

interface StudentAdvisor {
   id: number;
   CreatedAt?: string;
   AdvisorID: number;
   student_id: number;
   student: {
      ID: number;
      Name: string | null;
      Email: string;
      Role: string;
      Image: string | null;
      CreatedAt: string;
   };
   Advisor?: {
      Name: string;
      Email: string;
      Image: string;
      Role: string;
   }
}

interface StudentProps {
   advisorId: number | null;
}

const Student = ({ advisorId }: StudentProps) => {
   const [selectedId, setSelectedId] = useState<number | null>(null);
   const [openDialog, setOpenDialog] = useState(false);
   const [studentAdvisor, setStudentAdvisor] = useState<StudentAdvisor[]>([])
   const [isLoading, setIsLoading] = useState<boolean>(true);
   const [error, setError] = useState<string | null>(null);
   const [open, setOpen] = useState(false);

   const handleOpenDialog = () => {
      setOpenDialog(true);
   };

   const handleOpen = (id: number) => {
      setSelectedId(id);
      setOpen(true);
   }

   const handleClose = () => {
      setOpen(false);
      setSelectedId(null);
   }

   const handleCloseDialog = () => {
      setOpenDialog(false);
   };

   const fetchStudentAdvisor = useCallback(async () => {
      if (advisorId) {
         try {
            setIsLoading(true);
            setError(null);
            const res = await fetchWithBase(`/api/studentAdvisor?advisor_id=${advisorId}`)

            if (!res.ok) {
               throw new Error('Failed to fetch student advisor data');
            }

            const data = await res.json()
            setStudentAdvisor(data.data || [])
         } catch (error) {
            console.error('Error fetching student advisor:', error);
            setError('ไม่สามารถดึงข้อมูล student advisor ได้');
         } finally {
            setIsLoading(false);
         }
      } else {
         setStudentAdvisor([]);
         setIsLoading(false);
         setError(null);
      }
   }, [advisorId])

   useEffect(() => {
      fetchStudentAdvisor()
   }, [fetchStudentAdvisor])

   const deleteStudentAdvisor = async (id: number, email: string) => {
      const result = await Swal.fire({
         text: `คุณต้องการลบ ${email} ใช่หรือไม่?`,
         icon: 'question',
         showCancelButton: true,
         confirmButtonColor: "#d33",
         cancelButtonColor: "#899499",
         cancelButtonText: "ยกเลิก",
         confirmButtonText: "ยืนยัน",
      });

      if (result.isConfirmed) {
         try {
            const res = await fetchWithBase(`/api/studentAdvisor?id=${id}`, {
               method: 'DELETE'
            })

            if (!res.ok) throw new Error('Delete failed');
            const deleteResult = await res.json();

            if (deleteResult.ok) {
               Swal.fire({
                  icon: "success",
                  text: "ลบนิสิตในการดูแลสำเร็จ",
                  showConfirmButton: false,
                  timer: 1500
               });
               fetchStudentAdvisor();
            } else {
               Swal.fire({
                  icon: "error",
                  text: "ไม่สามารถลบนิสิตในการดูแลได้",
                  showConfirmButton: false,
                  timer: 1500
               });
            }
         } catch (err) {
            console.log(err)
            Swal.fire({
               icon: "error",
               text: "เกิดข้อผิดพลาดในการลบนิสิตในการดูแล",
               showConfirmButton: false,
               timer: 1500
            });
         }
      }
   }

   if (isLoading) {
      return (
         <Paper
            elevation={0}
            sx={{
               height: '100%',
               width: '100%',
               display: 'flex',
               alignItems: 'center',
               justifyContent: 'center',
               borderRadius: 3,
               border: '1px solid #e0e0e0'
            }}
         >
            <div className="flex items-center justify-center h-screen">
               <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                  <p className="text-lg">กำลังโหลด...</p>
               </div>
            </div>
         </Paper>
      );
   }

   if (error) {
      return (
         <>
            <Paper
               elevation={0}
               sx={{
                  height: '100%',
                  width: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  borderRadius: 3,
                  border: '1px solid #e0e0e0'
               }}
            >
               <Box
                  sx={{
                     p: 2,
                     pb: 0,
                     flex: 1,
                     overflowY: 'auto',
                     // scrollbarWidth: 'none',
                     // '&::-webkit-scrollbar': {
                     //    display: 'none',
                     // },
                  }}>
                  <Box
                     sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        height: '100%',
                     }}
                  >
                     <Typography variant="body2" color="text.secondary">
                        ไม่มีข้อมูลนิสิต
                     </Typography>
                  </Box>

               </Box>

               <Box sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
                  <Button
                     fullWidth
                     variant="contained"
                     onClick={handleOpenDialog}
                     sx={{
                        py: 0.5,
                        backgroundColor: '#7E57C2',
                        color: '#ffffff',
                        borderRadius: '3px',
                        textTransform: 'none',
                        fontSize: '14px',
                        fontWeight: 500,
                        boxShadow: 'none',
                        '&:hover': {
                           backgroundColor: '#8C7BB7',
                           boxShadow: 'none',
                        },
                     }}
                  >
                     เพิ่มนิสิตใหม่
                  </Button>
               </Box>
            </Paper>

            <Dialog
               open={openDialog}
               onClose={handleCloseDialog}
               maxWidth="md"
               fullWidth
               PaperProps={{
                  sx: {
                     minHeight: '100px',
                     backgroundColor: '#ffffff',
                     borderRadius: 3,
                     p: 1
                  }
               }}
            >
               <AddNewStudent advisorId={advisorId} onClose={handleCloseDialog} onStudentAdvisorSave={fetchStudentAdvisor} />
            </Dialog>
         </>
      );
   }

   return (
      <>
         <Paper
            elevation={0}
            sx={{
               height: '100%',
               width: '100%',
               display: 'flex',
               flexDirection: 'column',
               borderRadius: 3,
               border: '1px solid #e0e0e0'
            }}
         >
            <Box
               sx={{
                  p: 2,
                  pb: 0,
                  flex: 1,
                  overflowY: 'auto',
                  flexDirection: 'column',
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
                  }
                  // scrollbarWidth: 'none',
                  // '&::-webkit-scrollbar': {
                  //    display: 'none',
                  // },
               }}>
               {studentAdvisor.length > 0 ? studentAdvisor.map((item) => (
                  <Paper
                     key={item.id}
                     sx={{
                        mb: 1,
                        boxShadow: 'none',
                     }}
                  >
                     <Box sx={{
                        p: 2,
                        display: 'flex',
                        alignItems: 'center',
                        borderBottom: "1px solid #eeeeee"
                     }}>
                        <Avatar
                           src={item.student?.Image || '/default-avatar.svg'}
                           alt={item.student?.Name || ''}
                           sx={{ width: 40, height: 40, mr: 2 }}
                        />
                        <Box sx={{ flex: 1 }}>
                           <Box sx={{ display: 'flex', alignItems: 'center' }}>
                              <Box sx={{ display: 'flex', flexDirection: 'column', mr: 1 }}>
                                 <Typography
                                    variant="subtitle2"
                                    fontWeight="bold"
                                    sx={{ mb: 0, lineHeight: 1 }}
                                 >
                                    {item.student?.Name || 'ยังไม่ได้เคยเข้าสู่ระบบ'}
                                 </Typography>
                                 <Typography
                                    variant="caption"
                                    color="text.secondary"
                                    sx={{ mt: 0, lineHeight: 1 }}
                                 >
                                    {item.student?.Email || 'ไม่ระบุอีเมล'}
                                 </Typography>
                              </Box>
                           </Box>
                        </Box>
                        <Box>
                           <Tooltip title='ลบนิสิตในการดูแล'>
                              <DeleteIcon
                                 sx={{
                                    color: '#c62828',
                                    mr: 1,
                                    cursor: 'pointer',
                                    '&:hover': {
                                       color: '#b71c1c',
                                       transform: 'scale(1.1)',
                                       transition: 'all 0.3s ease',
                                    },
                                 }}
                                 onClick={() => deleteStudentAdvisor(item.id, item.student?.Email || '')}
                              />
                           </Tooltip>
                           <Tooltip title='ดูบันทึก'>
                              <IconButton onClick={() => handleOpen(item.student_id)}>
                                 <RemoveRedEyeIcon
                                    sx={{
                                       color: '#673ab7',
                                       cursor: 'pointer',
                                       '&:hover': {
                                          color: '#673ab0',
                                          transform: 'scale(1.1)',
                                          transition: 'all 0.3s ease',
                                       },
                                    }}
                                 />
                              </IconButton>
                           </Tooltip>
                        </Box>
                     </Box>
                  </Paper>
               )) : (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                     <Typography color="text.secondary">
                        ไม่มีข้อมูลนิสิต
                     </Typography>
                  </Box>
               )}
            </Box>

            <Box sx={{ p: 3, borderTop: '1px solid #e0e0e0' }}>
               <Button
                  fullWidth
                  variant="contained"
                  onClick={handleOpenDialog}
                  sx={{
                     py: 0.5,
                     backgroundColor: '#7E57C2',
                     color: '#ffffff',
                     borderRadius: '3px',
                     textTransform: 'none',
                     fontSize: '14px',
                     fontWeight: 500,
                     boxShadow: 'none',
                     '&:hover': {
                        backgroundColor: '#8C7BB7',
                        boxShadow: 'none',
                     },
                  }}
               >
                  เพิ่มนิสิตใหม่
               </Button>
            </Box>
         </Paper>

         <Dialog
            open={openDialog}
            onClose={handleCloseDialog}
            maxWidth="md"
            fullWidth
            PaperProps={{
               sx: {
                  minHeight: '100px',
                  backgroundColor: '#ffffff',
                  borderRadius: 3,
                  p: 1
               }
            }}
         >
            <AddNewStudent advisorId={advisorId} onClose={handleCloseDialog} onStudentAdvisorSave={fetchStudentAdvisor} />
         </Dialog>
         <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            PaperProps={{
               sx: {
                  borderRadius: 4,
                  p: 2,
               },
            }}
         >
            <IconButton
               onClick={handleClose}
               sx={{
                  p: 2,
                  position: 'absolute',
                  top: 8,
                  right: 8,
                  zIndex: 10,
                  color: '#7E57C2',
                  '&:hover': {
                     color: '#000',
                  },
               }}
            >
               <CloseIcon />
            </IconButton>
            <DialogContent>
               <ViewDiaryDate studentId={selectedId} />
            </DialogContent>
         </Dialog>
      </>
   );
};

export default Student;