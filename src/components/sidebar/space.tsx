// External Dependencies
import { useParams } from 'next/navigation';
import Link from 'next/link';

// Relative Dependencies
import { SpacesResponseType } from '@/hooks/use-get-spaces';
import { cn } from '@/lib/utils';
import DeleteSpaceModal from '../modals/delete-space-modal';
import EditSpaceModal from '../modals/edit-space-modal';

type Props = {
  space: SpacesResponseType['data']['spaces'][0];
};

const Space = ({ space }: Props) => {
  const { spaceId } = useParams();

  return (
    <Link
      href={`/space/${space.id}`}
      className={cn(
        spaceId === space.id ? 'bg-gray-200' : '',
        'flex w-[90%] items-center gap-3 rounded-lg px-5 py-2 text-primary transition-all hover:cursor-pointer hover:bg-gray-200 hover:text-primary'
      )}
    >
      <span>{space.name}</span>
      <div className="flex flex-row items-center gap-2 ml-auto">
        <EditSpaceModal spaceId={space.id} name={space.name} />
        <DeleteSpaceModal spaceID={space.id} name={space.name} />
      </div>
    </Link>
  );
};

export default Space;
