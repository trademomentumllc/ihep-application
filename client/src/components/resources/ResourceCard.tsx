import { Resource } from "@shared/schema";
import { Star } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

interface ResourceCardProps {
  resource: Resource;
}

const ResourceCard = ({ resource }: ResourceCardProps) => {
  // Function to render rating stars
  const renderRating = (rating: number) => {
    return Array(5)
      .fill(0)
      .map((_, i) => (
        <Star
          key={i}
          className={`h-4 w-4 ${
            i < Math.floor(rating) 
              ? "text-accent fill-accent" 
              : i < rating 
                ? "text-accent fill-accent/50" 
                : "text-gray-300"
          }`}
        />
      ));
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-4 border border-gray-200">
      <div className="flex">
        <img
          src={resource.imageUrl || `https://ui-avatars.com/api/?name=${encodeURIComponent(resource.name)}&background=random`}
          alt={resource.name}
          className="w-16 h-16 rounded-full object-cover mr-4"
        />
        <div>
          <h3 className="font-montserrat font-semibold">{resource.name}</h3>
          <p className="text-sm text-gray-600">{resource.description} • {resource.contactInfo}</p>
          
          {resource.rating ? (
            <div className="flex items-center mt-1">
              <div className="flex">
                {renderRating(resource.rating)}
              </div>
              <span className="text-xs text-gray-500 ml-1">
                ({resource.reviewCount || 0} reviews)
              </span>
            </div>
          ) : (
            <div className="mt-1">
              <Badge 
                variant="outline" 
                className={`text-xs ${resource.isVirtual ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'}`}
              >
                {resource.isVirtual ? 'Virtual' : 'In-Person'}
              </Badge>
              {resource.takingNewPatients && (
                <Badge variant="outline" className="text-xs ml-1 bg-amber-50 text-amber-600">
                  Taking New Patients
                </Badge>
              )}
            </div>
          )}
          
          <div className="flex mt-3 space-x-2">
            {resource.website ? (
              <a href={resource.website} target="_blank" rel="noopener noreferrer">
                <Button 
                  size="sm" 
                  className="text-xs bg-primary text-white px-3 py-1 rounded hover:bg-primary/90"
                >
                  Visit Website
                </Button>
              </a>
            ) : (
              <Button 
                size="sm" 
                className="text-xs bg-gray-300 text-gray-500 px-3 py-1 rounded cursor-not-allowed"
                disabled
              >
                No Website
              </Button>
            )}
            {resource.category.includes('specialist') || resource.category.includes('hiv') ? (
              <Link href={`/appointments/new?providerId=${resource.id}`}>
                <Button 
                  size="sm"
                  variant="outline" 
                  className="text-xs bg-green-50 text-green-600 px-3 py-1 rounded hover:bg-green-100"
                >
                  Schedule Appointment
                </Button>
              </Link>
            ) : resource.category === 'support_groups' ? (
              <a href={`tel:${resource.phone}`}>
                <Button 
                  size="sm"
                  variant="outline" 
                  className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100"
                >
                  Call to Join
                </Button>
              </a>
            ) : resource.phone ? (
              <a href={`tel:${resource.phone}`}>
                <Button 
                  size="sm"
                  variant="outline" 
                  className="text-xs bg-blue-50 text-blue-600 px-3 py-1 rounded hover:bg-blue-100"
                >
                  Call Now
                </Button>
              </a>
            ) : (
              <Button 
                size="sm"
                variant="outline" 
                className="text-xs bg-gray-300 text-gray-500 px-3 py-1 rounded cursor-not-allowed"
                disabled
              >
                Contact Unavailable
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceCard;
