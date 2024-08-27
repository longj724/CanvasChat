// External Dependencies
import { Dispatch, SetStateAction } from 'react';
import { FileIcon, X } from 'lucide-react';
import { toast } from 'sonner';

// Relative Dependencies
import { useDeleteFileUpload } from '@/hooks/use-delete-file-upload';
import { FileUploadData } from './customNode';

interface FileUploadedNotificationProps {
  fileData: FileUploadData;
  messageId: string;
  setUploadedFiles: Dispatch<SetStateAction<FileUploadData[]>>;
}

const FileUploadNotification = ({
  fileData,
  messageId,
  setUploadedFiles,
}: FileUploadedNotificationProps) => {
  const { imageId, name, publicUrl, type } = fileData;
  const deleteFileUploadMutation = useDeleteFileUpload();

  const onDeleteFileUpload = () => {
    deleteFileUploadMutation.mutate(
      {
        messageId,
        imageId,
      },
      {
        onSuccess: () => {
          setUploadedFiles((prev) =>
            prev.filter((file) => file.imageId !== imageId)
          );
          toast.success('File deleted successfully');
        },
        onError: () => {
          toast.error('Failed to delete file');
        },
      }
    );
  };

  return (
    <div className="flex items-center bg-white rounded-lg shadow-md p-2 max-w-[200px] hover:cursor-auto relative">
      <button
        aria-label="Delete file"
        className="absolute top-[0px] right-1 text-white bg-black p-1 rounded-full"
        onClick={onDeleteFileUpload}
      >
        <X size={12} className="rounded-full" color="white" />
      </button>

      <div className="bg-pink-100 rounded-lg p-2 mr-3">
        <FileIcon className="text-pink-500" size={24} />
      </div>
      <div className="flex flex-col overflow-auto">
        <span className="font-semibold text-gray-800 truncate">{name}</span>
        <span className="text-gray-500 text-sm uppercase">{type}</span>
      </div>
    </div>
  );
};

export default FileUploadNotification;
