import React, { useState } from 'react';
import {
    Dialog,
    Box,
    Button,
    TextField,
    Typography,
    IconButton,
    Fade
} from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import CloseIcon from '@mui/icons-material/Close';
import { fetchWithBase } from "@/app/unit/fetchWithUrl";
import Swal from 'sweetalert2';

interface CreateGroupDialogProps {
    open: boolean;
    onClose: () => void;
    advisorId: number | null;
    onGroupCreated: () => void;
}

const CreateGroupDialog: React.FC<CreateGroupDialogProps> = ({
    open,
    onClose,
    advisorId,
    onGroupCreated
}) => {
    const [newGroupName, setNewGroupName] = useState('');
    const [newGroupDescription, setNewGroupDescription] = useState('');
    const [createGroupLoading, setCreateGroupLoading] = useState(false);

    const handleClose = () => {
        onClose();
        setNewGroupName('');
        setNewGroupDescription('');
    };

    const createGroup = async () => {
        if (!newGroupName.trim()) {
            Swal.fire({
                icon: 'warning',
                text: 'กรุณากรอกชื่อโปรเจค',
                showConfirmButton: false,
                timer: 1500,
            });
            return;
        }

        if (!advisorId || advisorId <= 0) {
            console.error('Invalid advisorId:', advisorId);
            Swal.fire({
                icon: 'error',
                text: 'ไม่พบข้อมูลอาจารย์ที่ปรึกษา กรุณาล็อกอินใหม่',
                showConfirmButton: false,
                timer: 1500,
            });
            return;
        }

        setCreateGroupLoading(true);

        try {
            const requestBody = {
                name: newGroupName.trim(),
                description: newGroupDescription.trim() || null,
                advisor_id: Number(advisorId),
            };

            const res = await fetchWithBase(`/api/groups`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(requestBody),
            });

            if (res.ok) {
                Swal.fire({
                    icon: 'success',
                    text: 'สร้างกลุ่มสำเร็จ',
                    showConfirmButton: false,
                    timer: 1500,
                });
                handleClose();
                onGroupCreated();
            }
        } catch (error) {
            console.error('Error creating group:', error);
            Swal.fire({
                icon: 'error',
                text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่',
                showConfirmButton: false,
                timer: 1500,
            });
        } finally {
            setCreateGroupLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
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
                                <GroupIcon sx={{ color: '#7E57C2', fontSize: 20 }} />
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
                                สร้างกลุ่มใหม่
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

                    <Box sx={{ mb: 4 }}>
                        <TextField
                            autoFocus
                            fullWidth
                            label="รายชื่อโปรเจค"
                            type="text"
                            value={newGroupName}
                            onChange={(e) => setNewGroupName(e.target.value)}
                            placeholder="ชื่อโปรเจค"
                            variant="outlined"
                            sx={{
                                mb: 3,
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

                        <TextField
                            fullWidth
                            label="คำอธิบาย (ไม่บังคับ)"
                            multiline
                            rows={3}
                            value={newGroupDescription}
                            onChange={(e) => setNewGroupDescription(e.target.value)}
                            placeholder="รายละเอียดของโปรเจค"
                            variant="outlined"
                            sx={{
                                '& .MuiOutlinedInput-root': {
                                    borderRadius: 2.5,
                                    transition: 'all 0.3s ease',
                                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                                    '&:hover': {
                                        backgroundColor: 'rgba(0, 0, 0, 0.03)',
                                    },
                                },
                            }}
                        />
                    </Box>

                    <Box sx={{
                        display: 'flex',
                        gap: 2,
                        justifyContent: 'flex-end',
                        pt: 1
                    }}>
                        <Button
                            variant="outlined"
                            onClick={handleClose}
                            disabled={createGroupLoading}
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
                                },
                            }}
                        >
                            ยกเลิก
                        </Button>
                        <Button
                            onClick={createGroup}
                            variant="contained"
                            disabled={!newGroupName.trim() || createGroupLoading || !advisorId}
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
                            {createGroupLoading ? 'กำลังสร้าง...' : 'สร้างกลุ่ม'}
                        </Button>
                    </Box>
                </Box>
            </Fade>
        </Dialog>
    );
};

export default CreateGroupDialog;