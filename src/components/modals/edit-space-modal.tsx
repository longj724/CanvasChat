'use client';
// External Dependencies
import { useState } from 'react';
import { FilePenLine } from 'lucide-react';
import { toast } from 'sonner';

// Relative Dependencies
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { useEditSpace } from '@/hooks/use-edit-space';

type Props = {
  name: string;
  spaceId: string;
};

const EditSpaceModal = ({ name, spaceId }: Props) => {
  const [open, setIsOpen] = useState(false);
  const [spaceName, setSpaceName] = useState(name);
  const editSpaceMutation = useEditSpace();

  const handleSaveName = async () => {
    if (spaceName !== '') {
      editSpaceMutation.mutate({
        spaceId: spaceId,
        name: spaceName,
      });
    } else {
      toast.error('Space name cannot be empty');
    }
    setIsOpen(false);
  };

  const handleSpaceNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSpaceName(e.target.value);
  };

  return (
    <Dialog open={open} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <FilePenLine
          className="hover:pointer rounded-sm p-[3px] hover:bg-gray-500"
          size={20}
        />
      </DialogTrigger>
      <DialogContent className="w-1/2 sm:w-3/5">
        <DialogHeader>
          <DialogTitle className="mb-4">Edit Space Name</DialogTitle>
          <div className="flex flex-row items-center">
            <Label htmlFor="name" className="w-1/5">
              Name
            </Label>
            <Input
              id="name"
              value={spaceName}
              className="w-4/5"
              onChange={handleSpaceNameChange}
            />
          </div>
        </DialogHeader>
        <DialogFooter>
          <Button type="submit" onClick={handleSaveName}>
            Save
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default EditSpaceModal;
