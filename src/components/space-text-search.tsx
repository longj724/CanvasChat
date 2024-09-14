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
    setSearchValue(e.target.value);
  };

  useEffect(() => {
    if (searchValue.length > 0) {
      debouncedSave(searchValue);
    }
  }, [debouncedSave, searchValue]);

  const extractWordContext = (
    text: string,
    word: string,
    beforeWords = 4,
    afterWords = 10
  ) => {
    const lowercaseWord = word.toLowerCase();
    const words = text.split(/\s+/);

    const wordArrayIndex = words.findIndex((w) =>
      w.toLowerCase().includes(lowercaseWord)
    );

    const startIndex = Math.max(0, wordArrayIndex - beforeWords);
    const endIndex = Math.min(words.length, wordArrayIndex + afterWords + 1);

    const wordsBefore = words.slice(startIndex, wordArrayIndex);
    const wordsAfter = words.slice(wordArrayIndex + 1, endIndex);

    return {
      wordsBefore: wordsBefore.join(' '),
      wordsAfter: wordsAfter.join(' '),
    };
  };

  const highlightedSearchResponse = (text: string, word: string) => {
    const { wordsBefore, wordsAfter } = extractWordContext(text, word);

    return (
      <>
        <span>{wordsBefore} </span>
        <span className="bg-yellow-300 font-bold text-black">{word}</span>
        <span> {wordsAfter}</span>
      </>
    );
  };

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
                      <p className="truncate">
                        {highlightedSearchResponse(
                          result.userMessage as string,
                          searchValue
                        )}
                      </p>
                    </div>
                  ) : (
                    <div className="flex flex-col gap-2 h-20 w-96">
                      <p>Response Message:</p>
                      <p className="overflow-hidden text-ellipsis">
                        {highlightedSearchResponse(
                          result.response as string,
                          searchValue
                        )}
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
          <div className="text-center text-sm text-black bg-white">
            No results found
          </div>
        )}
    </div>
  );
};

export default SpaceTextSeach;
