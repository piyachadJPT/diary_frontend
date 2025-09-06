import React, { useEffect, useState } from 'react';
import {
    Dialog,
    Box,
    Typography,
    Button,
    CircularProgress,
    Avatar,
    Divider,
    IconButton,
    Fade
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { fetchWithBase } from '@/app/unit/fetchWithUrl';
import { withBasePath } from '@/app/unit/imageSrc';

interface ApproveUserPopupProps {
    adviserId: number | null | undefined;
    open: boolean;
    onClose: () => void;
}

interface Approve {
    ID: number;
    AdvisorID: number;
    StudentID: number;
    Message: string;
    IsRead: boolean;
    CreatedAt: string;
    Student: {
        ID: number;
        Name: string;
        Email: string;
        Approved: boolean;
        Image: string | null;
        Password: string;
        Role: string;
        CreatedAt: string;
    }
}

const ApproveStudent: React.FC<ApproveUserPopupProps> = ({ adviserId, open, onClose }) => {
    const [approve, setApprove] = useState<Approve[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const defaultAvatar = `${withBasePath("/default-avatar.png")}`;

    const fetchApprove = async () => {
        if (!adviserId) return;
        setLoading(true);
        try {
            const res = await fetchWithBase(`/api/student-advisor?advisor_id=${adviserId}`);
            const data = await res.json();

            setApprove(Array.isArray(data.data) ? data.data : [data.data]);
        } catch (err) {
            console.error(err);
            setError('ไม่สามารถโหลดรายชื่อนิสิตได้');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (open) fetchApprove();
    }, [open]);

    const handleApprove = async (id: number) => {
        setLoading(true);
        try {
            const res = await fetchWithBase(`/api/student-advisor?id=${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'อนุมัตินิสิตไม่สำเร็จ');

            setApprove(prev => prev.filter(user => user.Student.ID !== id));

        } catch (err) {
            console.error(err);
            setError(err instanceof Error ? err.message : 'อนุมัตินิสิตไม่สำเร็จ');
        } finally {
            setLoading(false);
        }
    };

    const deleteApprove = async (id: number) => {
        setLoading(true);
        try {
            const res = await fetchWithBase(`/api/student-advisor?id=${id}`, {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
            });

            if (!res.ok) {
                const errorData = await res.json();
                throw new Error(errorData.error || 'ลบคำขอไม่สำเร็จ');
            }

            setApprove(prev => prev.filter(user => user.Student.ID !== id));

        } catch (error) {
            console.error(error);
            setError('ลบคำขอไม่สำเร็จ');
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        if (error) {
            const timer = setTimeout(() => {
                setError(null);
            }, 5000);

            return () => clearTimeout(timer);
        }
    }, [error]);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
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
                                อนุมัตินิสิตในการดูแล
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

                    {loading && (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                            <CircularProgress size={24} sx={{ color: '#7E57C2' }} />
                        </Box>
                    )}

                    {error && error !== 'ไม่สามารถโหลดรายชื่อนิสิตได้' && (
                        <Typography
                            color="error"
                            mb={2}
                            textAlign="center"
                            sx={{
                                py: 2,
                                backgroundColor: 'rgba(244, 67, 54, 0.08)',
                                borderRadius: 1,
                                fontWeight: 500,
                            }}
                        >
                            {error}
                        </Typography>
                    )}

                    <Box sx={{ mb: 2 }}>
                        {approve.length > 0 ? (
                            <Box sx={{
                                maxHeight: '400px',
                                overflowY: 'auto',
                                pr: 1,
                                '&::-webkit-scrollbar': {
                                    width: '6px',
                                },
                                '&::-webkit-scrollbar-thumb': {
                                    background: '#c1c1c1',
                                    borderRadius: '4px',
                                },
                            }}>
                                {approve.map((data, index) => (
                                    <Box key={data.Student.ID}>
                                        <Box sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 2,
                                            py: 2,
                                            px: 1,
                                            borderRadius: 2,
                                            transition: 'all 0.2s ease',
                                            '&:hover': {
                                                backgroundColor: 'rgba(0, 0, 0, 0.02)'
                                            }
                                        }}>
                                            <Avatar
                                                src={data.Student.Image || defaultAvatar}
                                                alt={data.Student.Name}
                                                sx={{
                                                    width: 50,
                                                    height: 50,
                                                }}
                                            />
                                            <Box sx={{ flex: 1 }}>
                                                <Typography
                                                    variant="subtitle1"
                                                    sx={{
                                                        fontWeight: 600,
                                                        color: '#1a1a1a',
                                                        mb: 0.5
                                                    }}
                                                >
                                                    {data.Student.Name}
                                                </Typography>
                                                <Typography
                                                    variant="body2"
                                                    sx={{
                                                        color: '#666',
                                                        mb: 0.5
                                                    }}
                                                >
                                                    {data.Student.Email}
                                                </Typography>
                                            </Box>
                                            <Box>
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    onClick={() => handleApprove(data.Student.ID)}
                                                    disabled={loading}
                                                    sx={{
                                                        borderRadius: 2.5,
                                                        mr: 2,
                                                        px: 3,
                                                        py: 1,
                                                        fontWeight: 600,
                                                        textTransform: 'none',
                                                        fontSize: '0.85rem',
                                                        backgroundColor: '#7E57C2',
                                                        transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                                        '&:hover': {
                                                            backgroundColor: '#673ab7',
                                                            transform: 'translateY(-1px)',
                                                        },
                                                        '&:active': {
                                                            transform: 'translateY(0px)',
                                                        },
                                                        '&:disabled': {
                                                            backgroundColor: 'rgba(0, 0, 0, 0.12)',
                                                            color: 'rgba(0, 0, 0, 0.26)',
                                                            transform: 'none',
                                                        }
                                                    }}
                                                >
                                                    อนุมัติ
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    size="small"
                                                    onClick={() => deleteApprove(data.Student.ID)}
                                                    disabled={loading}
                                                    sx={{
                                                        borderRadius: 2.5,
                                                        px: 3,
                                                        py: 1,
                                                        fontWeight: 600,
                                                        textTransform: 'none',
                                                        fontSize: '0.85rem',
                                                        backgroundColor: '#ef4444',
                                                        transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                                        '&:hover': {
                                                            backgroundColor: '#dc2626',
                                                            transform: 'translateY(-1px)',
                                                        },
                                                        '&:active': {
                                                            transform: 'translateY(0px)',
                                                        },
                                                        '&:disabled': {
                                                            backgroundColor: 'rgba(0, 0, 0, 0.12)',
                                                            color: 'rgba(0, 0, 0, 0.26)',
                                                            transform: 'none',
                                                        }
                                                    }}
                                                >
                                                    ไม่อนุมัติ
                                                </Button>
                                            </Box>
                                        </Box>
                                        {index < approve.length - 1 && (
                                            <Divider sx={{ my: 1, opacity: 0.6 }} />
                                        )}
                                    </Box>
                                ))}
                            </Box>
                        ) : (
                            !loading && (
                                <Box sx={{
                                    textAlign: 'center',
                                    py: 4,
                                    backgroundColor: 'rgba(0, 0, 0, 0.02)',
                                    borderRadius: 2,
                                }}>
                                    <PersonAddIcon sx={{
                                        fontSize: 48,
                                        color: 'rgba(0, 0, 0, 0.2)',
                                        mb: 1
                                    }} />
                                    <Typography
                                        color="text.secondary"
                                        sx={{
                                            fontWeight: 500,
                                            fontSize: '0.95rem'
                                        }}
                                    >
                                        ไม่พบนิสิตที่รอการอนุมัติ
                                    </Typography>
                                </Box>
                            )
                        )}
                    </Box>

                    <Box sx={{
                        display: 'flex',
                        justifyContent: 'flex-end',
                        pt: 2,
                        borderTop: '1px solid rgba(0, 0, 0, 0.06)',
                        mt: 2
                    }}>
                        <Button
                            variant="outlined"
                            onClick={onClose}
                            sx={{
                                borderRadius: 2.5,
                                px: 4,
                                py: 1.2,
                                fontWeight: 500,
                                textTransform: 'none',
                                fontSize: '0.9rem',
                                color: '#666',
                                transition: 'all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                '&:hover': {
                                    backgroundColor: 'rgba(0, 0, 0, 0.04)',
                                    transform: 'translateY(-1px)',
                                },
                            }}
                        >
                            ปิด
                        </Button>
                    </Box>
                </Box>
            </Fade>
        </Dialog>
    );
};

export default ApproveStudent;