import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertPatientSchema, 
  insertVisitSchema,
  insertConsultationSchema,
  insertPrescriptionSchema,
  insertDiagnosticSchema,
  insertLabTestSchema,
  insertPhysioSessionSchema,
  insertPaymentSchema,
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Patient routes
  app.get("/api/patients", async (req, res) => {
    try {
      const { search } = req.query;
      let patients;
      
      if (search && typeof search === "string") {
        patients = await storage.searchPatients(search);
      } else {
        patients = await storage.getAllPatients();
      }
      
      res.json(patients);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patients" });
    }
  });

  app.get("/api/patients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const patient = await storage.getPatientWithVisits(id);
      
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      res.json(patient);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch patient" });
    }
  });

  app.post("/api/patients", async (req, res) => {
    try {
      const validatedData = insertPatientSchema.parse(req.body);
      const patient = await storage.createPatient(validatedData);
      res.status(201).json(patient);
    } catch (error) {
      res.status(400).json({ message: "Invalid patient data" });
    }
  });

  app.patch("/api/patients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertPatientSchema.partial().parse(req.body);
      const patient = await storage.updatePatient(id, validatedData);
      
      if (!patient) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      res.json(patient);
    } catch (error) {
      res.status(400).json({ message: "Invalid patient data" });
    }
  });

  app.delete("/api/patients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deletePatient(id);
      
      if (!deleted) {
        return res.status(404).json({ message: "Patient not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete patient" });
    }
  });

  // Visit routes
  app.get("/api/visits", async (req, res) => {
    try {
      const { today } = req.query;
      let visits;
      
      if (today === "true") {
        visits = await storage.getTodaysVisits();
      } else {
        visits = await storage.getAllVisits();
      }
      
      res.json(visits);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch visits" });
    }
  });

  app.get("/api/visits/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const visit = await storage.getVisitWithDetails(id);
      
      if (!visit) {
        return res.status(404).json({ message: "Visit not found" });
      }
      
      res.json(visit);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch visit" });
    }
  });

  app.get("/api/visits/code/:visitCode", async (req, res) => {
    try {
      const { visitCode } = req.params;
      const visit = await storage.getVisitByCode(visitCode);
      
      if (!visit) {
        return res.status(404).json({ message: "Visit not found" });
      }
      
      res.json(visit);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch visit" });
    }
  });

  app.post("/api/visits", async (req, res) => {
    try {
      const validatedData = insertVisitSchema.parse(req.body);
      const visit = await storage.createVisit(validatedData);
      res.status(201).json(visit);
    } catch (error) {
      res.status(400).json({ message: "Invalid visit data" });
    }
  });

  app.patch("/api/visits/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertVisitSchema.partial().parse(req.body);
      const visit = await storage.updateVisit(id, validatedData);
      
      if (!visit) {
        return res.status(404).json({ message: "Visit not found" });
      }
      
      res.json(visit);
    } catch (error) {
      res.status(400).json({ message: "Invalid visit data" });
    }
  });

  // Consultation routes
  app.get("/api/visits/:visitId/consultations", async (req, res) => {
    try {
      const visitId = parseInt(req.params.visitId);
      const consultations = await storage.getConsultationsByVisit(visitId);
      res.json(consultations);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch consultations" });
    }
  });

  app.get("/api/consultations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const consultation = await storage.getConsultation(id);
      
      if (!consultation) {
        return res.status(404).json({ message: "Consultation not found" });
      }
      
      res.json(consultation);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch consultation" });
    }
  });

  app.post("/api/consultations", async (req, res) => {
    try {
      const validatedData = insertConsultationSchema.parse(req.body);
      const consultation = await storage.createConsultation(validatedData);
      res.status(201).json(consultation);
    } catch (error) {
      res.status(400).json({ message: "Invalid consultation data" });
    }
  });

  app.patch("/api/consultations/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const validatedData = insertConsultationSchema.partial().parse(req.body);
      const consultation = await storage.updateConsultation(id, validatedData);
      
      if (!consultation) {
        return res.status(404).json({ message: "Consultation not found" });
      }
      
      res.json(consultation);
    } catch (error) {
      res.status(400).json({ message: "Invalid consultation data" });
    }
  });

  // Prescription routes
  app.get("/api/visits/:visitId/prescriptions", async (req, res) => {
    try {
      const visitId = parseInt(req.params.visitId);
      const prescriptions = await storage.getPrescriptionsByVisit(visitId);
      res.json(prescriptions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch prescriptions" });
    }
  });

  app.post("/api/prescriptions", async (req, res) => {
    try {
      const validatedData = insertPrescriptionSchema.parse(req.body);
      const prescription = await storage.createPrescription(validatedData);
      res.status(201).json(prescription);
    } catch (error) {
      res.status(400).json({ message: "Invalid prescription data" });
    }
  });

  // Diagnostic routes
  app.get("/api/visits/:visitId/diagnostics", async (req, res) => {
    try {
      const visitId = parseInt(req.params.visitId);
      const diagnostics = await storage.getDiagnosticsByVisit(visitId);
      res.json(diagnostics);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch diagnostics" });
    }
  });

  app.post("/api/diagnostics", async (req, res) => {
    try {
      const validatedData = insertDiagnosticSchema.parse(req.body);
      const diagnostic = await storage.createDiagnostic(validatedData);
      res.status(201).json(diagnostic);
    } catch (error) {
      res.status(400).json({ message: "Invalid diagnostic data" });
    }
  });

  // Lab test routes
  app.get("/api/visits/:visitId/lab-tests", async (req, res) => {
    try {
      const visitId = parseInt(req.params.visitId);
      const labTests = await storage.getLabTestsByVisit(visitId);
      res.json(labTests);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch lab tests" });
    }
  });

  app.post("/api/lab-tests", async (req, res) => {
    try {
      const validatedData = insertLabTestSchema.parse(req.body);
      const labTest = await storage.createLabTest(validatedData);
      res.status(201).json(labTest);
    } catch (error) {
      res.status(400).json({ message: "Invalid lab test data" });
    }
  });

  // Physio session routes
  app.get("/api/visits/:visitId/physio-sessions", async (req, res) => {
    try {
      const visitId = parseInt(req.params.visitId);
      const sessions = await storage.getPhysioSessionsByVisit(visitId);
      res.json(sessions);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch physio sessions" });
    }
  });

  app.post("/api/physio-sessions", async (req, res) => {
    try {
      const validatedData = insertPhysioSessionSchema.parse(req.body);
      const session = await storage.createPhysioSession(validatedData);
      res.status(201).json(session);
    } catch (error) {
      res.status(400).json({ message: "Invalid physio session data" });
    }
  });

  // Payment routes
  app.get("/api/visits/:visitId/payments", async (req, res) => {
    try {
      const visitId = parseInt(req.params.visitId);
      const payments = await storage.getPaymentsByVisit(visitId);
      res.json(payments);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch payments" });
    }
  });

  app.post("/api/payments", async (req, res) => {
    try {
      const validatedData = insertPaymentSchema.parse(req.body);
      const payment = await storage.createPayment(validatedData);
      res.status(201).json(payment);
    } catch (error) {
      res.status(400).json({ message: "Invalid payment data" });
    }
  });

  // Statistics routes
  app.get("/api/stats/today", async (req, res) => {
    try {
      const stats = await storage.getTodaysStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch statistics" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
