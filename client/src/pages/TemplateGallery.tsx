import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Search, Sparkles, ShoppingCart, Rocket, Store, Briefcase, Star } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { useLocation } from "wouter";
import { toast } from "sonner";

export default function TemplateGallery() {
  const [, navigate] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [previewTemplate, setPreviewTemplate] = useState<any>(null);

  const { data: templates, isLoading } = trpc.templates.list.useQuery({
    category: selectedCategory as any,
    includeBuiltIn: true,
    includeUserSaved: true,
  });

  const cloneTemplateMutation = trpc.templates.cloneTemplate.useMutation({
    onSuccess: (data) => {
      toast.success("Template cloned successfully!");
      navigate(`/workflows/builder/${data.workflowId}`);
    },
    onError: (error) => {
      toast.error(`Failed to clone template: ${error.message}`);
    },
  });

  const categories = [
    { id: "all", name: "All Templates", icon: Sparkles },
    { id: "ecommerce", name: "E-commerce", icon: ShoppingCart },
    { id: "saas", name: "SaaS", icon: Rocket },
    { id: "retail", name: "Retail", icon: Store },
    { id: "services", name: "Services", icon: Briefcase },
    { id: "general", name: "General", icon: Star },
  ];

  const filteredTemplates = templates?.filter((template: any) =>
    template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    template.tags?.some((tag: string) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleCloneTemplate = (template: any) => {
    cloneTemplateMutation.mutate({
      templateId: template.isBuiltIn ? template.id : Number(template.id),
      isBuiltIn: template.isBuiltIn,
    });
  };

  return (
    <div className="container mx-auto py-8 space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold mb-2">Workflow Templates</h1>
        <p className="text-muted-foreground">
          Choose from industry-specific templates to quickly set up automated workflows
        </p>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search templates by name, description, or tags..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Category Tabs */}
      <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
        <TabsList className="grid w-full grid-cols-6">
          {categories.map((category) => {
            const Icon = category.icon;
            return (
              <TabsTrigger key={category.id} value={category.id} className="flex items-center gap-2">
                <Icon className="h-4 w-4" />
                <span className="hidden sm:inline">{category.name}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        <TabsContent value={selectedCategory} className="mt-6">
          {isLoading ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Card key={i}>
                  <CardHeader>
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-full mt-2" />
                  </CardHeader>
                  <CardContent>
                    <Skeleton className="h-10 w-full" />
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredTemplates && filteredTemplates.length > 0 ? (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {filteredTemplates.map((template: any) => (
                <Card
                  key={`${template.isBuiltIn ? 'built-in' : 'user'}-${template.id}`}
                  className="hover:shadow-lg transition-shadow cursor-pointer"
                  onClick={() => setPreviewTemplate(template)}
                >
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="text-4xl mb-2">{template.icon}</div>
                      <div className="flex gap-1">
                        {template.isBuiltIn && (
                          <Badge variant="secondary">Built-in</Badge>
                        )}
                        {template.isPublic && !template.isBuiltIn && (
                          <Badge variant="outline">Public</Badge>
                        )}
                      </div>
                    </div>
                    <CardTitle className="text-lg">{template.name}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {template.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {template.tags?.slice(0, 3).map((tag: string) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        className="flex-1"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCloneTemplate(template);
                        }}
                        disabled={cloneTemplateMutation.isPending}
                      >
                        Use Template
                      </Button>
                      <Button
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewTemplate(template);
                        }}
                      >
                        Preview
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">No templates found</p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Preview Dialog */}
      <Dialog open={!!previewTemplate} onOpenChange={() => setPreviewTemplate(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">{previewTemplate?.icon}</span>
              <div>
                <DialogTitle>{previewTemplate?.name}</DialogTitle>
                <DialogDescription>{previewTemplate?.description}</DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <div className="space-y-6">
            {/* Metadata */}
            <div>
              <h4 className="font-semibold mb-2">Details</h4>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">Category:</span>
                  <Badge variant="outline" className="ml-2">
                    {previewTemplate?.category}
                  </Badge>
                </div>
                <div>
                  <span className="text-muted-foreground">Trigger:</span>
                  <Badge variant="outline" className="ml-2">
                    {previewTemplate?.triggerType?.replace('_', ' ')}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Tags */}
            {previewTemplate?.tags && previewTemplate.tags.length > 0 && (
              <div>
                <h4 className="font-semibold mb-2">Tags</h4>
                <div className="flex flex-wrap gap-2">
                  {previewTemplate.tags.map((tag: string) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Steps */}
            <div>
              <h4 className="font-semibold mb-2">Workflow Steps ({previewTemplate?.steps?.length || 0})</h4>
              <div className="space-y-3">
                {previewTemplate?.steps?.map((step: any, index: number) => (
                  <Card key={step.id}>
                    <CardContent className="pt-4">
                      <div className="flex items-start gap-3">
                        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline">{step.type}</Badge>
                            {step.type === 'email' && step.config.subject && (
                              <span className="text-sm font-medium">{step.config.subject}</span>
                            )}
                            {step.type === 'delay' && (
                              <span className="text-sm font-medium">
                                Wait {step.config.amount} {step.config.unit}
                              </span>
                            )}
                            {step.type === 'condition' && (
                              <span className="text-sm font-medium">
                                If {step.config.field} {step.config.operator} {step.config.value}
                              </span>
                            )}
                          </div>
                          {step.type === 'email' && step.config.htmlBody && (
                            <p className="text-sm text-muted-foreground line-clamp-2">
                              {step.config.htmlBody.replace(/<[^>]*>/g, '')}
                            </p>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4 border-t">
              <Button
                className="flex-1"
                onClick={() => {
                  handleCloneTemplate(previewTemplate);
                  setPreviewTemplate(null);
                }}
                disabled={cloneTemplateMutation.isPending}
              >
                Use This Template
              </Button>
              <Button
                variant="outline"
                onClick={() => setPreviewTemplate(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
