import { Router, type IRouter } from "express";
import healthRouter from "./health";
import courseRouter from "./course";
import assignmentsRouter from "./assignments";
import practiceRouter from "./practice";
import practiceAssignmentsRouter from "./practiceAssignments";
import tutorRouter from "./tutor";
import detectionRouter from "./detection";
import analyticsRouter from "./analytics";
import diagnosticsRouter from "./diagnostics";
import reasoningRouter from "./reasoning";
import adminRouter from "./admin";
import { anonAiQuota } from "../middlewares/anonAiQuota";

const router: IRouter = Router();

// Free-to-browse routes (no AI generation)
router.use(healthRouter);
router.use(courseRouter);

// AI-generating routes: anonymous visitors get a small free token budget,
// after which they must sign in with Google (401 LOGIN_REQUIRED).
router.use(anonAiQuota);
router.use(analyticsRouter);
router.use(adminRouter);
router.use(assignmentsRouter);
router.use(practiceRouter);
router.use(practiceAssignmentsRouter);
router.use(tutorRouter);
router.use(detectionRouter);
router.use(diagnosticsRouter);
router.use(reasoningRouter);

export default router;
