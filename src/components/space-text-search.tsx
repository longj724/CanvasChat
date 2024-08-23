// External Dependencies
import { useCallback, useEffect, useState } from 'react';
import _ from 'lodash';

// Relative Dependencies
import { Input } from './ui/input';

type Props = {};

const SpaceTextSeach = (props: Props) => {
  const [searchValue, setSearchValue] = useState('');

  const debouncedSave = useCallback(
    _.debounce((value: string) => {
      console.log('value', value);
      // mutate(values);
    }, 500),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
  };

  useEffect(() => {
    if (searchValue.length > 0) {
      debouncedSave(searchValue);
    }
  }, [searchValue]);

  return (
    <div className="absolute right-[50%] top-[12px] hover:cursor-pointer z-50 w-60">
      <Input
        placeholder="Search "
        value={searchValue}
        onChange={handleSearchChange}
      />
    </div>
  );
};

export default SpaceTextSeach;
