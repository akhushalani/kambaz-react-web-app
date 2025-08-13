import axios from "axios";
const REMOTE_SERVER = import.meta.env.VITE_REMOTE_SERVER;
const axiosWithCredentials = axios.create({ withCredentials: true });
const COURSES_API = `${REMOTE_SERVER}/api/courses`;
export const fetchAllCourses = async (userId: string) => {
  const { data } = await axiosWithCredentials.get(`${COURSES_API}?userId=${userId}`);
  return data;
};
export const deleteCourse = async (id: string) => {
  const { data } = await axios.delete(`${COURSES_API}/${id}`);
  return data;
};
export const updateCourse = async (course: any) => {
  const { data } = await axios.put(`${COURSES_API}/${course._id}`, course);
  return data;
};
export const findModulesForCourse = async (courseId: string) => {
  const response = await axios.get(`${COURSES_API}/${courseId}/modules`);
  return response.data;
};
export const createModuleForCourse = async (courseId: string, module: any) => {
  const response = await axios.post(`${COURSES_API}/${courseId}/modules`, module);
  return response.data;
};
export const findAssignmentsForCourse = async (courseId: string) => {
  const response = await axios.get(`${COURSES_API}/${courseId}/assignments`);
  return response.data;
};
export const findPeopleForCourse = async (courseId: string) => {
  const response = await axios.get(`${COURSES_API}/${courseId}/people`);
  return response.data;
};