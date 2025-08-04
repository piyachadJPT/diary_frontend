'use client'

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
   Fab,
   Chip,
   LinearProgress
} from "@mui/material";
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import PublicIcon from '@mui/icons-material/Public';
import PersonIcon from '@mui/icons-material/Person';
import SchoolIcon from '@mui/icons-material/School';
import LockIcon from '@mui/icons-material/Lock';
import LanguageIcon from '@mui/icons-material/Language';
import AttachFileIcon from '@mui/icons-material/AttachFile';
import DeleteIcon from '@mui/icons-material/Delete';
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

interface DiaryWithDetails extends Diary {
   ID: number;
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

interface FileWithPreview {
   file: File;
   id: string;
   name: string;
   size: number;
   type: string;
}

interface ExistingAttachment {
   ID: number;
   DiaryID: number;
   FileURL: string;
   FileName: string;
}

interface NewDiaryProps {
   onDiarySaved?: () => void;
   editDiary?: DiaryWithDetails | null;
   onEditComplete?: () => void;
}

export default function NewDiary({ onDiarySaved, editDiary, onEditComplete }: NewDiaryProps) {
   const { data: session } = useSession();
   const [open, setOpen] = useState(false);
   const [status, setStatus] = useState('veryHappy');
   const [shareAnchor, setShareAnchor] = React.useState<HTMLElement | null>(null);
   const [shareOption, setShareOption] = useState('everyone');
   const [content, setContent] = useState('');
   const [contentDelta, setContentDelta] = useState('');
   const [userId, setUserId] = useState<number | null>(null);
   const [isLoading, setIsLoading] = useState(false);
   const [selectedFiles, setSelectedFiles] = useState<FileWithPreview[]>([]);
   const [existingAttachments, setExistingAttachments] = useState<ExistingAttachment[]>([]);
   const [uploadProgress, setUploadProgress] = useState(0);
   const [isEditMode, setIsEditMode] = useState(false);
   const [editingDiaryId, setEditingDiaryId] = useState<number | null>(null);
   const [isDeletingFile, setIsDeletingFile] = useState<number | null>(null);

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

   useEffect(() => {
      if (editDiary) {
         setIsEditMode(true);
         setEditingDiaryId(editDiary.ID);
         setContent(editDiary.ContentHTML);
         setContentDelta(editDiary.ContentDelta);
         setStatus(editDiary.Status);
         setShareOption(editDiary.IsShared);
         setExistingAttachments(editDiary.Attachments || []);
         setSelectedFiles([]);
         setOpen(true);
      }
   }, [editDiary]);

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

   const handleStatusChange = (newStatus: string) => {
      setStatus(newStatus);
   };

   const handleShareClick = (event: React.MouseEvent<HTMLElement>) => {
      setShareAnchor(event.currentTarget);
   };

   const handleShareClose = () => {
      setShareAnchor(null);
   };

   const handleShareSelect = (option: string) => {
      setShareOption(option);
      handleShareClose();
   };

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
      setSelectedFiles([]);
      setExistingAttachments([]);
      setUploadProgress(0);
      setIsEditMode(false);
      setEditingDiaryId(null);
      setIsDeletingFile(null);
   };

   const handleContentChange = (html: string, delta: unknown) => {
      setContent(html);
      setContentDelta(JSON.stringify(delta || {}));
   };

   const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
      const files = event.target.files;
      if (!files) return;

      const newFiles: FileWithPreview[] = Array.from(files).map(file => ({
         file,
         id: Math.random().toString(36).substr(2, 9),
         name: file.name,
         size: file.size,
         type: file.type
      }));

      setSelectedFiles(prev => [...prev, ...newFiles]);
      event.target.value = '';
   };

   const handleRemoveFile = (fileId: string) => {
      setSelectedFiles(prev => prev.filter(f => f.id !== fileId));
   };

   const handleRemoveExistingFile = async (attachmentId: number) => {
      setIsDeletingFile(attachmentId);

      try {
         const response = await fetchWithBase(`/api/diary/attachment/${attachmentId}`, {
            method: 'DELETE',
            headers: {
               'Content-Type': 'application/json',
            },
         });

         if (response.ok) {
            setExistingAttachments(prev => prev.filter(att => att.ID !== attachmentId));
         } else {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || errorData.error || 'Failed to delete file');
         }
      } catch (error) {
         console.error('Error deleting file:', error);

         const errorMessage = error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการลบไฟล์';

         Swal.fire({
            icon: 'error',
            title: 'ลบไฟล์ไม่สำเร็จ',
            text: errorMessage,
            confirmButtonText: 'ตกลง',
         });
      } finally {
         setIsDeletingFile(null);
      }
   };

   const formatFileSize = (bytes: number) => {
      if (bytes === 0) return '0 Bytes';
      const k = 1024;
      const sizes = ['Bytes', 'KB', 'MB', 'GB'];
      const i = Math.floor(Math.log(bytes) / Math.log(k));
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
   };

   const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();

      if (!content.trim() || content === '<p><br></p>') {
         Swal.fire({
            icon: "warning",
            text: "กรุณาเพิ่มรายละเอียด",
            showConfirmButton: false,
            timer: 2500,
         });
         return;
      }

      if (!userId) {
         Swal.fire({
            icon: "error",
            text: "ไม่พบข้อมูลผู้ใช้",
            showConfirmButton: false,
            timer: 2500,
         });
         return;
      }

      setIsLoading(true);
      setUploadProgress(0);

      try {
         const diaryData: Diary = {
            StudentID: userId,
            ContentHTML: content,
            ContentDelta: contentDelta,
            IsShared: shareOption,
            AllowComment: shareOption !== 'personal',
            DiaryDate: isEditMode ? editDiary!.DiaryDate : new Date().toISOString(),
            Status: status
         };

         let response;
         let diaryId;

         if (isEditMode && editingDiaryId) {
            response = await fetchWithBase(`/api/diary/${editingDiaryId}`, {
               method: "PUT",
               headers: {
                  "Content-Type": "application/json",
               },
               body: JSON.stringify(diaryData),
            });
            diaryId = editingDiaryId;
         } else {
            response = await fetchWithBase("/api/diary", {
               method: "POST",
               headers: {
                  "Content-Type": "application/json",
               },
               body: JSON.stringify(diaryData),
            });

            const responseData = await response.json();
            diaryId = responseData.id || responseData.ID || responseData.diary_id ||
               responseData.insertId || responseData.data?.id || responseData.data?.ID ||
               responseData.result?.insertId;
         }

         if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText || 'Failed to save diary'}`);
         }

         setUploadProgress(30);

         if (selectedFiles.length > 0) {
            try {
               setUploadProgress(50);

               const formData = new FormData();
               formData.append("diary_id", diaryId.toString());

               selectedFiles.forEach(fileData => {
                  formData.append("files", fileData.file);
               });

               setUploadProgress(70);

               const fileRes = await fetchWithBase("/api/diary/uploadfile", {
                  method: "POST",
                  body: formData,
               });

               setUploadProgress(90);

               if (!fileRes.ok) {
                  const fileResponseData = await fileRes.json();
                  throw new Error(fileResponseData.error || "อัปโหลดไฟล์ไม่สำเร็จ");
               }

               setUploadProgress(100);
            } catch (fileError) {
               console.error("File upload error:", fileError);
               Swal.fire({
                  icon: "warning",
                  text: `${isEditMode ? 'แก้ไข' : 'บันทึก'}บันทึกสำเร็จ แต่อัปโหลดไฟล์ไม่สำเร็จ`,
                  showConfirmButton: false,
                  timer: 4000,
               });
            }
         }

         const successMessage = isEditMode ? "แก้ไขบันทึกสำเร็จ" : "บันทึกบันทึกสำเร็จ";
         const fileMessage = selectedFiles.length > 0 ? ` พร้อมไฟล์แนบ ${selectedFiles.length} ไฟล์` : "";

         Swal.fire({
            icon: "success",
            text: successMessage + fileMessage,
            showConfirmButton: false,
            timer: 2000,
         });

         resetForm();
         setOpen(false);

         if (isEditMode && onEditComplete) {
            onEditComplete();
         } else if (onDiarySaved) {
            onDiarySaved();
         }

      } catch (err) {
         console.error("Error submitting diary:", err);
         const errorMessage = err instanceof Error ? err.message : `เกิดข้อผิดพลาดในการ${isEditMode ? 'แก้ไข' : 'บันทึก'}บันทึก`;

         Swal.fire({
            icon: "error",
            title: `${isEditMode ? 'แก้ไข' : 'บันทึก'}บันทึกไม่สำเร็จ`,
            text: errorMessage,
            showConfirmButton: false,
         });
      } finally {
         setIsLoading(false);
         setUploadProgress(0);
      }
   };

   const handleClose = () => {
      if (isLoading || isDeletingFile) return;

      if (isEditMode) {
         resetForm();
         if (onEditComplete) {
            onEditComplete();
         }
      }
      setOpen(false);
   };

   return (
      <>
         {!isEditMode && (
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
         )}

         <Dialog
            open={open}
            onClose={handleClose}
            disableEscapeKeyDown={isLoading || isDeletingFile !== null}
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
                     {isEditMode ? 'แก้ไขบันทึก' : 'บันทึกความคืบหน้า'}
                  </Typography>
                  <IconButton
                     onClick={handleClose}
                     disabled={isLoading || isDeletingFile !== null}
                     sx={{
                        color: '#666',
                        "&:hover": {
                           color: '#212121',
                        },
                        "&:disabled": {
                           color: '#ccc',
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

                  <Box sx={{ mb: 2 }}>
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

                  {isEditMode && existingAttachments.length > 0 && (
                     <Box sx={{ mb: 2.5 }}>
                        <Typography variant="body2" sx={{ mb: 1, color: '#666' }}>
                           ไฟล์แนบปัจจุบัน ({existingAttachments.length} ไฟล์)
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                           {existingAttachments.map((attachment) => (
                              <Chip
                                 key={attachment.ID}
                                 icon={<AttachFileIcon />}
                                 label={attachment.FileName || 'ไฟล์ไม่มีชื่อ'}
                                 variant="outlined"
                                 onDelete={() => handleRemoveExistingFile(attachment.ID)}
                                 deleteIcon={
                                    isDeletingFile === attachment.ID ? (
                                       <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                          <Typography variant="caption" sx={{ mr: 0.5 }}>
                                             กำลังลบ...
                                          </Typography>
                                       </Box>
                                    ) : (
                                       <DeleteIcon />
                                    )
                                 }
                                 sx={{
                                    maxWidth: 300,
                                    opacity: isDeletingFile === attachment.ID ? 0.7 : 1,
                                    '& .MuiChip-label': {
                                       overflow: 'hidden',
                                       textOverflow: 'ellipsis',
                                       whiteSpace: 'nowrap',
                                    },
                                    '& .MuiChip-deleteIcon': {
                                       color: isDeletingFile === attachment.ID ? '#999' : '#e53935',
                                    },
                                 }}
                              />
                           ))}
                        </Box>
                     </Box>
                  )}

                  <Box sx={{
                     display: 'flex',
                     justifyContent: 'center',
                     mb: 3,
                     py: 2,
                     mx: 'auto',
                     width: 700,
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
                        <Typography variant="body2">
                           {isEditMode ? 'เพิ่มไฟล์แนบใหม่' : 'เลือกไฟล์แนบ'}
                        </Typography>
                        <input
                           type="file"
                           multiple
                           hidden
                           onChange={handleFileSelect}
                           accept=".pdf"
                        />
                     </Button>
                  </Box>

                  {selectedFiles.length > 0 && (
                     <Box sx={{ mb: 2.5 }}>
                        <Typography variant="body2" sx={{ mb: 1, color: '#666' }}>
                           ไฟล์ใหม่ที่เลือก ({selectedFiles.length} ไฟล์)
                        </Typography>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                           {selectedFiles.map((fileData) => (
                              <Chip
                                 key={fileData.id}
                                 icon={<AttachFileIcon />}
                                 label={`${fileData.name} (${formatFileSize(fileData.size)})`}
                                 onDelete={() => handleRemoveFile(fileData.id)}
                                 deleteIcon={<DeleteIcon />}
                                 variant="outlined"
                                 sx={{
                                    maxWidth: 300,
                                    backgroundColor: '#e3f2fd',
                                    '& .MuiChip-label': {
                                       overflow: 'hidden',
                                       textOverflow: 'ellipsis',
                                       whiteSpace: 'nowrap',
                                    },
                                 }}
                              />
                           ))}
                        </Box>
                     </Box>
                  )}

                  {isLoading && uploadProgress > 0 && (
                     <Box sx={{ mb: 3 }}>
                        <Typography variant="body2" sx={{ mb: 1, color: '#666' }}>
                           {isEditMode ? 'กำลังแก้ไข...' : 'กำลังอัปโหลด...'} {uploadProgress}%
                        </Typography>
                        <LinearProgress variant="determinate" value={uploadProgress} />
                     </Box>
                  )}

                  <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                     <Button
                        onClick={handleClose}
                        disabled={isLoading || isDeletingFile !== null}
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
                           '&:disabled': {
                              backgroundColor: '#f5f5f5',
                              color: '#ccc',
                           },
                        }}
                     >
                        ยกเลิก
                     </Button>
                     <Button
                        onClick={handleSubmit}
                        disabled={isLoading || isDeletingFile !== null}
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
                           '&:disabled': {
                              backgroundColor: '#ccc',
                              color: '#999',
                           },
                        }}
                     >
                        {isLoading ?
                           (isEditMode ? 'กำลังแก้ไข...' : 'กำลังบันทึก...') :
                           (isEditMode ? 'บันทึกการแก้ไข' : 'บันทึก')
                        }
                     </Button>
                  </Box>
               </Box>
            </DialogContent>
         </Dialog>
      </>
   );
}