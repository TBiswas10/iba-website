import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/role";

export const dynamic = "force-dynamic";

export default async function AdminResourcesPage() {
  const denied = await requireAdmin();
  if (denied) return denied;

  const resources = await prisma.resource.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <section className="panel-stack">
      <section className="glass-panel">
        <h1>Manage Resources</h1>
        <p>Add or remove community resources displayed on the Resources page.</p>
      </section>

      <section className="glass-panel">
        <h2>Add New Resource</h2>
        <form action="/api/resources" method="POST" className="grid-form">
          <label>
            Title
            <input required name="title" placeholder="Resource name" />
          </label>
          <label>
            URL
            <input required name="url" type="url" placeholder="https://..." />
          </label>
          <label>
            Category
            <select required name="category">
              <option value="Community">Community</option>
              <option value="Government">Government</option>
              <option value="Seniors">Seniors</option>
              <option value="Student">Student</option>
              <option value="Temple">Temple</option>
              <option value="Transport">Transport</option>
            </select>
          </label>
          <label className="span-2">
            Description
            <textarea name="description" placeholder="Brief description" />
          </label>
          <div className="span-2">
            <button className="btn-primary" type="submit">
              Add Resource
            </button>
          </div>
        </form>
      </section>

      <section className="glass-panel">
        <h2>Existing Resources</h2>
        {resources.length === 0 ? (
          <p>No resources yet. Add one above.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Category</th>
                <th>URL</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {resources.map((resource) => (
                <tr key={resource.id}>
                  <td>{resource.title}</td>
                  <td>{resource.category}</td>
                  <td>
                    <a href={resource.url} target="_blank" rel="noreferrer">
                      {resource.url.substring(0, 40)}...
                    </a>
                  </td>
                  <td>
                    <form action={`/api/resources/${resource.id}`} method="POST">
                      <input type="hidden" name="_method" value="DELETE" />
                      <button className="btn-danger btn-sm" type="submit">
                        Delete
                      </button>
                    </form>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </section>
  );
}