import emojiData from "emoji-picker-react/dist/data/emojis-en";

const allEmojis = Object.values(emojiData.emojis).flat();

const normalizeText = value =>
    String(value || "")
        .toLowerCase()
        .replace(/[_-]/g, " ")
        .trim();

const unifiedToEmoji = unified => {

    return String(unified || "")
        .split("-")
        .map(codePoint =>
            parseInt(codePoint, 16)
        )
        .map(codePoint =>
            String.fromCodePoint(codePoint)
        )
        .join("");
};

export const searchEmojis = (query, limit = 80) => {

    const normalizedQuery = normalizeText(query);

    if (!normalizedQuery) {
        return [];
    }

    const queryWords = normalizedQuery
        .split(/\s+/)
        .filter(Boolean);

    return allEmojis
        .filter(emoji => {

            const names =
                (emoji.n || [])
                    .map(normalizeText)
                    .join(" ");

            return queryWords.every(
                word =>
                    names.includes(word)
            );

        })
        .slice(0, limit)
        .map(emoji => {

            const unified =
                emoji.u;

            return {
                emoji:
                    unifiedToEmoji(
                        unified
                    ),

                unified,

                names:
                    emoji.n || [],
            };

        });

};