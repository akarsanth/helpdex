// Define the allowed status names
export type StatusName =
  | "Open"
  | "Acknowledged"
  | "Assigned"
  | "In Progress"
  | "Resolved"
  | "Closed"
  | "Reopened";

// Define the user roles (excluding admin for status transition control)
export type UserRole = "client" | "developer" | "qa" | "admin";

// Status order (if needed for future sorting or validation)
export const STATUS_ORDER: StatusName[] = [
  "Open",
  "Acknowledged",
  "Assigned",
  "In Progress",
  "Resolved",
  "Closed",
  "Reopened",
];

// Role-based status transitions
export const STATUS_TRANSITIONS_BY_ROLE: Record<
  Exclude<UserRole, "admin">,
  Partial<Record<StatusName, StatusName>>
> = {
  client: {},
  developer: {
    Assigned: "In Progress",
    "In Progress": "Resolved",
  },
  qa: {
    Open: "Acknowledged",
    Acknowledged: "Assigned",
    Resolved: "Closed",
    Closed: "Reopened",
    Reopened: "Assigned",
  },
};

// Get next status based on role and current status
export const getNextStatusForRole = (
  current: StatusName,
  role: UserRole
): StatusName | null => {
  if (role === "admin") return null;
  return STATUS_TRANSITIONS_BY_ROLE[role]?.[current] ?? null;
};

// Returns whether assignment (selecting developer) is required for this transition
export const requiresAssignment = (
  current: StatusName,
  role: UserRole
): boolean => {
  const next = getNextStatusForRole(current, role);
  return role === "qa" && next === "Assigned";
};

export const isValidStatusTransition = (
  current: StatusName,
  target: StatusName,
  role: UserRole
): boolean => {
  if (role === "admin") return false;
  const allowedNext = STATUS_TRANSITIONS_BY_ROLE[role]?.[current];
  return allowedNext === target;
};

// Action button label for transitions
export const getActionLabel = (
  current: StatusName,
  role: UserRole
): string | null => {
  const next = getNextStatusForRole(current, role);
  if (!next) return null;

  if (requiresAssignment(current, role)) return "Assign Developer";

  const labelMap: Partial<Record<StatusName, string>> = {
    "In Progress": "Mark In Progress",
    Resolved: "Mark Resolved",
    Closed: "Mark Closed",
    Reopened: "Reopen Ticket",
    Acknowledged: "Acknowledge",
    Assigned: "Assign Ticket",
  };

  return labelMap[next] ?? `Move to ${next}`;
};
