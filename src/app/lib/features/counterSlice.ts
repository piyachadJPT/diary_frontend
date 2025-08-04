import { createSlice, PayloadAction } from '@reduxjs/toolkit'

interface CalendarState {
    dataByDate: Record<string, boolean>
}

const initialState: CalendarState = {
    dataByDate: {},
}

export const calendarSlice = createSlice({
    name: 'calendar',
    initialState,
    reducers: {
        setDateHasData: (state, action: PayloadAction<{ date: string; hasData: boolean }>) => {
            const { date, hasData } = action.payload
            state.dataByDate[date] = hasData
        },
        removeDateData: (state, action: PayloadAction<string>) => {
            delete state.dataByDate[action.payload]
        },
    },
})

export const { setDateHasData, removeDateData } = calendarSlice.actions
export default calendarSlice.reducer
