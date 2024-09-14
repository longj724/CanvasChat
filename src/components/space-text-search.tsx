// External Dependencies
import { Search, X } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';
import _ from 'lodash';
import { useRouter } from 'next/navigation';

// Relative Dependenciess
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { useSearchMessages } from '@/hooks/use-search-messages';

const SpaceTextSeach = () => {
  const [searchValue, setSearchValue] = useState('');
  const router = useRouter();
  const {
    data,
    error,
    isPending,
    isSuccess,
    mutate: searchMessagesMutation,
  } = useSearchMessages();

  const debouncedSave = useCallback(
    _.debounce((value: string) => {
      searchMessagesMutation({
        searchValue: value,
      });
    }, 500),
    []
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    console.log('value', e.target.value);
    setSearchValue(e.target.value);
  };

  useEffect(() => {
    if (searchValue.length > 0) {
      debouncedSave(searchValue);
    }
  }, [debouncedSave, searchValue]);

  return (
    <div className="absolute left-1/2 transform -translate-x-1/2 top-[12px] w-128 flex flex-col gap-2 items-center z-50">
      <div className="relative w-60">
        <Input
          placeholder="Search"
          value={searchValue}
          onChange={handleSearchChange}
          className="pr-8"
        />
        {searchValue !== '' ? (
          <button
            onClick={() => setSearchValue('')}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
            aria-label="Clear search"
          >
            <X size={16} />
          </button>
        ) : (
          <div
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-500"
            aria-label="Search"
          >
            <Search size={16} />
          </div>
        )}
      </div>

      {isPending && (
        <div className="text-center text-sm text-black bg-white">
          Searching...
        </div>
      )}

      {error && (
        <div className="text-center text-sm text-red-500">
          Error Fething Results
        </div>
      )}

      {searchValue && isSuccess && data.data.messages.length > 0 && (
        <Card className="z-[150]">
          <CardContent className="p-0">
            <ul className="divide-y divide-gray-200">
              {data.data.messages.map((result, index) => (
                <li
                  key={index}
                  className="p-4 hover:bg-gray-50 hover:cursor-pointer"
                  onClick={() =>
                    router.push(
                      `/space/${result.spaceId}?position=${result.xPosition},${result.yPosition}`
                    )
                  }
                >
                  {result.userMessage !== null &&
                  result.userMessage.includes(searchValue) ? (
                    <div className="flex flex-col gap-2 h-20 w-96">
                      <p>User Message:</p>
                      <p className="truncate">{result.userMessage}</p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 h-20 w-96">
                      <p>Response Message:</p>
                      <p className="overflow-hidden text-ellipsis">
                        {result.response}
                      </p>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {searchValue.length > 0 &&
        !isPending &&
        data?.data.messages.length === 0 &&
        !error && (
          <div className="text-center text-sm text-gray-500">
            No results found
          </div>
        )}
    </div>
  );
};

export default SpaceTextSeach;
