"use client";

import { create } from "zustand";
import {
  Client, Supplier, Lead, Booking, Trip, TeamMember, Notification,
  UserSettings, Stage, ClientDocument, Invoice, InvoiceEditApproval, Transfer,
  Task,
  TaskComment,
} from "./types";
import {
  SEED_TEAM, DEFAULT_SETTINGS,
} from "./seed";
import { supabase } from "./supabase";

interface Store {
  clients: Client[];
  suppliers: Supplier[];
  leads: Lead[];
  bookings: Booking[];
  trips: Trip[];
  transfers: Transfer[];
  team: TeamMember[];
  notifications: Notification[];
  settings: UserSettings;
  
  clientDocuments: ClientDocument[];
  invoices: Invoice[];
  invoiceEditApprovals: InvoiceEditApproval[];
  
  tasks: Task[];
  taskComments: TaskComment[];

  sidebarCollapsed: boolean;
  isLoading: boolean;

  fetchInitialData: () => Promise<void>;

  addClient: (c: Omit<Client, "id" | "createdAt" | "revenue" | "activeDeals" | "lastContact" | "healthScore">) => Promise<void>;
  updateClient: (id: string, patch: Partial<Client>) => Promise<void>;
  deleteClient: (id: string) => Promise<void>;
  
  addClientDocument: (doc: Omit<ClientDocument, "id" | "uploadedAt">) => Promise<void>;

  addSupplier: (s: Omit<Supplier, "id" | "status">, asPending: boolean) => Promise<void>;
  approveSupplier: (id: string) => Promise<void>;
  rejectSupplier: (id: string) => Promise<void>;
  deleteSupplier: (id: string) => Promise<void>;

  addLead: (l: Omit<Lead, "id" | "createdAt" | "daysInStage">) => Promise<void>;
  moveLead: (id: string, toStage: Stage) => Promise<void>;
  updateLead: (id: string, patch: Partial<Lead>) => Promise<void>;
  deleteLead: (id: string) => Promise<void>;

  addBooking: (b: Omit<Booking, "id">) => Promise<void>;
  updateBooking: (id: string, patch: Partial<Booking>) => Promise<void>;
  deleteBooking: (id: string) => Promise<void>;

  addInvoice: (inv: Omit<Invoice, "id" | "createdAt">) => Promise<void>;
  updateInvoice: (id: string, patch: Partial<Invoice>) => Promise<void>;
  proposeInvoiceEdit: (approval: Omit<InvoiceEditApproval, "id" | "approvedAt">) => Promise<void>;

  addTrip: (t: Omit<Trip, "id">) => Promise<void>;
  updateTrip: (id: string, patch: Partial<Trip>) => Promise<void>;
  deleteTrip: (id: string) => Promise<void>;

  addTransfer: (t: Omit<Transfer, "id" | "createdAt">) => Promise<void>;
  updateTransfer: (id: string, patch: Partial<Transfer>) => Promise<void>;
  deleteTransfer: (id: string) => Promise<void>;

  addTask: (t: Omit<Task, "id" | "createdAt">) => Promise<void>;
  updateTask: (id: string, patch: Partial<Task>) => Promise<void>;
  addTaskComment: (c: Omit<TaskComment, "id" | "createdAt">) => Promise<void>;

  dismissNotification: (id: string) => void;
  markNotificationRead: (id: string) => Promise<void>;
  markAllNotificationsRead: () => Promise<void>;

  updateSettings: (patch: Partial<UserSettings>) => Promise<void>;
  toggleSidebar: () => void;
  resetDemoData: () => void;
}

// Convert from snake_case db columns to camelCase frontend model
function mapToCamel(obj: any): any {
  if (!obj) return obj;
  const newObj: any = {};
  for (const key of Object.keys(obj)) {
    const camelKey = key.replace(/_([a-z])/g, (g) => g[1].toUpperCase());
    newObj[camelKey] = obj[key];
  }
  // Custom overrides for schema mismatches
  if ('revenueKes' in newObj) { newObj.revenue = newObj.revenueKes; }
  if ('valueKes' in newObj) { newObj.value = newObj.valueKes; }
  if ('residentRateKes' in newObj) { newObj.residentRate = newObj.residentRateKes; }
  return newObj;
}

// Convert from camelCase frontend model to snake_case db columns
function mapToSnake(obj: any): any {
  if (!obj) return obj;
  const newObj: any = {};
  for (const key of Object.keys(obj)) {
    const snakeKey = key.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
    newObj[snakeKey] = obj[key];
  }
  // Reverse overrides
  if ('revenue' in newObj && !('revenue_kes' in newObj)) { newObj.revenue_kes = newObj.revenue; delete newObj.revenue; }
  if ('value' in newObj && !('value_kes' in newObj)) { newObj.value_kes = newObj.value; delete newObj.value; }
  if ('resident_rate' in newObj && !('resident_rate_kes' in newObj)) { newObj.resident_rate_kes = newObj.resident_rate; delete newObj.resident_rate; }
  return newObj;
}

export const useStore = create<Store>()((set, get) => ({
  clients: [],
  suppliers: [],
  leads: [],
  bookings: [],
  trips: [],
  transfers: [],
  team: SEED_TEAM, // In real app, fetch from profiles
  notifications: [],
  settings: DEFAULT_SETTINGS,
  
  clientDocuments: [],
  invoices: [],
  invoiceEditApprovals: [],
  
  tasks: [],
  taskComments: [],

  sidebarCollapsed: false,
  isLoading: true,

  fetchInitialData: async () => {
    set({ isLoading: true });
    
    try {
      // Fetch data in parallel
      const [
        { data: clients },
        { data: suppliers },
        { data: leads },
        { data: bookings },
        { data: trips },
        { data: transfers },
        { data: clientDocuments },
        { data: invoices },
        { data: invoiceEditApprovals },
        { data: tasks },
        { data: taskComments }
      ] = await Promise.all([
      supabase.from("clients").select("*"),
      supabase.from("suppliers").select("*"),
      supabase.from("leads").select("*"),
      supabase.from("bookings").select("*"),
      supabase.from("trips").select("*"),
      supabase.from("transfers").select("*"),
      supabase.from("client_documents").select("*"),
      supabase.from("invoices").select("*"),
      supabase.from("invoice_edit_approvals").select("*"),
      // Handle missing tables gracefully in case SQL script wasn't run yet
      supabase.from("koi_tasks").select("*").then(res => ({ data: res.error ? [] : res.data })),
      supabase.from("koi_task_comments").select("*").then(res => ({ data: res.error ? [] : res.data }))
    ]);

    set({
      clients: (clients || []).map(mapToCamel),
      suppliers: (suppliers || []).map(mapToCamel),
      leads: (leads || []).map(mapToCamel),
      bookings: (bookings || []).map(mapToCamel),
      trips: (trips || []).map(mapToCamel),
      transfers: (transfers || []).map(mapToCamel),
      clientDocuments: (clientDocuments || []).map(mapToCamel),
      invoices: (invoices || []).map(mapToCamel),
      invoiceEditApprovals: (invoiceEditApprovals || []).map(mapToCamel),
      tasks: (tasks || []).map(mapToCamel),
      taskComments: (taskComments || []).map(mapToCamel),
      isLoading: false
    });
    } catch (error) {
      console.error("Error fetching initial data:", error);
      set({ isLoading: false });
    }
  },

  addClient: async (c) => {
    const dbClient = mapToSnake({ ...c, activeDeals: 0, revenue: 0, healthScore: 75 });
    const { data } = await supabase.from("clients").insert(dbClient).select().single();
    if (data) set((s) => ({ clients: [...s.clients, mapToCamel(data)] }));
  },
  updateClient: async (id, patch) => {
    set((s) => ({ clients: s.clients.map((c) => (c.id === id ? { ...c, ...patch } : c)) }));
    await supabase.from("clients").update(mapToSnake(patch)).eq("id", id);
  },
  deleteClient: async (id) => {
    set((s) => ({ clients: s.clients.filter((c) => c.id !== id) }));
    await supabase.from("clients").delete().eq("id", id);
  },
  
  addClientDocument: async (doc) => {
    const { data } = await supabase.from("client_documents").insert(mapToSnake(doc)).select().single();
    if (data) set((s) => ({ clientDocuments: [...s.clientDocuments, mapToCamel(data)] }));
  },

  addSupplier: async (sup, asPending) => {
    const dbSup = mapToSnake({ ...sup, status: asPending ? "pending" : "approved" });
    const { data } = await supabase.from("suppliers").insert(dbSup).select().single();
    if (data) set((s) => ({ suppliers: [...s.suppliers, mapToCamel(data)] }));
  },
  approveSupplier: async (id) => {
    set((s) => ({ suppliers: s.suppliers.map((sp) => sp.id === id ? { ...sp, status: "approved" } : sp) }));
    await supabase.from("suppliers").update({ status: "approved" }).eq("id", id);
  },
  rejectSupplier: async (id) => {
    set((s) => ({ suppliers: s.suppliers.map((sp) => sp.id === id ? { ...sp, status: "rejected" } : sp) }));
    await supabase.from("suppliers").update({ status: "rejected" }).eq("id", id);
  },
  deleteSupplier: async (id) => {
    set((s) => ({ suppliers: s.suppliers.filter((sp) => sp.id !== id) }));
    await supabase.from("suppliers").delete().eq("id", id);
  },

  addLead: async (l) => {
    const dbLead = mapToSnake({ ...l, daysInStage: 0 });
    const { data } = await supabase.from("leads").insert(dbLead).select().single();
    if (data) set((s) => ({ leads: [...s.leads, mapToCamel(data)] }));
  },
  moveLead: async (id, toStage) => {
    const lead = get().leads.find((l) => l.id === id);
    if (!lead) return;

    set((s) => ({ leads: s.leads.map((l) => l.id === id ? { ...l, stage: toStage, daysInStage: 0 } : l) }));
    await supabase.from("leads").update({ stage: toStage }).eq("id", id);

    if (toStage === "confirmed" || toStage === "paid") {
      const alreadyBooked = get().bookings.some((b) => b.clientId === lead.clientId && b.destination === lead.destination);
      if (!alreadyBooked) {
        const client = get().clients.find((c) => c.id === lead.clientId);
        const bookingData = {
          clientId: lead.clientId,
          clientName: client?.name ?? "Unknown",
          contactName: client?.name ?? "—",
          contactEmail: client?.email ?? "—",
          destination: lead.destination,
          value: lead.value,
          currency: lead.currency,
          status: toStage === "paid" ? "confirmed" : "pending",
          stage: toStage,
          ownerName: lead.ownerName,
          closeDate: new Date().toISOString().slice(0, 10),
        };
        const { data } = await supabase.from("bookings").insert(mapToSnake(bookingData)).select().single();
        if (data) {
          set((s) => ({ bookings: [...s.bookings, mapToCamel(data)] }));
        }
      }
    }
  },
  updateLead: async (id, patch) => {
    set((s) => ({ leads: s.leads.map((l) => (l.id === id ? { ...l, ...patch } : l)) }));
    await supabase.from("leads").update(mapToSnake(patch)).eq("id", id);
  },
  deleteLead: async (id) => {
    set((s) => ({ leads: s.leads.filter((l) => l.id !== id) }));
    await supabase.from("leads").delete().eq("id", id);
  },

  addBooking: async (b) => {
    const { data } = await supabase.from("bookings").insert(mapToSnake(b)).select().single();
    if (data) set((s) => ({ bookings: [...s.bookings, mapToCamel(data)] }));
  },
  updateBooking: async (id, patch) => {
    set((s) => ({ bookings: s.bookings.map((b) => (b.id === id ? { ...b, ...patch } : b)) }));
    await supabase.from("bookings").update(mapToSnake(patch)).eq("id", id);
  },
  deleteBooking: async (id) => {
    set((s) => ({ bookings: s.bookings.filter((b) => b.id !== id) }));
    await supabase.from("bookings").delete().eq("id", id);
  },
  
  addInvoice: async (inv) => {
    const { data } = await supabase.from("invoices").insert(mapToSnake(inv)).select().single();
    if (data) set((s) => ({ invoices: [...s.invoices, mapToCamel(data)] }));
  },
  updateInvoice: async (id, patch) => {
    set((s) => ({ invoices: s.invoices.map((inv) => (inv.id === id ? { ...inv, ...patch } : inv)) }));
    await supabase.from("invoices").update(mapToSnake(patch)).eq("id", id);
  },
  proposeInvoiceEdit: async (approval) => {
    const { data } = await supabase.from("invoice_edit_approvals").insert(mapToSnake(approval)).select().single();
    if (data) set((s) => ({ invoiceEditApprovals: [...s.invoiceEditApprovals, mapToCamel(data)] }));
  },

  addTrip: async (t) => {
    const { data } = await supabase.from("trips").insert(mapToSnake(t)).select().single();
    if (data) set((s) => ({ trips: [...s.trips, mapToCamel(data)] }));
  },
  updateTrip: async (id, patch) => {
    set((s) => ({ trips: s.trips.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));
    await supabase.from("trips").update(mapToSnake(patch)).eq("id", id);
  },
  deleteTrip: async (id) => {
    set((s) => ({ trips: s.trips.filter((t) => t.id !== id) }));
    await supabase.from("trips").delete().eq("id", id);
  },

  addTransfer: async (t) => {
    const { data } = await supabase.from("transfers").insert(mapToSnake(t)).select().single();
    if (data) set((s) => ({ transfers: [...s.transfers, mapToCamel(data)] }));
  },
  updateTransfer: async (id, patch) => {
    set((s) => ({ transfers: s.transfers.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));
    await supabase.from("transfers").update(mapToSnake(patch)).eq("id", id);
  },
  deleteTransfer: async (id) => {
    set((s) => ({ transfers: s.transfers.filter((t) => t.id !== id) }));
    await supabase.from("transfers").delete().eq("id", id);
  },

  addTask: async (t) => {
    const { data } = await supabase.from("koi_tasks").insert(mapToSnake(t)).select().single();
    if (data) set((s) => ({ tasks: [...s.tasks, mapToCamel(data)] }));
  },
  updateTask: async (id, patch) => {
    set((s) => ({ tasks: s.tasks.map((t) => (t.id === id ? { ...t, ...patch } : t)) }));
    await supabase.from("koi_tasks").update(mapToSnake(patch)).eq("id", id);
  },
  addTaskComment: async (c) => {
    const { data } = await supabase.from("koi_task_comments").insert(mapToSnake(c)).select().single();
    if (data) set((s) => ({ taskComments: [...s.taskComments, mapToCamel(data)] }));
  },

  dismissNotification: (id) =>
    set((s) => ({ notifications: s.notifications.filter((n) => n.id !== id) })),
  markNotificationRead: async (id) => {
    set((s) => ({ notifications: s.notifications.map((n) => n.id === id ? { ...n, read: true } : n) }));
  },
  markAllNotificationsRead: async () => {
    set((s) => ({ notifications: s.notifications.map((n) => ({ ...n, read: true })) }));
  },

  updateSettings: async (patch) => {
    set((s) => ({ settings: { ...s.settings, ...patch } }));
  },

  toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
  resetDemoData: () => {
    // Left empty for now
  },
}));

export const useSettings = () => useStore((s) => s.settings);
export const useCurrency = () => useStore((s) => s.settings.currency);
