export interface SyntheticSample {
  id: string;
  name: string;
  category: "Spec Benchmark" | "KYC & Identity" | "Incident Response" | "Financial & Billing" | "Edge Case Clean" | "HR & Medical";
  description: string;
  content: string;
}

export const SYNTHETIC_SAMPLES: SyntheticSample[] = [
  {
    id: "sample-spec",
    name: "Problem Statement Benchmark",
    category: "Spec Benchmark",
    description: "Exact sample input from problem specification with Name, Email, and Phone.",
    content: "Contact John Mehta at john.mehta@email.com or 9876543210 for details.",
  },
  {
    id: "sample-kyc",
    name: "KYC & Employee Onboarding Record",
    category: "KYC & Identity",
    description: "Employee dossier with PAN card, Aadhaar, personal phone, and corporate email.",
    content: `EMPLOYEE VERIFICATION RECORD
Candidate Name: Priya Sharma
Email Address: priya.sharma@techcorp.in
Contact Number: +91 9123456780
Income Tax PAN: ABCDE1234F
Aadhaar Identifier: 4532 8901 2345
Designation: Senior Research Engineer
Reporting Manager: Dr. Vikram Malhotra
Corporate Office: Bangalore Innovation Hub`,
  },
  {
    id: "sample-incident",
    name: "Security Audit & System Log",
    category: "Incident Response",
    description: "Log trail containing API tokens, operator names, IP addresses, and desk lines.",
    content: `[2026-09-05T08:30:12Z] WARN AuthGateway: Suspicious login from IP 198.51.100.24.
Session assigned to agent Alice Cooper.
API Access Token: ghp_9a8B7c6D5e4F3g2H1i0JkLmNoPqRsTuVwXyZ
Secondary reviewer: David Miller (email: d.miller@cyberdefense.org)
Emergency Contact Phone: 1-800-555-0199
Action: Block incoming requests and notify team lead Marcus Vance.`,
  },
  {
    id: "sample-finance",
    name: "Billing Dispute & Card Record",
    category: "Financial & Billing",
    description: "Payment transaction with credit card number, customer name, and phone.",
    content: `CUSTOMER PAYMENT DISPUTE
Account Holder: Robert Jenkins
Email: rjenkins@financesecure.net
Phone Number: 415-555-2671
Payment Method: Visa ending in 9812
Card Number: 4532-8921-3456-9812
Status: Disputed charge under investigation.
Assigned Support Specialist: Sarah Connor`,
  },
  {
    id: "sample-clean",
    name: "Clean Document (Zero PII - Edge Case)",
    category: "Edge Case Clean",
    description: "Technical document with no personal data to test 'No sensitive data found' handling.",
    content: `Next.js 16 Architectural Principles

The App Router leverages React Server Components to minimize client bundle payloads while maximizing rendering performance. Streaming with Suspense enables incremental UI hydration.

Key Metrics:
- First Contentful Paint: < 0.8s
- Time to Interactive: < 1.2s
- Cumulative Layout Shift: 0.00`,
  },
  {
    id: "sample-medical",
    name: "Patient Intake & Health Summary",
    category: "HR & Medical",
    description: "Clinical patient profile with doctor name, patient name, and SSN identifier.",
    content: `CLINICAL ADMISSION NOTE
Attending Physician: Dr. Elizabeth Warren
Patient Name: Michael Chang
Social Security Number: 123-45-6789
Emergency Contact: +1 (650) 555-0143
Email for Reports: m.chang92@healthmail.com
Admitting Hospital: Stanford Medical Pavilion`,
  },
];
