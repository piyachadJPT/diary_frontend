'use client'

import React, { useState, useEffect } from "react";
import DiatyLayout from '../../../components/layouts/DiatyLayout';
import NewDiary from '@/components/share/NewDiary';
import { useSession } from 'next-auth/react';
import { fetchWithBase } from "@/app/unit/fetchWithUrl"

type Props = {
    params: Promise<{ date: string }>;
};

interface Diary {
    ID: number;
    StudentID: number;
    ContentHTML: string;
    ContentDelta: string;
    IsShared: string;
    AllowComment: boolean;
    Status: string;
    DiaryDate: string;
    CreatedAt: string;
    UpdatedAt: string;

    Student: {
        ID: number;
        Name: string;
        Email: string;
        Role: string;
        CreatedAt: string;
    };
}

export default function DiaryPage({ params }: Props) {
    const { date } = React.use(params);
    const { data: session } = useSession();
    const [userId, setUserId] = useState<number | null>(null);
    const [diary, setDiary] = useState<Diary | null>(null);

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

    const fetchDiray = async () => {
        try {
            const res = await fetchWithBase(`/api/diary?DiaryDate=${date}&StudentID=${userId}`)
            const data = await res.json();
            setDiary(data)
        } catch (err) {
            console.error('Error fetching diary:', err);
        }
    }

    useEffect(() => {
        if (userId && date) {
            fetchDiray();
        }
    }, [userId, date]); 


    console.log('diray :', diary)

    return (
        <DiatyLayout>
            <h1 className="flex justify-center items-center mt-12">บันทึกประจำวันที่: {date}</h1>
            <NewDiary />
        </DiatyLayout>
    );
}