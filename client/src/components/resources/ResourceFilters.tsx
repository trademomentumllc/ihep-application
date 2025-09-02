import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { RESOURCE_CATEGORIES, DISTANCE_OPTIONS, AVAILABILITY_OPTIONS } from "@/lib/constants";
import { ResourceFilters as ResourceFiltersType } from "@/lib/types";
import { Search } from "lucide-react";

interface ResourceFiltersProps {
  filters: ResourceFiltersType;
  onFilterChange: (filters: ResourceFiltersType) => void;
  onApply: () => void;
}

const ResourceFilters = ({ filters, onFilterChange, onApply }: ResourceFiltersProps) => {
  // Local state for filters before applying
  const [localFilters, setLocalFilters] = useState<ResourceFiltersType>(filters);

  const handleCategoryChange = (category: string) => {
    const updatedCategories = localFilters.categories.includes(category)
      ? localFilters.categories.filter(c => c !== category)
      : [...localFilters.categories, category];
    
    setLocalFilters({
      ...localFilters,
      categories: updatedCategories
    });
  };

  const handleAvailabilityChange = (availability: string) => {
    const updatedAvailability = localFilters.availability.includes(availability)
      ? localFilters.availability.filter(a => a !== availability)
      : [...localFilters.availability, availability];
    
    setLocalFilters({
      ...localFilters,
      availability: updatedAvailability
    });
  };

  const handleDistanceChange = (value: string) => {
    setLocalFilters({
      ...localFilters,
      distance: value
    });
  };

  const handleApplyFilters = () => {
    onFilterChange(localFilters);
    onApply();
  };

  // Handle local search
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLocalFilters({
      ...localFilters,
      search: e.target.value
    });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onFilterChange(localFilters);
  };

  return (
    <div className="w-full md:w-64 bg-gray-50 p-4 rounded-lg">
      <h3 className="font-montserrat font-semibold mb-3">Filter Resources</h3>
      
      <div className="mb-4">
        <form onSubmit={handleSearchSubmit} className="relative">
          <Input
            type="text"
            placeholder="Search in filters..."
            className="pl-8 pr-2 py-1 w-full"
            value={localFilters.search || ''}
            onChange={handleSearchChange}
          />
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Button type="submit" className="sr-only">Search</Button>
        </form>
      </div>
      
      <div className="mb-4">
        <h4 className="text-sm font-medium mb-2">Categories</h4>
        <div className="space-y-2">
          {RESOURCE_CATEGORIES.map((category) => (
            <div key={category.id} className="flex items-center">
              <Checkbox
                id={`category-${category.id}`}
                checked={localFilters.categories.includes(category.id)}
                onCheckedChange={() => handleCategoryChange(category.id)}
                className="text-primary rounded focus:ring-primary"
              />
              <Label
                htmlFor={`category-${category.id}`}
                className="ml-2 text-sm font-normal cursor-pointer"
              >
                {category.name}
              </Label>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-medium mb-2">Distance</h4>
        <Select 
          value={localFilters.distance} 
          onValueChange={handleDistanceChange}
        >
          <SelectTrigger className="w-full bg-white">
            <SelectValue placeholder="Select distance" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {DISTANCE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>

      <div className="mb-4">
        <h4 className="text-sm font-medium mb-2">Availability</h4>
        <div className="space-y-2">
          {AVAILABILITY_OPTIONS.map((option) => (
            <div key={option.id} className="flex items-center">
              <Checkbox
                id={`availability-${option.id}`}
                checked={localFilters.availability.includes(option.id)}
                onCheckedChange={() => handleAvailabilityChange(option.id)}
                className="text-primary rounded focus:ring-primary"
              />
              <Label
                htmlFor={`availability-${option.id}`}
                className="ml-2 text-sm font-normal cursor-pointer"
              >
                {option.name}
              </Label>
            </div>
          ))}
        </div>
      </div>
      
      <Button
        onClick={handleApplyFilters}
        className="w-full bg-primary text-white hover:bg-primary/90"
      >
        Apply Filters
      </Button>
    </div>
  );
};

export default ResourceFilters;
