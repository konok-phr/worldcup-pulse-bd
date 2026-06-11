import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { buildHead } from "@/lib/seo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { Pencil, Trash2, Plus, Save, X } from "lucide-react";

type Channel = {
  id: string;
  name: string;
  logo_url: string | null;
  stream_url: string;
  sort_order: number;
  is_active: boolean;
};

export const Route = createFileRoute("/live-tv-add-for-world-cup-2026-ad")({
  head: () => ({
    ...buildHead({
      title: "Manage Live TV Channels — WC26 Hub",
      description: "Add and update live TV channels for WC26 Hub.",
      path: "/live-tv-add-for-world-cup-2026-ad",
      noindex: true,
    }),
  }),
  component: AdminPage,
});

function AdminPage() {
  const qc = useQueryClient();
  const { data: channels, refetch } = useQuery({
    queryKey: ["live-tv-channels-admin"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("live_tv_channels")
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as Channel[];
    },
  });

  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [form, setForm] = React.useState({
    name: "",
    logo_url: "",
    stream_url: "",
    sort_order: 0,
    is_active: true,
  });
  const [saving, setSaving] = React.useState(false);

  function resetForm() {
    setEditingId(null);
    setForm({ name: "", logo_url: "", stream_url: "", sort_order: 0, is_active: true });
  }

  function startEdit(c: Channel) {
    setEditingId(c.id);
    setForm({
      name: c.name,
      logo_url: c.logo_url ?? "",
      stream_url: c.stream_url,
      sort_order: c.sort_order,
      is_active: c.is_active,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.name.trim() || !form.stream_url.trim()) {
      toast.error("Name and stream URL are required");
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name.trim(),
      logo_url: form.logo_url.trim() || null,
      stream_url: form.stream_url.trim(),
      sort_order: Number(form.sort_order) || 0,
      is_active: form.is_active,
      updated_at: new Date().toISOString(),
    };
    const { error } = editingId
      ? await supabase.from("live_tv_channels").update(payload).eq("id", editingId)
      : await supabase.from("live_tv_channels").insert(payload);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(editingId ? "Channel updated" : "Channel added");
    resetForm();
    await refetch();
    qc.invalidateQueries({ queryKey: ["live-tv-channels"] });
  }

  async function onDelete(id: string) {
    if (!confirm("Delete this channel?")) return;
    const { error } = await supabase.from("live_tv_channels").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted");
    await refetch();
    qc.invalidateQueries({ queryKey: ["live-tv-channels"] });
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 space-y-6">
      <header>
        <div className="text-[10px] font-mono uppercase tracking-[0.2em] text-primary mb-1">
          ▸ Admin
        </div>
        <h1 className="text-2xl font-bold">Live TV Channels</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Add or update HLS (.m3u8) channels shown on the /live-tv page. No login required — anyone with this URL can edit.
        </p>
      </header>

      <form
        onSubmit={onSubmit}
        className="rounded-2xl border border-border bg-card p-5 space-y-4 shadow-sm"
      >
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider">
            {editingId ? "Edit channel" : "Add new channel"}
          </h2>
          {editingId && (
            <Button type="button" variant="ghost" size="sm" onClick={resetForm}>
              <X className="h-4 w-4" /> Cancel
            </Button>
          )}
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="name">Channel name *</Label>
            <Input
              id="name"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. T Sports"
              maxLength={120}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="logo">Logo URL</Label>
            <Input
              id="logo"
              value={form.logo_url}
              onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
              placeholder="https://..."
              maxLength={500}
            />
          </div>
          <div className="space-y-1.5 sm:col-span-2">
            <Label htmlFor="stream">Stream URL (.m3u8) *</Label>
            <Input
              id="stream"
              value={form.stream_url}
              onChange={(e) => setForm({ ...form, stream_url: e.target.value })}
              placeholder="https://example.com/stream.m3u8"
              maxLength={1000}
              required
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="sort">Sort order</Label>
            <Input
              id="sort"
              type="number"
              value={form.sort_order}
              onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
            />
          </div>
          <div className="flex items-end gap-2">
            <label className="inline-flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.is_active}
                onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
                className="h-4 w-4 rounded border-border"
              />
              Active (visible on /live-tv)
            </label>
          </div>
        </div>

        <Button type="submit" disabled={saving} className="w-full sm:w-auto">
          {editingId ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
          {saving ? "Saving…" : editingId ? "Save changes" : "Add channel"}
        </Button>
      </form>

      <section className="space-y-2">
        <h2 className="text-xs font-mono uppercase tracking-[0.2em] text-muted-foreground">
          ▸ Existing channels ({channels?.length ?? 0})
        </h2>
        {!channels || channels.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/40 p-6 text-center text-sm text-muted-foreground">
            No channels yet.
          </div>
        ) : (
          <ul className="space-y-2">
            {channels.map((c) => (
              <li
                key={c.id}
                className="flex items-center gap-3 rounded-xl border border-border bg-card p-3"
              >
                {c.logo_url ? (
                  <img src={c.logo_url} alt={c.name} className="h-10 w-10 rounded object-cover bg-black/20" />
                ) : (
                  <div className="h-10 w-10 rounded bg-muted flex items-center justify-center text-xs font-mono">
                    TV
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold truncate">{c.name}</span>
                    {!c.is_active && (
                      <span className="text-[10px] font-mono uppercase tracking-wider rounded bg-muted px-1.5 py-0.5">
                        hidden
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-muted-foreground truncate font-mono">{c.stream_url}</div>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" onClick={() => startEdit(c)} aria-label="Edit">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(c.id)}
                    aria-label="Delete"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}