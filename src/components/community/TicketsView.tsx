import { useState, useEffect } from 'react';
import { Plus, MessageSquare, Clock, CheckCircle, XCircle, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Input } from '@/components/ui/input';

interface Ticket {
  id: string;
  subject: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
}

interface TicketResponse {
  id: string;
  content: string;
  is_staff_reply: boolean;
  created_at: string;
  profile?: { username: string };
}

export function TicketsView() {
  const { user, isAdmin } = useAuth();
  const [tickets, setTickets] = useState<Ticket[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null);
  const [responses, setResponses] = useState<TicketResponse[]>([]);
  const [newResponse, setNewResponse] = useState('');
  
  // Create form
  const [subject, setSubject] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchTickets();
  }, []);

  const fetchTickets = async () => {
    const { data, error } = await supabase
      .from('support_tickets')
      .select('*')
      .order('created_at', { ascending: false });

    if (!error && data) {
      setTickets(data);
    }
    setLoading(false);
  };

  const fetchResponses = async (ticketId: string) => {
    const { data } = await supabase
      .from('ticket_responses')
      .select(`
        *,
        profile:profiles!ticket_responses_user_id_fkey(username)
      `)
      .eq('ticket_id', ticketId)
      .order('created_at', { ascending: true });

    if (data) {
      setResponses(data as unknown as TicketResponse[]);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !subject.trim() || !description.trim()) return;

    setCreating(true);
    const { error } = await supabase
      .from('support_tickets')
      .insert({
        user_id: user.id,
        subject: subject.trim(),
        description: description.trim(),
      });

    if (!error) {
      setSubject('');
      setDescription('');
      setShowCreate(false);
      fetchTickets();
    }
    setCreating(false);
  };

  const handleReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !selectedTicket || !newResponse.trim()) return;

    const { error } = await supabase
      .from('ticket_responses')
      .insert({
        ticket_id: selectedTicket.id,
        user_id: user.id,
        content: newResponse.trim(),
        is_staff_reply: isAdmin,
      });

    if (!error) {
      setNewResponse('');
      fetchResponses(selectedTicket.id);
    }
  };

  const handleStatusChange = async (ticketId: string, status: string) => {
    await supabase
      .from('support_tickets')
      .update({ status })
      .eq('id', ticketId);
    
    fetchTickets();
    if (selectedTicket?.id === ticketId) {
      setSelectedTicket(prev => prev ? { ...prev, status } : null);
    }
  };

  const openTicket = (ticket: Ticket) => {
    setSelectedTicket(ticket);
    fetchResponses(ticket.id);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'closed': return <CheckCircle className="w-4 h-4 text-emerald-500" />;
      case 'resolved': return <CheckCircle className="w-4 h-4 text-primary" />;
      default: return <MessageSquare className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="w-6 h-6 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  // Show ticket detail
  if (selectedTicket) {
    return (
      <div className="space-y-4 animate-fade-in">
        <button
          onClick={() => setSelectedTicket(null)}
          className="text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          ← Back to tickets
        </button>

        <div className="card-modern p-6 rounded-xl">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h2 className="text-lg font-semibold text-foreground">{selectedTicket.subject}</h2>
              <p className="text-sm text-muted-foreground">{formatDate(selectedTicket.created_at)}</p>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon(selectedTicket.status)}
              <span className="text-sm capitalize">{selectedTicket.status}</span>
            </div>
          </div>

          <p className="text-foreground/90 mb-6">{selectedTicket.description}</p>

          {isAdmin && (
            <div className="flex gap-2 mb-6">
              <button
                onClick={() => handleStatusChange(selectedTicket.id, 'resolved')}
                className="btn-secondary text-xs"
              >
                Mark Resolved
              </button>
              <button
                onClick={() => handleStatusChange(selectedTicket.id, 'closed')}
                className="btn-secondary text-xs"
              >
                Close
              </button>
            </div>
          )}

          {/* Responses */}
          <div className="border-t border-border/30 pt-4 space-y-4">
            <h3 className="font-medium text-foreground">Responses</h3>
            
            {responses.length === 0 && (
              <p className="text-sm text-muted-foreground">No responses yet.</p>
            )}

            {responses.map((resp) => {
              const profile = Array.isArray(resp.profile) ? resp.profile[0] : resp.profile;
              return (
                <div 
                  key={resp.id} 
                  className={`p-3 rounded-lg ${resp.is_staff_reply ? 'bg-primary/10 border border-primary/20' : 'bg-secondary/50'}`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-sm font-medium ${resp.is_staff_reply ? 'text-primary' : 'text-foreground'}`}>
                      {profile?.username || 'Unknown'}
                      {resp.is_staff_reply && <span className="ml-1 text-xs">(Staff)</span>}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{formatDate(resp.created_at)}</span>
                  </div>
                  <p className="text-sm text-foreground/90">{resp.content}</p>
                </div>
              );
            })}

            {selectedTicket.status !== 'closed' && (
              <form onSubmit={handleReply} className="flex gap-2 mt-4">
                <input
                  type="text"
                  value={newResponse}
                  onChange={(e) => setNewResponse(e.target.value)}
                  placeholder="Write a response..."
                  className="flex-1 input-modern"
                />
                <button
                  type="submit"
                  disabled={!newResponse.trim()}
                  className="btn-primary"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-foreground">Your Tickets</h2>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          New Ticket
        </button>
      </div>

      {/* Create form */}
      {showCreate && (
        <div className="card-modern p-4 rounded-xl animate-fade-in">
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Subject</label>
              <Input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="Brief description of your issue"
                className="bg-secondary/50 border-border/50"
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground mb-1 block">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Provide details about your issue..."
                rows={4}
                className="w-full input-modern resize-none"
              />
            </div>
            <div className="flex gap-2">
              <button type="submit" disabled={creating} className="btn-primary">
                {creating ? 'Creating...' : 'Submit Ticket'}
              </button>
              <button type="button" onClick={() => setShowCreate(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Tickets list */}
      <div className="space-y-2">
        {tickets.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No tickets yet. Create one if you need help!
          </div>
        )}

        {tickets.map((ticket) => (
          <button
            key={ticket.id}
            onClick={() => openTicket(ticket)}
            className="w-full card-modern p-4 rounded-xl text-left hover:border-primary/30 transition-colors"
          >
            <div className="flex items-center justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-foreground truncate">{ticket.subject}</h3>
                <p className="text-sm text-muted-foreground truncate">{ticket.description}</p>
              </div>
              <div className="flex items-center gap-2">
                {getStatusIcon(ticket.status)}
                <span className="text-xs text-muted-foreground">{formatDate(ticket.created_at)}</span>
              </div>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}