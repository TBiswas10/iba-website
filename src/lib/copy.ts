export type Lang = "en" | "bn";

type Stat = {
  value: string;
  label: string;
};

type Audience = {
  title: string;
  body: string;
};

type Feature = {
  title: string;
  body: string;
};

type HomeCopy = {
  hero: {
    eyebrow: string;
    title: string;
    subtitle: string;
    primaryCta: string;
    secondaryCta: string;
    eventCta: string;
  };
  stats: Stat[];
  mission: {
    eyebrow: string;
    title: string;
    body: string;
  };
  howWeDoIt: {
    eyebrow: string;
    title: string;
    body: string;
    features: Feature[];
  };
  audience: {
    eyebrow: string;
    title: string;
    items: Audience[];
  };
  events: {
    eyebrow: string;
    title: string;
    body: string;
    highlight: {
      label: string;
      title: string;
      body: string;
      cta: string;
    };
    photoPlaceholder: string[];
  };
  volunteer: {
    title: string;
    body: string;
    cta: string;
  };
};

type CopyShape = {
  brand: string;
  rsvp: string;
  nav: {
    home: string;
    events: string;
    gallery: string;
    resources: string;
    membership: string;
    donations: string;
    contact: string;
    about: string;
    dashboard: string;
    admin: string;
  };
  home: HomeCopy;
};

const copy: Record<Lang, CopyShape> = {
  en: {
    brand: "Illawarra Bengali Association",
    rsvp: "RSVP",
    nav: {
      home: "Home",
      events: "Events",
      gallery: "Gallery",
      resources: "Resources",
      membership: "Membership",
      donations: "Donations",
      contact: "Contact",
      about: "About",
      dashboard: "Dashboard",
      admin: "Admin",
    },
    home: {
      hero: {
        eyebrow: "Hindu community in Wollongong",
        title: "A home for Hindu culture, service, and celebration in Wollongong.",
        subtitle:
          "We bring Hindu families, students, young professionals, Bengali and Indian families, members, and volunteers into one place. Real events. Real people. Real continuity.",
        primaryCta: "Explore Events",
        secondaryCta: "Meet the Association",
        eventCta: "View Events",
      },
      stats: [
        { value: "5", label: "years active" },
        { value: "100+", label: "average attendance" },
        { value: "6", label: "events each year" },
        { value: "60+", label: "families reached" },
        { value: "Volunteer-led", label: "community operations" },
      ],
      mission: {
        eyebrow: "Our mission",
        title: "Keep Hindu community life visible, welcoming, and useful in Wollongong.",
        body:
          "We create a place where people can participate, help, volunteer, and build something that lasts. The association exists to make cultural life easier to join and stronger to sustain.",
      },
      howWeDoIt: {
        eyebrow: "How we do it",
        title: "Community-led work that gets the hall booked, the food cooked, and the puja running.",
        body:
          "This is a volunteer-built operation. Small teams handle the practical work so bigger groups can show up and belong.",
        features: [
          { title: "Decorate", body: "Set up events with visual warmth and festival atmosphere." },
          { title: "Cook", body: "Coordinate food with the people who know the community best." },
          { title: "Book", body: "Secure venues and timings without chaos or last-minute panic." },
          { title: "Run puja", body: "Keep the ritual side organized, respectful, and reliable." },
        ],
      },
      audience: {
        eyebrow: "Who this is for",
        title: "Built for the whole community, not just one age group.",
        items: [
          {
            title: "Hindu families in Wollongong",
            body: "A clear place to gather, bring children, and stay connected throughout the year.",
          },
          {
            title: "Students, singles, and young professionals",
            body: "A way in that feels open, modern, and easy to join.",
          },
          {
            title: "Bengali and Indian families",
            body: "Cultural continuity with a broader invitation to participate and help.",
          },
          {
            title: "Existing members and volunteers",
            body: "A stronger public face for the work already happening behind the scenes.",
          },
        ],
      },
      events: {
        eyebrow: "Events",
        title: "Year-round celebrations, one community.",
        body:
          "From Janmastami to cultural nights and family gatherings — see what's coming up and join the celebration.",
        highlight: {
          label: "Coming up",
          title: "Janmastami 2026",
          body:
            "Our biggest celebration of the year. Everyone welcome — bring family, bring friends.",
          cta: "RSVP Now",
        },
        photoPlaceholder: ["Event photo 01", "Event photo 02", "Event photo 03"],
      },
      volunteer: {
        title: "Get involved",
        body:
          "Whether you can decorate, cook, book halls, or run puja — there's a place for you here.",
        cta: "Volunteer with us",
      },
    },
  },
  bn: {
    brand: "ইলাওয়ারা বেঙ্গলি অ্যাসোসিয়েশন",
    rsvp: "আরএসভিপি",
    nav: {
      home: "হোম",
      events: "ইভেন্টস",
      gallery: "গ্যালারি",
      resources: "রিসোর্স",
      membership: "সদস্যপদ",
      donations: "ডোনেশন",
      contact: "যোগাযোগ",
      about: "আমাদের সম্পর্কে",
      dashboard: "ড্যাশবোর্ড",
      admin: "অ্যাডমিন",
    },
    home: {
      hero: {
        eyebrow: "ওলংগং-এর হিন্দু কমিউনিটি",
        title: "ওলংগং-এ হিন্দু সংস্কৃতি, সেবা ও উদযাপনের ঘর।",
        subtitle:
          "আমরা হিন্দু পরিবার, শিক্ষার্থী, তরুণ পেশাজীবী, বাঙালি ও ভারতীয় পরিবার, সদস্য এবং স্বেচ্ছাসেবকদের এক জায়গায় আনি। সত্যিকারের ইভেন্ট। সত্যিকারের মানুষ। সত্যিকারের ধারাবাহিকতা।",
        primaryCta: "ইভেন্ট দেখুন",
        secondaryCta: "অ্যাসোসিয়েশন জানুন",
        eventCta: "ইভেন্ট দেখুন",
      },
      stats: [
        { value: "৫", label: "বছর সক্রিয়" },
        { value: "১০০+", label: "গড় উপস্থিতি" },
        { value: "৬", label: "বার্ষিক ইভেন্ট" },
        { value: "৬০+", label: "পরিবারের সাথে সংযোগ" },
        { value: "স্বেচ্ছাসেবক-চালিত", label: "কমিউনিটি অপারেশন" },
      ],
      mission: {
        eyebrow: "আমাদের মিশন",
        title: "ওলংগং-এ হিন্দু কমিউনিটি জীবনকে দৃশ্যমান, স্বাগতপূর্ণ, এবং কাজে লাগার মতো রাখা।",
        body:
          "আমরা এমন একটি জায়গা তৈরি করি যেখানে মানুষ অংশ নিতে পারে, সাহায্য করতে পারে, স্বেচ্ছাসেবক হতে পারে, এবং দীর্ঘমেয়াদে কিছু গড়ে তুলতে পারে।",
      },
      howWeDoIt: {
        eyebrow: "আমরা কীভাবে করি",
        title: "কমিউনিটি-চালিত কাজ, যাতে হল বুক হয়, খাবার তৈরি হয়, আর পুজো ঠিকঠাক চলে।",
        body:
          "এটি স্বেচ্ছাসেবকদের তৈরি একটি অপারেশন। ছোট টিমগুলো ব্যবহারিক কাজ সামলায়, যাতে বড় দলটি সহজে এসে যুক্ত হতে পারে।",
        features: [
          { title: "ডেকোরেট", body: "ইভেন্টে উষ্ণতা আর উৎসবের অনুভূতি তৈরি করা।" },
          { title: "রান্না", body: "কমিউনিটির মানুষজনকে সঙ্গে নিয়ে খাবারের আয়োজন।" },
          { title: "বুক", body: "শেষ মুহূর্তের দৌড়ঝাঁপ ছাড়া ভেন্যু ও সময় নির্ধারণ।" },
          { title: "পুজো চালানো", body: "ধর্মীয় অংশটি সংগঠিত, সম্মানজনক, এবং নির্ভরযোগ্য রাখা।" },
        ],
      },
      audience: {
        eyebrow: "কার জন্য",
        title: "এটি পুরো কমিউনিটির জন্য, শুধু এক বয়সের জন্য নয়।",
        items: [
          {
            title: "ওলংগং-এর হিন্দু পরিবার",
            body: "বছরজুড়ে একসাথে থাকার জন্য পরিষ্কার একটি জায়গা।",
          },
          {
            title: "শিক্ষার্থী, সিঙ্গেল, তরুণ পেশাজীবী",
            body: "সহজে যুক্ত হওয়ার জন্য আধুনিক ও খোলা পথ।",
          },
          {
            title: "বাঙালি ও ভারতীয় পরিবার",
            body: "সংস্কৃতির ধারাবাহিকতা, আর অংশ নেওয়ার খোলা আমন্ত্রণ।",
          },
          {
            title: "বিদ্যমান সদস্য ও স্বেচ্ছাসেবক",
            body: "পর্দার আড়ালের কাজকে দেখানোর মতো একটি শক্তিশালী মুখ।",
          },
        ],
      },
      events: {
        eyebrow: "ইভেন্ট",
        title: "সারাবছর উদযাপন, এক কমিউনিটি।",
        body:
          "Janmastami থেকে সাংস্কৃতিক রাত ও পারিবারিক অনুষ্ঠান — দেখুন কী আসছে আর উদযাপনে যোগ দিন।",
        highlight: {
          label: "আসছে",
          title: "Janmastami ২০২৬",
          body:
            "বছরের সবচেয়ে বড় উদযাপন। সবাই স্বাগত — পরিবার নিয়ে, বন্ধু নিয়ে আসুন।",
          cta: "RSVP করুন",
        },
        photoPlaceholder: ["ইভেন্ট ছবি ০১", "ইভেন্ট ছবি ০২", "ইভেন্ট ছবি ০৩"],
      },
      volunteer: {
        title: "যুক্ত হন",
        body:
          "আপনি ডেকোরেট করতে পারেন, রান্না করতে পারেন, হল বুক করতে পারেন, বা পুজো চালাতে পারেন — এখানে আপনার জন্য একটি জায়গা আছে।",
        cta: "স্বেচ্ছাসেবক হোন",
      },
    },
  },
};

export function getCopy(lang: Lang) {
  return copy[lang];
}
