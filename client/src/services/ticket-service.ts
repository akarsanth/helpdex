import type { Ticket } from "../types/ticket";
import axiosInstance from "../utils/axios";
import { AxiosError } from "axios";

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
