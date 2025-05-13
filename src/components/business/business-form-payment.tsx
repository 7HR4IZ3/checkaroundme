import React, { useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

interface PaymentOptionsState {
  [key: string]: boolean;
}

interface BusinessFormPaymentProps {
  paymentOptions: PaymentOptionsState;
  setPaymentOptions: React.Dispatch<React.SetStateAction<PaymentOptionsState>>;
}

export const BusinessFormPayment: React.FC<BusinessFormPaymentProps> =
  React.memo(({ paymentOptions, setPaymentOptions }) => {
    const handleSetPaymentOption = useCallback(
      (option: keyof PaymentOptionsState, value: boolean) => {
        setPaymentOptions((prev) => ({
          ...prev,
          [option]: value,
        }));
      },
      [setPaymentOptions]
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
              <Checkbox
                id="cashPayment"
                className="data-[state=checked]:bg-primary"
                checked={paymentOptions.cash}
                onCheckedChange={(checked) =>
                  handleSetPaymentOption("cash", checked as boolean)
                }
              />
              <Label htmlFor="cashPayment">Cash Payment</Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="bank_transfers" // Use the correct key for ID and label association
                className="data-[state=checked]:bg-primary"
                checked={paymentOptions.bank_transfers} // Use the correct key
                onCheckedChange={(checked) =>
                  // Ensure the key matches the state structure
                  handleSetPaymentOption("bank_transfers", checked as boolean)
                }
              />
              {/* Ensure label 'for' matches the ID */}
              <Label htmlFor="bank_transfers">Bank Transfers</Label>
            </div>
            {/* Add more payment options similarly */}
          </div>
        </div>
      </div>
    );
  });

BusinessFormPayment.displayName = "BusinessFormPayment";
