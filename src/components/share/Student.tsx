import {
   Paper,
   Box,
   Button,
   Dialog,
   Avatar,
   DialogContent,
   Typography,
   IconButton,
   Tooltip,
   Accordion,
   AccordionSummary,
   AccordionDetails,
   DialogTitle,
   Chip,
   Divider,
   Fade
} from '@mui/material';

import AddNewStudent from './AddNewStudent';
import CreateGroupDialog from './CreateGroupDialog';
import React, { useState, useEffect, useCallback } from 'react';
import { fetchWithBase } from "@/app/unit/fetchWithUrl";
import DeleteIcon from '@mui/icons-material/Delete';
import RemoveRedEyeIcon from '@mui/icons-material/RemoveRedEye';
import AddIcon from '@mui/icons-material/Add';
import GroupIcon from '@mui/icons-material/Group';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import PeopleIcon from '@mui/icons-material/People';
import GroupAddIcon from '@mui/icons-material/GroupAdd';
import Swal from 'sweetalert2';
import ViewDiaryDate from '@/components/share/ViewDiaryDate';
import CloseIcon from '@mui/icons-material/Close';
import { withBasePath } from '@/app/unit/imageSrc';

interface Student {
   id: number;
   name: string | null;
   email: string;
   image: string | null;
   created_at: string;
   joined_group_at?: string;
}

interface Group {
   ID: number;
   Name: string;
   Description?: string | null;
   AdvisorID: number;
   CreatedAt: string;
}

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
   };
}

interface StudentProps {
   advisorId: number | null;
}

interface RawGroup {
   ID: string;
   Name: string;
   Description?: string;
   AdvisorID: string;
   CreatedAt: string;
}

const Student = ({ advisorId }: StudentProps) => {
   const [selectedId, setSelectedId] = useState<number | null>(null);
   const [openDialog, setOpenDialog] = useState(false);
   const [studentAdvisor, setStudentAdvisor] = useState<StudentAdvisor[]>([]);
   const [groups, setGroups] = useState<Group[]>([]);
   const [studentsWithoutGroup, setStudentsWithoutGroup] = useState<Student[]>([]);
   const [groupStudents, setGroupStudents] = useState<{ [groupId: number]: Student[] }>({});
   const [isLoading, setIsLoading] = useState<boolean>(true);
   const [error, setError] = useState<string | null>(null);
   const [open, setOpen] = useState(false);
   const [openCreateGroup, setOpenCreateGroup] = useState(false);
   const [openAddToGroup, setOpenAddToGroup] = useState(false);
   const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
   const [selectedStudentId, setSelectedStudentId] = useState<number | null>(null);
   const [addToGroupLoading, setAddToGroupLoading] = useState(false);

   const handleOpenDialog = () => {
      setOpenDialog(true);
   };

   const handleOpen = (id: number) => {
      setSelectedId(id);
      setOpen(true);
   };

   const handleClose = () => {
      setOpen(false);
      setSelectedId(null);
   };

   const handleCloseDialog = () => {
      setOpenDialog(false);
   };

   const handleOpenCreateGroup = () => {
      setOpenCreateGroup(true);
   };

   const handleCloseCreateGroup = () => {
      setOpenCreateGroup(false);
   };

   const handleOpenAddToGroup = (studentId: number) => {
      setSelectedStudentId(studentId);
      setSelectedGroupId(null);
      setOpenAddToGroup(true);
   };

   const handleCloseAddToGroup = () => {
      setOpenAddToGroup(false);
      setSelectedGroupId(null);
      setSelectedStudentId(null);
   };

   const handleGroupSelect = (groupId: number) => {
      const isStudentInGroup = groupStudents[groupId]?.some(s => s.id === selectedStudentId);
      if (!isStudentInGroup) {
         setSelectedGroupId(groupId);
      }
   };

   const getDefaultAvatar = () => {
      return withBasePath("/default-avatar.png");
   };

   const fetchAllData = useCallback(async () => {
      if (!advisorId) {
         setGroups([]);
         setStudentsWithoutGroup([]);
         setStudentAdvisor([]);
         setIsLoading(false);
         return;
      }

      try {
         setIsLoading(true);
         setError(null);

         const groupsRes = await fetchWithBase(`/api/groups?advisor_id=${advisorId}`);
         const groupsData = await groupsRes.json();
         const fetchedGroups: Group[] = (groupsData.data || []).map((g: RawGroup) => ({
            ID: parseInt(g.ID.toString()),
            Name: g.Name,
            Description: g.Description || null,
            AdvisorID: parseInt(g.AdvisorID.toString()),
            CreatedAt: g.CreatedAt,
         }));

         setGroups(fetchedGroups);

         const groupStudentsData: { [groupId: number]: Student[] } = {};
         for (const group of fetchedGroups) {
            if (group.ID) {
               try {
                  const studentsRes = await fetchWithBase(`/api/groups/students?group_id=${group.ID}`);
                  const studentsData = await studentsRes.json();

                  groupStudentsData[group.ID] = studentsData.data || [];
               } catch (error) {
                  console.error(`Error fetching students for group ${group.ID}:`, error);
                  groupStudentsData[group.ID] = [];
               }
            }
         }
         setGroupStudents(groupStudentsData);

         const studentAdvisorRes = await fetchWithBase(`/api/studentAdvisor?advisor_id=${advisorId}`);
         const studentAdvisorData = await studentAdvisorRes.json();
         setStudentAdvisor(studentAdvisorData.data || []);

         const studentsInGroups = new Set<number>();
         Object.values(groupStudentsData).forEach(students => {
            students.forEach(student => studentsInGroups.add(student.id));
         });

         const studentsNotInAnyGroup = (studentAdvisorData.data || [])
            .filter((sa: StudentAdvisor) => !studentsInGroups.has(sa.student.ID))
            .map((sa: StudentAdvisor) => ({
               id: sa.student.ID,
               name: sa.student.Name,
               email: sa.student.Email,
               image: sa.student.Image,
               created_at: sa.student.CreatedAt,
            }));

         setStudentsWithoutGroup(studentsNotInAnyGroup);

      } catch (error) {
         console.error('Error fetching data:', error);
         setError('ไม่สามารถดึงข้อมูลได้');
      } finally {
         setIsLoading(false);
      }
   }, [advisorId]);

   useEffect(() => {
      fetchAllData();
   }, [fetchAllData]);

   const addStudentToGroup = async () => {
      if (!selectedStudentId || !selectedGroupId) {
         Swal.fire({
            icon: 'warning',
            text: 'กรุณาเลือกกลุ่มก่อน',
            showConfirmButton: false,
            timer: 1500,
         });
         return;
      }

      setAddToGroupLoading(true);

      try {
         const res = await fetchWithBase('/api/groups/students', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
               student_id: selectedStudentId,
               group_id: selectedGroupId,
            }),
         });

         if (res.ok) {
            const result = await res.json();
            if (result) {
               Swal.fire({
                  icon: 'success',
                  text: 'เพิ่มนิสิตเข้ากลุ่มสำเร็จ',
                  showConfirmButton: false,
                  timer: 1500,
               });
               handleCloseAddToGroup();
               await fetchAllData();
            }
         } else {
            const result = await res.json();
            if (res.status === 409) {
               Swal.fire({
                  icon: 'warning',
                  text: 'นิสิตอยู่ในกลุ่มนี้แล้ว',
                  showConfirmButton: false,
                  timer: 1500,
               });
            } else {
               Swal.fire({
                  icon: 'error',
                  text: result.message || 'ไม่สามารถเพิ่มนิสิตเข้ากลุ่มได้',
                  showConfirmButton: false,
                  timer: 1500,
               });
            }
         }
      } catch (error) {
         console.error('Error adding student to group:', error);
         Swal.fire({
            icon: 'error',
            text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่',
            showConfirmButton: false,
            timer: 1500,
         });
      } finally {
         setAddToGroupLoading(false);
      }
   };

   const removeStudentFromGroup = async (studentId: number, groupId: number, studentEmail: string) => {
      const result = await Swal.fire({
         text: `คุณต้องการลบ ${studentEmail} ออกจากกลุ่มใช่หรือไม่?`,
         icon: 'question',
         showCancelButton: true,
         confirmButtonColor: "#d33",
         cancelButtonColor: "#899499",
         cancelButtonText: "ยกเลิก",
         confirmButtonText: "ยืนยัน",
      });

      if (result.isConfirmed) {
         try {
            const res = await fetchWithBase(`/api/groups/students?student_id=${studentId}&group_id=${groupId}`, {
               method: 'DELETE',
            });

            const deleteResult = await res.json();
            if (deleteResult.ok) {
               Swal.fire({
                  icon: "success",
                  text: "ลบนิสิตออกจากกลุ่มสำเร็จ",
                  showConfirmButton: false,
                  timer: 1500,
               });
               fetchAllData();
            } else {
               throw new Error('ไม่สามารถลบได้');
            }
         } catch (error) {
            console.error('Error removing student from group:', error);
            Swal.fire({
               icon: "error",
               text: "ไม่สามารถลบนิสิตออกจากกลุ่มได้",
               showConfirmButton: false,
               timer: 1500,
            });
         }
      }
   };

   const deleteGroup = async (groupId: number, groupName: string) => {
      if (!groupId || groupId === undefined) {
         console.error('Invalid group ID:', groupId);
         Swal.fire({
            icon: "error",
            text: "ไม่สามารถลบกลุ่มได้ เนื่องจาก ID ไม่ถูกต้อง",
            showConfirmButton: false,
            timer: 1500,
         });
         return;
      }

      const result = await Swal.fire({
         text: `คุณต้องการลบกลุ่ม "${groupName}" ใช่หรือไม่?`,
         icon: 'question',
         showCancelButton: true,
         confirmButtonColor: "#d33",
         cancelButtonColor: "#899499",
         cancelButtonText: "ยกเลิก",
         confirmButtonText: "ยืนยัน",
      });

      if (result.isConfirmed) {
         try {
            const res = await fetchWithBase(`/api/groups?id=${groupId}`, {
               method: 'DELETE',
            });

            if (res.ok) {
               Swal.fire({
                  icon: "success",
                  text: "ลบกลุ่มสำเร็จ",
                  showConfirmButton: false,
                  timer: 1500,
               });
               await fetchAllData();
            } else {
               const errorResult = await res.json();
               throw new Error(errorResult.message || 'ไม่สามารถลบได้');
            }
         } catch (error) {
            console.error('Error deleting group:', error);
            Swal.fire({
               icon: "error",
               text: "ไม่สามารถลบกลุ่มได้ กรุณาลองใหม่",
               showConfirmButton: false,
               timer: 1500,
            });
         }
      }
   };

   const getStudentGroups = (studentId: number): Group[] => {
      return groups.filter(group =>
         groupStudents[group.ID]?.some(s => s.id === studentId)
      );
   };

   const renderAllStudentsSection = () => {
      if (studentAdvisor.length === 0) return null;

      return (
         <Box sx={{ mb: 2 }}>
            <Typography variant="subtitle2" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
               <PeopleIcon sx={{ mr: 1, color: '#7E57C2' }} />
               นิสิตทั้งหมด {studentAdvisor.length} คน
            </Typography>

            {studentAdvisor.map((studentAdv) => {
               const studentGroups = getStudentGroups(studentAdv.student.ID);

               return (
                  <Paper
                     key={studentAdv.student.ID}
                     sx={{
                        mb: 1,
                        boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
                        border: '1px solid rgba(0, 0, 0, 0.06)',
                        borderRadius: 3,
                        transition: 'all 0.2s ease',
                        '&:hover': {
                           boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
                           transform: 'translateY(-1px)',
                        }
                     }}
                  >
                     <Box sx={{
                        p: 2.5,
                        display: 'flex',
                        alignItems: 'center',
                     }}>
                        <Avatar
                           src={studentAdv.student.Image || getDefaultAvatar()}
                           alt={studentAdv.student.Name || ''}
                           sx={{ width: 48, height: 48, mr: 2.5, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}
                        />
                        <Box sx={{ flex: 1 }}>
                           <Box display="flex" flexDirection="column" gap={0}>
                              <Typography variant="subtitle2" fontWeight={600} sx={{ color: '#1a1a1a', fontSize: '0.95rem' }}>
                                 {studentAdv.student.Name || 'ยังไม่ได้เคยเข้าสู่ระบบ'}
                              </Typography>
                              <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                 {studentAdv.student.Email}
                              </Typography>
                           </Box>
                           <Box sx={{ mt: 1 }}>
                              {studentGroups.length > 0 ? (
                                 studentGroups.map((group) => (
                                    <Chip
                                       key={group.ID}
                                       label={group.Name}
                                       size="small"
                                       sx={{
                                          mr: 0.5,
                                          mb: 0.5,
                                          backgroundColor: 'rgba(126, 87, 194, 0.1)',
                                          color: '#7E57C2',
                                          fontSize: '0.75rem',
                                          fontWeight: 500,
                                          borderRadius: 2,
                                          whiteSpace: "normal",
                                          wordBreak: "break-word",
                                          maxWidth: "150px",
                                          height: "auto",
                                          lineHeight: 1.2,
                                       }}
                                    />
                                 ))
                              ) : (
                                 <Chip
                                    label="ยังไม่มีกลุ่ม"
                                    size="small"
                                    sx={{
                                       display: 'inline-block',
                                       backgroundColor: 'rgba(245, 124, 0, 0.1)',
                                       color: '#f57c00',
                                       fontSize: '0.75rem',
                                       fontWeight: 500,
                                       borderRadius: 2,
                                       lineHeight: 1.2,
                                    }}
                                 />
                              )}
                           </Box>
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1 }}>
                           <Tooltip title="เพิ่มเข้ากลุ่ม">
                              <IconButton
                                 size="small"
                                 onClick={() => handleOpenAddToGroup(studentAdv.student.ID)}
                                 sx={{
                                    color: '#4caf50',
                                    borderRadius: 2,
                                    p: 1,
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                       backgroundColor: 'rgba(76, 175, 80, 0.08)',
                                       transform: 'scale(1.1)',
                                    }
                                 }}
                              >
                                 <AddIcon fontSize="small" />
                              </IconButton>
                           </Tooltip>
                           <Tooltip title="ดูบันทึก">
                              <IconButton
                                 size="small"
                                 onClick={() => handleOpen(studentAdv.student.ID)}
                                 sx={{
                                    color: '#673ab7',
                                    borderRadius: 2,
                                    p: 1,
                                    transition: 'all 0.2s ease',
                                    '&:hover': {
                                       backgroundColor: 'rgba(103, 58, 183, 0.08)',
                                       transform: 'scale(1.1)',
                                    }
                                 }}
                              >
                                 <RemoveRedEyeIcon fontSize="small" />
                              </IconButton>
                           </Tooltip>
                        </Box>
                     </Box>
                  </Paper>
               );
            })}
         </Box>
      );
   };

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
               border: '1px solid rgba(0, 0, 0, 0.06)',
            }}
         >
            <div className="flex items-center justify-center h-screen">
               <div className="text-center">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
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
                  border: '1px solid rgba(0, 0, 0, 0.06)',
                  boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
               }}
            >
               <Box sx={{ p: 2, pb: 0, flex: 1, overflowY: 'auto' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                     <Typography variant="body2" color="text.secondary">
                        ไม่มีข้อมูลนิสิต
                     </Typography>
                  </Box>
               </Box>
               <Box sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.06)' }}>
                  <Button
                     fullWidth
                     variant="contained"
                     onClick={handleOpenDialog}
                     sx={{
                        backgroundColor: '#7E57C2',
                        color: '#ffffff',
                        borderRadius: 2.5,
                        textTransform: 'none',
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        transition: 'all 0.3s ease',
                        '&:hover': {
                           backgroundColor: '#673ab7',
                           transform: 'translateY(-2px)',
                        },
                     }}
                  >
                     เพิ่มนิสิตใหม่
                  </Button>
               </Box>
            </Paper>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
               <AddNewStudent advisorId={advisorId} onClose={handleCloseDialog} onStudentAdvisorSave={fetchAllData} />
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
               border: '1px solid rgba(0, 0, 0, 0.06)',
               boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
            }}
         >
            <Box
               sx={{
                  p: 2,
                  pb: 0,
                  flex: 1,
                  overflowY: 'auto',
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
               {/* แสดงกลุ่ม */}
               <Box sx={{ mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                     <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', color: '#1a1a1a' }}>
                        <Box sx={{
                           p: 1,
                           backgroundColor: 'rgba(126, 87, 194, 0.1)',
                           borderRadius: 2,
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'center',
                           mr: 1.5
                        }}>
                           <GroupIcon sx={{ color: '#7E57C2', fontSize: 20 }} />
                        </Box>
                        กลุ่มโปรเจค {groups.length} กลุ่ม
                     </Typography>
                     <Button
                        variant="outlined"
                        size="small"
                        startIcon={<AddIcon />}
                        onClick={handleOpenCreateGroup}
                        disabled={!advisorId}
                        sx={{
                           fontWeight: 600,
                           borderColor: '#7E57C2',
                           color: '#7E57C2',
                           borderRadius: 2.5,
                           px: 2,
                           py: 1,
                           textTransform: 'none',
                           transition: 'all 0.3s ease',
                           '&:hover': {
                              borderColor: '#673ab7',
                              backgroundColor: 'rgba(126, 87, 194, 0.05)',
                              transform: 'translateY(-1px)',
                           },
                           '&:disabled': {
                              opacity: 0.6,
                              cursor: 'not-allowed',
                           },
                        }}
                     >
                        สร้างกลุ่ม
                     </Button>
                  </Box>
                  {groups.length > 0 ? (
                     groups.map((group) => (
                        <Accordion key={group.ID} sx={{
                           mb: 1,
                           borderRadius: 3,
                           border: '1px solid rgba(0, 0, 0, 0.06)',
                           boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
                           '&:before': { display: 'none' },
                           '&.Mui-expanded': {
                              margin: '8px 0',
                           },
                        }}>
                           <AccordionSummary
                              expandIcon={<ExpandMoreIcon />}
                              sx={{
                                 borderRadius: 3,
                                 '&.Mui-expanded': {
                                    borderBottomLeftRadius: 0,
                                    borderBottomRightRadius: 0,
                                 },
                              }}
                           >
                              <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                                 <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#1a1a1a' }}>
                                    {group.Name}
                                 </Typography>
                                 <Box sx={{ flexGrow: 1 }} />
                                 <Tooltip title="ลบกลุ่ม">
                                    <IconButton
                                       size="small"
                                       onClick={(e) => {
                                          e.stopPropagation();
                                          deleteGroup(group.ID, group.Name);
                                       }}
                                       sx={{
                                          color: '#d32f2f',
                                          borderRadius: 2,
                                          p: 1,
                                          transition: 'all 0.2s ease',
                                          '&:hover': {
                                             backgroundColor: 'rgba(211, 47, 47, 0.08)',
                                             transform: 'scale(1.1)',
                                          }
                                       }}
                                    >
                                       <DeleteIcon fontSize="small" />
                                    </IconButton>
                                 </Tooltip>
                              </Box>
                           </AccordionSummary>
                           <AccordionDetails>
                              {groupStudents[group.ID]?.length > 0 ? (
                                 groupStudents[group.ID].map((student) => (
                                    <Box
                                       key={student.id}
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
                                          src={student.image || getDefaultAvatar()}
                                          alt={student.name || ''}
                                          sx={{ width: 40, height: 40, mr: 2, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}
                                       />
                                       <Box sx={{ flex: 1, gap: 0 }}>
                                          <Typography variant="body2" fontWeight={600} sx={{ color: '#1a1a1a' }}>
                                             {student.name || 'ยังไม่ได้เคยเข้าสู่ระบบ'}
                                          </Typography>
                                          <Typography variant="caption" color="text.secondary">
                                             {student.email}
                                          </Typography>
                                       </Box>
                                       <Box sx={{ display: 'flex', gap: 1 }}>
                                          <Tooltip title="ลบออกจากกลุ่ม">
                                             <IconButton
                                                size="small"
                                                onClick={() => removeStudentFromGroup(student.id, group.ID, student.email)}
                                                sx={{
                                                   color: '#d32f2f',
                                                   borderRadius: 2,
                                                   p: 1,
                                                   transition: 'all 0.2s ease',
                                                   '&:hover': {
                                                      backgroundColor: 'rgba(211, 47, 47, 0.08)',
                                                      transform: 'scale(1.1)',
                                                   }
                                                }}
                                             >
                                                <DeleteIcon fontSize="small" />
                                             </IconButton>
                                          </Tooltip>
                                          <Tooltip title="ดูบันทึก">
                                             <IconButton
                                                size="small"
                                                onClick={() => handleOpen(student.id)}
                                                sx={{
                                                   color: '#673ab7',
                                                   borderRadius: 2,
                                                   p: 1,
                                                   transition: 'all 0.2s ease',
                                                   '&:hover': {
                                                      backgroundColor: 'rgba(103, 58, 183, 0.08)',
                                                      transform: 'scale(1.1)',
                                                   }
                                                }}
                                             >
                                                <RemoveRedEyeIcon fontSize="small" />
                                             </IconButton>
                                          </Tooltip>
                                       </Box>
                                    </Box>
                                 ))
                              ) : (
                                 <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                                    ไม่มีนิสิตในกลุ่มนี้
                                 </Typography>
                              )}
                           </AccordionDetails>
                        </Accordion>
                     ))
                  ) : (
                     <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
                        ยังไม่มีกลุ่ม
                     </Typography>
                  )}
               </Box>

               <Divider sx={{ my: 2, borderColor: 'rgba(0, 0, 0, 0.06)' }} />

               {renderAllStudentsSection()}

               {studentAdvisor.length === 0 && studentsWithoutGroup.length === 0 && groups.length === 0 && (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                     <Typography color="text.secondary">
                        ไม่มีข้อมูลนิสิต
                     </Typography>
                  </Box>
               )}

            </Box>

            <Box sx={{ p: 2, borderTop: '1px solid rgba(0, 0, 0, 0.06)' }}>
               <Button
                  fullWidth
                  variant="contained"
                  onClick={handleOpenDialog}
                  sx={{
                     backgroundColor: '#7E57C2',
                     color: '#ffffff',
                     borderRadius: 2.5,
                     textTransform: 'none',
                     fontSize: '0.9rem',
                     fontWeight: 600,
                     transition: 'all 0.3s ease',
                     '&:hover': {
                        backgroundColor: '#673ab7',
                        transform: 'translateY(-2px)',
                     },
                  }}
               >
                  เพิ่มนิสิตใหม่
               </Button>
            </Box>
         </Paper>

         {/* เพิ่มนิสิตใหม่ */}
         <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
            <AddNewStudent
               advisorId={advisorId}
               onClose={handleCloseDialog}
               onStudentAdvisorSave={fetchAllData}
            />
         </Dialog>

         {/* สร้างกลุ่มใหม่ */}
         <CreateGroupDialog
            open={openCreateGroup}
            onClose={handleCloseCreateGroup}
            advisorId={advisorId}
            onGroupCreated={fetchAllData}
         />

         {/* เพิ่มนิสิตเข้ากลุ่ม */}
         <Dialog open={openAddToGroup} onClose={handleCloseAddToGroup} maxWidth="sm" fullWidth>
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
                           backgroundColor: 'rgba(126, 87, 194, 0.08)',
                           borderRadius: 2,
                           display: 'flex',
                           alignItems: 'center',
                           justifyContent: 'center'
                        }}>
                           <GroupAddIcon sx={{ color: '#7E57C2', fontSize: 20 }} />
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
                           เลือกกลุ่ม
                        </Typography>
                     </Box>

                     <IconButton
                        onClick={handleCloseAddToGroup}
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

                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3, fontSize: '0.9rem' }}>
                     เลือกกลุ่มที่ต้องการเพิ่มนิสิต
                  </Typography>

                  <Box sx={{ mb: 4 }}>
                     {groups.map((group) => {
                        const isStudentInGroup = groupStudents[group.ID]?.some(s => s.id === selectedStudentId);

                        return (
                           <Paper
                              key={group.ID}
                              sx={{
                                 p: 2.5,
                                 mb: 2,
                                 cursor: isStudentInGroup ? 'not-allowed' : 'pointer',
                                 border: selectedGroupId === group.ID ? '2px solid #7E57C2' : '1px solid rgba(0, 0, 0, 0.08)',
                                 backgroundColor: isStudentInGroup ? 'rgba(0, 0, 0, 0.04)' :
                                    selectedGroupId === group.ID ? 'rgba(126, 87, 194, 0.05)' : 'rgba(0, 0, 0, 0.02)',
                                 opacity: isStudentInGroup ? 0.6 : 1,
                                 borderRadius: 3,
                                 transition: 'all 0.3s ease',
                                 boxShadow: selectedGroupId === group.ID ? '0 0 0 3px rgba(126, 87, 194, 0.1)' : '0 1px 4px rgba(0, 0, 0, 0.05)',
                              }}
                              onClick={() => !isStudentInGroup && handleGroupSelect(group.ID)}
                           >
                              <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                                 <Box sx={{ flex: 1 }}>
                                    <Typography variant="subtitle1" fontWeight={600} sx={{ color: '#1a1a1a', mb: 0.5 }}>
                                       {group.Name}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                       <Chip
                                          label={`${groupStudents[group.ID]?.length || 0} คน`}
                                          size="small"
                                          sx={{
                                             backgroundColor: 'rgba(76, 175, 80, 0.1)',
                                             color: '#2e7d2e',
                                             fontWeight: 500,
                                             borderRadius: 2,
                                          }}
                                       />
                                       {isStudentInGroup && (
                                          <Chip
                                             label="อยู่ในกลุ่มแล้ว"
                                             size="small"
                                             sx={{
                                                backgroundColor: 'rgba(245, 124, 0, 0.1)',
                                                color: '#f57c00',
                                                fontWeight: 500,
                                                borderRadius: 2,
                                             }}
                                          />
                                       )}
                                    </Box>
                                 </Box>
                              </Box>
                           </Paper>
                        );
                     })}
                  </Box>

                  <Box sx={{
                     display: 'flex',
                     gap: 2,
                     justifyContent: 'flex-end',
                     pt: 1
                  }}>
                     <Button
                        onClick={handleCloseAddToGroup}
                        disabled={addToGroupLoading}
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
                        onClick={addStudentToGroup}
                        variant="contained"
                        disabled={!selectedGroupId || addToGroupLoading}
                        sx={{
                           borderRadius: 2.5,
                           px: 4,
                           py: 1.2,
                           fontWeight: 600,
                           textTransform: 'none',
                           fontSize: '0.9rem',
                           backgroundColor: '#7E57C2',
                           '&:disabled': {
                              backgroundColor: 'rgba(0, 0, 0, 0.12)',
                              color: 'rgba(0, 0, 0, 0.26)',
                              boxShadow: 'none',
                              transform: 'none',
                           }
                        }}
                     >
                        {addToGroupLoading ? 'กำลังเพิ่ม...' : 'เพิ่มเข้ากลุ่ม'}
                     </Button>
                  </Box>
               </Box>
            </Fade>
         </Dialog>

         <Dialog
            open={open}
            onClose={handleClose}
            maxWidth="md"
            fullWidth
            sx={{
               borderRadius: 4,
            }}>
            <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
               <IconButton onClick={handleClose}>
                  <CloseIcon />
               </IconButton>
            </DialogTitle>
            <DialogContent>
               <ViewDiaryDate studentId={selectedId} userId={null} />
            </DialogContent>
         </Dialog>
      </>
   );
};

export default Student;