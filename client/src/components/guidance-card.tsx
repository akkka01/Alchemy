import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useState } from "react";

interface Guidance {
  id: number;
  content: string;
  codeExample?: {
    title: string;
    code: string;
    language: string;
  };
}

interface GuidanceCardProps {
  guidance: Guidance;
}

export function GuidanceCard({ guidance }: GuidanceCardProps) {
  const [isCopied, setIsCopied] = useState(false);

  const refreshGuidanceMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/guidance/refresh", {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/guidance'] });
    },
  });

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  // Function to convert markdown-style lists to HTML
  const formatContent = (content: string) => {
    const paragraphs = content.split('\n\n');
    
    return paragraphs.map((paragraph, idx) => {
      // Check if this is a list
      if (paragraph.trim().startsWith('- ')) {
        const listItems = paragraph
          .split('\n')
          .filter(line => line.trim())
          .map(line => line.replace(/^- /, ''));
          
        return (
          <ul key={idx} className="list-disc pl-5 space-y-1 mt-2">
            {listItems.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        );
      }
      
      // Regular paragraph with potential strong tags
      const formattedParagraph = paragraph.replace(
        /\*\*(.*?)\*\*/g, 
        '<strong>$1</strong>'
      );
      
      return (
        <p 
          key={idx} 
          className={idx > 0 ? "mt-2" : ""} 
          dangerouslySetInnerHTML={{ __html: formattedParagraph }}
        />
      );
    });
  };

  return (
    <Card className="shadow-md rounded-lg overflow-hidden mb-6">
      <div className="p-5 border-b border-gray-200 flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Your Personalized Guidance</h2>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-primary-600 hover:text-primary-500 flex items-center"
          onClick={() => refreshGuidanceMutation.mutate()}
          disabled={refreshGuidanceMutation.isPending}
        >
          <RefreshCw className={`mr-1 h-4 w-4 ${refreshGuidanceMutation.isPending ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>
      <div className="p-5">
        <div className="flex items-start">
          <div className="flex-shrink-0 mt-1">
            <div className="h-8 w-8 rounded-full bg-accent-500 flex items-center justify-center text-white">
              <i className="ri-robot-line"></i>
            </div>
          </div>
          <div className="ml-4 flex-1">
            <div className="prose max-w-none text-gray-700">
              {formatContent(guidance.content)}
            </div>
            
            {/* Code Sample */}
            {guidance.codeExample && (
              <div className="mt-4 bg-gray-800 rounded-md overflow-hidden">
                <div className="flex items-center justify-between px-4 py-2 bg-gray-900">
                  <span className="text-xs text-gray-400">{guidance.codeExample.title}</span>
                  <button 
                    onClick={() => copyToClipboard(guidance.codeExample.code)}
                    className="text-xs text-gray-400 hover:text-gray-300"
                  >
                    <i className={`${isCopied ? 'ri-check-line' : 'ri-file-copy-line'}`}></i>
                  </button>
                </div>
                <pre className="p-4 overflow-x-auto text-sm text-gray-300 font-mono"><code>{guidance.codeExample.code}</code></pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}
