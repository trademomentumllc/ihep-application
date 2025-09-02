import { useState } from "react";
import { Helmet } from "react-helmet";
import { APP_NAME } from "@/lib/constants";
import { 
  RESOURCE_CATEGORIES, 
  DISTANCE_OPTIONS, 
  AVAILABILITY_OPTIONS 
} from "@/lib/constants";
import { useQuery } from "@tanstack/react-query";
import { Resource } from "@shared/schema";
import { ResourceFilters as ResourceFiltersType } from "@/lib/types";
import ResourceFilters from "@/components/resources/ResourceFilters";
import ResourceCard from "@/components/resources/ResourceCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

const Resources = () => {
  // Initial filters state
  const [filters, setFilters] = useState<ResourceFiltersType>({
    categories: RESOURCE_CATEGORIES.map(cat => cat.id),
    distance: "10",
    availability: ["taking_new_patients"],
    search: "",
    page: 1
  });

  // State for search input field
  const [searchInput, setSearchInput] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Fetch resources based on filters
  const { data: resources, isLoading, isFetching } = useQuery<Resource[]>({
    queryKey: ['/api/resources', filters],
  });

  // Handle search submission
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);
    setFilters({ ...filters, search: searchInput, page: 1 });
    // Reset searching state after a moment
    setTimeout(() => setIsSearching(false), 1000);
  };

  // Handle filter changes
  const handleFilterChange = (newFilters: ResourceFiltersType) => {
    setFilters({ ...newFilters, page: 1 });
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  return (
    <>
      <Helmet>
        <title>Resource Directory | {APP_NAME}</title>
        <meta name="description" content="Find HIV healthcare providers, support groups, and local resources to support your health journey." />
      </Helmet>
      
      <section className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 mt-2 sm:mt-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 sm:mb-6">
          <div>
            <h2 className="text-xl sm:text-2xl font-montserrat font-bold text-primary">Resource Directory</h2>
            <p className="text-sm sm:text-base text-gray-600 mt-1">Find services, providers, and support in your area</p>
          </div>
          <div className="mt-3 md:mt-0 w-full md:w-auto">
            <form onSubmit={handleSearch} className="relative w-full md:w-64">
              <Input
                type="text"
                placeholder="Search resources..."
                className="w-full pl-8 sm:pl-10 pr-4 py-2 text-sm sm:text-base"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                disabled={isSearching || isFetching}
              />
              {(isSearching || isFetching) ? (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <div className="h-3 w-3 sm:h-4 sm:w-4 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : (
                <Search className="absolute left-2 sm:left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-3 w-3 sm:h-4 sm:w-4" />
              )}
              <Button type="submit" className="sr-only">Search</Button>
            </form>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 sm:gap-6">
          {/* Filters Sidebar */}
          <ResourceFilters
            filters={filters}
            onFilterChange={handleFilterChange}
            onApply={() => {}}
          />

          {/* Resources List */}
          <div className="flex-1">
            {isLoading ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {Array(4).fill(0).map((_, i) => (
                  <Skeleton key={i} className="h-28 w-full rounded-lg" />
                ))}
              </div>
            ) : resources && resources.length > 0 ? (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {resources.map((resource) => (
                    <ResourceCard key={resource.id} resource={resource} />
                  ))}
                </div>

                <div className="mt-6 flex justify-center">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious 
                          href="#" 
                          onClick={(e) => {
                            e.preventDefault();
                            if (filters.page && filters.page > 1) handlePageChange(filters.page - 1);
                          }}
                          className={(filters.page === undefined || filters.page <= 1) ? "pointer-events-none opacity-50" : ""}
                        />
                      </PaginationItem>
                      
                      {[...Array(3)].map((_, i) => {
                        const page = i + 1;
                        return (
                          <PaginationItem key={page}>
                            <PaginationLink 
                              href="#" 
                              onClick={(e) => {
                                e.preventDefault();
                                handlePageChange(page);
                              }}
                              isActive={page === (filters.page || 1)}
                            >
                              {page}
                            </PaginationLink>
                          </PaginationItem>
                        );
                      })}
                      
                      <PaginationItem>
                        <PaginationNext 
                          href="#" 
                          onClick={(e) => {
                            e.preventDefault();
                            handlePageChange((filters.page || 1) + 1);
                          }}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              </>
            ) : (
              <div className="text-center py-10 bg-gray-50 rounded-lg">
                <Search className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                <h3 className="text-lg font-medium text-gray-800 mb-1">No resources found</h3>
                <p className="text-gray-500">Try adjusting your filters or search terms</p>
              </div>
            )}
          </div>
        </div>
      </section>
    </>
  );
};

export default Resources;
