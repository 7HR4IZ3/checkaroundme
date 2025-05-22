import React, { useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  UseFormRegister,
  FieldErrors,
  Control,
  UseFormSetValue,
  UseFormWatch,
  Controller,
} from "react-hook-form";
import { BusinessFormValues } from "./business-form"; // Import the main form values type

interface BusinessFormPaymentProps {
  // Pass RHF props down based on the main form values
  register: UseFormRegister<BusinessFormValues>;
  errors: FieldErrors<BusinessFormValues>;
  control: Control<BusinessFormValues>;
  setValue: UseFormSetValue<BusinessFormValues>;
  watch: UseFormWatch<BusinessFormValues>;
}

export const BusinessFormPayment: React.FC<BusinessFormPaymentProps> = ({
  control,
  setValue,
  watch,
  errors,
}) => {
  // Watch the paymentOptions array from RHF
  const paymentOptions = watch("paymentOptions") ?? [];

  const handleSetPaymentOption = useCallback(
    (option: string, value: boolean) => {
      // Get the current array, add/remove the option based on the checkbox value
      const currentOptions = watch("paymentOptions") ?? [];
      let newOptions = [...currentOptions];

      if (value && !newOptions.includes(option)) {
        newOptions.push(option);
      } else if (!value && newOptions.includes(option)) {
        newOptions = newOptions.filter((item) => item !== option);
      }

      setValue("paymentOptions", newOptions); // Update RHF state
    },
    [setValue, watch]
  );

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold border-b pb-2">Payment Options</h3>
      <div>
        <p className="text-sm text-muted-foreground mb-2">
          Select payment options your business accepts
        </p>
        <div className="flex gap-4 mt-2">
          <div className="flex items-center space-x-2">
            <Controller
              name="paymentOptions" // Name corresponds to the field in BusinessFormValues
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="cashPayment"
                  className="data-[state=checked]:bg-primary"
                  checked={paymentOptions.includes("cash")} // Check if 'cash' is in the array
                  onCheckedChange={(checked) =>
                    handleSetPaymentOption("cash", checked as boolean)
                  }
                />
              )}
            />
            <Label htmlFor="cashPayment">Cash Payment</Label>
          </div>
          <div className="flex items-center space-x-2">
            <Controller
              name="paymentOptions" // Name corresponds to the field in BusinessFormValues
              control={control}
              render={({ field }) => (
                <Checkbox
                  id="bank_transfers" // Use the correct key for ID and label association
                  className="data-[state=checked]:bg-primary"
                  checked={paymentOptions.includes("bank_transfers")} // Check if 'bank_transfers' is in the array
                  onCheckedChange={(checked) =>
                    handleSetPaymentOption("bank_transfers", checked as boolean)
                  }
                />
              )}
            />
            {/* Ensure label 'for' matches the ID */}
            <Label htmlFor="bank_transfers">Bank Transfers</Label>
          </div>
          {/* Add more payment options similarly */}
        </div>
      </div>
      {errors.paymentOptions && (
        <p className="text-red-500 text-sm mt-1">
          {errors.paymentOptions.message}
        </p>
      )}
    </div>
  );
};

BusinessFormPayment.displayName = "BusinessFormPayment";
