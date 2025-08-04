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
      <div
        ref={toolbarRef}
        className="ql-toolbar ql-snow"
      >
        <select className="ql-header" defaultValue="">
          <option value="1">หัวข้อ 1</option>
          <option value="2">หัวข้อ 2</option>
          <option value="">ปกติ</option>
        </select>
        <button className="ql-bold" title="ตัวหนา" />
        <button className="ql-italic" title="ตัวเอียง" />
        <button className="ql-underline" title="ขีดเส้นใต้" />
        <button className="ql-strike" title="ขีดฆ่า" />
        <select className="ql-color" title="สีข้อความ" />
        <select className="ql-background" title="สีพื้นหลัง" />
        <button className="ql-blockquote" title="อ้างอิง" />
        <button className="ql-code-block" title="บลอกโค้ด" />
        <button className="ql-list" value="ordered" title="รายการเรียงลำดับ" />
        <button className="ql-list" value="bullet" title="รายการจุด" />
        <button className="ql-indent" value="-1" title="ลดการเยื้อง" />
        <button className="ql-indent" value="+1" title="เพิ่มการเยื้อง" />
        <button className="ql-link" title="ลิงก์" />
        <button className="ql-image" title="รูปภาพ" />
        <button className="ql-clean" title="ล้างรูปแบบ" />
      </div>
      <div
        ref={editorRef}
        className="w-full min-h-[150px] h-auto max-h-[60vh] bg-white overflow-y-auto"
      />
    </div>
  );
}