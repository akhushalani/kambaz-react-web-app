import axios from "axios";
const REMOTE_SERVER = import.meta.env.VITE_REMOTE_SERVER;
const ENROLLMENTS_API = `${REMOTE_SERVER}/api/enroll`;
export const enrollInCourse = async (userId: string, courseId: string) => {
  const { data } = await axios.post(`${ENROLLMENTS_API}/${userId}/${courseId}`);
  return data;
};
export const unenrollInCourse = async (userId: string, courseId: string) => {
  const { data } = await axios.delete(`${ENROLLMENTS_API}/${userId}/${courseId}`);
  return data;
};