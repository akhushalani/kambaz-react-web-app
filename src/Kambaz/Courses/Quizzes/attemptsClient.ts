import axios from "axios";

const REMOTE_SERVER = import.meta.env.VITE_REMOTE_SERVER;
const QUIZZES_API = `${REMOTE_SERVER}/api/quizzes`;

export const findAttemptsForStudent = async (quizId: string, studentId: string) => {
  const { data } = await axios.get(`${QUIZZES_API}/${quizId}/attempts`, { params: { studentId } });
  return data;
};

export const createAttempt = async (quizId: string, payload: { studentId: string; answers: any }) => {
  const { data } = await axios.post(`${QUIZZES_API}/${quizId}/attempts`, payload);
  return data;
};