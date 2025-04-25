interface SearchSubjectsParams {
  searchTerm: string;
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
  const [, { searchTerm }] = queryKey;
  const requestBody = new URLSearchParams();
  requestBody.append("search-term", searchTerm);
  const response = await fetch(
    `${import.meta.env.VITE_LAMBDA_API}/subjects?searchTerm=${searchTerm}`,
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  return response.json();
}
