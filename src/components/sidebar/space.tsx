// External Dependencies
import { Ellipsis } from 'lucide-react';
import { useParams } from 'next/navigation';
import Link from 'next/link';

// Relative Dependencies
import { SpacesResponseType } from '@/hooks/use-get-spaces';
import { cn } from '@/lib/utils';

type Props = {
  space: SpacesResponseType['data']['spaces'][0];
};

const Space = ({ space }: Props) => {
  const { spaceID } = useParams();

  return (
    <Link
      href={`/space/${space.id}`}
      className={cn(
        spaceID === space.id ? 'bg-gray-200' : '',
        'flex w-[90%] items-center gap-3 rounded-lg px-5 py-2 text-primary transition-all hover:cursor-pointer hover:bg-gray-200 hover:text-primary'
      )}
    >
      <span>{space.name}</span>
      <Ellipsis className="h-5 w-5 ml-auto" />
    </Link>
  );
};

export default Space;
