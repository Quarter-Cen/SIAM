// file: RemarkModal.tsx

interface RemarkModalProps {
  isOpen: boolean;
  onClose: () => void;
  remark: string;
}

export default function RemarkModal({ isOpen, onClose, remark }: RemarkModalProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black/25 z-50 flex justify-center items-center">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <h3 className="text-lg font-bold text-gray-900 mb-4">เหตุผลประกอบการพิจารณา</h3>
        <div className="text-sm text-gray-700 bg-gray-50 p-4 rounded-md ">
          <p>{remark}</p>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-600 text-white text-sm font-medium rounded-md hover:bg-gray-700"
          >
            ปิด
          </button>
        </div>
      </div>
    </div>
  );
}