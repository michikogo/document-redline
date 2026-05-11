export type Change = {
  target: { text: string; occurrence: number };
  replacement: string;
};

export const applyChange = (
  content: string,
  targetText: string,
  occurrence: number,
  replacement: string,
): string => {
  if (!targetText) throw new Error("target.text cannot be empty");
  if (occurrence < 1) throw new Error("occurrence must be >= 1");

  let matchCount = 0;
  let searchFrom = 0;

  while (searchFrom < content.length) {
    const idx = content.indexOf(targetText, searchFrom);
    if (idx === -1) break;
    matchCount++;
    if (matchCount === occurrence) {
      return (
        content.slice(0, idx) +
        replacement +
        content.slice(idx + targetText.length)
      );
    }
    searchFrom = idx + 1;
  }

  if (matchCount === 0) {
    throw new Error(`target.text "${targetText}" not found in document`);
  }
  throw new Error(
    `occurrence ${occurrence} exceeds match count (${matchCount}) for "${targetText}"`,
  );
};

export const applyChanges = (content: string, changes: Change[]): string =>
  changes.reduce(
    (current, { target, replacement }) =>
      applyChange(current, target.text, target.occurrence, replacement),
    content,
  );
