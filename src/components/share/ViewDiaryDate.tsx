import React, { useCallback, useState, useEffect } from 'react';
import {
   Paper,
   Box,
   Typography,
   IconButton,
} from '@mui/material';
import {
   ChevronLeft,
   ChevronRight,
} from '@mui/icons-material';
import { fetchWithBase } from '@/app/unit/fetchWithUrl';
import { useRouter } from 'next/navigation';

interface ViewDiaryDateProps {
   studentId: number | null;
}

export interface DiaryDateResponse {
   message: string;
   data: string[];
}

const ViewDiaryDate: React.FC<ViewDiaryDateProps> = ({ studentId }) => {
   const today = new Date();
   const router = useRouter();
   const [currentDate, setCurrentDate] = useState(new Date(today.getFullYear(), today.getMonth(), 1));
   // const [selectedDate, setSelectedDate] = useState(today);
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   const [isLoading, setIsLoading] = useState<boolean>(true);
   // eslint-disable-next-line @typescript-eslint/no-unused-vars
   const [error, setError] = useState<string | null>(null);
   const [diaryDate, setDiaryDate] = useState<DiaryDateResponse | null>(null);

   const fetchDiaryByDate = useCallback(async () => {
      if (studentId) {
         try {
            const res = await fetchWithBase(`/api/diary/by-student?StudentID=${studentId}`)

            if (!res.ok) {
               throw new Error('Failed to fetch student advisor data');
            }

            const data = await res.json()
            setDiaryDate(data)

         } catch (error) {
            console.error('Error fetching student advisor:', error);
            setError('ไม่สามารถดึงข้อมูล student advisor ได้');
         } finally {
            setIsLoading(false);
         }
      }
   }, [studentId])

   useEffect(() => {
      fetchDiaryByDate()
   }, [fetchDiaryByDate])

   const getDaysInMonth = (date: Date): number => {
      return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
   };

   const getFirstDayOfMonth = (date: Date): number => {
      return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
   };

   const canGoToNextMonth = () => {
      const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
      const currentMonth = new Date(today.getFullYear(), today.getMonth(), 1);

      return nextMonth <= currentMonth;
   };

   const goToPreviousMonth = () => {
      setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
   };

   const goToNextMonth = () => {
      if (canGoToNextMonth()) {
         setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
      }
   };

   const isToday = (dateObj: Date): boolean => {
      return (
         dateObj.getDate() === today.getDate() &&
         dateObj.getMonth() === today.getMonth() &&
         dateObj.getFullYear() === today.getFullYear()
      );
   };

   const isFutureDate = (dateObj: Date): boolean => {
      return dateObj > today;
   };

   const isCurrentMonth = (dateObj: Date): boolean => {
      return dateObj.getMonth() === currentDate.getMonth();
   };

   const hasData = (dateObj: Date): boolean => {
      if (!diaryDate || !diaryDate.data || diaryDate.data.length === 0) {
         return false;
      }

      const dateString = dateObj.getFullYear() + '-' +
         String(dateObj.getMonth() + 1).padStart(2, '0') + '-' +
         String(dateObj.getDate()).padStart(2, '0');

      return diaryDate.data.some(isoString => {
         const dataDate = new Date(isoString);
         const dataDateString = dataDate.getFullYear() + '-' +
            String(dataDate.getMonth() + 1).padStart(2, '0') + '-' +
            String(dataDate.getDate()).padStart(2, '0');
         return dataDateString === dateString;
      });
   };

   const hasAnyData = () => {
      return diaryDate && diaryDate.data && diaryDate.data.length > 0;
   };

   const handleDateClick = (dateObj: Date, studentId: number) => {
      if (!isFutureDate(dateObj) && hasData(dateObj)) {

         const dateString = dateObj.getFullYear() + '-' +
            String(dateObj.getMonth() + 1).padStart(2, '0') + '-' +
            String(dateObj.getDate()).padStart(2, '0');

         handleToDate(String(studentId), dateString);
      }
   };


   const monthNames = [
      'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
      'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
   ];

   const dayNames = ['อา', 'จ', 'อ', 'พ', 'พฤ', 'ศ', 'ส'];

   const createCalendarGrid = () => {
      const grid = [];
      const firstDay = getFirstDayOfMonth(currentDate);
      const daysInMonth = getDaysInMonth(currentDate);

      const prevMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
      const daysInPrevMonth = getDaysInMonth(prevMonth);

      for (let i = firstDay - 1; i >= 0; i--) {
         grid.push(new Date(prevMonth.getFullYear(), prevMonth.getMonth(), daysInPrevMonth - i));
      }

      for (let day = 1; day <= daysInMonth; day++) {
         grid.push(new Date(currentDate.getFullYear(), currentDate.getMonth(), day));
      }

      const nextMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1);
      const remainingDays = 42 - grid.length;
      for (let day = 1; day <= remainingDays; day++) {
         grid.push(new Date(nextMonth.getFullYear(), nextMonth.getMonth(), day));
      }

      return grid;
   };

   const calendarDays = createCalendarGrid();

   const weeks = [];
   for (let i = 0; i < calendarDays.length; i += 7) {
      weeks.push(calendarDays.slice(i, i + 7));
   }

   const handleToDate = (id: string, date: string) => {
      router.push(`/teacher/${date}`);
      sessionStorage.setItem('studentId', id);
   }

   return (
      <Paper
         elevation={0}
         sx={{
            mt: 0.5,
            width: '100%',
            height: '70vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ffffff',
         }}
      >
         <Box sx={{ width: '100%', maxWidth: 420, px: 3 }}>
            <Box
               sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 3,
                  pt: 2,
               }}
            >
               <Typography
                  variant="h5"
                  sx={{
                     fontWeight: 600,
                     color: '#1a1a1a',
                     fontSize: '22px',
                     letterSpacing: '-0.01em',
                  }}
               >
                  {monthNames[currentDate.getMonth()]} {currentDate.getFullYear() + 543}
               </Typography>

               <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <IconButton
                     onClick={goToPreviousMonth}
                     size="small"
                     sx={{
                        width: 36,
                        height: 36,
                        color: '#374151',
                        backgroundColor: '#f8fafc',
                        border: '1px solid #e5e7eb',
                        borderRadius: 2,
                        transition: 'all 0.15s ease',
                        '&:hover': {
                           backgroundColor: '#f1f5f9',
                           borderColor: '#d1d5db',
                        }
                     }}
                  >
                     <ChevronLeft sx={{ fontSize: 18 }} />
                  </IconButton>

                  <IconButton
                     onClick={goToNextMonth}
                     size="small"
                     disabled={!canGoToNextMonth()}
                     sx={{
                        width: 36,
                        height: 36,
                        color: canGoToNextMonth() ? '#374151' : '#9ca3af',
                        backgroundColor: canGoToNextMonth() ? '#f8fafc' : '#f9fafb',
                        border: '1px solid #e5e7eb',
                        borderRadius: 2,
                        transition: 'all 0.15s ease',
                        '&:hover': canGoToNextMonth() ? {
                           backgroundColor: '#f1f5f9',
                           borderColor: '#d1d5db',
                        } : {},
                        '&:disabled': {
                           cursor: 'not-allowed',
                           opacity: 0.5
                        }
                     }}
                  >
                     <ChevronRight sx={{ fontSize: 18 }} />
                  </IconButton>
               </Box>
            </Box>

            <Box sx={{
               display: 'flex',
               mb: 2,
               borderBottom: '1px solid #ede7f6',
               pb: 1
            }}>
               {dayNames.map((day, index) => (
                  <Box
                     key={index}
                     sx={{
                        flex: 1,
                        textAlign: 'center',
                        py: 1,
                     }}
                  >
                     <Typography
                        variant="caption"
                        sx={{
                           fontSize: '12px',
                           fontWeight: 500,
                           color: '#9575cd',
                           letterSpacing: '0.05em',
                           textTransform: 'uppercase',
                        }}
                     >
                        {day}
                     </Typography>
                  </Box>
               ))}
            </Box>

            <Box>
               {weeks.map((week, weekIndex) => (
                  <Box key={weekIndex} sx={{ display: 'flex', mb: 0.5 }}>
                     {week.map((dateObj, dayIndex) => {
                        const dateHasData = hasData(dateObj);
                        const isClickable = !isFutureDate(dateObj) && dateHasData;
                        const isTodayDate = isToday(dateObj);
                        const isCurrentMonthDate = isCurrentMonth(dateObj);
                        const isFuture = isFutureDate(dateObj);

                        return (
                           <Box
                              key={dayIndex}
                              onClick={() => {
                                 if (studentId !== null) {
                                    handleDateClick(dateObj, studentId);
                                 }
                              }}
                              sx={{
                                 flex: 1,
                                 aspectRatio: '1',
                                 display: 'flex',
                                 alignItems: 'center',
                                 justifyContent: 'center',
                                 cursor: isClickable ? 'pointer' : 'default',
                                 borderRadius: 2,
                                 transition: 'all 0.2s ease',
                                 position: 'relative',
                                 margin: '2px',
                                 minHeight: 44,

                                 backgroundColor: dateHasData
                                    ? '#7e57c2'
                                    : isTodayDate
                                       ? '#f3f4f6'
                                       : 'transparent',

                                 border: dateHasData
                                    ? '2px solid #6d28d9'
                                    : isTodayDate
                                       ? '2px solid #d1d5db'
                                       : '1px solid transparent',

                                 color: !isCurrentMonthDate
                                    ? '#d1c4e9'
                                    : dateHasData
                                       ? '#ffffff'
                                       : isFuture
                                          ? '#b39ddb'
                                          : isTodayDate
                                             ? '#374151'
                                             : '#6b7280',

                                 opacity: !isCurrentMonthDate ? 0.4 : 1,

                                 boxShadow: dateHasData
                                    ? '0 2px 8px rgba(126, 87, 194, 0.25)'
                                    : 'none',

                                 '&:hover': isClickable ? {
                                    backgroundColor: '#6d28d9',
                                    transform: 'translateY(-1px)',
                                    boxShadow: '0 4px 16px rgba(126, 87, 194, 0.4)',
                                    borderColor: '#5b21b6',
                                 } : {},
                              }}
                           >
                              <Typography
                                 variant="body2"
                                 sx={{
                                    fontWeight: dateHasData
                                       ? 600
                                       : isTodayDate
                                          ? 500
                                          : 400,
                                    fontSize: '14px',
                                    letterSpacing: '-0.01em',
                                 }}
                              >
                                 {dateObj.getDate()}
                              </Typography>

                              {dateHasData && (
                                 <Box
                                    sx={{
                                       position: 'absolute',
                                       bottom: 3,
                                       left: '50%',
                                       transform: 'translateX(-50%)',
                                       width: 5,
                                       height: 5,
                                       borderRadius: '50%',
                                       backgroundColor: '#ffffff',
                                       boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                    }}
                                 />
                              )}

                              {isTodayDate && !dateHasData && (
                                 <Box
                                    sx={{
                                       position: 'absolute',
                                       bottom: 3,
                                       left: '50%',
                                       transform: 'translateX(-50%)',
                                       width: 4,
                                       height: 4,
                                       borderRadius: '50%',
                                       backgroundColor: '#9575cd',
                                    }}
                                 />
                              )}
                           </Box>
                        );
                     })}
                  </Box>
               ))}
            </Box>

            {hasAnyData() && (
               <Box sx={{
                  mt: 3,
                  pt: 2,
                  borderTop: '1px solid #e5e7eb',
                  display: 'flex',
                  justifyContent: 'center',
                  gap: 4
               }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                     <Box sx={{
                        width: 16,
                        height: 16,
                        borderRadius: 1,
                        backgroundColor: '#7e57c2',
                        border: '2px solid #6d28d9',
                        boxShadow: '0 1px 3px rgba(126, 87, 194, 0.3)',
                     }} />
                     <Typography variant="caption" sx={{
                        color: '#6b7280',
                        fontSize: '12px',
                        fontWeight: 500
                     }}>
                        วันที่มีข้อมูล
                     </Typography>
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                     <Box sx={{
                        width: 16,
                        height: 16,
                        borderRadius: 1,
                        backgroundColor: '#f3f4f6',
                        border: '2px solid #d1d5db',
                        position: 'relative',
                     }}>
                        <Box sx={{
                           position: 'absolute',
                           bottom: 1,
                           left: '50%',
                           transform: 'translateX(-50%)',
                           width: 3,
                           height: 3,
                           borderRadius: '50%',
                           backgroundColor: '#9575cd',
                        }} />
                     </Box>
                     <Typography variant="caption" sx={{
                        color: '#6b7280',
                        fontSize: '12px',
                        fontWeight: 500
                     }}>
                        วันนี้
                     </Typography>
                  </Box>
               </Box>
            )}
         </Box>
      </Paper>
   );
};

export default ViewDiaryDate;