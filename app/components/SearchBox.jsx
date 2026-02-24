"use client";

import {
  InputGroup,
  Input,
  InputRightElement,
  InputLeftElement,
  IconButton,
} from "@chakra-ui/react";
import { SearchIcon } from "@chakra-ui/icons";
import { useSearch } from "../context/SearchContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

// Map pathnames to placeholder text
function getPlaceholder(pathname) {
  if (pathname?.startsWith("/seakerDashboard")) return "Search services...";
  if (pathname?.startsWith("/seeker/bookings")) return "Search bookings...";
  if (pathname?.startsWith("/providerDashboard")) return "Search requests...";
  return "Search...";
}

export default function SearchBox() {
  const { searchQuery, setSearchQuery } = useSearch();
  const pathname = usePathname();
  const router = useRouter();
  const inputRef = useRef(null);

  // When navigating away from a search-enabled page, clear the query
  useEffect(() => {
    setSearchQuery("");
  }, [pathname]);

  const isDashboardPage =
    pathname?.startsWith("/seakerDashboard") ||
    pathname?.startsWith("/seeker/bookings") ||
    pathname?.startsWith("/providerDashboard");

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !isDashboardPage && searchQuery.trim()) {
      router.push(
        `/seakerDashboard?q=${encodeURIComponent(searchQuery.trim())}`,
      );
    }
  };

  const handleSearchClick = () => {
    if (!isDashboardPage && searchQuery.trim()) {
      router.push(
        `/seakerDashboard?q=${encodeURIComponent(searchQuery.trim())}`,
      );
    }
  };

  return (
    <InputGroup maxW={{ base: "full", md: "300px" }}>
      <InputLeftElement pointerEvents="none">
        <SearchIcon color="gray.400" />
      </InputLeftElement>
      <Input
        ref={inputRef}
        pl="2.5rem"
        pr="3rem"
        placeholder={getPlaceholder(pathname)}
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        onKeyDown={handleKeyDown}
        focusBorderColor="green.400"
        borderRadius="full"
        bg="white"
        fontSize="sm"
      />
      <InputRightElement>
        <IconButton
          aria-label="Search"
          icon={<SearchIcon />}
          size="sm"
          variant="ghost"
          colorScheme="green"
          onClick={handleSearchClick}
          borderRadius="full"
        />
      </InputRightElement>
    </InputGroup>
  );
}
