// External Dependencies
import { Ellipsis } from 'lucide-react';

type Props = {};

const Space = (props: Props) => {
  return (
    <div className="flex w-[90%] items-center gap-3 rounded-lg px-5 py-2 text-primary transition-all hover:cursor-pointer hover:bg-gray-200 hover:text-primary">
      Space Name
      <Ellipsis className="h-5 w-5" />
    </div>
  );
};

export default Space;
