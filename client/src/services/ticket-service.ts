import type { Ticket } from "../types/ticket";
import axiosInstance from "../utils/axios";
import { AxiosError } from "axios";
import type { StatusName } from "../utils/status-transition";
import type { MRT_ColumnFiltersState } from "material-react-table";

// Form values from Formik
export interface TicketFormValues {
  title: string;
  description: string;
  priority: string;
  category_id: string;
  attachments: string[]; // Array of uploaded attachment _ids
}

// Backend response shape
interface CreateTicketResponse {
  message: string;
  ticket: Ticket;
}

// Result type returned from the service
interface CreateTicketResponse {
  message: string;
  ticket: Ticket;
}

export interface Developer {
  _id: string;
  name: string;
  email: string;
}

// Create Ticket
export const createTicket = async (
  ticketData: TicketFormValues
): Promise<CreateTicketResponse> => {
  try {
    const response = await axiosInstance.post<CreateTicketResponse>(
      "/api/v1/tickets",
      ticketData
    );
    return response.data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ message: string }>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.message ||
        "Ticket creation failed."
    );
  }
};

// Get a single ticket by ID
export const getTicketById = async (id: string): Promise<Ticket> => {
  try {
    const response = await axiosInstance.get<{
      success: boolean;
      data: Ticket;
    }>(`/api/v1/tickets/${id}`);
    return response.data.data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ message: string }>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to fetch ticket."
    );
  }
};

// update ticket status
export const updateTicketStatus = async (
  ticketId: string,
  status: StatusName
) => {
  const { data } = await axiosInstance.patch(
    `/api/v1/tickets/${ticketId}/status`,
    { status }
  );
  return data.ticket;
};

// -----------------
// Fetch Developers (for assignment)
// -----------------
export const fetchDevelopers = async (): Promise<Developer[]> => {
  try {
    const response = await axiosInstance.get<{
      success: boolean;
      developers: Developer[];
    }>("/api/v1/users/developers");
    return response.data.developers;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ message: string }>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to fetch developers."
    );
  }
};

// -----------------
// Assign Developers (for assignment)
// -----------------
export const assignDeveloper = async (
  ticketId: string,
  developerId: string
) => {
  try {
    const { data } = await axiosInstance.patch(
      `/api/v1/tickets/${ticketId}/assign`,
      { developerId }
    );
    return data.ticket;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ message: string }>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.message ||
        "Assignment failed"
    );
  }
};

// Fetch ticket
interface FetchTicketsOptions {
  pageIndex: number;
  pageSize: number;
  search: string;
  filters: MRT_ColumnFiltersState;
}

interface FetchTicketsResponse {
  tickets: Ticket[];
  total: number;
}

export const fetchTickets = async (
  options?: FetchTicketsOptions
): Promise<FetchTicketsResponse> => {
  try {
    console.log(options?.filters);
    const response = await axiosInstance.get<FetchTicketsResponse>(
      "/api/v1/tickets",
      {
        params: {
          page: (options?.pageIndex ?? 0) + 1,
          pageSize: options?.pageSize ?? 10,
          search: options?.search ?? "",
          filters: JSON.stringify(options?.filters),
        },
      }
    );
    return response.data;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ message: string }>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to fetch tickets."
    );
  }
};

// ticket update
interface UpdateTicketPayload {
  title?: string;
  description?: string;
  priority?: string;
  category_id?: string;
  deadline?: string;
}

export const updateTicketDetails = async (
  ticketId: string,
  data: UpdateTicketPayload
): Promise<Ticket> => {
  try {
    const response = await axiosInstance.patch<{ ticket: Ticket }>(
      `/api/v1/tickets/${ticketId}`,
      data
    );
    return response.data.ticket;
  } catch (error: unknown) {
    const axiosError = error as AxiosError<{ message: string }>;
    throw new Error(
      axiosError.response?.data?.message ||
        axiosError.message ||
        "Failed to update ticket."
    );
  }
};
