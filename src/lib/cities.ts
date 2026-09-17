import type { City } from "./types";

/**
 * Ten hardcoded cities, deliberately spread across cost, safety, climate and
 * size so that changing factors/weights actually reshuffles the ranking.
 * `profile` is the neutral `state` text Jev evaluates every factor against —
 * it intentionally avoids numbers or verdicts, only situational detail.
 */
export const CITIES: City[] = [
  {
    id: "yerevan",
    name: "Yerevan",
    country: "Armenia",
    flag: "🇦🇲",
    population: "1.1M",
    profile:
      "Yerevan is Armenia's capital, a sunny city ringed by mountains with Mount Ararat visible on clear days. Rent and restaurant prices are low by international standards, and a growing tech and remote-work scene has filled the center with specialty coffee shops and coworking spaces. Summers are hot and dry, winters cold with some snow. The city is generally calm and walkable, with a lively square-and-fountain culture in the evenings, an old but functional metro, and a strong home-cooked and market food tradition alongside a young restaurant scene. English is spoken by younger people and in tourist areas but not universally; Russian is widely understood. Nightlife exists but is modest compared to bigger regional capitals. Public transit is cheap but a bit worn.",
  },
  {
    id: "tbilisi",
    name: "Tbilisi",
    country: "Georgia",
    flag: "🇬🇪",
    population: "1.2M",
    profile:
      "Tbilisi is a hilly Caucasus capital known for sulfur bathhouses, a dramatic old town, and one of the region's most active nightlife and natural-wine scenes. Cost of living is low, visas are easy, and a large expat and digital-nomad community has grown around cheap, fast internet and a relaxed bureaucratic environment. Streets are steep and cobbled in places, so walkability is mixed — charming in the center, patchy elsewhere. Summers are hot, winters mild-to-chilly with little snow. The food scene mixes hearty Georgian classics with an increasingly ambitious restaurant culture. Petty crime is rare and people generally feel safe walking at night. English is common in the center among younger people; a metro and marshrutka minibus network covers most of the city.",
  },
  {
    id: "lisbon",
    name: "Lisbon",
    country: "Portugal",
    flag: "🇵🇹",
    population: "2.9M (metro)",
    profile:
      "Lisbon is a coastal, hilly European capital famous for pastel tilework, tram lines, and Atlantic light. It has become one of Europe's most popular remote-work and relocation destinations, which has pushed rents up sharply in the past decade even though it remains cheaper than Paris or London. Mild, sunny winters and warm dry summers make it pleasant most of the year. Safety is generally very good, though tourist pickpocketing occurs in busy areas. Steep streets and cobblestones make some neighborhoods tough on foot or with luggage, but a mix of trams, funiculars, metro and buses covers the city well. English is widely spoken among younger residents and in the service industry. The food and coffee-shop scene is excellent and nightlife in Bairro Alto and along the river is lively.",
  },
  {
    id: "tokyo",
    name: "Tokyo",
    country: "Japan",
    flag: "🇯🇵",
    population: "14M (37M metro)",
    profile:
      "Tokyo is a vast, meticulously organized megacity where trains run on time to the minute and street crime is extremely rare, even late at night. It is expensive by many measures, though everyday costs like transit and casual dining are more reasonable than the reputation suggests; housing in central wards is costly. The public transit network is famously extensive, clean and easy to use once you learn it, covering nearly every corner of the metro area. Summers are hot and humid, winters mild with occasional cold snaps. The food scene ranges from Michelin-starred restaurants to extraordinary convenience-store meals and everything between. English signage exists in stations and tourist areas but everyday English fluency is limited outside those. Nightlife districts like Shibuya and Shinjuku run late; parks and gardens offer quiet green space within the city.",
  },
  {
    id: "mexico-city",
    name: "Mexico City",
    country: "Mexico",
    flag: "🇲🇽",
    population: "9.2M (22M metro)",
    profile:
      "Mexico City is a huge, culturally rich capital at high altitude, known for world-class museums, a famous food scene spanning street tacos to fine dining, and leafy neighborhoods like Roma and Condesa that have become magnets for remote workers. Cost of living is low to moderate and has risen in trendy areas due to an influx of foreign remote workers, though it remains cheap compared to US or Western European cities. Weather is mild and spring-like year-round given the altitude, with a distinct rainy season. Safety varies significantly by neighborhood; central and western districts favored by visitors are generally fine, but the city overall has a reputation for crime that requires some street sense. Traffic is heavy, though the metro is extensive and inexpensive. Nightlife and live music are excellent, and English is common in expat-heavy neighborhoods but not the norm citywide.",
  },
  {
    id: "reykjavik",
    name: "Reykjavik",
    country: "Iceland",
    flag: "🇮🇸",
    population: "140K (metro)",
    profile:
      "Reykjavik is a small, orderly capital on the edge of the North Atlantic, surrounded by dramatic volcanic and coastal scenery within easy driving distance. It is one of the most expensive cities in the world for groceries, dining out and housing. Crime is extremely low and it is regularly ranked among the safest capitals on earth. Winters are dark and windy with modest snow, kept from extreme cold by the Gulf Stream; summers bring nearly endless daylight and mild temperatures. The city itself is compact and walkable, with a small but earnest café, design and live-music scene concentrated downtown. Public transit is limited to buses and many residents rely on cars. English is spoken fluently by virtually everyone. Nature access is exceptional — geothermal pools, waterfalls and glaciers are all close by.",
  },
  {
    id: "nairobi",
    name: "Nairobi",
    country: "Kenya",
    flag: "🇰🇪",
    population: "4.4M",
    profile:
      "Nairobi is East Africa's largest city and a regional hub for tech, finance and NGOs, with a fast-growing startup scene and modern coworking spaces alongside older, denser neighborhoods. Cost of living is low to moderate for most goods and housing, though gated compounds favored by expats and professionals cost more. Weather is mild year-round thanks to elevation, rarely hot or cold. Safety is a real concern in some areas, particularly around opportunistic theft, and many residents and companies invest in private security; other neighborhoods feel comfortable and lively at most hours. Traffic congestion is heavy and public transit relies mainly on shared minibuses (matatus) rather than a formal metro. The restaurant and nightlife scene is vibrant and diverse, drawing on a large international community. English is an official language and spoken fluently throughout the city. Nairobi National Park, with wildlife visible against the skyline, sits right at the city's edge.",
  },
  {
    id: "melbourne",
    name: "Melbourne",
    country: "Australia",
    flag: "🇦🇺",
    population: "5.2M (metro)",
    profile:
      "Melbourne is a large, laneway-filled Australian city known for its coffee culture, live music, and consistent ranking among the world's most liveable cities. Cost of living is high, especially housing, comparable to other major Anglophone cities. Safety is generally excellent with low violent crime. Weather is famously changeable — 'four seasons in one day' — with mild summers, cool wet winters, and no extreme heat or cold typical of a temperate maritime climate. The city is well served by trams, trains and buses, and the center is very walkable. English is the native language. The food scene is diverse and highly regarded, nightlife is strong especially around the CBD and inner suburbs, and parks, the Yarra river and nearby coastline give good access to nature and outdoor recreation.",
  },
  {
    id: "prague",
    name: "Prague",
    country: "Czechia",
    flag: "🇨🇿",
    population: "1.3M",
    profile:
      "Prague is a compact, architecturally stunning Central European capital with a medieval old town, a famous beer and pub culture, and a lower cost of living than Western Europe though prices have risen with tourism. Crime is low and the city feels safe to walk at almost any hour, including for solo travelers. Winters are cold and grey with occasional snow, summers are warm and pleasant. The public transit system — trams, metro and buses — is efficient, cheap and covers the entire city. It is highly walkable in the center, with cobblestones in older districts. English is spoken by many younger residents and throughout the tourist-facing economy, less so among older generations. The food and craft-beer scene has expanded well beyond traditional heavy fare, and nightlife is well established, from jazz clubs to large techno venues.",
  },
  {
    id: "buenos-aires",
    name: "Buenos Aires",
    country: "Argentina",
    flag: "🇦🇷",
    population: "3.1M (16M metro)",
    profile:
      "Buenos Aires is a grand, European-feeling South American capital known for tango, steak, late-night culture and wide boulevards. Persistent high inflation makes cost of living hard to pin down in local currency, but for holders of stronger foreign currencies it is currently very cheap for rent, dining and services. Weather is temperate with warm humid summers and mild winters, rarely extreme. Safety varies by neighborhood: areas like Palermo and Recoleta are comfortable, while opportunistic street theft is a real risk in busier or less affluent parts, especially at night. The subte (subway), buses and extensive taxi availability make getting around manageable, though the transit network shows its age. English fluency is moderate, more common among younger and professional residents. The food, wine and nightlife scene is exceptional, with dinners starting late and clubs running until sunrise, and large green spaces like the Bosques de Palermo offer accessible nature within the city.",
  },
];

export const CITY_BY_ID: Record<string, City> = Object.fromEntries(
  CITIES.map((c) => [c.id, c]),
);
