import React, { useState, useEffect } from "react";
import {
   Button,
   Dialog,
   DialogContent,
   IconButton,
   Box,
   Typography,
   Tooltip,
   Menu,
   MenuItem,
   ListItemIcon,
   ListItemText,
   Fab
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PublicIcon from '@mui/icons-material/Public';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import LockIcon from '@mui/icons-material/Lock';
import LanguageIcon from '@mui/icons-material/Language';
import 'react-quill/dist/quill.snow.css'
import QuillEditor from '../share/QuillEditor'
import SentimentVerySatisfiedIcon from '@mui/icons-material/SentimentVerySatisfied';
import SentimentSatisfiedAltIcon from '@mui/icons-material/SentimentSatisfiedAlt';
import SentimentNeutralIcon from '@mui/icons-material/SentimentNeutral';
import SentimentDissatisfiedIcon from '@mui/icons-material/SentimentDissatisfied';
import SentimentVeryDissatisfiedIcon from '@mui/icons-material/SentimentVeryDissatisfied';
import { useSession } from 'next-auth/react';
import { fetchWithBase } from "@/app/unit/fetchWithUrl"
import Swal from 'sweetalert2';

interface Diary {
   StudentID: number
   ContentHTML: string
   ContentDelta: string
   IsShared: string
   AllowComment: boolean
   DiaryDate: string
   Status: string
}

export default function NewDiary() {
   const { data: session } = useSession();
   const [open, setOpen] = useState(false);
   const [status, setStatus] = useState('veryHappy');
   const [shareAnchor, setShareAnchor] = useState(null);
   const [shareOption, setShareOption] = useState('everyone');
   const [content, setContent] = useState('');
   const [contentDelta, setContentDelta] = useState('');
   const [userId, setUserId] = useState<number | null>(null);
   const [isLoading, setIsLoading] = useState(false);

   useEffect(() => {
      if (session) {
         const fetchUser = async () => {
            try {
               const res = await fetchWithBase(`/api/user?email=${session.user?.email}`);
               const data = await res.json();
               setUserId(data.ID);
            } catch (error) {
               console.error('Error fetching user:', error);
            }
         };
         fetchUser();
      }
   }, [session]);

   const statusIcons = {
      veryHappy: {
         icon: <SentimentVerySatisfiedIcon />,
         label: 'มีความสุข',
         color: '#1b5e20',
      },
      happy: {
         icon: <SentimentSatisfiedAltIcon />,
         label: 'พอใจ',
         color: '#7cb342',
      },
      neutral: {
         icon: <SentimentNeutralIcon />,
         label: 'เฉยๆ',
         color: '#ffca28',
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

   const handleStatusChange = (newStatus) => {
      setStatus(newStatus);
   };

   const handleShareClick = (event) => {
      setShareAnchor(event.currentTarget);
   };

   const handleShareClose = () => {
      setShareAnchor(null);
   };

   const handleShareSelect = (option) => {
      setShareOption(option);
      handleShareClose();
   };

   // const getShareIcon = () => {
   //    switch (shareOption) {
   //       case 'everyone': return <PublicIcon fontSize="small" />;
   //       case 'someone': return <PersonIcon fontSize="small" />;
   //       case 'teacher': return <SchoolIcon fontSize="small" />;
   //       case 'personal': return <LockIcon fontSize="small" />;
   //       default: return <PublicIcon fontSize="small" />;
   //    }
   // };

   const getShareText = () => {
      switch (shareOption) {
         case 'everyone': return 'สาธารณะ';
         case 'someone': return 'เจาะจง';
         case 'teacher': return 'อาจารย์เท่านั้น';
         case 'personal': return 'เฉพาะฉัน';
         default: return 'สาธารณะ';
      }
   };

   const resetForm = () => {
      setContent('');
      setContentDelta('');
      setStatus('veryHappy');
      setShareOption('everyone');
   };

   const handleContentChange = (html, delta) => {
      setContent(html);
      setContentDelta(JSON.stringify(delta || {}));
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!content.trim() || content === '<p><br></p>') {
         Swal.fire({
            icon: "warning",
            text: "กรุณาเพิ่มรายละเอียดในไดอารี่",
            showConfirmButton: false,
            timer: 2000,
         });
         return;
      }

      if (!userId) {
         Swal.fire({
            icon: "error",
            text: "ไม่พบข้อมูลผู้ใช้",
            showConfirmButton: false,
            timer: 2000,
         });
         return;
      }

      setIsLoading(true);

      try {
         const diaryData: Diary = {
            StudentID: userId,
            ContentHTML: content,
            ContentDelta: contentDelta,
            IsShared: shareOption,
            AllowComment: shareOption !== 'personal',
            DiaryDate: new Date().toISOString(),
            Status: status
         };

         console.log('Sending diary data:', diaryData);

         const res = await fetchWithBase("/api/diary", {
            method: "POST",
            headers: {
               "Content-Type": "application/json",
            },
            body: JSON.stringify(diaryData),
         });

         const responseData = await res.json();
         console.log('Response:', responseData);

         if (res.ok) {
            Swal.fire({
               icon: "success",
               text: "บันทึกสำเร็จ",
               showConfirmButton: false,
               timer: 2000,
            });
            resetForm();
            setOpen(false);
         } else {
            throw new Error(responseData.error || "Failed to save diary");
         }
      } catch (err) {
         console.error("Error submitting diary:", err);
         Swal.fire({
            icon: "error",
            text: "บันทึกไม่สำเร็จ",
            showConfirmButton: false,
            timer: 2000,
         });
      } finally {
         setIsLoading(false);
      }
   };

   return (
      <>
         <Fab
            onClick={() => setOpen(true)}
            sx={{
               position: "fixed",
               bottom: 16,
               right: 16,
               backgroundColor: "#000",
               color: "#fff",
               "&:hover": { backgroundColor: "#333" },
            }}
         >
            <AddIcon />
         </Fab>

         <Dialog
            open={open}
            onClose={() => setOpen(false)}
            PaperProps={{
               sx: {
                  borderRadius: 4,
                  width: "90vw",
                  maxWidth: "900px",
                  padding: 2,
               },
            }}
         >
            <DialogContent sx={{ padding: 0 }}>
               <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  p: 2,
                  borderBottom: '1px solid #e0e0e0'
               }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                     บันทึกความคืบหน้า
                  </Typography>
                  <IconButton
                     onClick={() => setOpen(false)}
                     sx={{
                        color: '#666',
                        "&:hover": {
                           color: '#212121',
                        },
                     }}
                  >
                     <CloseIcon />
                  </IconButton>
               </Box>

               <Box sx={{ p: 3 }}>
                  <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
                     รายละเอียด
                  </Typography>
                  <QuillEditor value={content} onChange={handleContentChange} />

                  <Box sx={{ alignItems: 'center', mb: 1, mt: 3, display: { xs: 'flex' } }}>
                     <Typography variant="body2" sx={{ mr: 2, color: '#666' }}>
                        สถานะของฉัน :
                     </Typography>
                     <Box sx={{ display: 'flex', gap: 1 }}>
                        {Object.entries(statusIcons).map(([key, { icon, label, color }]) => (
                           <IconButton
                              key={key}
                              onClick={() => handleStatusChange(key)}
                              aria-label={key}
                              sx={{
                                 width: 40,
                                 height: 40,
                                 color: status === key ? color : '#666',
                                 border: `2px solid ${status === key ? color : '#e0e0e0'}`,
                                 borderRadius: '50%',
                                 transition: 'all 0.2s ease-in-out',
                                 '&:hover': {
                                    backgroundColor: '#f5f5f5',
                                 },
                              }}
                           >
                              <Tooltip title={label}>
                                 {icon}
                              </Tooltip>
                           </IconButton>
                        ))}
                     </Box>

                     <Box sx={{ ml: 'auto', position: 'relative' }}>
                        <IconButton
                           onClick={handleShareClick}
                           sx={{
                              width: 40,
                              height: 40,
                              border: '1px solid #e0e0e0',
                              borderRadius: '50%',
                              color: '#666',
                           }}
                        >
                           <LanguageIcon fontSize="small" />
                        </IconButton>

                        <Menu
                           anchorEl={shareAnchor}
                           open={Boolean(shareAnchor)}
                           onClose={handleShareClose}
                           sx={{
                              '& .MuiPaper-root': {
                                 borderRadius: 2,
                                 minWidth: 180,
                              },
                           }}
                        >
                           <MenuItem onClick={() => handleShareSelect('everyone')}>
                              <ListItemIcon><PublicIcon fontSize="small" /></ListItemIcon>
                              <ListItemText>สาธารณะ</ListItemText>
                           </MenuItem>
                           <MenuItem onClick={() => handleShareSelect('someone')}>
                              <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
                              <ListItemText>เจาะจง</ListItemText>
                           </MenuItem>
                           <MenuItem onClick={() => handleShareSelect('teacher')}>
                              <ListItemIcon><SchoolIcon fontSize="small" /></ListItemIcon>
                              <ListItemText>อาจารย์เท่านั้น</ListItemText>
                           </MenuItem>
                           <MenuItem onClick={() => handleShareSelect('personal')}>
                              <ListItemIcon><LockIcon fontSize="small" /></ListItemIcon>
                              <ListItemText>เฉพาะฉัน</ListItemText>
                           </MenuItem>
                        </Menu>
                     </Box>
                  </Box>

                  <Box sx={{ mb: 3 }}>
                     <Typography
                        variant="body2"
                        sx={{
                           color: '#666',
                           fontSize: '12px',
                           textAlign: 'right',
                        }}
                     >
                        {getShareText()}
                     </Typography>
                  </Box>

                  <Box sx={{
                     display: 'flex',
                     justifyContent: 'center',
                     mb: 3,
                     py: 3,
                     border: '2px dashed #e0e0e0',
                     borderRadius: 2,
                     cursor: 'pointer',
                     '&:hover': {
                        borderColor: '#7e57c2',
                        backgroundColor: '#f5f5f5',
                     },
                  }}>
                     <Button
                        component="label"
                        sx={{
                           display: 'flex',
                           flexDirection: 'column',
                           alignItems: 'center',
                           gap: 1,
                           color: '#666',
                           textTransform: 'none',
                           '&:hover': {
                              backgroundColor: 'transparent',
                           },
                        }}
                     >
                        <CloudUploadIcon sx={{ fontSize: 24 }} />
                        <Typography variant="body2">Upload File</Typography>
                        <input type="file" hidden />
                     </Button>
                  </Box>

                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                     <Button
                        onClick={() => setOpen(false)}
                        disabled={isLoading}
                        sx={{
                           backgroundColor: '#e0e0e0',
                           color: '#666',
                           px: 6,
                           py: 1,
                           borderRadius: 5,
                           textTransform: 'none',
                           '&:hover': {
                              backgroundColor: '#d0d0d0',
                           },
                        }}
                     >
                        ยกเลิก
                     </Button>
                     <Button
                        onClick={handleSubmit}
                        disabled={isLoading}
                        sx={{
                           backgroundColor: '#4caf50',
                           color: '#fff',
                           px: 6,
                           py: 1,
                           borderRadius: 5,
                           textTransform: 'none',
                           '&:hover': {
                              backgroundColor: '#45a049',
                           },
                        }}
                     >
                        {isLoading ? 'กำลังบันทึก...' : 'บันทึก'}
                     </Button>
                  </Box>
               </Box>
            </DialogContent>
         </Dialog>
      </>
   );
}