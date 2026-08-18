export default function DashboardPage() {
  return (
    <div>
      <div className="mb-8">
        <p className="text-sm font-medium text-cyan-400">
          OVERVIEW
        </p>

        <h1 className="mt-1 text-3xl font-bold text-white">
          Dashboard
        </h1>

        <p className="mt-2 text-sm text-slate-400">
          Manage Noida Drive marketplace activity.
        </p>
      </div>

      {/* Stats */}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Users"
          value="—"
          description="Registered users"
        />

        <StatCard
          title="Active Listings"
          value="—"
          description="Approved cars"
        />

        <StatCard
          title="Rental Requests"
          value="—"
          description="All requests"
        />

        <StatCard
          title="Pending Reviews"
          value="—"
          description="Require attention"
        />
      </div>

      {/* Sections */}

      <div className="mt-8 grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="font-semibold">
            Pending Actions
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Pending rental requests, quotes and
            sell submissions will appear here.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h2 className="font-semibold">
            Recent Activity
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Recent marketplace activity will
            appear here.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  description,
}: {
  title: string;
  value: string;
  description: string;
}) {
  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900 p-5">
      <p className="text-sm text-slate-400">
        {title}
      </p>

      <p className="mt-3 text-3xl font-bold text-white">
        {value}
      </p>

      <p className="mt-1 text-xs text-slate-500">
        {description}
      </p>
    </div>
  );
}