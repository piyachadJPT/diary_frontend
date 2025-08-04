"use client";
import { useParams } from "next/navigation";
import React, { useState, useEffect } from "react";
import { fetchWithBase } from "@/app/unit/fetchWithUrl";
import { getUrlWithBase } from "@/app/unit/getUrlWithBase";

interface Attachments {
    ID: number;
    DiaryID: number;
    FileURL: string;
    FileName: string;
    FileType: string;
    CreatedAt: string;
}

export default function Page() {
    const params = useParams();
    const id = params.id;
    const [pdfUrl, setPdfUrl] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!id) {
            setError("ไม่พบ ID ของไดอารี่");
            return;
        }

        const fetchAttachment = async () => {
            try {
                setIsLoading(true);
                setError(null);

                const apiUrl = `/api/diary/file?ID=${id}`;
                const res = await fetchWithBase(apiUrl);

                if (!res.ok) {
                    const errorText = await res.text();
                    throw new Error(`Failed to fetch attachment data: ${res.status} - ${errorText}`);
                }

                const data: { attachments: Attachments[] } = await res.json();
                const attachments = data.attachments || [];

                if (attachments.length > 0) {
                    const pdfAttachment = attachments.find(att => att.FileType === "application/pdf");
                    if (pdfAttachment) {
                        const cleanFileURL = pdfAttachment.FileURL.replace(/\\/g, "/");
                        const fileName = cleanFileURL.split("upload/diary/")[1];
                        const fullUrl = getUrlWithBase(`/api/files/${fileName}`);
                        setPdfUrl(fullUrl);
                    } else {
                        setError("ไม่พบไฟล์แนบ PDF");
                    }
                } else {
                    setError("ไม่พบไฟล์แนบสำหรับไดอารี่นี้");
                }

            } catch (error) {
                setError(`Failed to load attachment data: ${error}`);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAttachment();
    }, [id]);

    return (
        <div className="w-screen h-screen">
            {error ? (
                <div className="flex items-center justify-center h-screen">
                    <div className="text-center">
                        <div className="text-red-500 text-xl mb-4">⚠️</div>
                        <p className="text-red-500 mb-2">{error}</p>
                    </div>
                </div>
            ) : pdfUrl ? (
                <div className="w-full h-full">
                    <iframe
                        src={pdfUrl}
                        className="w-full h-full border-0"
                        title="PDF Viewer"
                        onError={() => {
                            setError("ไม่สามารถแสดง PDF ได้ กรุณาตรวจสอบไฟล์");
                        }}
                    />
                </div>
            ) : (
                <div className="flex items-center justify-center h-screen">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                        <p className="text-lg">กำลังโหลด PDF...</p>
                    </div>
                </div>
            )}
        </div>
    );
}
