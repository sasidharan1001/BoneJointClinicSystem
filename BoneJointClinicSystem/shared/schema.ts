import { pgTable, text, serial, integer, boolean, timestamp, decimal } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const patients = pgTable("patients", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  age: integer("age").notNull(),
  gender: text("gender").notNull(),
  bloodGroup: text("blood_group"),
  phone: text("phone").notNull(),
  address: text("address"),
  emergencyContact: text("emergency_contact"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const visits = pgTable("visits", {
  id: serial("id").primaryKey(),
  patientId: integer("patient_id").notNull(),
  visitCode: text("visit_code").notNull().unique(),
  tokenNumber: text("token_number"),
  status: text("status").notNull().default("waiting"), // waiting, in_consultation, completed, cancelled
  visitDate: timestamp("visit_date").defaultNow().notNull(),
  chiefComplaint: text("chief_complaint"),
  notes: text("notes"),
});

export const consultations = pgTable("consultations", {
  id: serial("id").primaryKey(),
  visitId: integer("visit_id").notNull(),
  chiefComplaint: text("chief_complaint"),
  historyOfPresentIllness: text("history_of_present_illness"),
  pastMedicalHistory: text("past_medical_history"),
  familyHistory: text("family_history"),
  socialHistory: text("social_history"),
  allergies: text("allergies"),
  currentMedications: text("current_medications").array(),
  vitalSigns: text("vital_signs"), // JSON string for BP, pulse, temp, etc.
  generalExamination: text("general_examination"),
  systemicExamination: text("systemic_examination"),
  clinicalFindings: text("clinical_findings"),
  provisionalDiagnosis: text("provisional_diagnosis"),
  differentialDiagnosis: text("differential_diagnosis"),
  investigationsAdvised: text("investigations_advised").array(),
  treatmentPlan: text("treatment_plan"),
  advice: text("advice"),
  followUpDate: timestamp("follow_up_date"),
  followUpInstructions: text("follow_up_instructions"),
  criticalNotes: text("critical_notes"),
  doctorName: text("doctor_name"),
  consultationDate: timestamp("consultation_date").defaultNow().notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const prescriptions = pgTable("prescriptions", {
  id: serial("id").primaryKey(),
  visitId: integer("visit_id").notNull(),
  medicines: text("medicines").array(),
  dosage: text("dosage").array(),
  instructions: text("instructions"),
  prescribedBy: text("prescribed_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const diagnostics = pgTable("diagnostics", {
  id: serial("id").primaryKey(),
  visitId: integer("visit_id").notNull(),
  testType: text("test_type").notNull(), // xray, mri, ct_scan, etc.
  testName: text("test_name").notNull(),
  results: text("results"),
  reportUrl: text("report_url"),
  status: text("status").notNull().default("pending"), // pending, completed, reported
  orderedBy: text("ordered_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const labTests = pgTable("lab_tests", {
  id: serial("id").primaryKey(),
  visitId: integer("visit_id").notNull(),
  testName: text("test_name").notNull(),
  testCategory: text("test_category"),
  results: text("results"),
  normalRange: text("normal_range"),
  status: text("status").notNull().default("pending"), // pending, completed, reported
  orderedBy: text("ordered_by"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const physioSessions = pgTable("physio_sessions", {
  id: serial("id").primaryKey(),
  visitId: integer("visit_id").notNull(),
  sessionType: text("session_type").notNull(),
  duration: integer("duration"), // in minutes
  exercises: text("exercises").array(),
  notes: text("notes"),
  therapistName: text("therapist_name"),
  status: text("status").notNull().default("scheduled"), // scheduled, completed, cancelled
  sessionDate: timestamp("session_date"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  visitId: integer("visit_id").notNull(),
  amount: decimal("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(), // cash, card, upi
  paymentStatus: text("payment_status").notNull().default("pending"), // pending, completed, failed
  billItems: text("bill_items").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Insert schemas
export const insertPatientSchema = createInsertSchema(patients).omit({
  id: true,
  createdAt: true,
});

export const insertVisitSchema = createInsertSchema(visits).omit({
  id: true,
  visitCode: true,
  visitDate: true,
});

export const insertPrescriptionSchema = createInsertSchema(prescriptions).omit({
  id: true,
  createdAt: true,
});

export const insertDiagnosticSchema = createInsertSchema(diagnostics).omit({
  id: true,
  createdAt: true,
});

export const insertLabTestSchema = createInsertSchema(labTests).omit({
  id: true,
  createdAt: true,
});

export const insertPhysioSessionSchema = createInsertSchema(physioSessions).omit({
  id: true,
  createdAt: true,
});

export const insertConsultationSchema = createInsertSchema(consultations).omit({
  id: true,
  consultationDate: true,
  createdAt: true,
});

export const insertPaymentSchema = createInsertSchema(payments).omit({
  id: true,
  createdAt: true,
});

// Types
export type Patient = typeof patients.$inferSelect;
export type InsertPatient = z.infer<typeof insertPatientSchema>;

export type Consultation = typeof consultations.$inferSelect;
export type InsertConsultation = z.infer<typeof insertConsultationSchema>;

export type Visit = typeof visits.$inferSelect;
export type InsertVisit = z.infer<typeof insertVisitSchema>;

export type Prescription = typeof prescriptions.$inferSelect;
export type InsertPrescription = z.infer<typeof insertPrescriptionSchema>;

export type Diagnostic = typeof diagnostics.$inferSelect;
export type InsertDiagnostic = z.infer<typeof insertDiagnosticSchema>;

export type LabTest = typeof labTests.$inferSelect;
export type InsertLabTest = z.infer<typeof insertLabTestSchema>;

export type PhysioSession = typeof physioSessions.$inferSelect;
export type InsertPhysioSession = z.infer<typeof insertPhysioSessionSchema>;

export type Payment = typeof payments.$inferSelect;
export type InsertPayment = z.infer<typeof insertPaymentSchema>;

// Extended types for frontend
export type PatientWithVisits = Patient & {
  visits: Visit[];
  currentVisit?: Visit;
};

export type VisitWithDetails = Visit & {
  patient: Patient;
  consultation?: Consultation;
  prescriptions: Prescription[];
  diagnostics: Diagnostic[];
  labTests: LabTest[];
  physioSessions: PhysioSession[];
  payments: Payment[];
};
