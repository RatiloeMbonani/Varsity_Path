export type GradeLevel = 11 | 12;

export interface StudentProfile {
  uid: string;
  email: string;
  displayName: string;
  grade: GradeLevel;
  school?: string;
  province: 'Western Cape';
  targetUniversity?: string;
  createdAt: string;
}

export type AssessmentType = 'Exam' | 'Test' | 'Assignment' | 'Practical' | 'Class Test';

/**
 * Result used in the "Improve" tab for diagnostics, topic mastery, and learning analytics.
 */
export interface ImproveResult {
  id: string;
  subject: string;
  topic: string;
  mark: number; // Percentage mark 0 to 100
  date: string;
  assessmentType?: AssessmentType;
  score?: number;
  total?: number;
  percentage?: number;
  notes?: string;
  createdAt?: string;
}

/**
 * Separate results structure for the "Apply" tab.
 * Rule: Apply results contain ONLY: Subject and Mark.
 * Do NOT include: Topic, Date, Improve mastery, or Improve knowledge gaps.
 */
export interface ApplyResult {
  id: string;
  subject: string;
  mark: number; // 0 to 100
}

export type TaskPriority = 'high' | 'medium' | 'low';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';
export type TaskSource = 'knowledge_gap' | 'goal' | 'result' | 'programme_requirement' | 'manual';

export interface StudentGoal {
  id: string;
  userId?: string;
  title: string;
  subject: string;
  currentMark: number;
  targetMark: number;
  targetPercentage?: number; // Backward compatibility with legacy targetPercentage
  targetDate?: string;
  status: 'active' | 'completed' | 'abandoned';
  notes?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface StudyTask {
  id: string;
  userId?: string;
  title: string;
  description: string;
  subject: string;
  topic?: string;
  priority: TaskPriority;
  status: TaskStatus;
  completed?: boolean; // Backward compatibility with boolean toggle
  source: TaskSource;
  sourceId?: string;
  targetMark?: number;
  currentMark?: number;
  estimatedMinutes: number;
  dueDate?: string; // YYYY-MM-DD
  completedAt?: string;
  createdAt: string;
  updatedAt?: string;
}

export type ApplicationStatus =
  | 'planning'
  | 'not_started'
  | 'in_progress'
  | 'submitted'
  | 'under_review'
  | 'accepted'
  | 'rejected'
  | 'waitlisted';

export interface StatusHistoryItem {
  status: ApplicationStatus;
  changedAt: string;
  notes?: string;
}

export interface StudentApplication {
  id: string;
  userId?: string;
  programmeId: string;
  programmeName: string;
  universityId: 'uct' | 'stellenbosch' | 'uwc' | 'cput';
  universityName: string;
  faculty: string;
  qualificationType?: 'Bachelor' | 'Diploma' | 'Higher Certificate';
  status: ApplicationStatus;
  applicationNumber?: string;
  submissionDeadline?: string;
  notes?: string;
  statusHistory?: StatusHistoryItem[];
  createdAt: string;
  updatedAt: string;
}

export interface UniversityProgramme {
  id: string;
  universityId: 'uct' | 'stellenbosch' | 'uwc' | 'cput';
  universityName: string;
  faculty: string;
  name: string;
  degreeCode?: string;
  minAPS: number;
  durationYears: number;
  subjectRequirements: {
    subject: string;
    minMark: number;
  }[];
  description?: string;
}
