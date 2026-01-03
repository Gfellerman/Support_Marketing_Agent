import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Plus, Edit, Trash2, BookOpen, Sparkles } from "lucide-react";

export default function KnowledgeBase() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<any>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    category: "",
    tags: "",
  });

  const { data: articles, refetch } = trpc.ai.knowledge.list.useQuery({});
  const createMutation = trpc.ai.knowledge.create.useMutation();
  const updateMutation = trpc.ai.knowledge.update.useMutation();
  const deleteMutation = trpc.ai.knowledge.delete.useMutation();
  const seedMutation = trpc.ai.knowledge.seedDefault.useMutation();

  const handleCreate = async () => {
    try {
      await createMutation.mutateAsync({
        title: formData.title,
        content: formData.content,
        category: formData.category || undefined,
        tags: formData.tags ? formData.tags.split(",").map(t => t.trim()) : undefined,
      });
      toast.success("Knowledge article created successfully");
      setIsCreateDialogOpen(false);
      setFormData({ title: "", content: "", category: "", tags: "" });
      refetch();
    } catch (error) {
      toast.error("Failed to create article");
    }
  };

  const handleUpdate = async () => {
    if (!editingArticle) return;
    try {
      await updateMutation.mutateAsync({
        id: editingArticle.id,
        title: formData.title,
        content: formData.content,
        category: formData.category || undefined,
        tags: formData.tags ? formData.tags.split(",").map(t => t.trim()) : undefined,
      });
      toast.success("Knowledge article updated successfully");
      setEditingArticle(null);
      setFormData({ title: "", content: "", category: "", tags: "" });
      refetch();
    } catch (error) {
      toast.error("Failed to update article");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this article?")) return;
    try {
      await deleteMutation.mutateAsync({ id });
      toast.success("Knowledge article deleted successfully");
      refetch();
    } catch (error) {
      toast.error("Failed to delete article");
    }
  };

  const handleSeedDefault = async () => {
    try {
      const result = await seedMutation.mutateAsync();
      toast.success(`${result.count} default articles added to knowledge base`);
      refetch();
    } catch (error) {
      toast.error("Failed to seed default articles");
    }
  };

  const openEditDialog = (article: any) => {
    setEditingArticle(article);
    setFormData({
      title: article.title,
      content: article.content,
      category: article.category || "",
      tags: article.tags ? article.tags.join(", ") : "",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <BookOpen className="w-8 h-8" />
              AI Knowledge Base
            </h1>
            <p className="text-gray-600 mt-1">
              Manage the knowledge base that powers your AI customer service agent
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleSeedDefault}
              disabled={seedMutation.isPending}
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Load Default Articles
            </Button>
            <Button onClick={() => setIsCreateDialogOpen(true)}>
              <Plus className="w-4 h-4 mr-2" />
              New Article
            </Button>
          </div>
        </div>

        {!articles || articles.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-16">
              <BookOpen className="w-16 h-16 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                No knowledge articles yet
              </h3>
              <p className="text-gray-600 text-center max-w-md mb-4">
                Start building your AI knowledge base by adding articles that answer common customer questions.
              </p>
              <Button onClick={handleSeedDefault} disabled={seedMutation.isPending}>
                <Sparkles className="w-4 h-4 mr-2" />
                Load Default Articles
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {articles.map((article) => (
              <Card key={article.id}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <CardTitle className="text-xl">{article.title}</CardTitle>
                      <CardDescription className="mt-2">
                        {article.content.substring(0, 200)}
                        {article.content.length > 200 ? "..." : ""}
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(article)}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(article.id)}
                      >
                        <Trash2 className="w-4 h-4 text-red-600" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2">
                    {article.category && (
                      <Badge variant="secondary">{article.category}</Badge>
                    )}
                    {article.tags && article.tags.map((tag: string) => (
                      <Badge key={tag} variant="outline">{tag}</Badge>
                    ))}
                    <Badge variant={article.isActive ? "default" : "secondary"}>
                      {article.isActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Dialog open={isCreateDialogOpen || !!editingArticle} onOpenChange={(open) => {
          if (!open) {
            setIsCreateDialogOpen(false);
            setEditingArticle(null);
            setFormData({ title: "", content: "", category: "", tags: "" });
          }
        }}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingArticle ? "Edit Knowledge Article" : "Create Knowledge Article"}
              </DialogTitle>
              <DialogDescription>
                Add information that the AI agent can use to answer customer questions
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g., Shipping Policy"
                />
              </div>
              <div>
                <Label htmlFor="content">Content</Label>
                <Textarea
                  id="content"
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  placeholder="Detailed information about this topic..."
                  rows={8}
                />
              </div>
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  placeholder="e.g., shipping, returns, billing"
                />
              </div>
              <div>
                <Label htmlFor="tags">Tags (comma-separated)</Label>
                <Input
                  id="tags"
                  value={formData.tags}
                  onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                  placeholder="e.g., policy, delivery, tracking"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsCreateDialogOpen(false);
                  setEditingArticle(null);
                  setFormData({ title: "", content: "", category: "", tags: "" });
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={editingArticle ? handleUpdate : handleCreate}
                disabled={!formData.title || !formData.content || createMutation.isPending || updateMutation.isPending}
              >
                {editingArticle ? "Update" : "Create"} Article
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
