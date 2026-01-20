import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, type InsertDataPoint } from "@shared/routes";
import { z } from "zod";

export function useDataPoints() {
  return useQuery({
    queryKey: [api.dataPoints.list.path],
    queryFn: async () => {
      const res = await fetch(api.dataPoints.list.path);
      if (!res.ok) throw new Error("Failed to fetch data points");
      return api.dataPoints.list.responses[200].parse(await res.json());
    },
  });
}

export function useCreateDataPoint() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (data: InsertDataPoint) => {
      // Validate before sending (client-side validation)
      const validated = api.dataPoints.create.input.parse(data);
      
      const res = await fetch(api.dataPoints.create.path, {
        method: api.dataPoints.create.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
      });

      if (!res.ok) {
        if (res.status === 400) {
           const error = api.dataPoints.create.responses[400].parse(await res.json());
           throw new Error(error.message);
        }
        throw new Error("Failed to create data point");
      }
      return api.dataPoints.create.responses[201].parse(await res.json());
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [api.dataPoints.list.path] });
    },
  });
}
