import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import BusinessForm from "@/components/business/business-form";

describe("Business Creation", () => {
  it("submits the business creation form", async () => {
    const handleSubmit = jest.fn().mockResolvedValue(undefined);

    // Render form in create mode (no businessId)
    render(
      <BusinessForm
        onSubmit={handleSubmit}
        submitButtonText="Create Business"
        isSubmitting={false}
      />
    );

    // Fill required fields
    fireEvent.change(screen.getByPlaceholderText("Enter business name"), {
      target: { value: "Test Business" },
    });
    fireEvent.change(screen.getByPlaceholderText("Describe the business..."), {
      target: { value: "This is a test business" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter business email"), {
      target: { value: "test@example.com" },
    });

    // Fill address fields using select boxes
    fireEvent.click(screen.getByText("Select country")); // open country menu
    fireEvent.click(screen.getByText("Nigeria")); // select country

    fireEvent.click(screen.getByText("Select state")); // open state menu
    fireEvent.click(screen.getByText("Ogun")); // select state

    fireEvent.click(screen.getByText("Select city")); // open city menu
    fireEvent.click(screen.getByText("Ifo")); // select city

    // Fill address line 1
    fireEvent.change(screen.getByPlaceholderText("Enter address line 1"), {
      target: { value: "123 Main St" },
    });

    // Fill phone fields
    fireEvent.click(screen.getByText("Country Code")); // open phone code menu
    fireEvent.click(screen.getByText("+234")); // select phone code

    fireEvent.change(screen.getByPlaceholderText("Enter phone number"), {
      target: { value: "1234567890" },
    });

    // Fill optional fields
    fireEvent.change(
      screen.getByPlaceholderText("Enter referral code (optional)"),
      {
        target: { value: "REF123" },
      }
    );

    // Simulate selecting a category from the custom select component
    fireEvent.click(screen.getByText("Select category")); // open menu
    fireEvent.click(screen.getByText("Test Category"));

    // Agree to terms (checkbox label contains "I agree to")
    fireEvent.click(screen.getByLabelText(/I agree to/i));

    // Submit the form by clicking the submit button
    fireEvent.click(screen.getByText("Create Business"));

    // Wait for the submit handler to be called and check form data
    await waitFor(() => {
      expect(handleSubmit).toHaveBeenCalled();
      const formData = handleSubmit.mock.calls[0][0];
      expect(formData.name).toBe("Test Business");
      expect(formData.about).toBe("This is a test business");
      expect(formData.email).toBe("test@example.com");
      expect(formData.addressLine1).toBe("123 Main St");
      expect(formData.city).toBe("Ifo");
      expect(formData.country).toBe("Nigeria");
      expect(formData.phoneCountryCode).toBe("+234");
      expect(formData.phoneNumber).toBe("1234567890");
      expect(formData.referralCode).toBe("REF123");
      expect(formData.category).toBe("Test Category");
      expect(formData.agreedToTerms).toBe(true);
    });
  });

  it("shows validation errors for required fields", async () => {
    const handleSubmit = jest.fn().mockResolvedValue(undefined);

    // Render form in create mode (no businessId)
    render(
      <BusinessForm
        onSubmit={handleSubmit}
        submitButtonText="Create Business"
        isSubmitting={false}
      />
    );

    // Submit without filling any fields
    fireEvent.click(screen.getByText("Create Business"));

    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText("Business name is required")).toBeInTheDocument();
      expect(screen.getByText("About section is required")).toBeInTheDocument();
      expect(screen.getByText("Invalid email address")).toBeInTheDocument();
      expect(
        screen.getByText("Address Line 1 is required")
      ).toBeInTheDocument();
      expect(screen.getByText("City is required")).toBeInTheDocument();
      expect(screen.getByText("Country is required")).toBeInTheDocument();
    });
  });

  it("requires accepting terms and conditions", async () => {
    const handleSubmit = jest.fn().mockResolvedValue(undefined);

    // Render form in create mode (no businessId)
    render(
      <BusinessForm
        onSubmit={handleSubmit}
        submitButtonText="Create Business"
        isSubmitting={false}
      />
    );

    // Fill all required fields except terms
    fireEvent.change(screen.getByPlaceholderText("Enter business name"), {
      target: { value: "Test Business" },
    });
    fireEvent.change(screen.getByPlaceholderText("Describe the business..."), {
      target: { value: "This is a test business" },
    });
    fireEvent.change(screen.getByPlaceholderText("Enter business email"), {
      target: { value: "test@example.com" },
    });

    // Fill address fields using select boxes
    fireEvent.click(screen.getByText("Select country")); // open country menu
    fireEvent.click(screen.getByText("Nigeria")); // select country

    fireEvent.click(screen.getByText("Select state")); // open state menu
    fireEvent.click(screen.getByText("Ogun")); // select state

    fireEvent.click(screen.getByText("Select city")); // open city menu
    fireEvent.click(screen.getByText("Ifo")); // select city

    // Fill address line 1
    fireEvent.change(screen.getByPlaceholderText("Enter address line 1"), {
      target: { value: "123 Main St" },
    });

    // Submit without accepting terms
    fireEvent.click(screen.getByText("Create Business"));

    // Wait for the submit handler to not be called
    await waitFor(() => {
      expect(handleSubmit).not.toHaveBeenCalled();
    });
  });
});
