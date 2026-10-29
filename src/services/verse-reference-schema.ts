import { z } from "zod";
import bookList from "../data/book-list.json" with { type: "json" };

function getAllBibleBooks() {
  return bookList.data.map((book) => book.name);
}

const VerseReferenceCustomSchema = z
  .object({
    bookNumber: z.number().int().min(1).max(3).optional(),
    bookName: z.string().min(3),
    fullBookName: z.enum([...getAllBibleBooks(), "Psalm", "Revelations"], {
      error: () => "Invalid book name",
    }),
    chapter: z.number().int().min(1),
    verseNumberStart: z.number().int().min(1),
    verseNumberEnd: z.number().int().min(1),
  })
  .refine((data) => data.verseNumberEnd >= data.verseNumberStart, {
    message: "End verse cannot be less than start verse",
    path: ["verseNumberEnd"],
  })
  .transform((data) => {
    const { verseNumberStart, verseNumberEnd } = data;

    return {
      ...data,
      verseCount: 1 + verseNumberEnd - verseNumberStart,
    };
  });

export const VerseReferenceSchema = z
  .string()
  .min(6)
  .max(40)
  .regex(/^[a-zA-Z0-9:\s-]+$/, {
    message: "Must contain letters, numbers, spaces, colons, or dashes",
  })
  .transform((verseReference, context) => {
    try {
      const parsedParts = parseVerseReferenceIntoParts(verseReference);
      const validation = VerseReferenceCustomSchema.safeParse(parsedParts);

      if (!validation.success) {
        for (const issue of validation.error.issues) {
          context.addIssue({
            code: "custom",
            message: issue.message,
            path: issue.path,
          });
        }
        return z.NEVER;
      }

      return validation.data;
    } catch (error) {
      context.addIssue({
        code: "custom",
        message:
          error instanceof Error
            ? error.message
            : "Failed to parse verse reference",
      });
      return z.NEVER;
    }
  });

export type VerseReference = z.infer<typeof VerseReferenceSchema>;

function parseVerseReferenceIntoParts(verseReference: string) {
  const cleanInput = verseReference.trim();

  // 1. Broadly split the string by the colon to isolate Book/Chapter from Verses
  if (!cleanInput.includes(":")) {
    throw new Error(
      "Missing a colon ':' to separate the chapter from the verse",
    );
  }

  if ((cleanInput.match(/:/g) || []).length > 1) {
    throw new Error("Must include only a single colon character");
  }

  const [bookAndChapter, verseResult] = cleanInput.split(":", 2);

  // 2. Extract the chapter from the end of the first segment
  // This safely grabs trailing digits even if the book name is duplicated or messy
  const chapterMatch = bookAndChapter.match(/\s+(\d+)$/);
  if (!chapterMatch) {
    throw new Error("Could not find a valid chapter number before the colon");
  }

  const rawChapter = chapterMatch[1];
  // Remove the chapter digits and trailing spaces to isolate the book portion
  const rawFullBookName = bookAndChapter
    .slice(
      0,
      Math.max(
        0,
        chapterMatch.index === undefined ? Infinity : chapterMatch.index,
      ),
    )
    .trim();

  // 3. Granularly validate the Book portion for common typos
  if (!rawFullBookName) {
    throw new Error("Book name cannot be blank");
  }

  // Parse out an optional leading book number (1, 2, or 3)
  const bookNumberMatch = rawFullBookName.match(/^[1-3](?:\s+|$)/);
  let bookNumber: number | undefined;
  let rawBookName = rawFullBookName;

  if (bookNumberMatch) {
    bookNumber = Number(bookNumberMatch[0]);
    rawBookName = rawFullBookName.slice(bookNumberMatch[0].length).trim();
  } else if (/^\d/.test(rawFullBookName)) {
    // Catches cases like "4 John" or "1John" (missing space)
    const invalidNumber = rawFullBookName.charAt(0);
    if (["1", "2", "3"].includes(invalidNumber)) {
      throw new Error(
        `Book number '${invalidNumber}' must be followed by a space`,
      );
    }
    throw new Error("Book numbers can only be 1, 2, or 3");
  }

  // 4. Validate the Verse portion
  if (!verseResult.trim()) {
    throw new Error("Verse section cannot be empty after the colon");
  }

  if (verseResult.includes("-") && (verseResult.match(/-/g) || []).length > 1) {
    throw new Error("Verse range can only contain a single dash");
  }

  const [rawStart, rawEnd] = verseResult.includes("-")
    ? verseResult.split("-", 2)
    : [verseResult, verseResult];

  const verseNumberStart = Number(rawStart.trim());
  const verseNumberEnd = Number(rawEnd.trim());

  if (Number.isNaN(verseNumberStart) || Number.isNaN(verseNumberEnd)) {
    throw new TypeError("Invalid verse number");
  }

  // Final check on the text portion of the book name
  const bookName = toTitleCase(rawBookName);
  const fullBookName = bookNumber ? `${bookNumber} ${bookName}` : bookName;

  return {
    bookNumber,
    bookName,
    fullBookName,
    chapter: Number(rawChapter),
    verseNumberStart,
    verseNumberEnd,
  };
}

function toTitleCase(value: string) {
  const lowerCaseValue = value.toLowerCase();
  const titleCasedWords = lowerCaseValue.split(" ").map((word) => {
    return word === "of" ? word : word.charAt(0).toUpperCase() + word.slice(1);
  });

  return titleCasedWords.join(" ");
}
