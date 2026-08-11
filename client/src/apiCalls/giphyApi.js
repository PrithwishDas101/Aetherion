import axios from "axios";

const GIPHY_API_KEY = import.meta.env.VITE_GIPHY_API_KEY;
const GIPHY_BASE_URL = "https://api.giphy.com/v1/gifs";
const GIPHY_SEARCH_URL = `${GIPHY_BASE_URL}/search`;

export const searchGifs = async (query, limit = 20) => {

    if (!query?.trim()) {
        return [];
    }

    const response =
        await axios.get(
            GIPHY_SEARCH_URL,
            {
                params: {
                    api_key:
                        GIPHY_API_KEY,

                    q:
                        query.trim(),

                    limit,

                    rating:
                        "pg-13",

                    lang:
                        "en",
                },
            }
        );

    return response.data?.data || [];
};

export const getTrendingGifs = async (limit = 20) => {

    const response =
        await axios.get(
            `${GIPHY_BASE_URL}/trending`,
            {
                params: {
                    api_key:
                        GIPHY_API_KEY,

                    limit,

                    rating:
                        "pg-13",
                },
            }
        );

    return response.data?.data || [];
};