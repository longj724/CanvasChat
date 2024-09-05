// External Dependencies
import { Dispatch, SetStateAction } from 'react';
import { LoaderCircle, PlusCircle } from 'lucide-react';
import { useParams } from 'next/navigation';

// Relative Dependencies
import { Button } from './ui/button';

type Props = {
  isNewRootMessageLoading: boolean;
  setIsPlacingRootMessage: Dispatch<SetStateAction<boolean>>;
};

const AddMessageButton = ({
  isNewRootMessageLoading,
  setIsPlacingRootMessage,
}: Props) => {
  const { spaceId } = useParams();

  return (
    <div className="absolute right-[50px] top-[12px] hover:cursor-pointer z-50">
      <Button onClick={() => setIsPlacingRootMessage(true)} disabled={!spaceId}>
        {isNewRootMessageLoading ? (
          <LoaderCircle className="size-6 animate-spin text-muted-foreground mr-2" />
        ) : (
          <PlusCircle className="h-6 w-6 mr-2" />
        )}
        Add Message
      </Button>
    </div>
  );
};

export default AddMessageButton;
