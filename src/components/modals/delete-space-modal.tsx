'use client';
// External Dependencies
import { Trash2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

// Relative Dependencies
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useDeleteSpace } from '@/hooks/use-delete-space';

type Props = {
  spaceID: string;
  name: string;
};

const DeleteSpaceModal = ({ spaceID, name }: Props) => {
  const deleteSpaceMutation = useDeleteSpace();
  const router = useRouter();

  const handleDeleteSpace = async () => {
    deleteSpaceMutation.mutate(
      { spaceId: spaceID },
      {
        onSuccess: () => {
          router.back();
        },
      }
    );
  };

  return (
    <AlertDialog>
      <AlertDialogTrigger className="flex">
        <Trash2
          className="hover:pointer rounded-sm p-[3px] hover:bg-gray-500"
          size={20}
        />
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            Delete <i>{name}</i>
          </AlertDialogTitle>
          <AlertDialogDescription>
            Are you sure you want to delete this space?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={handleDeleteSpace}>
            Delete
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteSpaceModal;
