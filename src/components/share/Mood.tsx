import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Paper, Box, Typography, IconButton } from '@mui/material';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { fetchWithBase } from '@/app/unit/fetchWithUrl';
import { Column } from '@antv/g2plot';

interface Mood {
    burnedOut: number;
    happy: number;
    neutral: number;
    stressed: number;
    veryHappy: number;
}

interface AdvisorProps {
    advisorId: number | null;
}

const WeekSelector = ({ advisorId }: AdvisorProps) => {
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [mood, setMood] = useState<Mood | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const chartRef = useRef<Column | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    const getMonday = useCallback((date: Date) => {
        const d = new Date(date);
        const day = d.getDay();
        const diff = (day + 6) % 7;
        const monday = new Date(d);
        monday.setDate(d.getDate() - diff);
        monday.setHours(0, 0, 0, 0);
        return monday;
    }, []);

    const getSunday = useCallback((date: Date) => {
        const monday = getMonday(date);
        const sunday = new Date(monday);
        sunday.setDate(monday.getDate() + 6);
        sunday.setHours(0, 0, 0, 0);
        return sunday;
    }, [getMonday]);

    const initializeDates = useCallback(() => {
        const today = new Date();
        setStartDate(getMonday(today));
        setEndDate(getSunday(today));
    }, [getMonday, getSunday]);

    useEffect(() => {
        initializeDates();
    }, [initializeDates]);

    const goToPreviousWeek = () => {
        if (!startDate || !endDate) return;
        const newStartDate = new Date(startDate);
        newStartDate.setDate(startDate.getDate() - 7);
        const newEndDate = new Date(endDate);
        newEndDate.setDate(endDate.getDate() - 7);
        setStartDate(newStartDate);
        setEndDate(newEndDate);
    };

    const goToNextWeek = () => {
        if (!startDate || !endDate) return;
        const newStartDate = new Date(startDate);
        newStartDate.setDate(startDate.getDate() + 7);
        const newEndDate = new Date(endDate);
        newEndDate.setDate(endDate.getDate() + 7);
        setStartDate(newStartDate);
        setEndDate(newEndDate);
    };

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('th-TH', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const formatDateForApi = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const fetchMood = useCallback(async () => {
        try {
            setIsLoading(true);
            if (!startDate || !endDate) return;

            const start = formatDateForApi(startDate);
            const end = formatDateForApi(endDate);
            const res = await fetchWithBase(`/api/mood?advisor_id=${advisorId}&startDate=${start}&endDate=${end}`);

            if (res.ok) {
                const data = await res.json();
                setMood(data || { burnedOut: 0, happy: 0, neutral: 0, stressed: 0, veryHappy: 0 });
            } else {
                console.error('API Error:', res.status, res.statusText);
                setMood({ burnedOut: 0, happy: 0, neutral: 0, stressed: 0, veryHappy: 0 });
            }
        } catch (error) {
            console.error('Error fetching mood:', error);
            setMood({ burnedOut: 0, happy: 0, neutral: 0, stressed: 0, veryHappy: 0 });
        } finally {
            setIsLoading(false);
        }
    }, [startDate, endDate, advisorId]);

    useEffect(() => {
        if (startDate && endDate) {
            fetchMood();
        }
    }, [fetchMood, startDate, endDate]);

    // สร้างข้อมูลกราฟ
    const chartData = React.useMemo(() => {
        const baseData = [
            { action: 'มีความสุข', pv: mood?.veryHappy || 0, color: '#2e7d32' },
            { action: 'พอใจ', pv: mood?.happy || 0, color: '#9ccc65' },
            { action: 'เฉยๆ', pv: mood?.neutral || 0, color: '#5c6bc0' },
            { action: 'เครียด', pv: mood?.stressed || 0, color: '#ff9800' },
            { action: 'หมดไฟ', pv: mood?.burnedOut || 0, color: '#f44336' },
        ];

        return baseData;
    }, [mood]);

    useEffect(() => {
        if (!containerRef.current || isLoading || !chartData) return;

        // ตรวจสอบว่ามีข้อมูลหรือไม่
        const hasData = chartData.some(item => item.pv > 0);
        const maxValue = hasData ? Math.max(...chartData.map(d => d.pv)) : 10;

        // ทำลายกราฟเก่าก่อน 
        if (chartRef.current) {
            chartRef.current.destroy();
            chartRef.current = null;
        }

        setTimeout(() => {
            if (!containerRef.current) return;

            try {
                chartRef.current = new Column(containerRef.current, {
                    data: chartData,
                    xField: 'action',
                    yField: 'pv',
                    columnStyle: {
                        radius: [4, 4, 0, 0],
                        fillOpacity: 0.8
                    },
                    padding: [40, 20, 50, 40],
                    xAxis: {
                        label: {
                            autoHide: false,
                            autoRotate: false,
                            style: {
                                fontSize: 12,
                                fill: '#666'
                            }
                        }
                    },
                    yAxis: {
                        min: 0,
                        max: Math.ceil(maxValue * 1.2),
                        label: {
                            style: {
                                fontSize: 11,
                                fill: '#666'
                            }
                        },
                        grid: {
                            line: {
                                style: {
                                    stroke: '#e8e8e8',
                                    lineWidth: 1,
                                    lineDash: [3, 3]
                                }
                            }
                        }
                    },
                    meta: {
                        pv: {
                            min: 0,
                            alias: 'จำนวน'
                        },
                        action: {
                            alias: 'อารมณ์'
                        }
                    },
                    color: ({ action }) => {
                        const item = chartData.find(d => d.action === action);
                        return item?.color || '#666';
                    },
                    tooltip: {
                        showTitle: false,
                        formatter: (datum) => ({
                            name: datum.action,
                            value: `${datum.pv} ครั้ง`,
                        }),
                    },
                    label: {
                        position: 'top',
                        style: {
                            fontSize: 11,
                            fill: '#666'
                        }
                    }
                });

                chartRef.current.render();
            } catch (error) {
                console.error('Error creating chart:', error);
            }
        }, 100);

        return () => {
            if (chartRef.current) {
                chartRef.current.destroy();
                chartRef.current = null;
            }
        };
    }, [chartData, isLoading]);

    useEffect(() => {
        const handleResize = () => {
            if (chartRef.current && containerRef.current) {
                setTimeout(() => {
                    const width = containerRef.current!.offsetWidth;
                    const height = containerRef.current!.offsetHeight;
                    chartRef.current?.changeSize(width, height);
                }, 200);
            }
        };

        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    if (isLoading) {
        return (
            <Paper
                elevation={0}
                sx={{
                    width: '100%',
                    height: '50vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderRadius: 3,
                    border: '1px solid #e0e0e0',
                    backgroundColor: '#fff'
                }}
            >
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-lg">กำลังโหลด...</p>
                </div>
            </Paper>
        );
    }

    const hasData = chartData && chartData.some(item => item.pv > 0);

    return (
        <Paper
            elevation={0}
            sx={{
                width: '100%',
                height: '50vh',
                display: 'flex',
                alignItems: 'stretch',
                borderRadius: 3,
                border: '1px solid #e0e0e0',
                backgroundColor: '#fff'
            }}
        >
            <Box sx={{
                px: 3,
                width: '100%',
                height: '100%',
                display: 'flex',
                flexDirection: 'column'
            }}>
                <Box sx={{
                    textAlign: 'center',
                    flex: 1,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: 0
                }}>
                    {hasData ? (
                        <div
                            ref={containerRef}
                            style={{
                                width: '100%',
                                height: '100%',
                                minHeight: '300px'
                            }}
                        />
                    ) : (
                        <Typography
                            variant="body2"
                            color="text.secondary"
                            sx={{
                                textAlign: 'center'
                            }}
                        >
                            ไม่มีข้อมูลอารมณ์ในสัปดาห์นี้
                        </Typography>
                    )}
                </Box>

                <Box sx={{ mb: 4 }}>
                    <Box sx={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: 3
                    }}>
                        <IconButton
                            onClick={goToPreviousWeek}
                            disabled={!startDate || !endDate}
                            sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}
                            aria-label="สัปดาห์ก่อนหน้า"
                        >
                            <ChevronLeft size={20} />
                        </IconButton>

                        <Box sx={{ textAlign: 'center' }}>
                            <Typography
                                variant="body1"
                                sx={{ fontWeight: 500, color: '#333', mb: 0.5 }}
                            >
                                กราฟภาพรวมอารมณ์ในแต่ละสัปดาห์
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{ color: '#666', fontSize: '0.875rem' }}
                            >
                                {startDate && endDate ?
                                    `${formatDate(startDate)} ถึง ${formatDate(endDate)}` :
                                    'กำลังโหลด...'
                                }
                            </Typography>
                        </Box>

                        <IconButton
                            onClick={goToNextWeek}
                            disabled={!startDate || !endDate}
                            sx={{ '&:hover': { backgroundColor: 'rgba(0, 0, 0, 0.04)' } }}
                            aria-label="สัปดาห์ถัดไป"
                        >
                            <ChevronRight size={20} />
                        </IconButton>
                    </Box>
                </Box>
            </Box>
        </Paper>
    );
};

export default WeekSelector;