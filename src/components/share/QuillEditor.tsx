'use client';

import { useEffect, useRef } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';

interface QuillEditorProps {
  value: string;
  onChange: (value: string, delta?: unknown) => void;
}

export default function QuillEditor({ value, onChange }: QuillEditorProps) {
  const editorRef = useRef<HTMLDivElement | null>(null);
  const toolbarRef = useRef<HTMLDivElement | null>(null);
  const quillInstance = useRef<Quill | null>(null);

  useEffect(() => {
    if (editorRef.current && toolbarRef.current && !quillInstance.current) {
      const quill = new Quill(editorRef.current, {
        theme: 'snow',
        modules: {
          toolbar: toolbarRef.current,
        },
      });

      quill.on('text-change', () => {
        const html = quill.root.innerHTML;
        const delta = quill.getContents();
        onChange(html, delta);
      });

      if (value) {
        quill.root.innerHTML = value;
      }

      quillInstance.current = quill;
    }
  }, [onChange]);

  useEffect(() => {
    if (quillInstance.current) {
      const currentHtml = quillInstance.current.root.innerHTML;
      if (currentHtml !== value) {
        if (value === '') {
          quillInstance.current.setText('');
        } else {
          quillInstance.current.root.innerHTML = value;
        }
      }
    }
  }, [value]);

  return (
    <div className="w-full max-w-full flex flex-col font-sans">
      <style>{`
        @media (max-width: 767px) {
          .ql-toolbar .ql-formats {
            flex: 0 0 auto;
            width: 100%;
            display: flex;
            flex-wrap: wrap;
            gap: 0.125rem;
          }
          .ql-toolbar .ql-formats > * {
            flex: 1 0 calc(12.5% - 0.125rem);
            max-width: calc(12.5% - 0.125rem);
          }
        }
      `}</style>
      <div
        ref={toolbarRef}
        className="flex md:flex-nowrap flex-wrap gap-1 p-1.5 bg-gray-100 border border-gray-300 rounded-t-lg"
      >
        <div className="ql-formats flex items-center gap-0.5">
          <select className="ql-header text-sm h-7 px-1" defaultValue="">
            <option value="1">หัวข้อ 1</option>
            <option value="2">หัวข้อ 2</option>
            <option value="">ปกติ</option>
          </select>
          <button className="ql-bold w-6 h-6" title="ตัวหนา" />
          <button className="ql-italic w-6 h-6" title="ตัวเอียง" />
          <button className="ql-underline w-6 h-6" title="ขีดเส้นใต้" />
          <button className="ql-strike w-6 h-6" title="ขีดฆ่า" />
          <button className="ql-blockquote w-6 h-6" title="อ้างอิง" />
          <button className="ql-code-block w-6 h-6" title="บลอกโค้ด" />
          <select className="ql-color text-sm h-7 px-1" title="สีข้อความ" />
        </div>
        <div className="ql-formats flex items-center gap-0.5">
          <select className="ql-background text-sm h-7 px-1" title="สีพื้นหลัง" />
          <button className="ql-list w-6 h-6" value="ordered" title="รายการเรียงลำดับ" />
          <button className="ql-list w-6 h-6" value="bullet" title="รายการจุด" />
          <button className="ql-indent w-6 h-6" value="-1" title="ลดการเยื้อง" />
          <button className="ql-indent w-6 h-6" value="+1" title="เพิ่มการเยื้อง" />
          <button className="ql-link w-6 h-6" title="ลิงก์" />
          <button className="ql-image w-6 h-6" title="รูปภาพ" />
          <button className="ql-clean w-6 h-6" title="ล้างรูปแบบ" />
        </div>
      </div>
      <div
        ref={editorRef}
        className="w-full min-h-[150px] h-auto max-h-[60vh] border border-t-0 border-gray-300 rounded-b-lg bg-white overflow-y-auto"
      />
    </div>
  );
}