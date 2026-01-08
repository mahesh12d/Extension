import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useLocation } from "wouter";
import { useProfiles, useDeleteProfile, useCreateProfile, useUpdateProfile } from "@/hooks/use-profiles";
import { Button, Card, Dialog, Input } from "@/components/ui-components";
import { LogOut, Plus, User, MapPin, Mail, Trash2, Edit2, Search } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion, AnimatePresence } from "framer-motion";
import type { InsertProfile, Profile } from "@shared/schema";

export default function Dashboard() {
  const { logout, isAuthenticated } = useAuth();
  const [_, setLocation] = useLocation();

  if (!isAuthenticated) {
    setLocation("/auth");
    return null;
  }
  
  const { data: profiles, isLoading } = useProfiles();
  const deleteProfile = useDeleteProfile();
  const createProfile = useCreateProfile();
  const updateProfile = useUpdateProfile();
  const { toast } = useToast();
  
  const [search, setSearch] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingProfile, setEditingProfile] = useState<Profile | null>(null);

  const filteredProfiles = profiles?.filter(p => 
    p.profileName.toLowerCase().includes(search.toLowerCase()) || 
    p.firstName?.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    if (confirm("Are you sure you want to delete this profile?")) {
      await deleteProfile.mutateAsync(id);
      toast({ title: "Deleted", description: "Profile removed successfully" });
    }
  };

  const handleEdit = (profile: Profile) => {
    setEditingProfile(profile);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setEditingProfile(null);
    setIsDialogOpen(true);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold font-display bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            Autofill Pro
          </h1>
          <Button variant="ghost" size="icon" onClick={logout} title="Logout">
            <LogOut size={18} className="text-muted-foreground" />
          </Button>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <input
            type="text"
            placeholder="Search profiles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-secondary/50 border-0 rounded-xl pl-9 pr-4 py-2.5 text-sm focus:ring-2 focus:ring-primary/20 transition-all"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 p-4 overflow-y-auto space-y-4 pb-20">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : filteredProfiles?.length === 0 ? (
          <div className="text-center py-12 space-y-3">
            <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto text-muted-foreground">
              <User size={32} />
            </div>
            <h3 className="font-semibold text-lg">No profiles found</h3>
            <p className="text-sm text-muted-foreground px-6">
              Create your first profile to start auto-filling forms.
            </p>
            <Button onClick={handleCreate} className="mt-4">
              Create Profile
            </Button>
          </div>
        ) : (
          <AnimatePresence>
            {filteredProfiles?.map((profile) => (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                layout
              >
                <Card className="p-4 group hover:border-primary/30 transition-all duration-200">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="font-bold text-base flex items-center gap-2">
                        {profile.profileName}
                        {/* Example Unsplash image for visual interest if needed, but using icons here for perf */}
                      </h3>
                      <p className="text-sm text-muted-foreground mt-1">
                        {profile.firstName} {profile.lastName}
                      </p>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => handleEdit(profile)}
                        className="p-2 hover:bg-secondary rounded-lg text-muted-foreground hover:text-primary transition-colors"
                      >
                        <Edit2 size={16} />
                      </button>
                      <button 
                        onClick={() => handleDelete(profile.id)}
                        className="p-2 hover:bg-destructive/10 rounded-lg text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-border/50 grid grid-cols-1 gap-2 text-xs text-muted-foreground">
                    {profile.email && (
                      <div className="flex items-center gap-2">
                        <Mail size={12} />
                        <span className="truncate">{profile.email}</span>
                      </div>
                    )}
                    {(profile.city || profile.country) && (
                      <div className="flex items-center gap-2">
                        <MapPin size={12} />
                        <span>{[profile.city, profile.country].filter(Boolean).join(", ")}</span>
                      </div>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>

      {/* Floating Action Button */}
      <div className="fixed bottom-6 right-6">
        <Button 
          size="icon" 
          className="h-14 w-14 rounded-full shadow-xl shadow-primary/30"
          onClick={handleCreate}
        >
          <Plus size={24} />
        </Button>
      </div>

      {/* Edit/Create Dialog */}
      <ProfileFormDialog 
        isOpen={isDialogOpen} 
        onClose={() => setIsDialogOpen(false)} 
        initialData={editingProfile}
        createMutation={createProfile}
        updateMutation={updateProfile}
      />
    </div>
  );
}

function ProfileFormDialog({ isOpen, onClose, initialData, createMutation, updateMutation }: any) {
  const [formData, setFormData] = useState<Partial<InsertProfile>>({});
  
  // Reset form when dialog opens/changes
  useState(() => {
    if (isOpen) {
      setFormData(initialData || { profileName: "", firstName: "", lastName: "", email: "" });
    }
  });

  // Update local state when initialData changes
  const isEditing = !!initialData;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (isEditing) {
        await updateMutation.mutateAsync({ id: initialData.id, ...formData });
      } else {
        await createMutation.mutateAsync(formData as InsertProfile);
      }
      onClose();
    } catch (error) {
      // Error handled by mutation hook or toast
    }
  };

  const handleChange = (field: keyof InsertProfile, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isOpen) return null;

  return (
    <Dialog 
      isOpen={isOpen} 
      onClose={onClose} 
      title={isEditing ? "Edit Profile" : "New Profile"}
    >
      <form onSubmit={handleSubmit} className="space-y-4 max-h-[400px] overflow-y-auto pr-1 hide-scrollbar">
        <Input
          label="Profile Name"
          placeholder="e.g. Work, Personal"
          value={formData.profileName || ""}
          onChange={(e) => handleChange("profileName", e.target.value)}
          required
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="First Name"
            placeholder="John"
            value={formData.firstName || ""}
            onChange={(e) => handleChange("firstName", e.target.value)}
          />
          <Input
            label="Last Name"
            placeholder="Doe"
            value={formData.lastName || ""}
            onChange={(e) => handleChange("lastName", e.target.value)}
          />
        </div>
        <Input
          label="Email"
          type="email"
          placeholder="john@example.com"
          value={formData.email || ""}
          onChange={(e) => handleChange("email", e.target.value)}
        />
        <Input
          label="Address"
          placeholder="123 Main St"
          value={formData.address || ""}
          onChange={(e) => handleChange("address", e.target.value)}
        />
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="City"
            placeholder="New York"
            value={formData.city || ""}
            onChange={(e) => handleChange("city", e.target.value)}
          />
          <Input
            label="ZIP Code"
            placeholder="10001"
            value={formData.zip || ""}
            onChange={(e) => handleChange("zip", e.target.value)}
          />
        </div>

        <div className="pt-2 flex gap-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" className="flex-1" isLoading={createMutation.isPending || updateMutation.isPending}>
            {isEditing ? "Save Changes" : "Create Profile"}
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
