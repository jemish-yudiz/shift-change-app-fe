import {
  User,
  ShiftHistory,
  Task,
  TaskType,
  AuthResponse,
  PreviousShiftInfo,
  CompleteTaskResponse,
} from "../types";

const BASE_URL = "http://192.168.11.35:5080/api/app";

class ApiService {
  private get token(): string | null {
    return localStorage.getItem("token");
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${BASE_URL}${endpoint}`;
    const headers = {
      "Content-Type": "application/json",
      ...(this.token ? { Authorization: `Bearer ${this.token}` } : {}),
      ...options.headers,
    };

    const response = await fetch(url, { ...options, headers });

    if (response.status === 401) {
      localStorage.removeItem("token");
      // If we are not on the login page, we might want to reload to trigger redirect
      if (!window.location.hash.includes("/login")) {
        window.location.reload();
      }
      throw new Error("Unauthorized");
    }

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.message || "API Request failed");
    }
    return data;
  }

  async login(email: string, password: string): Promise<AuthResponse> {
    const data = await this.request<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    if (data.success && data.token) {
      localStorage.setItem("token", data.token);
    }
    return data;
  }

  async getMe(): Promise<User | null> {
    if (!this.token) return null;
    try {
      const data = await this.request<{ success: boolean; user: User }>(
        "/auth/me"
      );
      return data.user;
    } catch {
      return null;
    }
  }

  async getActiveShift(): Promise<{
    success: boolean;
    hasActiveShift: boolean;
    activeShift: ShiftHistory | null;
    previousShiftInfo?: PreviousShiftInfo;
  }> {
    return this.request<{
      success: boolean;
      hasActiveShift: boolean;
      activeShift: ShiftHistory | null;
      previousShiftInfo?: PreviousShiftInfo;
    }>("/worker/shifts/active");
  }

  async startShift(): Promise<{
    success: boolean;
    shiftHistory: ShiftHistory;
  }> {
    return this.request("/worker/shifts/start", { method: "POST" });
  }

  async endShift(
    handoverNotes: string
  ): Promise<{ success: boolean; shiftHistory: ShiftHistory }> {
    return this.request("/worker/shifts/active/end", {
      method: "PUT",
      body: JSON.stringify({ handoverNotes }),
    });
  }

  async addTask(
    type: TaskType,
    title: string,
    description: string
  ): Promise<Task> {
    const data = await this.request<{ success: boolean; task: Task }>(
      "/worker/shifts/active/tasks",
      {
        method: "POST",
        body: JSON.stringify({ type, title, description }),
      }
    );
    return data.task;
  }

  async completeTask(taskId: string): Promise<CompleteTaskResponse> {
    return this.request<CompleteTaskResponse>(
      `/worker/shifts/active/tasks/${taskId}/complete`,
      {
        method: "PUT",
      }
    );
  }

  async getHistory(): Promise<ShiftHistory[]> {
    const data = await this.request<{
      success: boolean;
      shiftHistories: ShiftHistory[];
    }>("/worker/shifts/history");
    return data.shiftHistories || [];
  }

  async getDepartmentHistory(filters?: {
    status?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
  }): Promise<{
    success: boolean;
    department: string;
    count: number;
    shiftHistories: ShiftHistory[];
  }> {
    const queryParams = new URLSearchParams();
    if (filters?.status) queryParams.append("status", filters.status);
    if (filters?.startDate) queryParams.append("startDate", filters.startDate);
    if (filters?.endDate) queryParams.append("endDate", filters.endDate);
    if (filters?.limit) queryParams.append("limit", filters.limit.toString());

    const endpoint = `/worker/department/history${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    return this.request<{
      success: boolean;
      department: string;
      count: number;
      shiftHistories: ShiftHistory[];
    }>(endpoint);
  }
}

export const api = new ApiService();
