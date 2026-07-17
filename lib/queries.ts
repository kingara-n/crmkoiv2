import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "./supabase";
import { mapToCamel, mapToSnake, useStore } from "./store";
import {
  SEED_CLIENTS, SEED_SUPPLIERS, SEED_LEADS, SEED_BOOKINGS,
  SEED_TRIPS, SEED_POS, SEED_INVOICES, SEED_TEAM, SEED_TASKS
} from "./seed";

const withFallback = async <T>(promise: any, fallback: T[]): Promise<T[]> => {
  try {
    const { data, error } = await promise;
    if (error) throw error;
    return data || [];
  } catch {
    return fallback;
  }
};

// 1. Clients Hook
export function useClientsQuery() {
  return useQuery({
    queryKey: ["clients"],
    queryFn: async () => {
      const data = await withFallback(supabase.from("clients").select("*"), SEED_CLIENTS);
      return data.map(mapToCamel);
    },
  });
}

// 2. Suppliers Hook
export function useSuppliersQuery() {
  return useQuery({
    queryKey: ["suppliers"],
    queryFn: async () => {
      const data = await withFallback(supabase.from("suppliers").select("*"), SEED_SUPPLIERS);
      return data.map(mapToCamel);
    },
  });
}

// 3. Bookings Hook
export function useBookingsQuery() {
  return useQuery({
    queryKey: ["bookings"],
    queryFn: async () => {
      const data = await withFallback(supabase.from("bookings").select("*"), SEED_BOOKINGS);
      return data.map(mapToCamel);
    },
  });
}

// 4. Leads Hook
export function useLeadsQuery() {
  return useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const data = await withFallback(supabase.from("leads").select("*"), SEED_LEADS);
      return data.map(mapToCamel);
    },
  });
}

// 5. Trips Hook
export function useTripsQuery() {
  return useQuery({
    queryKey: ["trips"],
    queryFn: async () => {
      const data = await withFallback(supabase.from("trips").select("*"), SEED_TRIPS);
      return data.map(mapToCamel);
    },
  });
}

// 6. Invoices Hook
export function useInvoicesQuery() {
  return useQuery({
    queryKey: ["invoices"],
    queryFn: async () => {
      const data = await withFallback(supabase.from("invoices").select("*"), SEED_INVOICES);
      return data.map(mapToCamel);
    },
  });
}

// 7. Purchase Orders Hook
export function usePurchaseOrdersQuery() {
  return useQuery({
    queryKey: ["purchaseOrders"],
    queryFn: async () => {
      const data = await withFallback(supabase.from("koi_purchase_orders").select("*"), SEED_POS);
      return data.map(mapToCamel);
    },
  });
}

// 8. Team Hook
export function useTeamQuery() {
  return useQuery({
    queryKey: ["team"],
    queryFn: async () => {
      const { data, error } = await supabase.from("profiles").select("*");
      if (error || !data || data.length === 0) {
        return SEED_TEAM.map(mapToCamel);
      }
      return data.map((t: any) => {
        const camel = mapToCamel(t);
        return {
          ...camel,
          name: camel.name || `${camel.firstName || ""} ${camel.lastName || ""}`.trim() || "Unknown User"
        };
      });
    },
  });
}

// 9. Tasks Hook
export function useTasksQuery() {
  return useQuery({
    queryKey: ["tasks"],
    queryFn: async () => {
      const data = await withFallback(supabase.from("koi_tasks").select("*"), SEED_TASKS);
      return data.map(mapToCamel);
    },
  });
}

// 10. Invoice Approvals Hook
export function useInvoiceApprovalsQuery() {
  return useQuery({
    queryKey: ["invoiceApprovals"],
    queryFn: async () => {
      const data = await withFallback(supabase.from("invoice_edit_approvals").select("*"), []);
      return data.map(mapToCamel);
    },
  });
}

// 11. Approve Supplier Mutation
export function useApproveSupplierMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("suppliers")
        .update({ status: "approved" })
        .eq("id", id);
      if (error) throw error;
      
      useStore.setState((s) => ({
        suppliers: s.suppliers.map((sup) => (sup.id === id ? { ...sup, status: "approved" } : sup))
      }));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
}

// 12. Reject Supplier Mutation
export function useRejectSupplierMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("suppliers")
        .update({ status: "rejected" })
        .eq("id", id);
      if (error) throw error;

      useStore.setState((s) => ({
        suppliers: s.suppliers.map((sup) => (sup.id === id ? { ...sup, status: "rejected" } : sup))
      }));
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["suppliers"] });
    },
  });
}
