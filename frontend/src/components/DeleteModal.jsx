import React from "react";

const DeleteModal = ({ isOpen, onClose, onConfirm, fileName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[#FFF9EC] rounded-t-3xl shadow-lg w-full max-w-3xl">
        <div className="bg-[#5C4033] text-white px-6 py-4 flex justify-between items-center rounded-t-md">
          <h2 className="text-3xl font-semibold">Delete Data File?</h2>
          <button
            className="text-4xl font-bold hover:text-red-400"
            onClick={onClose}
          >
            ×
          </button>
        </div>

        <div className="px-6 py-5 text-center">
          <div className="border-2 border-[#5C4033] p-8 rounded text-[#5C4033]">
            <p className="font-bold text-lg mb-4">
              Are you sure to delete the following Data files?
            </p>
            <p className="font-semibold text-lg">{fileName}</p>

            <div className="flex justify-center gap-6 mt-8">
              <button
                className="px-14 py-1 border-2 border-[#5C4033] rounded-xl text-[#5C4033] hover:bg-[#5C4033] hover:text-white transition"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                className="px-14 py-1 bg-[#5C4033] text-white rounded-xl hover:bg-[#3e2a20] transition"
                onClick={onConfirm}
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;
