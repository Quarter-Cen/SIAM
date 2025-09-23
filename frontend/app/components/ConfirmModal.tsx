import React, { useState } from "react";
import LoadingOverlay from "./LoadingOverlay";
interface ConfirmModalProps {
  isOpen: boolean;
  onConfirm: (remark: string) => void; // เปลี่ยน type ของ onConfirm ให้รับ remark ด้วย
  onCancel: () => void;
  title: string;
  message: string;
  confirmButtonColor: string;
  messageColor: string;
  showRemarkInput?: boolean; // เพิ่ม prop ใหม่สำหรับแสดง input
  isLoading: boolean;
}

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  onConfirm,
  onCancel,
  title,
  message,
  confirmButtonColor,
  messageColor,
  isLoading,
}) => {
  const [remark, setRemark] = useState(""); // เพิ่ม state สำหรับเก็บค่า remark

  if (!isOpen) {
    return null;
  }

  const handleConfirm = () => {
    onConfirm(remark); // ส่งค่า remark กลับไปใน onConfirm
    setRemark(""); // Clear ค่า remark หลังจาก confirm
  };

  const handleCancel = () => {
    onCancel();
    setRemark(""); // Clear ค่า remark เมื่อยกเลิก
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/25">
      <div className="w-96 rounded-lg bg-white p-6 shadow-xl">
         {isLoading && <LoadingOverlay />}
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <div className="mt-2 text-sm text-gray-500">
          <p className={messageColor}>{message}</p>
        </div>
          <div className="mt-4">
            <label
              htmlFor="remark"
              className="block text-sm font-medium text-gray-700"
            >
              เหตุผล (Remark)
            </label>
            <textarea
              id="remark"
              rows={3}
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm text-black"
              placeholder=" กรุณาระบุเหตุผล..."
            />
          </div>
        <div className="mt-4 flex justify-end space-x-2">
          <button
            onClick={handleCancel}
            className="rounded-md bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
          >
            ยกเลิก
          </button>
          <button
            onClick={handleConfirm}
            className={`rounded-md px-4 py-2 text-sm font-medium text-white shadow-sm ${confirmButtonColor}`}
          >
            ยืนยัน
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
