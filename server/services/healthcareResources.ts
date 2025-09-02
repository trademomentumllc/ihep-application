import { resources, insertResourceSchema } from '@shared/schema';
import { db } from '../db';
import { z } from 'zod';
import { sql } from 'drizzle-orm';

// Realistic HIV healthcare resources
const staticHealthcareResources: z.infer<typeof insertResourceSchema>[] = [
  // HIV Testing Centers
  {
    name: "Community Health Services HIV Testing Center",
    description: "Free and confidential HIV testing, counseling, and prevention services. Walk-ins welcome.",
    category: "testing_centers",
    address: "1425 Martin Luther King Jr Way, Oakland, CA 94612",
    phone: "(510) 555-0198",
    email: "testing@communityhealthservices.org",
    website: "https://communityhealthservices.org/hiv-testing",
    contactInfo: "(510) 555-0198",
    hours: "Mon-Fri 8AM-6PM, Sat 9AM-3PM",
    takingNewPatients: true,
    isVirtual: false,
    rating: 5,
    reviewCount: 127,
    imageUrl: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop"
  },
  {
    name: "San Francisco AIDS Foundation Testing Site",
    description: "Comprehensive HIV testing, PrEP consultation, and sexual health services in a welcoming environment.",
    category: "testing_centers", 
    address: "1035 Market St, San Francisco, CA 94103",
    phone: "(415) 555-0234",
    email: "services@sfaf.org",
    website: "https://sfaf.org/hiv-testing",
    contactInfo: "(415) 555-0234",
    hours: "Mon-Thu 9AM-7PM, Fri 9AM-5PM",
    takingNewPatients: true,
    isVirtual: false,
    rating: 5,
    reviewCount: 203,
    imageUrl: "https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop"
  },

  // HIV Specialists
  {
    name: "Dr. Maria Rodriguez - HIV Specialist",
    description: "Board-certified infectious disease specialist with 15+ years treating HIV patients. Expertise in treatment adherence and care coordination.",
    category: "hiv_specialists",
    address: "2100 Webster St, Suite 401, San Francisco, CA 94115",
    phone: "(415) 555-0156",
    email: "appointments@rodriguezmd.com",
    website: "https://rodriguezmd.com",
    contactInfo: "(415) 555-0156",
    hours: "Mon-Fri 8AM-5PM",
    takingNewPatients: true,
    isVirtual: false,
    rating: 5,
    reviewCount: 89,
    imageUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=400&h=300&fit=crop"
  },
  {
    name: "Dr. James Chen - Infectious Disease Clinic",
    description: "Comprehensive HIV care including viral load monitoring, medication management, and preventive care. Telehealth available.",
    category: "hiv_specialists",
    address: "3801 Sacramento St, San Francisco, CA 94118", 
    phone: "(415) 555-0287",
    email: "care@cheninfectiousdisease.com",
    website: "https://cheninfectiousdisease.com",
    contactInfo: "(415) 555-0287",
    hours: "Mon-Fri 7AM-6PM",
    takingNewPatients: true,
    isVirtual: true,
    rating: 5,
    reviewCount: 156,
    imageUrl: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=300&fit=crop"
  },

  // Mental Health Support
  {
    name: "Bay Area HIV Mental Health Counseling",
    description: "Specialized therapy for HIV+ individuals dealing with diagnosis adjustment, depression, anxiety, and life transitions.",
    category: "mental_health",
    address: "1663 Mission St, Suite 400, San Francisco, CA 94103",
    phone: "(415) 555-0345",
    email: "support@bayhivmentalhealth.org",
    website: "https://bayhivmentalhealth.org",
    contactInfo: "(415) 555-0345",
    hours: "Mon-Sat 9AM-8PM",
    takingNewPatients: true,
    isVirtual: true,
    rating: 5,
    reviewCount: 94,
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop"
  },
  {
    name: "LGBTQ+ Affirming Therapy Center",
    description: "Culturally competent mental health services for LGBTQ+ individuals living with HIV. Individual and group therapy available.",
    category: "mental_health",
    address: "1800 Market St, Suite 3A, San Francisco, CA 94102",
    phone: "(415) 555-0412",
    email: "intake@lgbtqtherapy.org",
    website: "https://lgbtqtherapy.org",
    contactInfo: "(415) 555-0412", 
    hours: "Mon-Sun 8AM-9PM",
    takingNewPatients: true,
    isVirtual: true,
    rating: 5,
    reviewCount: 167,
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=300&fit=crop"
  },

  // Support Groups
  {
    name: "Positive Living Support Group",
    description: "Weekly peer support meetings for people newly diagnosed with HIV. Safe space to share experiences and build community.",
    category: "support_groups",
    address: "Community Center, 1235 Folsom St, San Francisco, CA 94103",
    phone: "(415) 555-0567",
    email: "groups@positiveliving.org",
    website: "https://positiveliving.org/support-groups",
    contactInfo: "(415) 555-0567",
    hours: "Thursdays 7PM-8:30PM",
    takingNewPatients: true,
    isVirtual: false,
    rating: 5,
    reviewCount: 78,
    imageUrl: "https://images.unsplash.com/photo-1544027993-37dbfe43562a?w=400&h=300&fit=crop"
  },
  {
    name: "Virtual HIV+ Wellness Circle",
    description: "Online support group focusing on wellness, nutrition, and maintaining health while living with HIV. Meets twice weekly.",
    category: "support_groups",
    address: "Online - Zoom meetings",
    phone: "(415) 555-0698",
    email: "virtual@hivwellnesscircle.org",
    website: "https://hivwellnesscircle.org",
    contactInfo: "(415) 555-0698",
    hours: "Tuesdays & Saturdays 6PM-7PM",
    takingNewPatients: true,
    isVirtual: true,
    rating: 5,
    reviewCount: 124,
    imageUrl: "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&h=300&fit=crop"
  },

  // Pharmacy & Medication
  {
    name: "AIDS Healthcare Foundation Pharmacy",
    description: "Specialized HIV medication pharmacy with financial assistance programs and medication adherence support.",
    category: "pharmacy",
    address: "6255 Sunset Blvd, Los Angeles, CA 90028",
    phone: "(323) 555-0789",
    email: "pharmacy@aidshealth.org", 
    website: "https://aidshealth.org/pharmacy",
    contactInfo: "(323) 555-0789",
    hours: "Mon-Fri 8AM-8PM, Sat 9AM-5PM",
    takingNewPatients: true,
    isVirtual: false,
    rating: 5,
    reviewCount: 267,
    imageUrl: "https://images.unsplash.com/photo-1576602975774-74c020fc5bb4?w=400&h=300&fit=crop"
  },
  {
    name: "Walgreens Specialty Pharmacy - HIV Care",
    description: "Full-service specialty pharmacy for HIV medications with home delivery and 24/7 pharmacist support.",
    category: "pharmacy",
    address: "Multiple locations - Home delivery available",
    phone: "(855) 555-0234",
    email: "hivcare@walgreensspecialty.com",
    website: "https://walgreensspecialty.com/hiv",
    contactInfo: "(855) 555-0234",
    hours: "24/7 Support Available",
    takingNewPatients: true,
    isVirtual: true,
    rating: 4,
    reviewCount: 189,
    imageUrl: "https://images.unsplash.com/photo-1576602975774-74c020fc5bb4?w=400&h=300&fit=crop"
  },

  // Legal & Financial Support
  {
    name: "HIV Legal Aid Society",
    description: "Free legal services for HIV+ individuals including disability benefits, healthcare advocacy, and employment discrimination cases.",
    category: "legal_support",
    address: "995 Market St, Suite 200, San Francisco, CA 94103",
    phone: "(415) 555-0123",
    email: "help@hivlegalaid.org",
    website: "https://hivlegalaid.org",
    contactInfo: "(415) 555-0123",
    hours: "Mon-Fri 9AM-5PM",
    takingNewPatients: true,
    isVirtual: true,
    rating: 5,
    reviewCount: 56,
    imageUrl: "https://images.unsplash.com/photo-1589391886645-d51941baf7fb?w=400&h=300&fit=crop"
  }
];

/**
 * Seed realistic healthcare resources for HIV patients
 */
export async function seedHealthcareResources(): Promise<number> {
  try {
    // Check if healthcare resources already exist
    const existingCount = await db.select({ count: sql`count(*)` }).from(resources);
    const count = Number(existingCount[0]?.count || '0');
    
    if (count > 0) {
      console.log(`Found ${count} existing resources. Skipping healthcare resource seed.`);
      return 0;
    }

    // Insert healthcare resources
    await db.insert(resources).values(staticHealthcareResources);
    console.log(`Seeded ${staticHealthcareResources.length} healthcare resources`);
    
    return staticHealthcareResources.length;
  } catch (error) {
    console.error('Error seeding healthcare resources:', error);
    return 0;
  }
}

/**
 * Refresh healthcare resources (replace RSS-sourced ones)
 */
export async function refreshHealthcareResources(): Promise<number> {
  try {
    // Clear all existing resources
    await db.delete(resources);
    
    // Insert fresh healthcare resources
    await db.insert(resources).values(staticHealthcareResources);
    console.log(`Refreshed with ${staticHealthcareResources.length} healthcare resources`);
    
    return staticHealthcareResources.length;
  } catch (error) {
    console.error('Error refreshing healthcare resources:', error);
    return 0;
  }
}