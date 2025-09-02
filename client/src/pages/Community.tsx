import { Helmet } from "react-helmet";
import { APP_NAME } from "@/lib/constants";
import CommunityGroups from "@/components/community/CommunityGroups";
import DiscussionsList from "@/components/community/DiscussionsList";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { Link, useLocation } from "wouter";

const Community = () => {
  const { isAuthenticated } = useAuth();
  const [, navigate] = useLocation();

  const handleNewDiscussion = () => {
    if (!isAuthenticated) {
      navigate("/login?redirect=/community/new-discussion");
    } else {
      navigate("/community/new-discussion");
    }
  };

  return (
    <>
      <Helmet>
        <title>Community Support | {APP_NAME}</title>
        <meta name="description" content="Connect with other HIV patients and healthcare providers through support groups and discussions." />
      </Helmet>
      
      <section className="container mx-auto px-4 py-6 mt-8 mb-12">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h2 className="text-2xl font-montserrat font-bold text-primary">Community Support</h2>
            <p className="text-gray-600 mt-1">Connect with others, share experiences, and find support</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Button 
              className="bg-primary text-white hover:bg-primary/90 flex items-center"
              onClick={handleNewDiscussion}
            >
              <MessageSquare className="mr-2 h-4 w-4" />
              New Discussion
            </Button>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Featured Community Groups */}
          <CommunityGroups />
          
          {/* Recent Discussion Topics */}
          <DiscussionsList />
        </div>
      </section>
    </>
  );
};

export default Community;
