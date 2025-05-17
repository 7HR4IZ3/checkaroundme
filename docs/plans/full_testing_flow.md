# Testing Setup Plan

This document outlines the plan for setting up comprehensive testing (unit, integration, and end-to-end) for the application.

## 1. Choose Testing Frameworks

*   **Unit/Integration Tests:** Jest combined with React Testing Library.
    *   Jest: A JavaScript Testing Framework with a focus on simplicity.
    *   React Testing Library: Provides utilities for testing React components in a user-centric way.
*   **End-to-End Tests:** Playwright.
    *   Playwright: Enables reliable end-to-end testing for modern web apps across major browsers.

## 2. Install Dependencies

Add the necessary testing libraries and their types to the `devDependencies` in `package.json`.

```bash
bun add -d jest @types/jest ts-jest react-testing-library @testing-library/react @testing-library/jest-dom playwright @playwright/test
```
*(Note: Use `npm install --save-dev` or `yarn add --dev` if not using Bun)*

## 3. Configure Testing Environment

*   **Jest:** Create a `jest.config.js` file in the project root. Configure it to use `ts-jest` for TypeScript support and include setup for `@testing-library/jest-dom`.
*   **Playwright:** Initialize Playwright which will create `playwright.config.ts` and example tests.

    ```bash
    bunx playwright install # Install necessary browser binaries
    bunx playwright test --init # Initialize Playwright configuration
    ```
    *(Note: Use `npx` if not using Bun)*

## 4. Structure Test Files

*   **Unit/Integration Tests:** Place test files in a `__tests__` directory within the directory containing the code being tested (e.g., `src/lib/__tests__/utils.test.ts`, `src/lib/trpc/routers/__tests__/business.test.ts`).
*   **End-to-End Tests:** Create a dedicated directory, e.g., `e2e`, in the project root to house Playwright tests.

## 5. Write Tests

*   **Unit Tests:** Focus on isolated functions and modules.
    *   Example: Test utility functions in `src/lib/utils.ts`.
*   **Integration Tests:** Test interactions between components or layers.
    *   Example: Test tRPC router procedures (`src/lib/trpc/routers/`) ensuring correct data handling and interaction with services (requires mocking external dependencies like Appwrite or Redis). Test component interactions with hooks or context.
*   **Component Tests:** Test React components using React Testing Library, simulating user interactions and verifying rendered output.
    *   Example: Test form components (`src/components/business/business-form.tsx`) for input handling and submission.
*   **End-to-End Tests:** Simulate complete user workflows using Playwright.
    *   Example: Test the business creation flow (`src/app/business/create/page.tsx`) from filling the form to successful submission and display.

## 6. Add Test Scripts

Add scripts to the `scripts` section of `package.json` to run tests easily:

```json
"scripts": {
  "test": "jest",
  "test:e2e": "playwright test",
  "test:watch": "jest --watch"
}
```

## 7. Integrate into CI/CD (Future Consideration)

Set up automated test runs in your CI/CD pipeline (e.g., Vercel, GitHub Actions) to ensure code changes do not introduce regressions.

## Appwrite Testing Instances

It is recommended to set up separate Appwrite instances for testing environments to isolate test data from development or production data. This ensures test repeatability and prevents data corruption. This can be configured using environment variables specific to the testing environment.

```mermaid
graph TD
    A[Application] --> B(End-to-End Tests);
    B --> C(Integration Tests);
    C --> D(Unit Tests);

    D -- Tests individual functions/modules --> E[Utility Functions, Small Modules];
    C -- Tests interactions between units --> F[tRPC Routers, Component Interactions, Service Integrations];
    B -- Tests full user flows --> G[Pages, Forms, Navigation];

    F -- Mocks/Interacts with --> H[Appwrite, Redis, External APIs];
    G -- Interacts with --> H;