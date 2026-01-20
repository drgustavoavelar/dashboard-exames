import { useState } from "react";
import { useCreateDataPoint } from "@/hooks/use-data-points";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

export function CreateDataPointDialog() {
  const [open, setOpen] = useState(false);
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");
  const { toast } = useToast();
  
  const createMutation = useCreateDataPoint();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simple coercion manually for form inputs
    const numValue = parseInt(value, 10);
    
    if (isNaN(numValue)) {
      toast({
        title: "Invalid Input",
        description: "Value must be a number",
        variant: "destructive",
      });
      return;
    }

    try {
      await createMutation.mutateAsync({
        label,
        value: numValue,
      });
      
      toast({
        title: "Success",
        description: "Data point added successfully",
      });
      setOpen(false);
      setLabel("");
      setValue("");
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add data point",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="gap-2 bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/25 rounded-xl transition-all hover:scale-105 active:scale-95">
          <Plus className="h-4 w-4" />
          Add Data Point
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-card border-border shadow-2xl rounded-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-display font-bold">Add New Data</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 pt-4">
          <div className="space-y-2">
            <Label htmlFor="label" className="text-muted-foreground font-medium">Metric Label</Label>
            <Input
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Monthly Revenue"
              className="bg-secondary/50 border-border focus:ring-primary/20 rounded-xl"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="value" className="text-muted-foreground font-medium">Value</Label>
            <Input
              id="value"
              type="number"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="0"
              className="bg-secondary/50 border-border focus:ring-primary/20 rounded-xl"
              required
            />
          </div>
          <div className="flex justify-end pt-2">
            <Button 
              type="submit" 
              disabled={createMutation.isPending}
              className="w-full rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold h-11"
            >
              {createMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Adding...
                </>
              ) : (
                "Create Data Point"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
