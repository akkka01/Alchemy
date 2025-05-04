import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

interface Resource {
  id: number;
  type: string;
  title: string;
  description: string;
  duration?: string;
  level?: string;
  imageUrl?: string;
  link: string;
}

interface ResourceCardProps {
  resource: Resource;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const getButtonText = (type: string) => {
    switch (type) {
      case 'course':
        return 'Start Learning';
      case 'challenge':
        return 'Try Challenge';
      case 'documentation':
        return 'View Docs';
      case 'video':
        return 'Watch Video';
      default:
        return 'View Resource';
    }
  };

  const getButtonClass = (type: string) => {
    if (type === 'challenge') {
      return 'bg-secondary-600 hover:bg-secondary-700';
    } else if (type === 'video') {
      return 'bg-red-600 hover:bg-red-700';
    }
    return '';
  };
  
  const getIcon = (type: string) => {
    switch (type) {
      case 'course':
        return 'ri-book-open-line';
      case 'challenge':
        return 'ri-code-box-line';
      case 'documentation':
        return 'ri-file-text-line';
      case 'video':
        return 'ri-video-line';
      default:
        return 'ri-link';
    }
  };

  return (
    <Card className="shadow-md rounded-lg overflow-hidden">
      <div className="p-4 border-b border-gray-200">
        <h3 className="font-medium text-gray-900">
          {resource.type === 'course' ? 'Recommended Course' : 
           resource.type === 'challenge' ? 'Practice Challenge' : 
           resource.type === 'documentation' ? 'Key Documentation' : 
           resource.type === 'video' ? 'Video Tutorial' :
           'Resource'}
        </h3>
      </div>
      <div className="p-4">
        {resource.type !== 'documentation' && (
          <div className="mb-3 h-32 rounded-md overflow-hidden">
            {resource.imageUrl ? (
              <img
                src={resource.imageUrl}
                alt={resource.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="h-full bg-gray-100 flex items-center justify-center">
                <i className="ri-code-box-line text-5xl text-primary-300"></i>
              </div>
            )}
          </div>
        )}

        {resource.type === 'documentation' ? (
          <div className="space-y-3">
            {resource.title.split(',').map((doc, i) => (
              <a key={i} href={resource.link} className="group block p-3 bg-gray-50 rounded-md hover:bg-primary-50 transition">
                <h4 className="font-medium text-gray-900 group-hover:text-primary-700">{doc.trim()}</h4>
                <p className="text-sm text-gray-500">{resource.description.split(',')[i]?.trim() || resource.description}</p>
              </a>
            ))}
          </div>
        ) : (
          <>
            <h4 className="font-semibold mb-1">{resource.title}</h4>
            <p className="text-sm text-gray-500 mb-3">{resource.description}</p>
            {(resource.duration || resource.level) && (
              <div className="flex items-center text-sm text-gray-500 mb-3">
                {resource.duration && (
                  <>
                    <i className={`ri-${resource.type === 'challenge' ? 'timer' : 'time'}-line mr-1`}></i> {resource.duration}
                    {resource.level && <span className="mx-2">•</span>}
                  </>
                )}
                {resource.level && (
                  <>
                    <i className="ri-bar-chart-line mr-1"></i> {resource.level}
                  </>
                )}
              </div>
            )}
            <Button
              className={`w-full ${getButtonClass(resource.type)}`}
              onClick={() => window.open(resource.link, "_blank")}
            >
              {getButtonText(resource.type)}
            </Button>
          </>
        )}
      </div>
    </Card>
  );
}
