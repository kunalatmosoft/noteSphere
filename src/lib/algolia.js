import { liteClient as algoliasearch } from 'algoliasearch/lite';

// Make sure to add these to your .env.local file
const appId = import.meta.env.VITE_ALGOLIA_APP_ID || 'APP_ID_PLACEHOLDER';
const searchKey = import.meta.env.VITE_ALGOLIA_SEARCH_KEY || 'SEARCH_KEY_PLACEHOLDER';

export const searchClient = algoliasearch(appId, searchKey);
export const INDEX_NAME = import.meta.env.VITE_ALGOLIA_INDEX_NAME || 'posts';
