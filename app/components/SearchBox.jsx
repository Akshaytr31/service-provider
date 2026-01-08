"use client";

import {
  InputGroup,
  Input,
  InputRightElement,
  IconButton,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";

export default function SearchBox() {
  return (
    <InputGroup maxW="300px">
      <Input
        placeholder="Search..."
        pr="3rem"
        focusBorderColor="blue.100"
      />
      <InputRightElement>
        <IconButton
          aria-label="Search"
          icon={<SearchIcon />}
          size="sm"
          variant="ghost"
        />
      </InputRightElement>
    </InputGroup>
  );
}
