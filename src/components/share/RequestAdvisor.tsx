import { Dialog, DialogContent, Box, Button, IconButton, Typography, TextField, Paper, Avatar, Chip } from '@mui/material'
import React, { useState, useEffect } from 'react'
import { Close as CloseIcon, PersonAdd as PersonAddIcon, Check as CheckIcon } from '@mui/icons-material';
import { fetchWithBase } from '@/app/unit/fetchWithUrl';
import { withBasePath } from '@/app/unit/imageSrc';
import Swal from 'sweetalert2';

interface RequestAdvisorProps {
   userId: number | null;
   openRequestAdvisor: boolean;
   onClose: () => void;
}

interface Advisor {
   ID: number;
   Name: string | null;
   Email: string;
   Image: string | null;
}

export default function RequestAdvisor({ userId, openRequestAdvisor, onClose }: RequestAdvisorProps) {
   const [searchEmail, setSearchEmail] = useState('');
   const [advisors, setAdvisors] = useState<Advisor[]>([]);
   const [filteredAdvisors, setFilteredAdvisors] = useState<Advisor[]>([]);
   const [selectedAdvisor, setSelectedAdvisor] = useState<Advisor | null>(null);
   const [loading, setLoading] = useState(false);

   const fetchAllAdvisor = async () => {
      try {
         const res = await fetchWithBase('/api/admin/allteachers');
         const data = await res.json();
         setAdvisors(data);
         setFilteredAdvisors(data);
      } catch (error) {
         console.log('Fetch All Advisor :', error);
      }
   };

   useEffect(() => {
      fetchAllAdvisor();
   }, []);

   useEffect(() => {
      if (searchEmail.trim() === '') {
         setFilteredAdvisors(advisors);
      } else {
         const filtered = advisors.filter(advisor =>
            advisor.Email.toLowerCase().includes(searchEmail.toLowerCase()) ||
            (advisor.Name && advisor.Name.toLowerCase().includes(searchEmail.toLowerCase()))
         );
         setFilteredAdvisors(filtered);
      }
   }, [searchEmail, advisors]);

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!selectedAdvisor || !userId) return;

      setLoading(true);
      try {
         const res = await fetchWithBase('/api/student-advisor', {
            method: 'POST',
            headers: {
               'Content-Type': 'application/json',
            },
            body: JSON.stringify({
               student_id: userId,
               advisor_id: selectedAdvisor.ID
            })
         });

         const data = await res.json()

         if (res.ok) {
            Swal.fire({
               icon: 'success',
               text: 'ส่งตำขอสำเร็จ',
               showConfirmButton: false,
               timer: 1500,
            })
         } else if (!res.ok && data.message === 'คุณได้ส่งคำขออาจารย์ท่านนี้แล้ว') {
            Swal.fire({
               icon: 'error',
               text: 'คุณได้ส่งคำขออาจารย์ท่านนี้แล้ว',
               showConfirmButton: false,
               timer: 1500,
            })
         } else {
            console.error('Failed to send advisor request');
            Swal.fire({
               icon: 'error',
               text: 'ส่งตำขอไม่สำเร็จ',
               showConfirmButton: false,
               timer: 1500,
            })
         }
      } catch (error) {
         console.error('Error requesting advisor:', error);
         Swal.fire({
            icon: 'error',
            text: 'เกิดข้อผิดพลาด',
            showConfirmButton: false,
            timer: 1500,
         })
      } finally {
         setLoading(false);
      }
      handleClose();
   };

   const handleClose = () => {
      setSearchEmail('');
      setSelectedAdvisor(null);
      setFilteredAdvisors([]);
      onClose();
   };

   const handleSelectAdvisor = (advisor: Advisor) => {
      setSelectedAdvisor(advisor);
   };

   return (
      <>
         <Dialog
            open={openRequestAdvisor}
            onClose={handleClose}
            PaperProps={{
               sx: {
                  borderRadius: 4,
                  width: "90vw",
                  maxWidth: "600px",
                  p: 0,
                  overflow: "hidden",
                  maxHeight: "80vh",
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
               <Box sx={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  p: 3,
                  pb: 2,
                  borderBottom: '1px solid rgba(0, 0, 0, 0.06)',
                  backgroundColor: "white",
                  position: "sticky",
                  top: 0,
                  zIndex: 1
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
                        เลือกอาจารย์ที่ปรึกษา
                     </Typography>
                  </Box>

                  <IconButton
                     onClick={handleClose}
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

               <Box sx={{ p: 3, pb: 1 }}>
                  <TextField
                     fullWidth
                     label="ค้นหาอาจารย์"
                     type="text"
                     value={searchEmail}
                     onChange={(e) => setSearchEmail(e.target.value)}
                     placeholder="พิมพ์ชื่อหรืออีเมล์อาจารย์"
                     variant="outlined"
                     disabled={loading}
                     sx={{
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
               </Box>

               {selectedAdvisor && (
                  <Box sx={{ px: 3, pb: 2 }}>
                     <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                        อาจารย์ที่เลือก:
                     </Typography>
                     <Chip
                        avatar={
                           <Avatar
                              src={selectedAdvisor.Image || withBasePath("/default-avatar.png")}
                              sx={{ width: 24, height: 24 }}
                           />
                        }
                        label={`${selectedAdvisor.Name || 'ไม่ระบุชื่อ'} (${selectedAdvisor.Email})`}
                        onDelete={() => setSelectedAdvisor(null)}
                        color="primary"
                        sx={{
                           backgroundColor: 'rgba(126, 87, 194, 0.1)',
                           color: '#7E57C2',
                           '& .MuiChip-deleteIcon': {
                              color: '#7E57C2'
                           }
                        }}
                     />
                  </Box>
               )}

               <Box
                  sx={{
                     flex: 1,
                     overflowY: 'auto',
                     px: 3,
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
                  {filteredAdvisors.length === 0 ? (
                     <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography color="text.secondary">
                           ไม่พบอาจารย์ที่ค้นหา
                        </Typography>
                     </Box>
                  ) : (
                     filteredAdvisors.map((filteredAdvisors) => (
                        <Paper
                           key={filteredAdvisors.ID}
                           sx={{
                              mb: 1.5,
                              boxShadow: selectedAdvisor?.ID === filteredAdvisors.ID
                                 ? '0 2px 12px rgba(126, 87, 194, 0.2)'
                                 : '0 1px 4px rgba(0, 0, 0, 0.05)',
                              border: selectedAdvisor?.ID === filteredAdvisors.ID
                                 ? '2px solid #7E57C2'
                                 : '1px solid rgba(0, 0, 0, 0.06)',
                              borderRadius: 3,
                              transition: 'all 0.2s ease',
                              cursor: 'pointer',
                              '&:hover': {
                                 boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                                 transform: 'translateY(-1px)',
                              }
                           }}
                           onClick={() => handleSelectAdvisor(filteredAdvisors)}
                        >
                           <Box sx={{
                              p: 2,
                              display: 'flex',
                              alignItems: 'center',
                           }}>
                              <Avatar
                                 src={filteredAdvisors.Image || withBasePath("/default-avatar.png")}
                                 alt={filteredAdvisors.Name || ''}
                                 sx={{ width: 48, height: 48, mr: 2.5, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}
                              />
                              <Box sx={{ flex: 1 }}>
                                 <Typography variant="subtitle2" fontWeight={600} sx={{ color: '#1a1a1a', fontSize: '0.95rem' }}>
                                    {filteredAdvisors.Name || 'ยังไม่ได้เคยเข้าสู่ระบบ'}
                                 </Typography>
                                 <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                    {filteredAdvisors.Email}
                                 </Typography>
                              </Box>
                              {selectedAdvisor?.ID === filteredAdvisors.ID && (
                                 <Box sx={{
                                    backgroundColor: '#7E57C2',
                                    borderRadius: '50%',
                                    p: 0.5,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                 }}>
                                    <CheckIcon sx={{ color: 'white', fontSize: 16 }} />
                                 </Box>
                              )}
                           </Box>
                        </Paper>
                     ))
                  )}
               </Box>

               <Box sx={{
                  p: 3,
                  pt: 2,
                  borderTop: '1px solid rgba(0, 0, 0, 0.06)',
                  backgroundColor: "white",
                  display: 'flex',
                  gap: 2,
                  justifyContent: 'flex-end',
               }}>
                  <Button
                     variant="outlined"
                     onClick={handleClose}
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
                     onClick={handleSubmit}
                     variant="contained"
                     disabled={loading || !selectedAdvisor}
                     sx={{
                        borderRadius: 2.5,
                        px: 4,
                        py: 1.2,
                        fontWeight: 600,
                        textTransform: 'none',
                        fontSize: '0.9rem',
                        backgroundColor: '#7E57C2',
                        transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                        '&:hover': {
                           backgroundColor: '#673ab7',
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
                     {loading ? 'กำลังส่งคำขอ...' : 'ส่งคำขอ'}
                  </Button>
               </Box>
            </DialogContent>
         </Dialog>
      </>
   )
}