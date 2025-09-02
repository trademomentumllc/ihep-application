import Parser from 'rss-parser';
import { resources, insertResourceSchema } from '@shared/schema';
import { db } from '../db';
import { z } from 'zod';
import { eq, and, sql } from 'drizzle-orm';

// Define cache structure
interface RssFeedCache {
  [feedUrl: string]: {
    items: any[];
    lastFetched: Date;
  };
}

// Cache with default 30-minute expiration
const cache: RssFeedCache = {};
const CACHE_EXPIRATION_MS = 30 * 60 * 1000; // 30 minutes

// RSS Parser instance
const parser = new Parser({
  customFields: {
    item: [
      ['media:content', 'media', { keepArray: true }],
      ['content:encoded', 'contentEncoded'],
    ],
  },
});

// Health topic categories mapping
const healthTopicCategories = {
  'mental-health': 'Mental Health Resources',
  'post-diagnosis': 'Post-Diagnosis Care',
  'hiv-research': 'HIV Research',
  'treatment': 'Treatment Options',
  'support': 'Support Networks',
  'prevention': 'Prevention Strategies',
  'nutrition': 'Nutrition & Diet',
  'wellness': 'General Wellness'
};

// Disable RSS feeds - we'll use static healthcare resources instead
const feedUrls: Record<string, string[]> = {};

/**
 * Fetch an RSS feed and update cache
 */
export async function fetchRssFeed(url: string, forceRefresh = false): Promise<any[]> {
  // Check cache first if not forcing refresh
  if (!forceRefresh && cache[url] && 
      (new Date().getTime() - cache[url].lastFetched.getTime() < CACHE_EXPIRATION_MS)) {
    console.log(`Using cached feed for ${url}`);
    return cache[url].items;
  }

  try {
    console.log(`Fetching feed from ${url}`);
    const feed = await parser.parseURL(url);
    
    // Update cache
    cache[url] = {
      items: feed.items,
      lastFetched: new Date()
    };
    
    return feed.items;
  } catch (error) {
    console.error(`Error fetching RSS feed from ${url}:`, error);
    
    // Return cached data if available, even if expired
    if (cache[url]) {
      console.log(`Using expired cached feed for ${url} due to fetch error`);
      return cache[url].items;
    }
    
    return [];
  }
}

/**
 * Convert RSS item to resource format
 */
function rssItemToResource(item: any, category: string): z.infer<typeof insertResourceSchema> {
  // Extract image URL if available
  let imageUrl = '';
  if (item.media && item.media.length > 0 && item.media[0].$) {
    imageUrl = item.media[0].$.url;
  } else if (item.enclosure && item.enclosure.url) {
    imageUrl = item.enclosure.url;
  }
  
  // Format content description, limiting length
  let description = item.contentSnippet || item.content || item.description || '';
  if (description.length > 300) {
    description = description.substring(0, 297) + '...';
  }
  
  // Remove HTML tags if present
  description = description.replace(/<[^>]*>?/gm, '');
  
  // Get category name or default to General Health
  const categoryName = healthTopicCategories[category as keyof typeof healthTopicCategories] || 'General Health';
  
  return {
    name: item.title || 'Untitled Article',
    description,
    category: categoryName,
    contactInfo: item.link || '',
    address: '',
    website: item.link || '',
    imageUrl,
    isVirtual: true,
    takingNewPatients: true,
    availableToday: true
  };
}

/**
 * Import RSS feeds as resources
 */
export async function importRssFeedsAsResources(): Promise<number> {
  let importCount = 0;
  
  for (const [category, urls] of Object.entries(feedUrls)) {
    for (const url of urls) {
      try {
        const items = await fetchRssFeed(url);
        
        // Prepare resources batch
        const resourcesBatch = items
          .slice(0, 10) // Limit to 10 items per feed
          .map(item => rssItemToResource(item, category));
        
        // Insert resources in batch
        if (resourcesBatch.length > 0) {
          await db.insert(resources).values(resourcesBatch);
          importCount += resourcesBatch.length;
          console.log(`Imported ${resourcesBatch.length} items from ${url}`);
        }
      } catch (error) {
        console.error(`Error importing feed ${url} as resources:`, error);
      }
    }
  }
  
  return importCount;
}

/**
 * Check if we need to seed initial resources
 */
export async function seedInitialResourcesIfNeeded(): Promise<void> {
  // Import healthcare resources instead of RSS feeds
  const { seedHealthcareResources } = await import('./healthcareResources');
  await seedHealthcareResources();
}

/**
 * Refresh all RSS feeds and update resources
 */
export async function refreshAllFeeds(): Promise<number> {
  // Clear all existing resources that came from RSS feeds - target those that are marked as virtual
  // and have a website URL (which would be from our RSS feed imports)
  await db.delete(resources).where(
    and(
      sql`website is not null and website != ''`,
      eq(resources.isVirtual, true)
    )
  );
  
  // Re-import all feeds
  return await importRssFeedsAsResources();
}

/**
 * Schedule regular refresh of feeds
 */
export function scheduleRssFeedRefresh(intervalHours = 24): NodeJS.Timeout {
  const intervalMs = intervalHours * 60 * 60 * 1000;
  
  console.log(`Scheduling RSS feed refresh every ${intervalHours} hours`);
  
  return setInterval(async () => {
    console.log('Running scheduled RSS feed refresh...');
    try {
      const count = await refreshAllFeeds();
      console.log(`Refreshed ${count} resources from RSS feeds`);
    } catch (error) {
      console.error('Error during scheduled RSS feed refresh:', error);
    }
  }, intervalMs);
}