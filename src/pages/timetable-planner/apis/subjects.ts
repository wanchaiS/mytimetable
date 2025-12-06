interface SearchSubjectsParams {
  searchTerm: string;
  semester: string;
  year: number;
}

type SearchSubjectsQueryKey = ["subjects", SearchSubjectsParams];

export interface SubjectsResponse {
  [subjectKey: string]: SubjectResponse;
}

export interface SubjectResponse {
  activities: ActivitiesResponse;
  description: string;
  semester: "AUT" | "SPR";
  callista_code: string;
  subject_code: string;
}

export interface ActivitiesResponse {
  [activityKey: string]: ActivityResponse;
}

export interface ActivityResponse {
  subject_code: string;
  activitiesDays: string[];
  activity_code: string;
  activity_group_code: string;
  activity_type: string;
  availability: number;
  day_of_week: string;
  duration: string;
  start_time: string;
  semester: string;
  location: string;
}

export async function searchSubjects({
  queryKey,
}: {
  queryKey: SearchSubjectsQueryKey;
}): Promise<SubjectsResponse> {
  const [, { searchTerm, semester, year }] = queryKey;

  const response = await fetch(
    `${import.meta.env.VITE_SUBJECTS_API}/subjects?searchTerm=${searchTerm}&semester=${mapSemester(semester)}&year=${year}`,
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}

function mapSemester(semester: string): "AUT" | "SPR" {
  return semester === "Autumn" ? "AUT" : "SPR";
}
