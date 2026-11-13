import sparksWingRunnerHandbook from "../data/awana-books/sparks-wingrunner-handbook.json" with { type: "json" };
import ttAgentsOfGraceKidsHandbook from "../data/awana-books/tt-mission-agents-of-grace-kids-handbook.json" with { type: "json" };
import ttDiscoveryofGraceKidsHandbook from "../data/awana-books/tt-mission-discovery-of-grace-kids-handbook.json" with { type: "json" };

type BookOptions = {
  includeMemoryVerses: boolean;
};

export function getAllBooks({ includeMemoryVerses }: BookOptions) {
  const allBooks = [
    sparksWingRunnerHandbook,
    ttAgentsOfGraceKidsHandbook,
    ttDiscoveryofGraceKidsHandbook,
  ];
  if (includeMemoryVerses) {
    return allBooks;
  }

  return allBooks.map((book) => {
    const { memoryVerses: _memoryVerses, ...bookWithoutMemoryVerses } = book;
    return bookWithoutMemoryVerses;
  });
}

export function getBookById(
  bookId: string,
  { includeMemoryVerses }: BookOptions,
) {
  const allBooks = getAllBooks({ includeMemoryVerses });
  const book = allBooks.find((book) => book.id === bookId);
  if (!book) {
    throw new Error(`Book with ID "${bookId}" not found`);
  }
  return book;
}
