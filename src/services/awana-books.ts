import sparksHangGliderHandbook from "../data/awana-books/sparks-hangglider-handbook.json" with { type: "json" };
import ttAgentsOfGraceKidsHandbook from "../data/awana-books/tt-mission-agents-of-grace-kids-handbook.json" with { type: "json" };
import ttDiscoveryofGraceKidsHandbook from "../data/awana-books/tt-mission-discovery-of-grace-kids-handbook.json" with { type: "json" };

type BookOptions = {
  includeVerses: boolean;
};

export function getAllBooks({ includeVerses }: BookOptions) {
  const allBooks = [
    sparksHangGliderHandbook,
    ttAgentsOfGraceKidsHandbook,
    ttDiscoveryofGraceKidsHandbook,
  ];
  if (includeVerses) {
    return allBooks;
  }

  return allBooks.map((book) => {
    const { verseList: _verseList, ...bookWithoutVerses } = book;
    return bookWithoutVerses;
  });
}

export function getBookById(bookId: string, { includeVerses }: BookOptions) {
  const allBooks = getAllBooks({ includeVerses });
  const book = allBooks.find((book) => book.id === bookId);
  if (!book) {
    throw new Error(`Book with ID "${bookId}" not found`);
  }
  return book;
}
