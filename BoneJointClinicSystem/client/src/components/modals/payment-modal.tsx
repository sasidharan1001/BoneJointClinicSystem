import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertPaymentSchema, type InsertPayment, type Patient, type Visit } from "@shared/schema";
import { z } from "zod";

const paymentFormSchema = insertPaymentSchema.extend({
  amount: z.string().min(1, "Amount is required"),
});

type PaymentFormData = z.infer<typeof paymentFormSchema>;

interface PaymentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  patient: Patient;
  visit?: Visit;
}

export default function PaymentModal({ 
  open, 
  onOpenChange, 
  patient, 
  visit 
}: PaymentModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const form = useForm<PaymentFormData>({
    resolver: zodResolver(paymentFormSchema),
    defaultValues: {
      visitId: visit?.id || 0,
      amount: "",
      paymentMethod: "",
      paymentStatus: "pending",
      billItems: [],
    },
  });

  const createPaymentMutation = useMutation({
    mutationFn: async (data: PaymentFormData) => {
      const paymentData: InsertPayment = {
        ...data,
        amount: data.amount,
      };
      const response = await apiRequest("POST", "/api/payments", paymentData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/patients"] });
      toast({
        title: "Success",
        description: "Payment recorded successfully",
      });
      onOpenChange(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to record payment",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: PaymentFormData) => {
    createPaymentMutation.mutate(data);
  };

  const billItems = [
    { name: "Consultation Fee", amount: 500 },
    { name: "X-ray", amount: 300 },
    { name: "Medicines", amount: 200 },
  ];

  const totalAmount = billItems.reduce((sum, item) => sum + item.amount, 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Payment & Billing</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Patient Info */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-medium text-gray-900">Patient Details</h4>
            {patient && (
              <>
                <p className="text-sm text-gray-600">
                  {patient.firstName} {patient.lastName}
                </p>
                <p className="text-sm text-gray-600">{patient.phone}</p>
              </>
            )}
            {visit && (
              <Badge variant="outline" className="mt-2">
                Visit: {visit.visitCode}
              </Badge>
            )}
          </div>

          {/* Bill Items */}
          <div className="space-y-3">
            <h4 className="font-medium text-gray-900">Bill Items</h4>
            <div className="border rounded-lg">
              {billItems.map((item, index) => (
                <div key={index} className="flex justify-between items-center p-3 border-b last:border-b-0">
                  <span className="text-sm text-gray-700">{item.name}</span>
                  <span className="font-medium">₹{item.amount}</span>
                </div>
              ))}
              <div className="flex justify-between items-center p-3 bg-gray-50 font-semibold">
                <span>Total Amount</span>
                <span>₹{totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Payment Form */}
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Amount</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Enter amount"
                        value={field.value || totalAmount.toString()}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="paymentMethod"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Payment Method</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select payment method" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cash">Cash</SelectItem>
                        <SelectItem value="card">Card</SelectItem>
                        <SelectItem value="upi">UPI</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex justify-end space-x-3 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                  disabled={createPaymentMutation.isPending}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={createPaymentMutation.isPending}>
                  {createPaymentMutation.isPending ? "Processing..." : "Record Payment"}
                </Button>
              </div>
            </form>
          </Form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
