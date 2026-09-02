import { NextResponse } from 'next/server';
import { getD1Record } from '@/lib/db';
import { SEED_PROPERTIES, Property } from '@/lib/queries';

export const runtime = 'edge';

interface AdCopyVariation {
  headline: string;
  primary_copy: string;
  short_description: string;
  cta: string;
}

const PLATFORM_STYLES: Record<string, string> = {
  facebook: 'Persuasive, storytelling, and emotional. Suitable for paid Facebook advertising.',
  instagram: 'Concise, visual-first, engaging, and social-media friendly with modern appeal.',
  whatsapp: 'Conversational, personal, direct, and punchy. Perfect for direct messaging.',
  portal: 'Factual, detailed, professional, and search-friendly for real estate portals.',
  general: 'Balanced, professional, versatile, and suitable for print or digital marketing.'
};

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const { propertyId, platform = 'facebook', propertyData } = body;

    if (!propertyId) {
      return NextResponse.json({ error: 'Property ID is required' }, { status: 400 });
    }

    const normalizedPlatform = (platform as string).toLowerCase();
    const platformStyle = PLATFORM_STYLES[normalizedPlatform] || PLATFORM_STYLES.facebook;

    // Fetch property data: payload > D1 > fallback SEED
    let prop: Property | null = propertyData || null;

    if (!prop && process.env.DB) {
      prop = await getD1Record<Property>('properties', propertyId);
    }

    if (!prop) {
      prop = SEED_PROPERTIES.find((p) => p.id === propertyId) || null;
    }

    if (!prop) {
      return NextResponse.json({ error: 'Property not found' }, { status: 404 });
    }

    // Extract non-empty facts only
    const facts: string[] = [];
    if (prop.title) facts.push(`Title: ${prop.title}`);
    if (prop.property_code) facts.push(`Property Code: ${prop.property_code}`);
    if (prop.location) facts.push(`Location: ${prop.location}`);
    if (prop.address) facts.push(`Address: ${prop.address}`);
    if (prop.property_type) facts.push(`Property Type: ${prop.property_type}`);
    if (prop.configuration) facts.push(`Configuration: ${prop.configuration}`);
    if (prop.carpet_area) facts.push(`Carpet Area: ${prop.carpet_area} sq.ft.`);
    if (prop.built_up_area) facts.push(`Built-up Area: ${prop.built_up_area} sq.ft.`);
    if (prop.price) facts.push(`Price: ₹${(prop.price / 10000000).toFixed(2)} Cr (${prop.price.toLocaleString('en-IN')} INR)`);
    if (prop.listing_type) facts.push(`Listing Type: ${prop.listing_type}`);
    if (prop.source_type) facts.push(`Source Type: ${prop.source_type}`);
    if (prop.owner_name) facts.push(`Developer/Owner: ${prop.owner_name}`);
    if (prop.unit_no) facts.push(`Unit No: ${prop.unit_no}`);
    if (prop.description) facts.push(`Existing Description: ${prop.description}`);

    const promptText = `You are a professional real estate marketing copywriter.
Create marketing copy for the selected property.

STRICT FACTUAL RULE:
Use ONLY the property facts supplied below.
Never invent, infer, estimate, assume, or add property facts.
Do NOT invent metro distance, sea view, mountain view, possession date, developer claims, amenities, investment returns, rental yield, floor number, parking, or pricing unless explicitly provided in the facts.
If a fact is not supplied, do not mention it.

PROPERTY FACTS:
${facts.join('\n')}

TARGET PLATFORM: ${platform.toUpperCase()}
PLATFORM STYLE: ${platformStyle}

Generate exactly 3 distinct variations.
Target lengths:
- Headline: 8-12 words
- Primary Ad Copy: 60-80 words
- Short Description: 20-30 words
- Call to Action: 4-8 words

Respond ONLY with a valid JSON object matching this exact schema:
{
  "variations": [
    {
      "headline": "...",
      "primary_copy": "...",
      "short_description": "...",
      "cta": "..."
    },
    {
      "headline": "...",
      "primary_copy": "...",
      "short_description": "...",
      "cta": "..."
    },
    {
      "headline": "...",
      "primary_copy": "...",
      "short_description": "...",
      "cta": "..."
    }
  ]
}`;

    // Cloudflare Workers AI runtime check
    // @ts-ignore
    const aiBinding = (globalThis as any).process?.env?.AI || (globalThis as any).AI;

    if (aiBinding && typeof aiBinding.run === 'function') {
      try {
        const aiResponse = await aiBinding.run('@cf/meta/llama-3.1-8b-instruct', {
          messages: [
            {
              role: 'system',
              content: 'You are an expert real estate copywriter. Output valid JSON only.'
            },
            {
              role: 'user',
              content: promptText
            }
          ]
        });

        const rawContent = aiResponse?.response || aiResponse?.result?.response || '';
        const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          if (Array.isArray(parsed.variations) && parsed.variations.length >= 3) {
            return NextResponse.json({
              success: true,
              variations: parsed.variations.slice(0, 3),
              property: prop
            });
          }
        }
      } catch (aiErr) {
        console.warn('Workers AI execution warning, using local generator fallback:', aiErr);
      }
    }

    // Local Development / Fallback Mock Generator (Strictly Grounded in Property Data)
    const priceStr = prop.price ? `₹${(prop.price / 10000000).toFixed(2)} Cr` : '';
    const areaStr = prop.carpet_area ? `${prop.carpet_area} sq.ft.` : '';
    const title = prop.title || 'Luxury Residence';
    const loc = prop.location || 'Pune';
    const config = prop.configuration || 'Luxury Unit';
    const pType = prop.property_type || 'Property';

    let mockVariations: AdCopyVariation[] = [];

    if (normalizedPlatform === 'facebook') {
      mockVariations = [
        {
          headline: `Discover Elevated Living at ${title} in ${loc}`,
          primary_copy: `Step into timeless elegance with this spacious ${config} ${pType} situated in the prime enclave of ${loc}. Spanning ${areaStr} of meticulously planned layout, this home offers refined living tailored for modern families. Available at ${priceStr}, it presents an unmatched opportunity in one of the region's most coveted addresses.`,
          short_description: `Exclusive ${config} ${pType} in ${loc} spanning ${areaStr}. Available now for ${priceStr}. Premium living in a prime neighborhood.`,
          cta: `Schedule Your Private Site Tour`
        },
        {
          headline: `Unmatched Luxury: Premium ${config} ${pType} in ${loc}`,
          primary_copy: `Looking for your dream home in ${loc}? ${title} offers an exquisite ${config} ${pType} featuring ${areaStr} of carpet area. Perfectly positioned with a price of ${priceStr}, this ${prop.listing_type || 'Direct'} listing combines prestige, spaciousness, and modern design. Contact our team today to explore this exceptional residence.`,
          short_description: `Spacious ${config} residence at ${title}, ${loc}. ${areaStr} carpet area priced at ${priceStr}. Connect with us today.`,
          cta: `Enquire Now for Exclusive Details`
        },
        {
          headline: `Your Landmark Address: ${title}, ${loc}`,
          primary_copy: `Experience modern sophistication with this premium ${config} ${pType} located in ${loc}. Offering ${areaStr} of thoughtfully designed living space, this property is available at ${priceStr}. Designed for discerning buyers who appreciate quality and prime location. Book a personal viewing today.`,
          short_description: `High-value ${config} property in ${loc}. ${areaStr} floor space offered at ${priceStr}. Ideal luxury home investment.`,
          cta: `Book an Exclusive Site Visit`
        }
      ];
    } else if (normalizedPlatform === 'instagram') {
      mockVariations = [
        {
          headline: `Modern Elegance: ${config} ${pType} in ${loc}`,
          primary_copy: `Redefining luxury living in ${loc}. Featuring ${areaStr} of prime carpet area, ${title} offers the ultimate ${config} residence. Priced at ${priceStr}. DM us or click the link to book your private walkthrough today!`,
          short_description: `Premium ${config} at ${title}, ${loc}. ${areaStr} layout priced at ${priceStr}. Explore today.`,
          cta: `Send Message for Site Visit`
        },
        {
          headline: `Sophisticated ${loc} Sanctuary at ${title}`,
          primary_copy: `Elevate your lifestyle with this stunning ${config} ${pType} in ${loc}. Offering ${areaStr} of high-end living for ${priceStr}. Ideal for those seeking space and prestige. Swipe up or link in bio for full details!`,
          short_description: `Luxury ${config} ${pType} in ${loc} (${areaStr}, ${priceStr}). DM for details.`,
          cta: `Click Link to Explore`
        },
        {
          headline: `Prime ${loc} Address: ${config} ${pType}`,
          primary_copy: `Welcome to ${title}! A beautifully designed ${config} ${pType} in ${loc} with ${areaStr} carpet area. Offered at ${priceStr}. Experience modern architectural perfection. Reach out today!`,
          short_description: `Sophisticated ${config} in ${loc}. ${areaStr} offered at ${priceStr}. DM for inquiry.`,
          cta: `Book Your Private Visit`
        }
      ];
    } else if (normalizedPlatform === 'whatsapp') {
      mockVariations = [
        {
          headline: `Exclusive Property Share: ${title}, ${loc}`,
          primary_copy: `Hello! Here is a featured property listing in ${loc}:\n\n📍 Property: ${title}\n🏡 Type: ${config} ${pType}\n📐 Area: ${areaStr}\n💰 Price: ${priceStr}\n\nLet me know if you would like to schedule a site visit or receive the floor plans!`,
          short_description: `${config} ${pType} in ${loc} (${areaStr}, ${priceStr}). Contact for visit details.`,
          cta: `Reply to Book Site Visit`
        },
        {
          headline: `Hot Inventory Update: ${config} in ${loc}`,
          primary_copy: `Hi there! Sharing details for a prime ${config} ${pType} at ${title}, ${loc}. Carpet area is ${areaStr} with a listing price of ${priceStr}. Perfect for buyers seeking a high-value address in ${loc}. Reply to arrange a tour.`,
          short_description: `Prime ${config} at ${title}, ${loc}. Offered at ${priceStr}. Reply for floor plans.`,
          cta: `Request Full Cost Sheet`
        },
        {
          headline: `Verified Listing: ${title} (${loc})`,
          primary_copy: `Good day! We have an active listing for a spacious ${config} ${pType} in ${loc}. Spanning ${areaStr} and offered at ${priceStr}. Would you like to inspect this property this week?`,
          short_description: `Spacious ${config} in ${loc} (${areaStr}, ${priceStr}). Available for viewing.`,
          cta: `Call Us to Schedule Tour`
        }
      ];
    } else if (normalizedPlatform === 'portal') {
      mockVariations = [
        {
          headline: `${config} ${pType} for Sale in ${loc} - ${title}`,
          primary_copy: `A premium ${config} ${pType} is available for sale at ${title}, located in ${loc}. The unit features a carpet area of ${areaStr} (${prop.built_up_area ? prop.built_up_area + ' sq.ft. built-up' : ''}). Priced competitively at ${priceStr}. This property offers structured floor layouts and high-quality residential construction.`,
          short_description: `${config} ${pType} in ${loc}. Carpet area ${areaStr}. Listed at ${priceStr}. Genuine listing.`,
          cta: `Contact Owner/Broker`
        },
        {
          headline: `Spacious ${areaStr} ${config} Apartment at ${title}, ${loc}`,
          primary_copy: `Presenting ${title}, a high-spec ${config} ${pType} situated in the well-connected locality of ${loc}. Carpet area measures ${areaStr}. Offered at an attractive price of ${priceStr}. Suitable for family occupation or long-term portfolio growth. Verified ${prop.listing_type || 'Direct'} listing.`,
          short_description: `Verified ${config} ${pType} in ${loc}. Area: ${areaStr}, Price: ${priceStr}.`,
          cta: `View Verified Details`
        },
        {
          headline: `Prime ${loc} ${config} Residence - ${title}`,
          primary_copy: `Available for purchase: ${config} ${pType} in ${title}, ${loc}. Total carpet space of ${areaStr} offered at ${priceStr}. Features clean title and transparent valuation. Contact for site visit appointment and official brochure.`,
          short_description: `${config} ${pType} at ${title}, ${loc} (${areaStr}, ${priceStr}). Clean title.`,
          cta: `Get In Touch Now`
        }
      ];
    } else {
      mockVariations = [
        {
          headline: `Exceptional ${config} Residence at ${title}, ${loc}`,
          primary_copy: `Discover refined architectural design with this ${config} ${pType} at ${title}, ${loc}. Offering ${areaStr} of carpet area and priced at ${priceStr}, this residence combines luxury with practical space management in a premier neighborhood.`,
          short_description: `Luxury ${config} ${pType} in ${loc}. ${areaStr} offered at ${priceStr}. Available immediately.`,
          cta: `Schedule a Private Viewing`
        },
        {
          headline: `Luxury Living in ${loc}: ${title}`,
          primary_copy: `Upgrade your address to ${title} in ${loc}. Featuring a grand ${config} layout spanning ${areaStr}, this property represents exceptional value at ${priceStr}. Ideal for discerning homeowners seeking quality craftsmanship.`,
          short_description: `${config} ${pType} in ${loc} (${areaStr}, ${priceStr}). Premium quality.`,
          cta: `Inquire for Tour Schedule`
        },
        {
          headline: `Prestige & Comfort: ${title}, ${loc}`,
          primary_copy: `Introducing a pristine ${config} ${pType} in ${loc}. Offering ${areaStr} of interior space at ${priceStr}, ${title} delivers a high standard of residential comfort in a sought-after area.`,
          short_description: `${config} property at ${title}, ${loc}. Area: ${areaStr}, Price: ${priceStr}.`,
          cta: `Contact Our Sales Desk`
        }
      ];
    }

    return NextResponse.json({
      success: true,
      variations: mockVariations,
      property: prop
    });
  } catch (error: any) {
    console.error('Error in /api/ad-copy:', error);
    return NextResponse.json(
      { error: 'Unable to generate ad copy. Please try again.' },
      { status: 500 }
    );
  }
}
