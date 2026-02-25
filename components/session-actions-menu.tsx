import React from "react";

type SessionActionsMenuProps = {
  onRename: () => void;
  onDelete: () => void;
};

export function SessionActionsMenuContent({
  onRename,
  onDelete,
}: SessionActionsMenuProps) {
  return (
    <>
      <button
        type="button"
        className="flex w-full items-center rounded-sm px-2 py-1.5 text-left text-stone-700 hover:bg-stone-100 font-medium cursor-pointer"
        onClick={onRename}
      >
        Rename
      </button>
      <button
        type="button"
        className="flex w-full items-center rounded-sm px-2 py-1.5 text-left text-red-600 hover:bg-red-50 font-medium cursor-pointer"
        onClick={onDelete}
      >
        Delete
      </button>
    </>
  );
}

// <button
//                         type="button"
//                         className="flex w-full items-center rounded-sm px-2 py-1.5 text-left text-stone-700 hover:bg-stone-100 font-medium cursor-pointer"
//                         onClick={() => startRename(session)}
//                       >
//                         Rename
//                       </button>
//                       <button
//                         type="button"
//                         className="mt-0.5 flex w-full items-center rounded-sm px-2 py-1.5 text-left text-red-600 hover:bg-red-50 font-medium cursor-pointer"
//                         onClick={() => {
//                           setSelectedIds(new Set([session.id]));
//                           setDeleteDialogOpen(true);
//                         }}
//                       >
//                         Delete
//                       </button>
