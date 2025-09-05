import { fetchWithBase } from '@/app/unit/fetchWithUrl';
import { withBasePath } from '@/app/unit/imageSrc';
import { Paper, Box, Avatar, Typography, IconButton, Tooltip, Divider } from '@mui/material'
import React, { useEffect, useState } from 'react'
import SchoolIcon from '@mui/icons-material/School';
import DeleteIcon from '@mui/icons-material/Delete';
import Swal from 'sweetalert2';

interface AllAdvisor {
    ID: number;
    Name: string | null;
    Email: string;
    Image: string | null;
}

interface AllAdvisorByAdminProps {
    userId: number | null;
}

export default function AllAdvisorByAdmin({ }: AllAdvisorByAdminProps) {
    const [advisors, setAdvisors] = useState<AllAdvisor[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    const fetchAllAdvisor = async () => {
        try {
            setIsLoading(true);
            const res = await fetchWithBase('/api/admin/allteachers');
            const data = await res.json();
            setAdvisors(data);
        } catch (error) {
            console.log('Fetch All Advisor :', error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchAllAdvisor();
    }, []);

    const getDefaultAvatar = () => {
        return withBasePath("/default-avatar.png");
    };

    const handleDeleteAdvisor = async (advisorId: number, email: string) => {
        const result = await Swal.fire({
            text: `คุณต้องการลบอาจารย์ ${email} ใช่หรือไม่?`,
            icon: 'question',
            showCancelButton: true,
            confirmButtonColor: "#d33",
            cancelButtonColor: "#899499",
            cancelButtonText: "ยกเลิก",
            confirmButtonText: "ยืนยัน",
        });

        if (result.isConfirmed) {
            try {
                const res = await fetchWithBase(`/api/user/${advisorId}`, {
                    method: 'DELETE'
                })

                if (!res.ok) throw new Error('Delete failed');
                const deleteResult = await res.json();

                if (deleteResult.ok) {
                    Swal.fire({
                        icon: "success",
                        text: "ลบอาจารย์สำเร็จ",
                        showConfirmButton: false,
                        timer: 1500
                    });
                    fetchAllAdvisor();
                } else {
                    Swal.fire({
                        icon: "error",
                        text: "ไม่สามารถลบอาจารย์ได้",
                        showConfirmButton: false,
                        timer: 1500
                    });
                }
            } catch (err) {
                console.log(err)
                Swal.fire({
                    icon: "error",
                    text: "เกิดข้อผิดพลาดในการลบอาจารย์",
                    showConfirmButton: false,
                    timer: 1500
                });
            }
        }

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
                    boxShadow: '0 1px 4px rgba(0, 0, 0, 0.05)',
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

    return (
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
                    flexShrink: 0,
                }}
            >
                <Box sx={{ mb: 2 }}>
                    <Box
                        sx={{
                            cursor: 'pointer',
                            borderRadius: 2,
                            p: 1.5,
                            mb: 1,
                            transition: 'all 0.3s ease',
                            '&:hover': {
                                backgroundColor: 'rgba(126, 87, 194, 0.05)',
                                transform: 'translateY(-1px)',
                                boxShadow: '0 2px 8px rgba(126, 87, 194, 0.15)',
                            }
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
                                <SchoolIcon sx={{ color: '#7E57C2', fontSize: 20 }} />
                            </Box>
                            อาจารย์ทั้งหมด {advisors.length} คน
                        </Typography>
                    </Box>
                    <Divider
                        sx={{
                            borderColor: 'rgba(126, 87, 194, 0.2)',
                            borderWidth: '1px',
                            mb: 1
                        }}
                    />
                </Box>
            </Box>

            <Box
                sx={{
                    flex: 1,
                    overflowY: 'auto',
                    px: 2,
                    pb: 2,
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
                {advisors.length > 0 ? (
                    advisors.map((advisor) => (
                        <Paper
                            key={advisor.ID}
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
                                p: 1.5,
                                display: 'flex',
                                alignItems: 'center',
                            }}>
                                <Avatar
                                    src={advisor.Image || getDefaultAvatar()}
                                    alt={advisor.Name || ''}
                                    sx={{ width: 48, height: 48, mr: 2.5, boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)' }}
                                />
                                <Box sx={{ flex: 1 }}>
                                    <Box display="flex" flexDirection="column" gap={0}>
                                        <Typography variant="subtitle2" fontWeight={600} sx={{ color: '#1a1a1a', fontSize: '0.95rem' }}>
                                            {advisor.Name || 'ยังไม่ได้เคยเข้าสู่ระบบ'}
                                        </Typography>
                                        <Typography variant="caption" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
                                            {advisor.Email}
                                        </Typography>
                                    </Box>
                                </Box>
                                <Box sx={{ display: 'flex', gap: 1 }}>
                                    <Tooltip title="ลบอาจารย์">
                                        <IconButton
                                            size="small"
                                            onClick={() => handleDeleteAdvisor(advisor.ID, advisor.Email)}
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
                            </Box>
                        </Paper>
                    ))
                ) : (
                    <Box sx={{ textAlign: 'center', py: 4 }}>
                        <Typography color="text.secondary">
                            ไม่มีข้อมูลอาจารย์
                        </Typography>
                    </Box>
                )}
            </Box>
        </Paper>
    );
}