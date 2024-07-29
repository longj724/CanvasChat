// External Dependencies
import { Ellipsis } from 'lucide-react';

// Relative Dependencies
import { SpacesResponseType } from '@/hooks/use-get-spaces';

type Props = {
  space: SpacesResponseType['data']['spaces'][0];
};

const Space = ({ space }: Props) => {
  return (
    <div className="flex w-[90%] items-center gap-3 rounded-lg px-5 py-2 text-primary transition-all hover:cursor-pointer hover:bg-gray-200 hover:text-primary">
      {space.name}
      <Ellipsis className="h-5 w-5 ml-auto" />
    </div>
  );
};

export default Space;
