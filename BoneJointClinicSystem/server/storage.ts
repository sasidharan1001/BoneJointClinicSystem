import {
  type Patient,
  type InsertPatient,
  type Visit,
  type InsertVisit,
  type Consultation,
  type InsertConsultation,
  type Prescription,
  type InsertPrescription,
  type Diagnostic,
  type InsertDiagnostic,
  type LabTest,
  type InsertLabTest,
  type PhysioSession,
  type InsertPhysioSession,
  type Payment,
  type InsertPayment,
  type PatientWithVisits,
  type VisitWithDetails,
} from "@shared/schema";

export interface IStorage {
  // Patient methods
  getAllPatients(): Promise<Patient[]>;
  getPatient(id: number): Promise<Patient | undefined>;
  getPatientWithVisits(id: number): Promise<PatientWithVisits | undefined>;
  searchPatients(query: string): Promise<Patient[]>;
  createPatient(patient: InsertPatient): Promise<Patient>;
  updatePatient(id: number, patient: Partial<InsertPatient>): Promise<Patient | undefined>;
  deletePatient(id: number): Promise<boolean>;

  // Visit methods
  getAllVisits(): Promise<Visit[]>;
  getVisit(id: number): Promise<Visit | undefined>;
  getVisitWithDetails(id: number): Promise<VisitWithDetails | undefined>;
  getVisitByCode(visitCode: string): Promise<Visit | undefined>;
  getTodaysVisits(): Promise<Visit[]>;
  createVisit(visit: InsertVisit): Promise<Visit>;
  updateVisit(id: number, visit: Partial<InsertVisit>): Promise<Visit | undefined>;
  generateVisitCode(): string;
  generateTokenNumber(): string;

  // Consultation methods
  createConsultation(consultation: InsertConsultation): Promise<Consultation>;
  getConsultationsByVisit(visitId: number): Promise<Consultation[]>;
  getConsultation(id: number): Promise<Consultation | undefined>;
  updateConsultation(id: number, consultation: Partial<InsertConsultation>): Promise<Consultation | undefined>;

  // Prescription methods
  createPrescription(prescription: InsertPrescription): Promise<Prescription>;
  getPrescriptionsByVisit(visitId: number): Promise<Prescription[]>;
  updatePrescription(id: number, prescription: Partial<InsertPrescription>): Promise<Prescription | undefined>;

  // Diagnostic methods
  createDiagnostic(diagnostic: InsertDiagnostic): Promise<Diagnostic>;
  getDiagnosticsByVisit(visitId: number): Promise<Diagnostic[]>;
  updateDiagnostic(id: number, diagnostic: Partial<InsertDiagnostic>): Promise<Diagnostic | undefined>;

  // Lab test methods
  createLabTest(labTest: InsertLabTest): Promise<LabTest>;
  getLabTestsByVisit(visitId: number): Promise<LabTest[]>;
  updateLabTest(id: number, labTest: Partial<InsertLabTest>): Promise<LabTest | undefined>;

  // Physio session methods
  createPhysioSession(session: InsertPhysioSession): Promise<PhysioSession>;
  getPhysioSessionsByVisit(visitId: number): Promise<PhysioSession[]>;
  updatePhysioSession(id: number, session: Partial<InsertPhysioSession>): Promise<PhysioSession | undefined>;

  // Payment methods
  createPayment(payment: InsertPayment): Promise<Payment>;
  getPaymentsByVisit(visitId: number): Promise<Payment[]>;
  updatePayment(id: number, payment: Partial<InsertPayment>): Promise<Payment | undefined>;

  // Statistics methods
  getTodaysStats(): Promise<{
    totalPatients: number;
    completed: number;
    inProgress: number;
    pending: number;
  }>;
}

export class MemStorage implements IStorage {
  private patients: Map<number, Patient> = new Map();
  private visits: Map<number, Visit> = new Map();
  private consultations: Map<number, Consultation> = new Map();
  private prescriptions: Map<number, Prescription> = new Map();
  private diagnostics: Map<number, Diagnostic> = new Map();
  private labTests: Map<number, LabTest> = new Map();
  private physioSessions: Map<number, PhysioSession> = new Map();
  private payments: Map<number, Payment> = new Map();

  private currentPatientId = 1;
  private currentVisitId = 1;
  private currentConsultationId = 1;
  private currentPrescriptionId = 1;
  private currentDiagnosticId = 1;
  private currentLabTestId = 1;
  private currentPhysioSessionId = 1;
  private currentPaymentId = 1;
  private currentTokenNumber = 1;

  // Patient methods
  async getAllPatients(): Promise<Patient[]> {
    return Array.from(this.patients.values());
  }

  async getPatient(id: number): Promise<Patient | undefined> {
    return this.patients.get(id);
  }

  async getPatientWithVisits(id: number): Promise<PatientWithVisits | undefined> {
    const patient = this.patients.get(id);
    if (!patient) return undefined;

    const visits = Array.from(this.visits.values()).filter(v => v.patientId === id);
    const currentVisit = visits.find(v => v.status === "waiting" || v.status === "in_consultation");

    return {
      ...patient,
      visits,
      currentVisit,
    };
  }

  async searchPatients(query: string): Promise<Patient[]> {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.patients.values()).filter(
      patient =>
        patient.firstName.toLowerCase().includes(lowerQuery) ||
        patient.lastName.toLowerCase().includes(lowerQuery) ||
        patient.phone.includes(query)
    );
  }

  async createPatient(insertPatient: InsertPatient): Promise<Patient> {
    const id = this.currentPatientId++;
    const patient: Patient = {
      ...insertPatient,
      id,
      bloodGroup: insertPatient.bloodGroup || null,
      address: insertPatient.address || null,
      emergencyContact: insertPatient.emergencyContact || null,
      createdAt: new Date(),
    };
    this.patients.set(id, patient);
    return patient;
  }

  async updatePatient(id: number, updateData: Partial<InsertPatient>): Promise<Patient | undefined> {
    const patient = this.patients.get(id);
    if (!patient) return undefined;

    const updatedPatient = { ...patient, ...updateData };
    this.patients.set(id, updatedPatient);
    return updatedPatient;
  }

  async deletePatient(id: number): Promise<boolean> {
    return this.patients.delete(id);
  }

  // Visit methods
  async getAllVisits(): Promise<Visit[]> {
    return Array.from(this.visits.values());
  }

  async getVisit(id: number): Promise<Visit | undefined> {
    return this.visits.get(id);
  }

  async getVisitWithDetails(id: number): Promise<VisitWithDetails | undefined> {
    const visit = this.visits.get(id);
    if (!visit) return undefined;

    const patient = this.patients.get(visit.patientId);
    if (!patient) return undefined;

    const consultation = Array.from(this.consultations.values()).find(c => c.visitId === id);
    const prescriptions = Array.from(this.prescriptions.values()).filter(p => p.visitId === id);
    const diagnostics = Array.from(this.diagnostics.values()).filter(d => d.visitId === id);
    const labTests = Array.from(this.labTests.values()).filter(l => l.visitId === id);
    const physioSessions = Array.from(this.physioSessions.values()).filter(s => s.visitId === id);
    const payments = Array.from(this.payments.values()).filter(p => p.visitId === id);

    return {
      ...visit,
      patient,
      consultation,
      prescriptions,
      diagnostics,
      labTests,
      physioSessions,
      payments,
    };
  }

  async getVisitByCode(visitCode: string): Promise<Visit | undefined> {
    return Array.from(this.visits.values()).find(v => v.visitCode === visitCode);
  }

  async getTodaysVisits(): Promise<Visit[]> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return Array.from(this.visits.values()).filter(visit => {
      const visitDate = new Date(visit.visitDate);
      return visitDate >= today && visitDate < tomorrow;
    });
  }

  async createVisit(insertVisit: InsertVisit): Promise<Visit> {
    const id = this.currentVisitId++;
    const visitCode = this.generateVisitCode();
    const tokenNumber = this.generateTokenNumber();
    
    const visit: Visit = {
      ...insertVisit,
      id,
      visitCode,
      tokenNumber: tokenNumber,
      status: insertVisit.status || "waiting",
      chiefComplaint: insertVisit.chiefComplaint || null,
      notes: insertVisit.notes || null,
      visitDate: new Date(),
    };
    this.visits.set(id, visit);
    return visit;
  }

  async updateVisit(id: number, updateData: Partial<InsertVisit>): Promise<Visit | undefined> {
    const visit = this.visits.get(id);
    if (!visit) return undefined;

    const updatedVisit = { ...visit, ...updateData };
    this.visits.set(id, updatedVisit);
    return updatedVisit;
  }

  generateVisitCode(): string {
    const today = new Date();
    const dateStr = today.toISOString().slice(2, 10).replace(/-/g, '');
    const sequence = String(this.currentVisitId).padStart(3, '0');
    return `V${dateStr}${sequence}`;
  }

  generateTokenNumber(): string {
    return `T-${String(this.currentTokenNumber++).padStart(3, '0')}`;
  }

  // Consultation methods
  async createConsultation(insertConsultation: InsertConsultation): Promise<Consultation> {
    const id = this.currentConsultationId++;
    const consultation: Consultation = {
      ...insertConsultation,
      id,
      currentMedications: insertConsultation.currentMedications || null,
      investigationsAdvised: insertConsultation.investigationsAdvised || null,
      followUpDate: insertConsultation.followUpDate || null,
      followUpInstructions: insertConsultation.followUpInstructions || null,
      criticalNotes: insertConsultation.criticalNotes || null,
      doctorName: insertConsultation.doctorName || null,
      chiefComplaint: insertConsultation.chiefComplaint || null,
      historyOfPresentIllness: insertConsultation.historyOfPresentIllness || null,
      pastMedicalHistory: insertConsultation.pastMedicalHistory || null,
      familyHistory: insertConsultation.familyHistory || null,
      socialHistory: insertConsultation.socialHistory || null,
      allergies: insertConsultation.allergies || null,
      vitalSigns: insertConsultation.vitalSigns || null,
      generalExamination: insertConsultation.generalExamination || null,
      systemicExamination: insertConsultation.systemicExamination || null,
      clinicalFindings: insertConsultation.clinicalFindings || null,
      provisionalDiagnosis: insertConsultation.provisionalDiagnosis || null,
      differentialDiagnosis: insertConsultation.differentialDiagnosis || null,
      treatmentPlan: insertConsultation.treatmentPlan || null,
      advice: insertConsultation.advice || null,
      consultationDate: new Date(),
      createdAt: new Date(),
    };
    this.consultations.set(id, consultation);
    return consultation;
  }

  async getConsultationsByVisit(visitId: number): Promise<Consultation[]> {
    return Array.from(this.consultations.values()).filter(c => c.visitId === visitId);
  }

  async getConsultation(id: number): Promise<Consultation | undefined> {
    return this.consultations.get(id);
  }

  async updateConsultation(id: number, updateData: Partial<InsertConsultation>): Promise<Consultation | undefined> {
    const consultation = this.consultations.get(id);
    if (!consultation) return undefined;

    const updatedConsultation = { ...consultation, ...updateData };
    this.consultations.set(id, updatedConsultation);
    return updatedConsultation;
  }

  // Prescription methods
  async createPrescription(insertPrescription: InsertPrescription): Promise<Prescription> {
    const id = this.currentPrescriptionId++;
    const prescription: Prescription = {
      ...insertPrescription,
      id,
      medicines: insertPrescription.medicines || null,
      dosage: insertPrescription.dosage || null,
      instructions: insertPrescription.instructions || null,
      prescribedBy: insertPrescription.prescribedBy || null,
      createdAt: new Date(),
    };
    this.prescriptions.set(id, prescription);
    return prescription;
  }

  async getPrescriptionsByVisit(visitId: number): Promise<Prescription[]> {
    return Array.from(this.prescriptions.values()).filter(p => p.visitId === visitId);
  }

  async updatePrescription(id: number, updateData: Partial<InsertPrescription>): Promise<Prescription | undefined> {
    const prescription = this.prescriptions.get(id);
    if (!prescription) return undefined;

    const updatedPrescription = { ...prescription, ...updateData };
    this.prescriptions.set(id, updatedPrescription);
    return updatedPrescription;
  }

  // Diagnostic methods
  async createDiagnostic(insertDiagnostic: InsertDiagnostic): Promise<Diagnostic> {
    const id = this.currentDiagnosticId++;
    const diagnostic: Diagnostic = {
      ...insertDiagnostic,
      id,
      status: insertDiagnostic.status || "pending",
      results: insertDiagnostic.results || null,
      reportUrl: insertDiagnostic.reportUrl || null,
      orderedBy: insertDiagnostic.orderedBy || null,
      createdAt: new Date(),
    };
    this.diagnostics.set(id, diagnostic);
    return diagnostic;
  }

  async getDiagnosticsByVisit(visitId: number): Promise<Diagnostic[]> {
    return Array.from(this.diagnostics.values()).filter(d => d.visitId === visitId);
  }

  async updateDiagnostic(id: number, updateData: Partial<InsertDiagnostic>): Promise<Diagnostic | undefined> {
    const diagnostic = this.diagnostics.get(id);
    if (!diagnostic) return undefined;

    const updatedDiagnostic = { ...diagnostic, ...updateData };
    this.diagnostics.set(id, updatedDiagnostic);
    return updatedDiagnostic;
  }

  // Lab test methods
  async createLabTest(insertLabTest: InsertLabTest): Promise<LabTest> {
    const id = this.currentLabTestId++;
    const labTest: LabTest = {
      ...insertLabTest,
      id,
      status: insertLabTest.status || "pending",
      results: insertLabTest.results || null,
      orderedBy: insertLabTest.orderedBy || null,
      testCategory: insertLabTest.testCategory || null,
      normalRange: insertLabTest.normalRange || null,
      createdAt: new Date(),
    };
    this.labTests.set(id, labTest);
    return labTest;
  }

  async getLabTestsByVisit(visitId: number): Promise<LabTest[]> {
    return Array.from(this.labTests.values()).filter(l => l.visitId === visitId);
  }

  async updateLabTest(id: number, updateData: Partial<InsertLabTest>): Promise<LabTest | undefined> {
    const labTest = this.labTests.get(id);
    if (!labTest) return undefined;

    const updatedLabTest = { ...labTest, ...updateData };
    this.labTests.set(id, updatedLabTest);
    return updatedLabTest;
  }

  // Physio session methods
  async createPhysioSession(insertSession: InsertPhysioSession): Promise<PhysioSession> {
    const id = this.currentPhysioSessionId++;
    const session: PhysioSession = {
      ...insertSession,
      id,
      status: insertSession.status || "scheduled",
      notes: insertSession.notes || null,
      duration: insertSession.duration || null,
      exercises: insertSession.exercises || null,
      therapistName: insertSession.therapistName || null,
      sessionDate: insertSession.sessionDate || null,
      createdAt: new Date(),
    };
    this.physioSessions.set(id, session);
    return session;
  }

  async getPhysioSessionsByVisit(visitId: number): Promise<PhysioSession[]> {
    return Array.from(this.physioSessions.values()).filter(s => s.visitId === visitId);
  }

  async updatePhysioSession(id: number, updateData: Partial<InsertPhysioSession>): Promise<PhysioSession | undefined> {
    const session = this.physioSessions.get(id);
    if (!session) return undefined;

    const updatedSession = { ...session, ...updateData };
    this.physioSessions.set(id, updatedSession);
    return updatedSession;
  }

  // Payment methods
  async createPayment(insertPayment: InsertPayment): Promise<Payment> {
    const id = this.currentPaymentId++;
    const payment: Payment = {
      ...insertPayment,
      id,
      paymentStatus: insertPayment.paymentStatus || "pending",
      billItems: insertPayment.billItems || null,
      createdAt: new Date(),
    };
    this.payments.set(id, payment);
    return payment;
  }

  async getPaymentsByVisit(visitId: number): Promise<Payment[]> {
    return Array.from(this.payments.values()).filter(p => p.visitId === visitId);
  }

  async updatePayment(id: number, updateData: Partial<InsertPayment>): Promise<Payment | undefined> {
    const payment = this.payments.get(id);
    if (!payment) return undefined;

    const updatedPayment = { ...payment, ...updateData };
    this.payments.set(id, updatedPayment);
    return updatedPayment;
  }

  // Statistics methods
  async getTodaysStats(): Promise<{
    totalPatients: number;
    completed: number;
    inProgress: number;
    pending: number;
  }> {
    const todaysVisits = await this.getTodaysVisits();
    
    return {
      totalPatients: todaysVisits.length,
      completed: todaysVisits.filter(v => v.status === "completed").length,
      inProgress: todaysVisits.filter(v => v.status === "in_consultation").length,
      pending: todaysVisits.filter(v => v.status === "waiting").length,
    };
  }
}

export const storage = new MemStorage();
