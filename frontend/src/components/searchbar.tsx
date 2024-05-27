import { Input, InputGroup, InputLeftElement } from '@chakra-ui/react';
import { Search2Icon } from '@chakra-ui/icons';

export const SearchBar = () => {
  return (
    <>
      <InputGroup>
        <Input
          variant="outline"
          placeholder="Search pins"
          display="flex"
          flexDirection="row"
          type="search"
          rounded="full"
        />
        <InputLeftElement padding="0" border-radius="100%" sx="">
          <Search2Icon />
        </InputLeftElement>
      </InputGroup>
    </>
  );
};
