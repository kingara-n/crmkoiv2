-- =====================================================================
-- Audit Logging Triggers
-- =====================================================================

-- 1. Create the generic trigger function
-- It captures the operation type (INSERT, UPDATE, DELETE) and records
-- the before/after state as a JSON diff, tagging it with the currently
-- authenticated Supabase user ID.
CREATE OR REPLACE FUNCTION audit_trigger_func()
RETURNS trigger AS $$
DECLARE
  old_data jsonb;
  new_data jsonb;
BEGIN
  IF (TG_OP = 'UPDATE') THEN
    old_data = to_jsonb(OLD);
    new_data = to_jsonb(NEW);
    INSERT INTO audit_log (actor_id, action, entity_type, entity_id, diff)
    VALUES (auth.uid(), 'updated', TG_TABLE_NAME::text, NEW.id, jsonb_build_object('old', old_data, 'new', new_data));
    RETURN NEW;
  ELSIF (TG_OP = 'DELETE') THEN
    old_data = to_jsonb(OLD);
    INSERT INTO audit_log (actor_id, action, entity_type, entity_id, diff)
    VALUES (auth.uid(), 'deleted', TG_TABLE_NAME::text, OLD.id, jsonb_build_object('old', old_data));
    RETURN OLD;
  ELSIF (TG_OP = 'INSERT') THEN
    new_data = to_jsonb(NEW);
    INSERT INTO audit_log (actor_id, action, entity_type, entity_id, diff)
    VALUES (auth.uid(), 'created', TG_TABLE_NAME::text, NEW.id, jsonb_build_object('new', new_data));
    RETURN NEW;
  END IF;
  RETURN NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Attach the trigger to all core operational tables

DROP TRIGGER IF EXISTS audit_clients_trigger ON clients;
CREATE TRIGGER audit_clients_trigger 
AFTER INSERT OR UPDATE OR DELETE ON clients 
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

DROP TRIGGER IF EXISTS audit_suppliers_trigger ON suppliers;
CREATE TRIGGER audit_suppliers_trigger 
AFTER INSERT OR UPDATE OR DELETE ON suppliers 
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

DROP TRIGGER IF EXISTS audit_leads_trigger ON leads;
CREATE TRIGGER audit_leads_trigger 
AFTER INSERT OR UPDATE OR DELETE ON leads 
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

DROP TRIGGER IF EXISTS audit_bookings_trigger ON bookings;
CREATE TRIGGER audit_bookings_trigger 
AFTER INSERT OR UPDATE OR DELETE ON bookings 
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

DROP TRIGGER IF EXISTS audit_trips_trigger ON trips;
CREATE TRIGGER audit_trips_trigger 
AFTER INSERT OR UPDATE OR DELETE ON trips 
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();

DROP TRIGGER IF EXISTS audit_invoices_trigger ON invoices;
CREATE TRIGGER audit_invoices_trigger 
AFTER INSERT OR UPDATE OR DELETE ON invoices 
FOR EACH ROW EXECUTE FUNCTION audit_trigger_func();
