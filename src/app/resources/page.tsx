import { prisma } from "@/lib/prisma";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function ResourcesPage() {
  const resources = await prisma.resource.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  const localResources = [
    {
      title: "Sri Venkateswara Temple",
      description: "Historic Hindu temple in Helensburgh — one of the largest in the Southern Hemisphere. Open weekends for darshan, pooja, and vegetarian canteen.",
      url: "https://www.svtemple.org.au/",
      category: "Temple",
    },
    {
      title: "Multicultural Communities Council of Illawarra",
      description: "Peak body representing CALD communities. Offers aged care, youth programs, refugee support, and community services.",
      url: "https://www.mcci.org.au/",
      category: "Community",
    },
    {
      title: "Nan Tien Temple",
      description: "Largest Buddhist temple in the Southern Hemisphere. Located in Berkeley, Wollongong. Open for visitors and programs.",
      url: "https://www.nantien.org.au/",
      category: "Temple",
    },
    {
      title: "Wollongong City Council",
      description: "Local government services, community grants, and events. Check for multicultural programs and community facilities.",
      url: "https://www.wollongong.nsw.gov.au/",
      category: "Government",
    },
    {
      title: "UOW Accommodation",
      description: "On-campus student housing. Apply for halls like Campus East, Kooloobong Village, and more.",
      url: "https://www.uow.edu.au/study/accommodation/",
      category: "Student",
    },
    {
      title: "UOW Study Stays",
      description: "Find off-campus rentals near UOW. Search rooms, apartments, and shared housing.",
      url: "https://uow.studystays.com/",
      category: "Student",
    },
    {
      title: "UHomes Student Rentals",
      description: "Student accommodation platform for Wollongong. Private rooms and apartments available.",
      url: "https://en.uhomes.com/au/wollongong",
      category: "Student",
    },
    {
      title: "HBM Properties",
      description: "Shared student accommodation in Keiraville. Fully furnished, all-inclusive weekly rent.",
      url: "https://www.hbmproperties.com.au/prospective-tenants",
      category: "Student",
    },
    {
      title: "Wollongong Transport",
      description: "Getting around — train, free Gong Shuttle bus, Opal cards, cycling, and walking paths.",
      url: "https://www.uow.edu.au/study/move/transport/",
      category: "Transport",
    },
    {
      title: "TransLink NSW",
      description: "Plan trips, check timetables, and find bus/train routes around Wollongong and to Sydney.",
      url: "https://www.transportnsw.info/",
      category: "Transport",
    },
  ];

  const allResources = resources.length > 0 ? resources : localResources;

  const categorySet = new Set(allResources.map((r: any) => r.category || "General"));
  let categories = Array.from(categorySet);
  categories = categories.filter((c: string) => c !== "Cultural" && c !== "Seniors");

  return (
    <section className="panel-stack">
      <section className="glass-panel">
        <h1>Resource Hub</h1>
        <p>Useful community services, local links, and support resources for the Illawarra Bengali community.</p>
      </section>

      {categories.map((category) => (
        <section key={category} className="resource-category">
          <h2>{category} Resources</h2>
          <div className="resource-grid">
            {allResources
              .filter((r: any) => (r.category || "General") === category)
              .map((resource: any) => (
                <article key={resource.id || resource.title} className="resource-card">
                  <div className="resource-icon">
                    {resource.category === "Temple" ? "🛕" : 
                     resource.category === "Seniors" ? "👴" : 
                     resource.category === "Community" ? "🤝" : 
                     resource.category === "Government" ? "🏛️" : 
                     resource.category === "Student" ? "🎓" :
                     resource.category === "Transport" ? "🚌" : "📄"}
                  </div>
                  <div className="resource-content">
                    <h3>{resource.title}</h3>
                    <p>{resource.description}</p>
                    <a href={resource.url} target="_blank" rel="noreferrer" className="resource-link">
                      Visit website →
                    </a>
                  </div>
                </article>
              ))}
          </div>
        </section>
      ))}
    </section>
  );
}
