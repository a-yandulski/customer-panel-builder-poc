import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function ServiceCardSkeleton() {
  return (
    <Card className="shadow-md">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
        <div className="h-5 w-5 bg-gray-200 rounded animate-pulse"></div>
      </CardHeader>
      <CardContent>
        <div className="h-8 bg-gray-200 rounded w-12 mb-2 animate-pulse"></div>
        <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
      </CardContent>
    </Card>
  );
}

export function RenewalTableSkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(3)].map((_, index) => (
        <div key={index} className="p-4 bg-gray-50 rounded-lg border space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2 sm:space-y-0">
            <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
            <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-1 sm:space-y-0">
            <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-28 animate-pulse"></div>
          </div>
          <div className="flex flex-col space-y-3 sm:space-y-0 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center space-x-3">
              <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
              <div className="h-6 w-11 bg-gray-200 rounded-full animate-pulse"></div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
              <div className="h-9 bg-gray-200 rounded w-24 animate-pulse"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ActivitySkeleton() {
  return (
    <div className="space-y-4">
      {[...Array(4)].map((_, index) => (
        <div
          key={index}
          className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg border"
        >
          <div className="p-2 bg-gray-200 rounded-full w-10 h-10 animate-pulse"></div>
          <div className="flex-1 min-w-0 space-y-2">
            <div className="h-5 bg-gray-200 rounded w-3/4 animate-pulse"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse"></div>
          </div>
          <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
        </div>
      ))}
    </div>
  );
}

export function QuickActionsSkeleton() {
  return (
    <div className="space-y-3">
      {[...Array(4)].map((_, index) => (
        <div
          key={index}
          className="h-11 bg-gray-200 rounded animate-pulse"
        ></div>
      ))}
    </div>
  );
}

export function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Welcome Section Skeleton */}
      <div className="bg-gray-100 rounded-lg p-6 border border-gray-200">
        <div className="h-8 bg-gray-200 rounded w-64 mb-2 animate-pulse"></div>
        <div className="h-5 bg-gray-200 rounded w-96 animate-pulse"></div>
      </div>

      {/* Service Cards Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        {[...Array(4)].map((_, index) => (
          <ServiceCardSkeleton key={index} />
        ))}
      </div>

      {/* Main Content Grid Skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-10 gap-4 lg:gap-6">
        {/* Main Content - 70% */}
        <div className="lg:col-span-7 space-y-4 lg:space-y-6">
          {/* Renewals Section */}
          <Card className="shadow-md">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-48 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-72 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <RenewalTableSkeleton />
            </CardContent>
          </Card>

          {/* Activity Section */}
          <Card className="shadow-md">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-36 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-64 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <ActivitySkeleton />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar - 30% */}
        <div className="lg:col-span-3 space-y-4 lg:space-y-6">
          {/* Quick Actions */}
          <Card className="shadow-md">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-32 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-48 animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <QuickActionsSkeleton />
            </CardContent>
          </Card>

          {/* Status Widget */}
          <Card className="shadow-md">
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded w-28 mb-2 animate-pulse"></div>
              <div className="h-4 bg-gray-200 rounded w-40 animate-pulse"></div>
            </CardHeader>
            <CardContent className="space-y-3">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
                  <div className="h-6 bg-gray-200 rounded w-20 animate-pulse"></div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
